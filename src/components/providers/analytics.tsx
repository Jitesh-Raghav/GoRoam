"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { analyticsEnabled, identify, loadAnalytics } from "@/lib/analytics";

/** Starts PostHog in idle time (when configured) and keeps it in step with sign-in. */
export function Analytics() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!analyticsEnabled) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => void loadAnalytics(), { timeout: 4000 });
    return () => cancel(id);
  }, []);

  useEffect(() => {
    if (status !== "loading") identify(userId);
  }, [status, userId]);

  return null;
}
