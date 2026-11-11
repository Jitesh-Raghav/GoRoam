"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TripFilterOption = { id: string; label: string; count: number };
export type TripSort = string;
export type TripSortOption = { id: TripSort; label: string };

const SORTS: TripSortOption[] = [
  { id: "popular", label: "Popular" },
  { id: "cost", label: "Lowest cost" },
  { id: "days", label: "Shortest" },
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PICK = "goroam:trip-filter";

/**
 * A link to the grid (`#all`) that also picks one of its filters, e.g. a "Trekking" tile above
 * it. Without script it's still the link, to the whole grid.
 */
export function FilterLink({ filter, href = "#all", className, children }: { filter: string; href?: string; className?: string; children: ReactNode }) {
  return (
    <a href={href} className={className} onClick={() => window.dispatchEvent(new CustomEvent(PICK, { detail: filter }))}>
      {children}
    </a>
  );
}

/**
 * A sticky bar that narrows and sorts a server-rendered grid of cards (trips, adventures):
 * kind, best month, and order. Every card stays in the HTML; a choice only writes one small style
 * block (hide by `data-tags` / `data-months`, order by each card's `--o-cost` / `--o-days`),
 * so the grid never re-renders. The count reads what's left on screen.
 */
export function TripFilter({
  options,
  children,
  startMonth = 0,
  label = "Kind of trip",
  noun = ["trip", "trips"],
  sorts = SORTS,
  wrap = false,
}: {
  options: TripFilterOption[];
  children: ReactNode;
  startMonth?: number;
  /** What the chips choose between, for screen readers. */
  label?: string;
  /** What's being counted: [one, many]. */
  noun?: [string, string];
  /** The orders on offer; each card carries a matching `--o-{id}` value. The first keeps the HTML order. */
  sorts?: TripSortOption[];
  /** Let the chips wrap onto a second line on wide screens instead of scrolling. */
  wrap?: boolean;
}) {
  const [filter, setFilter] = useState(options[0]?.id ?? "all");
  const [month, setMonth] = useState(startMonth);
  const [sort, setSort] = useState<TripSort>(sorts[0]?.id ?? "popular");
  const [count, setCount] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const chips = useRef<HTMLDivElement>(null);
  const safe = (s: string) => s.replace(/[^a-z0-9-]/g, "");

  // Picked from a FilterLink elsewhere on the page: show all of that kind, whatever the month,
  // and (once the chips have re-rendered) bring its chip into view along the row.
  const picked = useRef(false);
  useEffect(() => {
    const onPick = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (!options.some((o) => o.id === id)) return;
      picked.current = true;
      setFilter(id);
      setMonth(0);
    };
    window.addEventListener(PICK, onPick);
    return () => window.removeEventListener(PICK, onPick);
  }, [options]);
  useEffect(() => {
    if (!picked.current) return;
    picked.current = false;
    const row = chips.current;
    const on = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (row && on) row.scrollTo({ left: on.offsetLeft - (row.clientWidth - on.offsetWidth) / 2 });
  }, [filter]);

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
    sort !== sorts[0]?.id && `[data-trip-grid] > li { order: var(--o-${safe(sort)}); }`,
  ]
    .filter(Boolean)
    .join("\n");
  const shown = count ?? options.find((o) => o.id === filter)?.count ?? 0;
  const chip = (on: boolean) => cn("shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors duration-200", on ? "bg-ink text-paper" : "text-ink/75 hover:bg-paper-2 hover:text-ink");

  return (
    <div ref={box}>
      <div className="sticky top-0 z-30 -mx-4 border-b border-line bg-paper/[0.97] px-4 pb-3 pt-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        <div ref={chips} role="group" aria-label={label} className={cn("no-scrollbar relative -mx-1 flex gap-1 overflow-x-auto px-1", wrap && "lg:flex-wrap lg:gap-y-1.5 lg:overflow-visible")}>
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
              {shown} {shown === 1 ? noun[0] : noun[1]}
            </span>
            <label className="flex items-center gap-2">
              <span className="sr-only">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-9 cursor-pointer rounded-full bg-paper-2 px-3.5 pr-8 text-sm text-ink outline-none ring-brand/40 focus-visible:ring-2"
              >
                {sorts.map((s) => (
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
