// Sends emails through Resend (https://resend.com). Without an API key (local
// development) the email is only written to the server log.
export type EmailEnv = { RESEND_API_KEY?: string; EMAIL_FROM?: string };

export async function sendEmail(env: EmailEnv, to: string, subject: string, text: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    console.log(`[email not sent: no RESEND_API_KEY] to=${to} subject="${subject}"\n${text}`);
    return true;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.EMAIL_FROM ?? 'Keranjang Impian <onboarding@resend.dev>', to, subject, text }),
  });
  if (!res.ok) console.error('resend', res.status, (await res.text()).slice(0, 300));
  return res.ok;
}
