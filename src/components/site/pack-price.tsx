"use client";

import { usePackPrice } from "@/lib/money";
import type { Plan } from "@/lib/plans";
import { cn } from "@/lib/utils";

/**
 * A pass's price in the visitor's currency: "₹799 one-time", or, where
 * we bill in USD, "≈ ₹830" with "billed as $9.99" so nobody is surprised at checkout.
 */
export function PackPrice({ plan, className, muted, note = "one-time" }: { plan: Plan; className?: string; muted?: string; note?: string }) {
  const p = usePackPrice()(plan);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className={cn("display leading-none tabular-nums", className)}>
        {p.approx && <span className="mr-1 align-[0.18em] text-[0.5em] opacity-60">≈</span>}
        {p.price}
      </span>
      <span className={cn("text-sm", muted)}>{p.billed ? `billed as ${p.billed}` : note}</span>
    </div>
  );
}

/** "$0.05" / "₹2": what a pass costs per day. */
export function PackEach({ plan }: { plan: Plan }) {
  return <>{usePackPrice()(plan).each}</>;
}
