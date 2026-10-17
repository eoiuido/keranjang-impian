// DOKU Checkout (non-SNAP). Signature rules:
// https://developers.doku.com/getting-started-with-doku-api/signature-component/signature-component-from-request-header
const enc = new TextEncoder();

const toBase64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));

// Digest = base64(SHA-256(JSON body)). POST only.
export async function digest(body: string): Promise<string> {
  return toBase64(await crypto.subtle.digest('SHA-256', enc.encode(body)));
}

export type SignParts = {
  clientId: string;
  requestId: string;
  timestamp: string; // ISO8601 UTC, e.g. 2020-08-11T08:45:42Z
  target: string; // path only, e.g. /checkout/v1/payment
  digest?: string; // omitted for GET
};

// One "Name:value" per line, no trailing newline, HMAC-SHA256 with the Secret Key.
export async function signature(secretKey: string, p: SignParts): Promise<string> {
  const lines = [
    `Client-Id:${p.clientId}`,
    `Request-Id:${p.requestId}`,
    `Request-Timestamp:${p.timestamp}`,
    `Request-Target:${p.target}`,
  ];
  if (p.digest !== undefined) lines.push(`Digest:${p.digest}`);
  const key = await crypto.subtle.importKey('raw', enc.encode(secretKey), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(lines.join('\n')));
  return `HMACSHA256=${toBase64(mac)}`;
}

// Constant-time string comparison, so attackers can't guess the signature byte by byte.
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// DOKU wants UTC with no milliseconds.
const timestamp = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

export type DokuEnv = { DOKU_BASE_URL: string; DOKU_CLIENT_ID: string; DOKU_SECRET_KEY: string };

async function call(env: DokuEnv, method: 'GET' | 'POST', target: string, body?: unknown) {
  const raw = body === undefined ? undefined : JSON.stringify(body);
  const requestId = crypto.randomUUID();
  const ts = timestamp();
  const sig = await signature(env.DOKU_SECRET_KEY, {
    clientId: env.DOKU_CLIENT_ID,
    requestId,
    timestamp: ts,
    target,
    digest: raw === undefined ? undefined : await digest(raw),
  });
  const res = await fetch(env.DOKU_BASE_URL + target, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Client-Id': env.DOKU_CLIENT_ID,
      'Request-Id': requestId,
      'Request-Timestamp': ts,
      Signature: sig,
    },
    body: raw,
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    // keep null
  }
  return { ok: res.ok, status: res.status, json, text };
}

// Payment methods on DOKU's page: QRIS + e-wallets (owner decision 2026-10-16).
export const METHODS = ['QRIS', 'EMONEY_OVO', 'EMONEY_DANA', 'EMONEY_SHOPEE_PAY', 'EMONEY_LINKAJA'];

export async function createCheckout(
  env: DokuEnv,
  o: { invoice: string; amount: number; email: string; callbackUrl: string; notifyUrl: string; minutes: number },
): Promise<{ url: string }> {
  const r = await call(env, 'POST', '/checkout/v1/payment', {
    order: { amount: o.amount, invoice_number: o.invoice, callback_url: o.callbackUrl },
    payment: { payment_due_date: o.minutes, payment_method_types: METHODS },
    customer: { email: o.email },
    // Tell DOKU where to send the "paid" message for this order; no dashboard setting needed.
    additional_info: { override_notification_url: o.notifyUrl },
  });
  const url = r.json?.response?.payment?.url;
  if (!r.ok || typeof url !== 'string') {
    throw new Error(`DOKU checkout failed (${r.status}): ${r.text.slice(0, 300)}`);
  }
  return { url };
}

// Ask DOKU about an order. Returns e.g. SUCCESS, PENDING, FAILED, EXPIRED, or null if unknown.
export async function checkStatus(env: DokuEnv, invoice: string): Promise<{ status: string | null; amount: number | null; channel: string | null }> {
  const r = await call(env, 'GET', `/orders/v1/status/${encodeURIComponent(invoice)}`);
  const j = r.json;
  return {
    status: typeof j?.transaction?.status === 'string' ? j.transaction.status : null,
    amount: j?.order?.amount != null ? Math.round(Number(j.order.amount)) : null,
    channel: j?.channel?.id ?? j?.service?.id ?? null,
  };
}

// Check that a notification really came from DOKU: same signature recomputed with our Secret Key.
export async function verifyNotification(
  env: DokuEnv,
  headers: Headers,
  path: string,
  rawBody: string,
): Promise<boolean> {
  const clientId = headers.get('Client-Id');
  const requestId = headers.get('Request-Id');
  const ts = headers.get('Request-Timestamp');
  const sig = headers.get('Signature');
  if (!clientId || !requestId || !ts || !sig || clientId !== env.DOKU_CLIENT_ID) return false;
  const expected = await signature(env.DOKU_SECRET_KEY, {
    clientId,
    requestId,
    timestamp: ts,
    target: path,
    digest: await digest(rawBody),
  });
  return safeEqual(expected, sig);
}
