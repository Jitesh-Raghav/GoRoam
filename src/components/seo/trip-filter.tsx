"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TripFilterOption = { id: string; label: string; count: number };
export type TripSort = "popular" | "cost" | "days";

const SORTS: { id: TripSort; label: string }[] = [
  { id: "popular", label: "Popular" },
  { id: "cost", label: "Lowest cost" },
  { id: "days", label: "Shortest" },
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * A sticky bar that narrows and sorts a server-rendered grid of trips: kind of trip, best
 * month, and order. Every card stays in the HTML; a choice only writes one small style
 * block (hide by `data-tags` / `data-months`, order by each card's `--o-cost` / `--o-days`),
 * so the grid never re-renders. The count reads what's left on screen.
 */
export function TripFilter({ options, children, startMonth = 0 }: { options: TripFilterOption[]; children: ReactNode; startMonth?: number }) {
  const [filter, setFilter] = useState(options[0]?.id ?? "all");
  const [month, setMonth] = useState(startMonth);
  const [sort, setSort] = useState<TripSort>("popular");
  const [count, setCount] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const safe = (s: string) => s.replace(/[^a-z0-9-]/g, "");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const items = box.current?.querySelectorAll<HTMLElement>("[data-trip-grid] > li") ?? [];
      setCount([...items].filter((li) => getComputedStyle(li).display !== "none").length);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [filter, month]);

  const rules = [
    filter !== "all" && `[data-trip-grid] > li:not([data-tags~="${safe(filter)}"]) { display: none; }`,
    month > 0 && `[data-trip-grid] > li:not([data-months~="${month}"]) { display: none; }`,
    sort !== "popular" && `[data-trip-grid] > li { order: var(--o-${sort}); }`,
  ]
    .filter(Boolean)
    .join("\n");
  const shown = count ?? options.find((o) => o.id === filter)?.count ?? 0;
  const chip = (on: boolean) => cn("shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors duration-200", on ? "bg-ink text-paper" : "text-ink/75 hover:bg-paper-2 hover:text-ink");

  return (
    <div ref={box}>
      <div className="sticky top-0 z-30 -mx-4 border-b border-line bg-paper/[0.97] px-4 pb-3 pt-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        <div role="group" aria-label="Kind of trip" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
          {options.map((o) => (
            <button key={o.id} type="button" aria-pressed={filter === o.id} onClick={() => setFilter(o.id)} className={chip(filter === o.id)}>
              {o.label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <div role="group" aria-label="Best month" className="no-scrollbar -mx-1 flex max-w-full gap-0.5 overflow-x-auto px-1">
            <button type="button" aria-pressed={month === 0} onClick={() => setMonth(0)} className={cn(chip(month === 0), "px-3 text-[0.8rem]")}>
              Any month
            </button>
            {MONTHS.map((m, i) => (
              <button key={m} type="button" aria-pressed={month === i + 1} onClick={() => setMonth(i + 1)} className={cn(chip(month === i + 1), "px-2.5 text-[0.8rem]")}>
                {m}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-stone" aria-live="polite">
              {shown} {shown === 1 ? "trip" : "trips"}
            </span>
            <label className="flex items-center gap-2">
              <span className="sr-only">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as TripSort)}
                className="h-9 cursor-pointer rounded-full bg-paper-2 px-3.5 pr-8 text-sm text-ink outline-none ring-brand/40 focus-visible:ring-2"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>
      {rules && <style>{rules}</style>}
      {children}
    </div>
  );
}
