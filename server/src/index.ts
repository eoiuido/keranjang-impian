import { getBackup, putBackup } from './backup';
import { checkStatus, createCheckout, verifyNotification } from './doku';
import { requestCode, verifyCode } from './login';
import { isPlan, PLANS, type PlanId } from './plans';
import { ago, type Env, iso, json, newSession, normalizeEmail, randomHex, userFromToken } from './shared';

type Order = {
  id: string;
  email: string;
  plan: PlanId;
  amount: number;
  offer: number;
  status: 'pending' | 'paid' | 'expired' | 'review';
  payment_url: string | null;
  expires_at: string;
  created_at: string;
  checked_at: string | null;
  paid_at: string | null;
};

const PAY_MINUTES = 30; // how long DOKU's payment page stays valid
const NOTIFY_PATH = '/api/doku/notify';

const getOrder = (env: Env, id: string) => env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first<Order>();

// ---------- Orders ----------

// POST /api/orders {email, plan, offer} → a DOKU payment page for this order.
async function createOrder(req: Request, env: Env): Promise<Response> {
  const body = (await req.json().catch(() => null)) as { email?: unknown; plan?: unknown; offer?: unknown } | null;
  const email = normalizeEmail(body?.email);
  if (!email) return json({ error: 'invalid_email' }, 400);
  if (!isPlan(body?.plan)) return json({ error: 'invalid_plan' }, 400);
  const plan = body.plan;

  // The decline-offer price is allowed once per email (the phone also shows it only once).
  let offer = body?.offer === true && plan === 'yearly';
  if (offer) {
    const used = await env.DB.prepare("SELECT 1 FROM orders WHERE email = ? AND offer = 1 AND status = 'paid'")
      .bind(email)
      .first();
    if (used) offer = false;
  }
  const amount = offer ? PLANS[plan].offerAmount! : PLANS[plan].amount;

  // Reuse an unpaid page that still has time left: prevents paying twice.
  const reuse = await env.DB.prepare(
    "SELECT * FROM orders WHERE email = ? AND plan = ? AND amount = ? AND status = 'pending' AND expires_at > ? ORDER BY created_at DESC LIMIT 1",
  )
    .bind(email, plan, amount, iso(new Date(Date.now() + 5 * 60_000)))
    .first<Order>();
  if (reuse?.payment_url) return json(publicOrder(reuse));

  const now = new Date();
  const id = `SB-${iso(now).slice(0, 10).replace(/-/g, '')}-${randomHex(16)}`;
  const expiresAt = iso(new Date(now.getTime() + PAY_MINUTES * 60_000));

  let url: string;
  try {
    ({ url } = await createCheckout(env, {
      invoice: id,
      amount,
      email,
      callbackUrl: `${env.APP_URL}/bayar?order=${id}`,
      notifyUrl: `${env.APP_URL}${NOTIFY_PATH}`,
      minutes: PAY_MINUTES,
    }));
  } catch (e) {
    console.error('createCheckout', String(e));
    return json({ error: 'payment_unavailable' }, 502);
  }

  await env.DB.prepare(
    'INSERT INTO orders (id, email, plan, amount, offer, status, payment_url, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(id, email, plan, amount, offer ? 1 : 0, 'pending', url, expiresAt, iso(now))
    .run();

  return json(publicOrder({ id, email, plan, amount, offer: offer ? 1 : 0, status: 'pending', payment_url: url, expires_at: expiresAt } as Order));
}

function publicOrder(o: Order) {
  return {
    orderId: o.id,
    plan: o.plan,
    amount: o.amount,
    status: o.status,
    paymentUrl: o.payment_url,
    expiresAt: o.expires_at,
  };
}

// GET /api/orders/:id → status. Once paid, also a login token for this phone.
async function orderStatus(env: Env, id: string): Promise<Response> {
  let order = await getOrder(env, id);
  if (!order) return json({ error: 'not_found' }, 404);

  // Notification late? After a minute, ask DOKU ourselves (at most every 30 seconds).
  if (order.status === 'pending' && ago(order.created_at) >= 60_000 && (!order.checked_at || ago(order.checked_at) >= 30_000)) {
    await reconcile(env, order);
    order = (await getOrder(env, id))!;
  }

  if (order.status !== 'paid') return json(publicOrder(order));

  const access = await env.DB.prepare(
    'SELECT a.plan, a.ends_at, u.id AS user_id FROM access a JOIN users u ON u.id = a.user_id WHERE u.email = ?',
  )
    .bind(order.email)
    .first<{ plan: string; ends_at: string; user_id: number }>();

  // Hand out a token only shortly after payment; later, log in with the email code.
  let token: string | undefined;
  if (access && order.paid_at && ago(order.paid_at) < 24 * 3_600_000) {
    token = await newSession(env, access.user_id);
  }
  return json({ ...publicOrder(order), email: order.email, endsAt: access?.ends_at, token });
}

// ---------- Payment confirmation (the only way to unlock) ----------

// Marks an order paid exactly once and adds time to the buyer's access.
async function markPaid(env: Env, order: Order, paidAmount: number | null, channel: string | null): Promise<string> {
  if (order.status === 'paid') return 'already';
  if (paidAmount !== null && paidAmount !== order.amount) {
    await env.DB.prepare("UPDATE orders SET status = 'review', paid_amount = ?, doku_channel = ? WHERE id = ? AND status != 'paid'")
      .bind(paidAmount, channel, order.id)
      .run();
    console.error('amount mismatch', order.id, order.amount, paidAmount);
    return 'review';
  }

  const now = iso();
  const upd = await env.DB.prepare(
    "UPDATE orders SET status = 'paid', paid_at = ?, paid_amount = ?, doku_channel = ? WHERE id = ? AND status IN ('pending', 'expired')",
  )
    .bind(now, paidAmount ?? order.amount, channel, order.id)
    .run();
  if (upd.meta.changes !== 1) return 'already'; // another request got here first

  const days = PLANS[order.plan].days;
  await env.DB.batch([
    env.DB.prepare('INSERT INTO users (email, created_at) VALUES (?, ?) ON CONFLICT (email) DO NOTHING').bind(order.email, now),
    // Paying again adds time on top: end = later of (now, current end) + days. Done in one statement.
    env.DB.prepare(
      `INSERT INTO access (user_id, plan, ends_at)
       SELECT id, ?1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', ?2) FROM users WHERE email = ?3
       ON CONFLICT (user_id) DO UPDATE SET plan = excluded.plan,
         ends_at = strftime('%Y-%m-%dT%H:%M:%fZ', max(access.ends_at, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), ?2)`,
    ).bind(order.plan, `+${days} days`, order.email),
  ]);
  console.log('paid', order.id, order.plan, order.amount, channel);
  return 'paid';
}

// Ask DOKU about one pending order and act on the answer.
async function reconcile(env: Env, order: Order): Promise<void> {
  await env.DB.prepare('UPDATE orders SET checked_at = ? WHERE id = ?').bind(iso(), order.id).run();
  let s;
  try {
    s = await checkStatus(env, order.id);
  } catch (e) {
    console.error('checkStatus', order.id, String(e));
    return;
  }
  if (s.status === 'SUCCESS') {
    await markPaid(env, order, s.amount, s.channel);
  } else if (ago(order.expires_at) > 5 * 60_000) {
    // Page expired more than 5 minutes ago and DOKU has no successful payment.
    await env.DB.prepare("UPDATE orders SET status = 'expired' WHERE id = ? AND status = 'pending'").bind(order.id).run();
  }
}

// POST /api/doku/notify — DOKU tells us a payment happened.
async function dokuNotify(req: Request, env: Env): Promise<Response> {
  const raw = await req.text();
  if (!(await verifyNotification(env, req.headers, NOTIFY_PATH, raw))) {
    console.error('notify: bad signature');
    return json({ error: 'bad_signature' }, 401);
  }
  const n = JSON.parse(raw);
  const id = n?.order?.invoice_number;
  const status = n?.transaction?.status;
  // DOKU Checkout: ignore FAILED, the buyer may still switch method and pay.
  if (typeof id !== 'string' || status !== 'SUCCESS') return json({ ok: true });

  const order = await getOrder(env, id);
  if (!order) {
    console.error('notify: unknown order', id);
    return json({ ok: true });
  }
  const amount = n?.order?.amount != null ? Math.round(Number(n.order.amount)) : null;
  const result = await markPaid(env, order, amount, n?.channel?.id ?? n?.service?.id ?? null);
  return json({ ok: true, result });
}

// GET /api/me (Authorization: Bearer <token>) → paid access of this phone.
async function me(req: Request, env: Env): Promise<Response> {
  const user = await userFromToken(req, env);
  if (!user) return json({ error: 'unauthorized' }, 401);
  return json({ email: user.email, plan: user.plan, endsAt: user.endsAt });
}

// ---------- Router ----------

function withCors(res: Response, req: Request, env: Env): Response {
  const origin = req.headers.get('Origin');
  if (!origin || origin !== env.ALLOWED_ORIGIN) return res;
  const r = new Response(res.body, res);
  r.headers.set('Access-Control-Allow-Origin', origin);
  r.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  r.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  return r;
}

async function route(req: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(req.url);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (req.method === 'POST' && pathname === '/api/orders') return createOrder(req, env);
  const m = pathname.match(/^\/api\/orders\/([A-Za-z0-9-]{1,64})$/);
  if (req.method === 'GET' && m) return orderStatus(env, m[1]);
  if (req.method === 'POST' && pathname === NOTIFY_PATH) return dokuNotify(req, env);
  if (req.method === 'GET' && pathname === '/api/me') return me(req, env);
  if (req.method === 'POST' && pathname === '/api/login/code') return requestCode(req, env);
  if (req.method === 'POST' && pathname === '/api/login/verify') return verifyCode(req, env);
  if (req.method === 'GET' && pathname === '/api/backup') return getBackup(req, env);
  if (req.method === 'PUT' && pathname === '/api/backup') return putBackup(req, env);
  return json({ error: 'not_found' }, 404);
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    try {
      return withCors(await route(req, env), req, env);
    } catch (e) {
      console.error('unhandled', String(e));
      return withCors(json({ error: 'server_error' }, 500), req, env);
    }
  },

  // Every 5 minutes: ask DOKU about recent pending orders, in case a notification was lost.
  async scheduled(_c: ScheduledController, env: Env): Promise<void> {
    const { results } = await env.DB.prepare(
      `SELECT * FROM orders WHERE status = 'pending' AND created_at > ? AND created_at < ?
       AND (checked_at IS NULL OR checked_at < ?) ORDER BY created_at LIMIT 20`,
    )
      .bind(iso(new Date(Date.now() - 24 * 3_600_000)), iso(new Date(Date.now() - 60_000)), iso(new Date(Date.now() - 4 * 60_000)))
      .all<Order>();
    for (const o of results) await reconcile(env, o);
  },
} satisfies ExportedHandler<Env>;
