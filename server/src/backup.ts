// Online backup (spec.md section 4) so a paid user's numbers survive a phone change.
import { type Env, iso, json, userFromToken } from './shared';

const MAX_BYTES = 200_000; // numbers and names only; ~2.000 items fit easily

// Keys that must never be stored online, wherever they appear (UU PDP: only what's needed).
const PRIVATE_KEYS = new Set(['photo', 'address']);

function stripPrivate(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripPrivate);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) if (!PRIVATE_KEYS.has(k)) out[k] = stripPrivate(v);
    return out;
  }
  return value;
}

// GET /api/backup → the saved backup of this user, or null.
export async function getBackup(req: Request, env: Env): Promise<Response> {
  const user = await userFromToken(req, env);
  if (!user) return json({ error: 'unauthorized' }, 401);
  const row = await env.DB.prepare('SELECT data, updated_at FROM backups WHERE user_id = ?')
    .bind(user.id)
    .first<{ data: string; updated_at: string }>();
  return json(row ? { data: JSON.parse(row.data), updatedAt: row.updated_at } : { data: null, updatedAt: null });
}

// PUT /api/backup {data} — paid users only.
export async function putBackup(req: Request, env: Env): Promise<Response> {
  const user = await userFromToken(req, env);
  if (!user) return json({ error: 'unauthorized' }, 401);
  if (!user.endsAt || new Date(user.endsAt).getTime() < Date.now()) return json({ error: 'not_paid' }, 403);

  const raw = await req.text();
  if (raw.length > MAX_BYTES) return json({ error: 'too_large' }, 413);
  const body = (() => {
    try {
      return JSON.parse(raw) as { data?: unknown };
    } catch {
      return null;
    }
  })();
  if (!body || !body.data || typeof body.data !== 'object') return json({ error: 'invalid' }, 400);

  const data = JSON.stringify(stripPrivate(body.data));
  const now = iso();
  await env.DB.prepare(
    'INSERT INTO backups (user_id, data, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT (user_id) DO UPDATE SET data = ?2, updated_at = ?3',
  )
    .bind(user.id, data, now)
    .run();
  return json({ ok: true, updatedAt: now });
}
