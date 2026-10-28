// Log out and delete-my-data (spec.md S16, UU PDP: users can delete their data and account).
import { type Env, json, sha256Hex, userFromToken } from './shared';

// POST /api/logout — ends only this phone's session.
export async function logout(req: Request, env: Env): Promise<Response> {
  const token = req.headers.get('Authorization')?.replace(/^Bearer /, '');
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256Hex(token)).run();
  return json({ ok: true });
}

// DELETE /api/account — removes the account, access, sessions, backup and login codes.
// Orders are kept for bookkeeping but the email is removed from them (anonymous).
export async function deleteAccount(req: Request, env: Env): Promise<Response> {
  const user = await userFromToken(req, env);
  if (!user) return json({ error: 'unauthorized' }, 401);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM backups WHERE user_id = ?').bind(user.id),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(user.id),
    env.DB.prepare('DELETE FROM access WHERE user_id = ?').bind(user.id),
    env.DB.prepare('DELETE FROM login_codes WHERE email = ?').bind(user.email),
    env.DB.prepare("UPDATE orders SET email = 'deleted' WHERE email = ?").bind(user.email),
    env.DB.prepare('DELETE FROM users WHERE id = ?').bind(user.id),
  ]);
  console.log('account deleted', user.id);
  return json({ ok: true });
}
