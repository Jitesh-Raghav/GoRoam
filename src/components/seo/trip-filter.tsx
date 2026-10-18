"use client";

import { useState } from "react";
import { TripCard } from "@/components/seo/trip-card";
import { TAG_LABEL, type TripIdea, type TripTag } from "@/lib/trip-ideas";
import { cn } from "@/lib/utils";

type Filter = "all" | "india" | TripTag;

const FILTERS: Filter[] = ["all", "india", "abroad", "beach", "hills", "snow", "desert", "wildlife", "heritage", "festival", "honeymoon", "weekend", "family", "adventure"];
const label = (f: Filter) => (f === "all" ? "All trips" : f === "india" ? "India" : TAG_LABEL[f]);
const matches = (t: TripIdea, f: Filter) => f === "all" || (f === "india" ? t.country === "India" : t.tags.includes(f));

/** Every trip, with chips to narrow them down. All cards stay in the HTML; the filter only hides them. */
export function TripFilter({ trips }: { trips: TripIdea[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const count = trips.filter((t) => matches(t, filter)).length;
  return (
    <div>
      <div role="tablist" aria-label="Filter trips" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={cn("shrink-0 rounded-full px-4 py-2 text-sm ring-1 transition-colors", filter === f ? "bg-ink text-paper ring-ink" : "bg-white text-ink ring-line hover:bg-paper-2")}
          >
            {label(f)}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-stone">
        {count} {count === 1 ? "trip" : "trips"}
      </p>
      <ul className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {trips.map((t) => (
          <li key={t.slug} className={cn(!matches(t, filter) && "hidden")}>
            <TripCard t={t} />
          </li>
        ))}
      </ul>
    </div>
  );
}
