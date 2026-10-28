// End-to-end test of the payment server against a pretend DOKU on this computer.
// Run: npm run e2e   (no real DOKU account or money involved)
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createHash, createHmac } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CLIENT_ID = 'MCH-LOCAL-TEST';
const SECRET = 'local-test-secret-not-real';
const MOCK_PORT = 8799;
const API = 'http://localhost:8798';
const WRANGLER = join('node_modules', 'wrangler', 'bin', 'wrangler.js');

const sign = (h, target, body) => {
  const lines = [`Client-Id:${h.clientId}`, `Request-Id:${h.requestId}`, `Request-Timestamp:${h.ts}`, `Request-Target:${target}`];
  if (body !== undefined) lines.push(`Digest:${createHash('sha256').update(body).digest('base64')}`);
  return 'HMACSHA256=' + createHmac('sha256', SECRET).update(lines.join('\n')).digest('base64');
};

// ---- Pretend DOKU ----
const mock = { created: [], status: new Map(), badSignatures: 0 };
const server = createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    const h = { clientId: req.headers['client-id'], requestId: req.headers['request-id'], ts: req.headers['request-timestamp'] };
    const expected = sign(h, req.url, req.method === 'POST' ? body : undefined);
    if (req.headers.signature !== expected || h.clientId !== CLIENT_ID) {
      mock.badSignatures++;
      res.writeHead(401).end('{"error":"bad signature"}');
      return;
    }
    if (req.method === 'POST' && req.url === '/checkout/v1/payment') {
      const j = JSON.parse(body);
      mock.created.push(j);
      res.writeHead(200, { 'Content-Type': 'application/json' }).end(
        JSON.stringify({ response: { payment: { url: `http://localhost:${MOCK_PORT}/pay/${j.order.invoice_number}` } } }),
      );
      return;
    }
    const m = req.url.match(/^\/orders\/v1\/status\/(.+)$/);
    if (req.method === 'GET' && m) {
      const s = mock.status.get(decodeURIComponent(m[1])) ?? { status: 'PENDING' };
      res.writeHead(200, { 'Content-Type': 'application/json' }).end(
        JSON.stringify({ order: { invoice_number: m[1], amount: s.amount }, transaction: { status: s.status }, channel: { id: 'QRIS_DOKU' } }),
      );
      return;
    }
    res.writeHead(404).end();
  });
});
await new Promise((r) => server.listen(MOCK_PORT, r));

// ---- Our server, with a throwaway local database ----
const dir = mkdtempSync(join(tmpdir(), 'ki-e2e-'));
const mig = spawnSync(process.execPath, [WRANGLER, 'd1', 'migrations', 'apply', 'keranjang-impian', '--local', '--persist-to', dir], {
  encoding: 'utf8',
  env: { ...process.env, CI: '1' },
});
assert.equal(mig.status, 0, mig.stderr + mig.stdout);

