"use client";

import { useState } from "react";
import type { PlanId } from "@/lib/plans";

/** Remembered across the redirect so the return page can tell when the credits land. */
export const CHECKOUT_KEY = "goroam:checkout";

export interface PendingCheckout {
  plan: PlanId;
  creditsBefore: number;
  startedAt: number;
}

/** Sends the traveller to Dodo's hosted checkout for a credit pack. */
export function useCheckout(creditsNow: number) {
  const [pending, setPending] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = async (plan: PlanId, returnTo?: "planner") => {
    setPending(plan);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan, returnTo }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "We couldn't start checkout. Please try again.");
      try {
        const record: PendingCheckout = { plan, creditsBefore: creditsNow, startedAt: Date.now() };
        window.sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify(record));
      } catch {
        /* the return page falls back to a plain refresh */
      }
      window.location.assign(data.data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "We couldn't start checkout. Please try again.");
      setPending(null);
    }
  };

  return { start, pending, error, clearError: () => setError(null) };
}
