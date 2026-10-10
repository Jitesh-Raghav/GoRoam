"use client";

import { Coins } from "@/components/site/icons";
import { useMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

/**
 * "Prices in ₹ INR ▾": which currency the trip's prices are shown in. Offers
 * the traveller's own money, the destination's and a few common ones; the
 * choice is remembered on this device for every trip.
 */
export function CurrencySwitch({ local, typed, className }: { local?: string | null; typed?: string | null; className?: string }) {
  const m = useMoney();
  const options = [...new Set([m.region, typed, local, "USD", "EUR", "GBP"].filter((c): c is string => !!c))].filter((c) => c === "USD" || m.rates?.[c]);
  if (!m.live || options.length < 2) return null;
  return (
    <label
      className={cn(
        "no-print relative inline-flex h-9 cursor-pointer items-center gap-2 rounded-full bg-white/80 pl-3 pr-2 text-xs text-stone ring-1 ring-line backdrop-blur transition-colors focus-within:ring-2 focus-within:ring-brand/50 hover:text-ink",
        className
      )}
    >
      <Coins className="size-3.5 text-brand" />
      Prices in
      <select
        value={m.currency}
        onChange={(e) => m.setCurrency(e.target.value === m.region ? null : e.target.value)}
        aria-label="Show prices in"
        className="cursor-pointer appearance-none bg-transparent pr-4 font-mono text-ink outline-none"
      >
        {options.map((c) => (
          <option key={c} value={c}>
            {c}
            {c === local ? " · local" : c === m.region ? " · yours" : ""}
          </option>
        ))}
      </select>
      <span aria-hidden className="pointer-events-none absolute right-2.5 text-[9px] text-stone">
        ▼
      </span>
    </label>
  );
}
