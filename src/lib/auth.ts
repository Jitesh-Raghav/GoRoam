import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (account && user) {
        return {
          ...token,
          userId: user.id,
        };
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }: any) {
      console.log("New user created:", user.email);
    },
  },
}; 