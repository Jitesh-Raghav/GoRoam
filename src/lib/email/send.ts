// Server-only: sends mail through Resend (https://resend.com).

/**
 * Needs RESEND_API_KEY and EMAIL_FROM, e.g. "GoRoam <jitesh@goroam.world>"
 * (the domain must be verified in Resend). Returns false, with a log line,
 * when email isn't configured or Resend refuses, so callers can carry on.
 */
/** Local development: EMAIL_DEV_LOG=1 prints emails to the server console instead of sending (never in production). */
const devLog = () => process.env.NODE_ENV !== 'production' && process.env.EMAIL_DEV_LOG === '1';

export const emailConfigured = () => devLog() || !!(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());

export async function sendEmail(mail: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; content: string }[];
}): Promise<boolean> {
  if (devLog()) {
    console.log(`\n[email to ${mail.to}] ${mail.subject}\n${mail.text}\n`);
    return true;
  }
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!key || !from) {
    console.warn(`email: RESEND_API_KEY / EMAIL_FROM not set; skipped "${mail.subject}"`);
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        reply_to: mail.replyTo ?? 'jitesh@goroam.world',
        attachments: mail.attachments,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.error('Resend error:', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (error) {
    console.error('email:', error instanceof Error ? error.message : error);
    return false;
  }
}
