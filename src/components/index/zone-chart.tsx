"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface ZoneBar {
  zone: string;
  /** Median mid-range day, for the bar length. */
  value: number;
  mid: string;
  low: string;
  high: string;
  count: number;
  cheapest: string;
}

/**
 * Median mid-range cost a day by zone: one series, so one hue and no legend; the
 * value sits at each bar's tip and the rest is in the tooltip and the table below.
 */
export function ZoneChart({ title, bars }: { title: string; bars: ZoneBar[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...bars.map((b) => b.value));

  return (
    <figure>
      <figcaption className="text-sm text-stone">{title}</figcaption>
      <div role="img" aria-label={`${title}: ${bars.map((b) => `${b.zone} ${b.mid}`).join(", ")}`} className="mt-4">
        <ul className="space-y-2 sm:space-y-1">
          {bars.map((b, i) => (
            <li
              key={b.zone}
              tabIndex={0}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover((h) => (h === i ? null : h))}
              onFocus={() => setHover(i)}
              onBlur={() => setHover((h) => (h === i ? null : h))}
              className="relative grid grid-cols-1 gap-1 rounded-lg py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-brand sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-center sm:gap-4"
            >
              <span className={cn("truncate text-sm transition-colors", hover === i ? "text-ink" : "text-ink/75")}>{b.zone}</span>
              <span className="flex items-center gap-2.5 sm:border-l sm:border-line-strong">
                <span className={cn("h-[18px] rounded-r-[4px] bg-brand transition-opacity", hover !== null && hover !== i && "opacity-40")} style={{ width: `${Math.max(2, (b.value / max) * 82)}%` }} />
                <span className="shrink-0 text-sm tabular-nums text-ink">{b.mid}</span>
              </span>
              {hover === i && (
                <span role="tooltip" className="pointer-events-none absolute left-0 top-full z-20 mt-1 w-60 rounded-xl bg-white p-3.5 text-sm shadow-float ring-1 ring-line sm:left-[13rem]">
                  <span className="block font-medium text-ink">{b.zone}</span>
                  <span className="mt-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-ink/80">
                    <span>Mid-range day</span>
                    <strong className="font-medium tabular-nums text-ink">{b.mid}</strong>
                    <span>Backpacker</span>
                    <span className="tabular-nums">{b.low}</span>
                    <span>Luxury</span>
                    <span className="tabular-nums">{b.high}+</span>
                    <span>Trips</span>
                    <span className="tabular-nums">{b.count}</span>
                  </span>
                  <span className="mt-2 block border-t border-line pt-2 text-xs text-stone">Cheapest: {b.cheapest}</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* The same numbers as a table, for screen readers. Wrapped, since a table ignores sr-only's 1px width. */}
      <div className="sr-only">
        <table>
          <caption>{title}</caption>
          <thead>
            <tr>
              <th scope="col">Zone</th>
              <th scope="col">Median mid-range day</th>
              <th scope="col">Median backpacker day</th>
              <th scope="col">Median luxury day</th>
              <th scope="col">Trips</th>
            </tr>
          </thead>
          <tbody>
            {bars.map((b) => (
              <tr key={b.zone}>
                <th scope="row">{b.zone}</th>
                <td>{b.mid}</td>
                <td>{b.low}</td>
                <td>{b.high}</td>
                <td>{b.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
