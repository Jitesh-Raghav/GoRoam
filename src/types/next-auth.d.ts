import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      /** First sign-in: show the "What should we call you?" step. */
      needsOnboarding?: boolean
    }
  }

  interface User {
    id: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string
    needsOnboarding?: boolean
  }
} 