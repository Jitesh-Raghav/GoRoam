import type { Metadata } from "next";

// The sign-in page is for people, not search results.
export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: true } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
