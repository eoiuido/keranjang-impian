// Talks to our server (keranjang-impian/server). Online, app and server share one
// address, so the base is empty; in development it points at the local server.
const BASE = process.env.EXPO_PUBLIC_API_URL ?? '';

export type OrderInfo = {
  orderId: string;
  plan: 'weekly' | 'yearly';
  amount: number;
  status: 'pending' | 'paid' | 'expired' | 'review';
  paymentUrl: string | null;
  expiresAt: string;
  email?: string;
  endsAt?: string;
  token?: string;
};

export class ApiError extends Error {
  constructor(
    public code: string,
    public data: Record<string, unknown> = {},
  ) {
    super(code);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE + path, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  } catch {
    throw new ApiError('offline');
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(body?.error ?? 'server_error', body ?? {});
  return body as T;
}

export const createOrder = (email: string, plan: 'weekly' | 'yearly', offer: boolean) =>
  request<OrderInfo>('/api/orders', { method: 'POST', body: JSON.stringify({ email, plan, offer }) });

export const getOrder = (id: string) => request<OrderInfo>(`/api/orders/${encodeURIComponent(id)}`);

export const requestLoginCode = (email: string) =>
  request<{ ok: true }>('/api/login/code', { method: 'POST', body: JSON.stringify({ email }) });

export type LoginResult = { token: string; email: string; plan: 'weekly' | 'yearly' | null; endsAt: string | null };

export const verifyLoginCode = (email: string, code: string) =>
  request<LoginResult>('/api/login/verify', { method: 'POST', body: JSON.stringify({ email, code }) });

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

export const fetchBackup = <T>(token: string) =>
  request<{ data: T | null; updatedAt: string | null }>('/api/backup', { headers: auth(token) });

export const uploadBackup = (token: string, data: unknown) =>
  request<{ ok: true; updatedAt: string }>('/api/backup', { method: 'PUT', headers: auth(token), body: JSON.stringify({ data }) });
