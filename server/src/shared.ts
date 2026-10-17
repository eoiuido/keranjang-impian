import type { DokuEnv } from './doku';
import type { EmailEnv } from './email';

export interface Env extends DokuEnv, EmailEnv {
  DB: D1Database;
  APP_URL: string;
  ALLOWED_ORIGIN?: string;
  DEV_RETURN_CODE?: string; // automated local test only
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const iso = (d = new Date()) => d.toISOString();
export const ago = (t: string) => Date.now() - new Date(t).getTime();

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

// Lower-case, trimmed email, or '' when it isn't a valid address.
export function normalizeEmail(e: unknown): string {
  const email = typeof e === 'string' ? e.trim().toLowerCase() : '';
  return EMAIL_RE.test(email) && email.length <= 254 ? email : '';
}

export function randomHex(bytes: number): string {
  const b = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

export async function sha256Hex(s: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(d), (x) => x.toString(16).padStart(2, '0')).join('');
}

// A new login token for this phone. Only its hash is stored.
export async function newSession(env: Env, userId: number): Promise<string> {
  const token = randomHex(32);
  await env.DB.prepare('INSERT INTO sessions (token_hash, user_id, created_at) VALUES (?, ?, ?)')
    .bind(await sha256Hex(token), userId, iso())
    .run();
  return token;
}

export type SessionUser = { id: number; email: string; plan: string | null; endsAt: string | null };

// The user behind "Authorization: Bearer <token>", or null.
export async function userFromToken(req: Request, env: Env): Promise<SessionUser | null> {
  const token = req.headers.get('Authorization')?.replace(/^Bearer /, '');
  if (!token) return null;
  return env.DB.prepare(
    `SELECT u.id, u.email, a.plan, a.ends_at AS endsAt FROM sessions s JOIN users u ON u.id = s.user_id
     LEFT JOIN access a ON a.user_id = u.id WHERE s.token_hash = ?`,
  )
    .bind(await sha256Hex(token))
    .first<SessionUser>();
}