const worker = spawn(
  process.execPath,
  [
    WRANGLER, 'dev', '--port', '8798', '--persist-to', dir, '--test-scheduled',
    '--var', `DOKU_BASE_URL:http://localhost:${MOCK_PORT}`,
    '--var', `DOKU_CLIENT_ID:${CLIENT_ID}`,
    '--var', `DOKU_SECRET_KEY:${SECRET}`,
    '--var', 'DEV_RETURN_CODE:1',
  ],
  { env: { ...process.env, CI: '1' }, stdio: ['ignore', 'pipe', 'pipe'] },
);
let log = '';
worker.stdout.on('data', (d) => (log += d));
worker.stderr.on('data', (d) => (log += d));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const api = async (path, opts = {}) => {
  const r = await fetch(API + path, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers ?? {}) } });
  return { status: r.status, body: await r.json().catch(() => null) };
};
const notify = (order, status = 'SUCCESS', amount = order.amount, secretOk = true) => {
  const body = JSON.stringify({ order: { invoice_number: order.orderId, amount }, transaction: { status }, channel: { id: 'QRIS_DOKU' } });
  const h = { clientId: CLIENT_ID, requestId: crypto.randomUUID(), ts: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z') };
  const signature = secretOk ? sign(h, '/api/doku/notify', body) : 'HMACSHA256=wrong';
  return api('/api/doku/notify', {
    method: 'POST',
    body,
    headers: { 'Client-Id': h.clientId, 'Request-Id': h.requestId, 'Request-Timestamp': h.ts, Signature: signature },
  });
};
const days = (t) => Math.round((new Date(t).getTime() - Date.now()) / 86_400_000);

let passed = 0;
const step = async (name, fn) => {
  await fn();
  passed++;
  console.log('✔', name);
};

try {
  for (let i = 0; ; i++) {
    try {
      if ((await fetch(API + '/api/me')).status === 401) break;
    } catch {}
    if (i > 120) throw new Error('worker did not start:\n' + log);
    await sleep(500);
  }

  const email = 'pembeli.test@example.com';
  let yearly;

  await step('rejects a bad email and a bad plan', async () => {
    assert.equal((await api('/api/orders', { method: 'POST', body: JSON.stringify({ email: 'bukan-email', plan: 'yearly' }) })).status, 400);
    assert.equal((await api('/api/orders', { method: 'POST', body: JSON.stringify({ email, plan: 'monthly' }) })).status, 400);
  });

  await step('creates a yearly order at Rp119.000 with a DOKU page (QRIS + e-wallets)', async () => {
    const r = await api('/api/orders', { method: 'POST', body: JSON.stringify({ email: ' Pembeli.Test@Example.com ', plan: 'yearly' }) });
    assert.equal(r.status, 200, JSON.stringify(r.body));
    yearly = r.body;
    assert.equal(yearly.amount, 119_000);
    assert.match(yearly.paymentUrl, /\/pay\/SB-/);
    const sent = mock.created.at(-1);
    assert.equal(sent.order.amount, 119_000);
    assert.equal(sent.customer.email, email);
    assert.ok(String(sent.additional_info?.override_notification_url).endsWith('/api/doku/notify'));
    assert.deepEqual(sent.payment.payment_method_types, ['QRIS', 'EMONEY_OVO', 'EMONEY_DANA', 'EMONEY_SHOPEE_PAY', 'EMONEY_LINKAJA']);
    assert.equal(mock.badSignatures, 0, 'our signature to DOKU must be valid');
  });

  await step('asking again reuses the same unpaid page (no double payment)', async () => {
    const r = await api('/api/orders', { method: 'POST', body: JSON.stringify({ email, plan: 'yearly' }) });
    assert.equal(r.body.orderId, yearly.orderId);
    assert.equal(mock.created.length, 1);
  });

  await step('a price sent by the browser is ignored', async () => {
    const r = await api('/api/orders', { method: 'POST', body: JSON.stringify({ email: 'lain@example.com', plan: 'weekly', amount: 1 }) });
    assert.equal(r.body.amount, 10_000);
  });

  await step('order is pending before payment, with no token', async () => {
    const r = await api(`/api/orders/${yearly.orderId}`);
    assert.equal(r.body.status, 'pending');
    assert.equal(r.body.token, undefined);
  });

  await step('a notification with a wrong signature is refused and unlocks nothing', async () => {
    assert.equal((await notify(yearly, 'SUCCESS', 119_000, false)).status, 401);
    assert.equal((await api(`/api/orders/${yearly.orderId}`)).body.status, 'pending');
  });

  await step('FAILED notification is ignored (buyer may switch method)', async () => {
    assert.equal((await notify(yearly, 'FAILED')).status, 200);
    assert.equal((await api(`/api/orders/${yearly.orderId}`)).body.status, 'pending');
  });

  await step('a real SUCCESS notification unlocks 1 year, only once', async () => {
    assert.equal((await notify(yearly)).body.result, 'paid');
    assert.equal((await notify(yearly)).body.result, 'already');
    const r = await api(`/api/orders/${yearly.orderId}`);
    assert.equal(r.body.status, 'paid');
    assert.equal(days(r.body.endsAt), 365);
    assert.match(r.body.token, /^[0-9a-f]{64}$/);
    const me = await api('/api/me', { headers: { Authorization: `Bearer ${r.body.token}` } });
    assert.equal(me.body.email, email);
    assert.equal(me.body.plan, 'yearly');
    assert.equal((await api('/api/me', { headers: { Authorization: 'Bearer nope' } })).status, 401);
  });

  await step('email login code: wrong code counts, right code logs in once', async () => {
    const post = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) });
    const unknown = await post('/api/login/code', { email: 'belum.bayar@example.com' });
    assert.equal(unknown.status, 200);
    assert.equal(unknown.body.devCode, undefined, 'no code for emails that never paid');

    const sent = await post('/api/login/code', { email: ' PEMBELI.test@example.com ' });
    assert.match(String(sent.body.devCode), /^\d{6}$/, JSON.stringify(sent.body));
    assert.equal((await post('/api/login/code', { email })).status, 429, 'one code per minute');

    const wrong = String((Number(sent.body.devCode) + 1) % 1_000_000).padStart(6, '0');
    const bad = await post('/api/login/verify', { email, code: wrong });
    assert.equal(bad.body.error, 'wrong_code');
    assert.equal(bad.body.attemptsLeft, 4);

    const ok = await post('/api/login/verify', { email, code: sent.body.devCode });
    assert.match(ok.body.token, /^[0-9a-f]{64}$/);
    assert.equal(ok.body.plan, 'yearly');
    assert.equal((await api('/api/me', { headers: { Authorization: `Bearer ${ok.body.token}` } })).body.email, email);
    assert.equal((await post('/api/login/verify', { email, code: sent.body.devCode })).body.error, 'expired', 'code works once');
  });

  await step('online backup: paid users only, photos and address never stored', async () => {
    const order = (await api('/api/orders', { method: 'POST', body: JSON.stringify({ email: 'backup@example.com', plan: 'weekly' }) })).body;
    await notify(order);
    const token = (await api(`/api/orders/${order.orderId}`)).body.token;
    const auth = { Authorization: `Bearer ${token}` };
    const data = {
      version: 1,
      wallet: { balance: 150_000, debt: 0 },
      items: [{ id: 'a1', name: 'Tumbler', price: 850_000, photo: 'data:image/jpeg;base64,AAAA' }],
      address: 'Jl. Rahasia No. 1',
    };
    assert.equal((await api('/api/backup', { method: 'PUT', body: JSON.stringify({ data }) })).status, 401);
    assert.equal((await api('/api/backup', { method: 'PUT', body: JSON.stringify({ data }), headers: auth })).status, 200);
    const back = (await api('/api/backup', { headers: auth })).body;
    assert.equal(back.data.wallet.balance, 150_000);
    assert.equal(back.data.items[0].name, 'Tumbler');
    assert.equal(back.data.items[0].photo, undefined, 'photo stripped');
    assert.equal(back.data.address, undefined, 'address stripped');
    const big = { items: ['x'.repeat(210_000)] };
    assert.equal((await api('/api/backup', { method: 'PUT', body: JSON.stringify({ data: big }), headers: auth })).status, 413);
  });

  let offerOrder;
  await step('decline offer gives Rp99.000', async () => {
    offerOrder = (await api('/api/orders', { method: 'POST', body: JSON.stringify({ email, plan: 'yearly', offer: true }) })).body;
    assert.equal(offerOrder.amount, 99_000);
  });

  await step('lost notification: the 5-minute safety net asks DOKU and unlocks (waits ~1 minute)', async () => {
    mock.status.set(offerOrder.orderId, { status: 'SUCCESS', amount: 99_000 });
    await sleep(62_000); // the safety net only looks at orders older than 1 minute
    await fetch(API + '/__scheduled?cron=*/5+*+*+*+*');
    await sleep(1_000);
    const r = await api(`/api/orders/${offerOrder.orderId}`);
    assert.equal(r.body.status, 'paid');
    assert.equal(days(r.body.endsAt), 730, 'second year is added on top of the first');
  });

  await step('the offer price works only once per email', async () => {
    const r = await api('/api/orders', { method: 'POST', body: JSON.stringify({ email, plan: 'yearly', offer: true }) });
    assert.equal(r.body.amount, 119_000);
  });

  await step('paid amount different from the price goes to manual review, no access', async () => {
    const w = (await api('/api/orders', { method: 'POST', body: JSON.stringify({ email: 'beda@example.com', plan: 'weekly' }) })).body;
    assert.equal((await notify(w, 'SUCCESS', 5_000)).body.result, 'review');
    const r = await api(`/api/orders/${w.orderId}`);
    assert.equal(r.body.status, 'review');
    assert.equal(r.body.token, undefined);
  });

  console.log(`\nAll ${passed} checks passed.`);
} catch (e) {
  console.error('\n✖ FAILED after', passed, 'checks:', e.message, '\n--- server log ---\n' + log.slice(-3000));
  process.exitCode = 1;
} finally {
  worker.kill();
  server.close();
  await sleep(500);
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {}
}
