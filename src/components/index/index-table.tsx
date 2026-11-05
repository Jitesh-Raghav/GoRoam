"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDownUp, Search } from "@/components/site/icons";
import { cn } from "@/lib/utils";

export interface TableRow {
  slug: string;
  name: string;
  place: string;
  zone: string;
  days: number;
  low: number;
  mid: number;
  high: number;
  forTwo: number;
  best: string;
}

export interface TableIndex {
  id: string;
  label: string;
  currency: "INR" | "USD";
  rows: TableRow[];
}

type Key = "name" | "zone" | "days" | "low" | "mid" | "high" | "forTwo";
const COLS: { k: Key; label: string; num?: boolean }[] = [
  { k: "zone", label: "Zone" },
  { k: "days", label: "Days", num: true },
  { k: "low", label: "Backpacker /day", num: true },
  { k: "mid", label: "Mid-range /day", num: true },
  { k: "high", label: "Luxury /day", num: true },
  { k: "forTwo", label: "Mid-range trip for two", num: true },
];

const fmt = (c: "INR" | "USD", n: number) => (c === "USD" ? `$${n.toLocaleString("en-US")}` : `₹${n.toLocaleString("en-IN")}`);

function Panel({ ix, hidden }: { ix: TableIndex; hidden: boolean }) {
  const [sort, setSort] = useState<{ k: Key; dir: 1 | -1 }>({ k: "mid", dir: 1 });
  const [zone, setZone] = useState("All zones");
  const [q, setQ] = useState("");
  const zones = useMemo(() => ["All zones", ...[...new Set(ix.rows.map((r) => r.zone))].sort()], [ix.rows]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ix.rows
      .filter((r) => (zone === "All zones" || r.zone === zone) && (!needle || `${r.name} ${r.place}`.toLowerCase().includes(needle)))
      .sort((a, b) => {
        const x = a[sort.k];
        const y = b[sort.k];
        return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))) * sort.dir;
      });
  }, [ix.rows, zone, q, sort]);

  const head = (k: Key, label: string, num?: boolean) => {
    const on = sort.k === k;
    return (
      <th key={k} scope="col" aria-sort={on ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className={cn("px-4 py-3 font-normal", num && "text-right")}>
        <button type="button" onClick={() => setSort({ k, dir: on ? (sort.dir === 1 ? -1 : 1) : 1 })} className={cn("inline-flex items-center gap-1 whitespace-nowrap transition-colors hover:text-ink", on && "text-ink")}>
          {label}
          <ArrowDownUp className={cn("size-3", on ? "opacity-100" : "opacity-30")} />
        </button>
      </th>
    );
  };

  return (
    <div id={`index-${ix.id}`} role="tabpanel" aria-labelledby={`index-tab-${ix.id}`} hidden={hidden}>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block sm:w-72">
          <span className="sr-only">Search trips</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a trip or place" className="w-full rounded-full bg-white py-2.5 pl-10 pr-4 text-sm text-ink outline-none ring-1 ring-line placeholder:text-stone-2 focus:ring-ink" />
        </label>
        <label className="flex items-center gap-2 text-sm text-stone">
          Zone
          <select value={zone} onChange={(e) => setZone(e.target.value)} className="rounded-full bg-white px-3.5 py-2.5 text-sm text-ink outline-none ring-1 ring-line focus:ring-ink">
            {zones.map((z) => (
              <option key={z}>{z}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-4 text-xs text-stone sm:hidden">Swipe the table sideways for prices.</p>
      <div className="no-scrollbar mt-3 overflow-x-auto border-y border-ink sm:mt-5">
        <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
          <thead className="text-xs text-stone">
            <tr className="border-b border-line">
              <th scope="col" aria-sort={sort.k === "name" ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className="sticky left-0 z-10 bg-paper py-3 pr-4 font-normal">
                <button type="button" onClick={() => setSort({ k: "name", dir: sort.k === "name" ? (sort.dir === 1 ? -1 : 1) : 1 })} className={cn("inline-flex items-center gap-1 hover:text-ink", sort.k === "name" && "text-ink")}>
                  Trip <ArrowDownUp className={cn("size-3", sort.k === "name" ? "opacity-100" : "opacity-30")} />
                </button>
              </th>
              {COLS.map((c) => head(c.k, c.label, c.num))}
              <th scope="col" className="px-4 py-3 font-normal">
                Best time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.slug} className="transition-colors hover:bg-white">
                <th scope="row" className="sticky left-0 z-10 bg-paper py-3 pr-4 font-normal">
                  <Link href={`/trips/${r.slug}`} className="font-medium text-ink hover:text-brand">
                    {r.name}
                  </Link>
                  <span className="block text-xs text-stone">{r.place}</span>
                </th>
                <td className="px-4 py-3 text-ink/80">{r.zone}</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink/80">{r.days}</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink/80">{fmt(ix.currency, r.low)}</td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-ink">{fmt(ix.currency, r.mid)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink/80">{fmt(ix.currency, r.high)}+</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink/80">{fmt(ix.currency, r.forTwo)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink/80">{r.best}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={COLS.length + 2} className="py-10 text-center text-stone">
                  No trips match{q.trim() ? ` “${q.trim()}”` : ""}{zone !== "All zones" ? ` in ${zone}` : ""}.{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setQ("");
                      setZone("All zones");
                    }}
                    className="text-ink underline underline-offset-2 hover:text-brand"
                  >
                    Show all trips
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-stone">
        {rows.length} of {ix.rows.length} trips · per person, stay, food, local transport and entry fees; getting there not included · {ix.currency === "USD" ? "US dollars" : "Indian rupees"}
      </p>
    </div>
  );
}

/** Every trip in the index: one tab per index, sortable on any column, with a zone filter and search. All rows are in the page's HTML. */
export function IndexTable({ indexes }: { indexes: TableIndex[] }) {
  const [active, setActive] = useState(indexes[0].id);
  return (
    <div>
      <div role="tablist" aria-label="Choose an index" className="inline-flex rounded-full bg-paper-2 p-1">
        {indexes.map((ix) => (
          <button
            key={ix.id}
            type="button"
            role="tab"
            id={`index-tab-${ix.id}`}
            aria-selected={active === ix.id}
            aria-controls={`index-${ix.id}`}
            onClick={() => setActive(ix.id)}
            className={cn("rounded-full px-4 py-2 text-sm transition-colors", active === ix.id ? "bg-ink text-paper" : "text-ink/75 hover:text-ink")}
          >
            {ix.label} <span className={cn("ml-1 text-xs", active === ix.id ? "text-paper/60" : "text-stone")}>{ix.rows.length}</span>
          </button>
        ))}
      </div>
      {indexes.map((ix) => (
        <Panel key={ix.id} ix={ix} hidden={ix.id !== active} />
      ))}
    </div>
  );
}
