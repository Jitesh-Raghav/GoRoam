"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "@/components/site/icons";

/** On public pages, a way back to the dashboard for travellers who are signed in. */
export function DashboardReturn() {
  const { status } = useSession();
  if (status !== "authenticated") return null;
  return (
    <Link
      href="/dashboard"
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-paper"
    >
      <ArrowLeft className="size-3.5" /> Back to dashboard
    </Link>
  );
}
