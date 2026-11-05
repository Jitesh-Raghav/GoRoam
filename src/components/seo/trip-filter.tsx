"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TripFilterOption = { id: string; label: string; count: number };

/**
 * Chips that narrow a server-rendered grid of trips. Every card stays in the HTML; picking a
 * chip only adds one style rule that hides the cards whose `data-tags` don't carry it, so the
 * grid itself never re-renders.
 */
export function TripFilter({ options, children }: { options: TripFilterOption[]; children: ReactNode }) {
  const [filter, setFilter] = useState(options[0]?.id ?? "all");
  const count = options.find((o) => o.id === filter)?.count ?? 0;
  return (
    <div>
      <div role="tablist" aria-label="Filter trips" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={filter === o.id}
            onClick={() => setFilter(o.id)}
            className={cn("shrink-0 rounded-full px-4 py-2 text-sm transition-colors", filter === o.id ? "bg-ink text-paper" : "bg-paper-2 text-ink hover:bg-paper-3")}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="mt-5 text-sm text-stone" aria-live="polite">
        {count} {count === 1 ? "trip" : "trips"}
      </p>
      {filter !== "all" && <style>{`[data-trip-grid] > li:not([data-tags~="${filter.replace(/[^a-z-]/g, "")}"]) { display: none; }`}</style>}
      {children}
    </div>
  );
}
