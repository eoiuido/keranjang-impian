// Email login with a 6-digit code (spec.md S14), for paid users on a new phone or browser.
import { sendEmail } from './email';
import { type Env, iso, json, normalizeEmail, sha256Hex, newSession } from './shared';

const CODE_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_AFTER_MS = 60_000;
const MAX_SENDS_PER_HOUR = 5;

type CodeRow = {
  email: string;
  code_hash: string;
  expires_at: string;
  attempts: number;
  sent_at: string;
  sends_in_hour: number;
  hour_started_at: string;
};

const hashCode = (email: string, code: string) => sha256Hex(`${email}:${code}`);

function sixDigits(): string {
  // Uniform 000000-999999 from secure random bytes.
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(n).padStart(6, '0');
}

// POST /api/login/code {email}. Always answers "ok" so nobody can test which emails have paid.
export async function requestCode(req: Request, env: Env): Promise<Response> {
  const body = (await req.json().catch(() => null)) as { email?: unknown } | null;
  const email = normalizeEmail(body?.email);
  if (!email) return json({ error: 'invalid_email' }, 400);

  const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (!user) return json({ ok: true });

  const now = Date.now();
  const prev = await env.DB.prepare('SELECT * FROM login_codes WHERE email = ?').bind(email).first<CodeRow>();
  let sendsInHour = 1;
  let hourStarted = iso();
  if (prev) {
    if (now - new Date(prev.sent_at).getTime() < RESEND_AFTER_MS) return json({ error: 'too_soon' }, 429);
    const sameHour = now - new Date(prev.hour_started_at).getTime() < 3_600_000;
    if (sameHour && prev.sends_in_hour >= MAX_SENDS_PER_HOUR) return json({ error: 'too_many' }, 429);
    if (sameHour) {
      sendsInHour = prev.sends_in_hour + 1;
      hourStarted = prev.hour_started_at;
    }
  }

  const code = sixDigits();
  await env.DB.prepare(
    `INSERT INTO login_codes (email, code_hash, expires_at, attempts, sent_at, sends_in_hour, hour_started_at)
     VALUES (?1, ?2, ?3, 0, ?4, ?5, ?6)
     ON CONFLICT (email) DO UPDATE SET code_hash = ?2, expires_at = ?3, attempts = 0, sent_at = ?4, sends_in_hour = ?5, hour_started_at = ?6`,
  )
    .bind(email, await hashCode(email, code), iso(new Date(now + CODE_MINUTES * 60_000)), iso(), sendsInHour, hourStarted)
    .run();

  await sendEmail(
    env,
    email,
    `Kode masuk Spirit Belongings: ${code}`,
    `Kode masuk kamu: ${code}\n\nBerlaku ${CODE_MINUTES} menit. Jangan bagikan kode ini ke siapa pun.\nKalau kamu tidak minta kode ini, abaikan email ini.\n\nSpirit Belongings by EOI · eoi.uido@gmail.com`,
  );
  // Only for the automated local test; never set online.
  return json(env.DEV_RETURN_CODE === '1' ? { ok: true, devCode: code } : { ok: true });
}

// POST /api/login/verify {email, code} → a login token and the paid access.
export async function verifyCode(req: Request, env: Env): Promise<Response> {
  const body = (await req.json().catch(() => null)) as { email?: unknown; code?: unknown } | null;
  const email = normalizeEmail(body?.email);
  const code = typeof body?.code === 'string' ? body.code.replace(/\D/g, '') : '';
  if (!email || code.length !== 6) return json({ error: 'invalid_code' }, 400);

  const row = await env.DB.prepare('SELECT * FROM login_codes WHERE email = ?').bind(email).first<CodeRow>();
  if (!row || new Date(row.expires_at).getTime() < Date.now()) return json({ error: 'expired' }, 400);
  if (row.attempts >= MAX_ATTEMPTS) return json({ error: 'too_many' }, 429);

  if ((await hashCode(email, code)) !== row.code_hash) {
    await env.DB.prepare('UPDATE login_codes SET attempts = attempts + 1 WHERE email = ?').bind(email).run();
    return json({ error: 'wrong_code', attemptsLeft: MAX_ATTEMPTS - row.attempts - 1 }, 400);
  }

  await env.DB.prepare('DELETE FROM login_codes WHERE email = ?').bind(email).run(); // one use only
  const user = await env.DB.prepare(
    'SELECT u.id, a.plan, a.ends_at FROM users u LEFT JOIN access a ON a.user_id = u.id WHERE u.email = ?',
  )
    .bind(email)
    .first<{ id: number; plan: string | null; ends_at: string | null }>();
  if (!user) return json({ error: 'expired' }, 400);

  const token = await newSession(env, user.id);
  return json({ token, email, plan: user.plan, endsAt: user.ends_at });
}
