import GoogleProvider from "next-auth/providers/google";
import type { EmailConfig } from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
// The app's shared client: a second one here doubled the database connections
// (and in dev, every hot reload opened yet another).
import { prisma } from "@/lib/prisma";
import { emailConfigured, sendEmail } from "@/lib/email/send";
import { signInEmail } from "@/lib/email/signin-email";
import { sendWelcomeOnce } from "@/lib/email/welcome";

// At most 3 links per address per hour, so the form can't be used to spam someone's inbox.
const linkRequests = new Map<string, number[]>();
function allowLink(email: string) {
  const now = Date.now();
  const recent = (linkRequests.get(email) ?? []).filter((t) => now - t < 60 * 60 * 1000);
  if (recent.length >= 3) return false;
  linkRequests.set(email, [...recent, now]);
  if (linkRequests.size > 5000) linkRequests.delete(linkRequests.keys().next().value!);
  return true;
}

// Defined by hand (not EmailProvider()) so nodemailer isn't needed; mail goes through Resend.
const emailLinkProvider: EmailConfig = {
  id: "email",
  type: "email",
  name: "Email",
  server: {},
  from: process.env.EMAIL_FROM ?? "",
  maxAge: 24 * 60 * 60,
  options: {},
  // "Jane@Mail.com " and "jane@mail.com" are the same account.
  normalizeIdentifier: (identifier) => identifier.trim().toLowerCase(),
  async sendVerificationRequest({ identifier, url }) {
    const email = identifier.toLowerCase();
    if (!allowLink(email)) throw new Error("Too many sign-in links requested; try again in an hour.");
    const { subject, html, text } = signInEmail(url);
    const sent = await sendEmail({ to: email, subject, html, text });
    if (!sent) throw new Error("Couldn't send the sign-in email.");
  },
};

// Accounts created before the first-sign-in step shipped are treated as onboarded,
// so existing travellers are never asked.
const ONBOARDING_SINCE = new Date("2026-10-10T00:00:00Z");

async function needsOnboarding(userId: string) {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { onboardedAt: true, createdAt: true } });
  return !!u && !u.onboardedAt && u.createdAt >= ONBOARDING_SINCE;
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Google verifies the address, so someone who first signed in by email link can
      // later use Google with the same address and land in the same account.
      allowDangerousEmailAccountLinking: true,
    }),
    // Sign in with any email address through a one-time link (sent with Resend).
    ...(emailConfigured() ? [emailLinkProvider] : []),
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
    verifyRequest: "/auth?sent=1",
  },
  callbacks: {
    async jwt({ token, user, account, trigger }: any) {
      if (account && user) {
        return {
          ...token,
          userId: user.id,
          needsOnboarding: await needsOnboarding(user.id).catch(() => false),
        };
      }
      // After the avatar changes, read it back from the database (never trust the client's copy).
      if (trigger === "update" && token.email) {
        const fresh = await prisma.user.findUnique({ where: { email: token.email }, select: { id: true, image: true, name: true } });
        if (fresh) return { ...token, picture: fresh.image, name: fresh.name, needsOnboarding: await needsOnboarding(fresh.id).catch(() => false) };
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.userId as string;
        session.user.needsOnboarding = !!token.needsOnboarding;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }: any) {
      console.log("New user created:", user.email);
      // Google gives us a name straight away; email-link users are welcomed after
      // they tell us what to call them (see /api/user/profile).
      if (user.id && user.name) await sendWelcomeOnce(user.id);
    },
    // Also on every sign-in, so a welcome that failed to send (or was cut off) is retried, still only once.
    async signIn({ user }: any) {
      if (user?.id && user.name) await sendWelcomeOnce(user.id);
    },
  },
}; 