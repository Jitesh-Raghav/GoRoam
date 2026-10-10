// Server-only: sends the welcome email exactly once per account.
import { prisma } from '@/lib/prisma';
import { emailConfigured, sendEmail } from './send';
import { welcomeEmail } from './welcome-email';

/**
 * Claims the user's welcome atomically (so two sign-in events can't both send),
 * then sends it. If sending fails the claim is released, so the next sign-in
 * retries. Only accounts created in the last week qualify, so existing users
 * never get a surprise "welcome" long after joining.
 */
export async function sendWelcomeOnce(userId: string) {
  if (!emailConfigured()) return;
  try {
    const recent = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const claimed = await prisma.user.updateMany({
      where: { id: userId, welcomeSentAt: null, createdAt: { gte: recent } },
      data: { welcomeSentAt: new Date() },
    });
    if (claimed.count !== 1) return;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
    if (!user?.email) return;
    const { subject, html, text } = welcomeEmail(user.name);
    const sent = await sendEmail({ to: user.email, subject, html, text });
    if (!sent) await prisma.user.update({ where: { id: userId }, data: { welcomeSentAt: null } });
  } catch (error) {
    console.error('welcome email:', error instanceof Error ? error.message : error);
  }
}
