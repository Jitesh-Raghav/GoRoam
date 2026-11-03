"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CalendarDays, CloudRain, Sun, Users } from "@/components/site/icons";
import { cn } from "@/lib/utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const ease = [0.16, 1, 0.3, 1] as const;

type Season = "best" | "shoulder" | "off";

/** Each month as best, shoulder (next to a best month) or off. */
export function seasonOf(months: number[]): Season[] {
  return MONTHS.map((_, i) => {
    const m = i + 1;
    if (months.includes(m)) return "best";
    const prev = m === 1 ? 12 : m - 1;
    const next = m === 12 ? 1 : m + 1;
    return months.includes(prev) || months.includes(next) ? "shoulder" : "off";
  });
}

const LABEL = { best: "Best", shoulder: "Shoulder", off: "Off season" } as const;
const VERDICT: Record<Season, { title: string; icon: typeof Sun; tone: string; lines: string[] }> = {
  best: { title: "A great time to go", icon: Sun, tone: "bg-brand text-white", lines: ["The weather is at its best.", "Peak season: book stays and tours early."] },
  shoulder: { title: "A good time, with fewer crowds", icon: Users, tone: "bg-brand-2/30 text-ink", lines: ["Mostly good weather, with the odd off day.", "Shoulder season: lower prices and easier bookings."] },
  off: { title: "Off season: go with your eyes open", icon: CloudRain, tone: "bg-paper-2 text-ink", lines: ["Expect heat, rain or closures.", "Prices are at their lowest, and you'll have places to yourself."] },
};

/**
 * The year at a glance, and "When are you going?": tap a month to see whether it's a
 * good time, what to expect and a planner link for that month.
 */
export function SeasonBar({ months, weather, name, hrefs }: { months: number[]; weather?: string; name: string; hrefs: string[] }) {
  const season = seasonOf(months);
  const now = new Date().getMonth();
  const [picked, setPicked] = useState(now);
  const v = VERDICT[season[picked]];

  return (
    <div className="overflow-hidden rounded-panel bg-white ring-1 ring-line">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-medium text-ink">
            <CalendarDays className="size-4 text-brand" /> When are you going?
          </p>
          <ul className="flex flex-wrap gap-3 text-xs text-stone">
            {(["best", "shoulder", "off"] as const).map((k) => (
              <li key={k} className="inline-flex items-center gap-1.5">
                <span className={cn("size-2.5 rounded-full", k === "best" ? "bg-brand" : k === "shoulder" ? "bg-brand-2/70" : "bg-paper-3")} />
                {LABEL[k]}
              </li>
            ))}
          </ul>
        </div>
        <ol aria-label="Pick a month" className="mt-5 grid grid-cols-6 gap-1.5 sm:grid-cols-12">
          {MONTHS.map((m, i) => (
            <li key={m} className="relative">
              <button
                type="button"
                aria-pressed={picked === i}
                onClick={() => setPicked(i)}
                className={cn(
                  "flex h-11 w-full flex-col items-center justify-center rounded-xl font-mono text-[11px] transition-all duration-300",
                  season[i] === "best" ? "bg-brand text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]" : season[i] === "shoulder" ? "bg-brand-2/25 text-ink" : "bg-paper-2/70 text-stone-2",
                  picked === i ? "scale-105 ring-2 ring-ink ring-offset-2 ring-offset-white" : "hover:-translate-y-0.5"
                )}
              >
                {m}
                <span className="sr-only">: {LABEL[season[i]]}</span>
              </button>
              {i === now && <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-sun-2 px-1.5 text-[9px] font-medium uppercase tracking-wider text-ink">Now</span>}
            </li>
          ))}
        </ol>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={picked}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease }}
          className="grid gap-4 border-t border-line bg-paper-2/40 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6"
        >
          <div className="flex gap-4">
            <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", v.tone)}>
              <v.icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.14em] text-stone">
                {name} in {FULL[picked]}
              </p>
              <p className="display mt-0.5 text-[1.2rem] leading-snug text-ink">{v.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink/70">{v.lines.join(" ")}</p>
            </div>
          </div>
          <Link href={hrefs[picked]} className="group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm text-paper transition-colors hover:bg-brand">
            Plan {name} for {FULL[picked]} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </AnimatePresence>
      {weather && <p className="border-t border-line px-5 py-4 text-sm leading-relaxed text-stone sm:px-6">{weather}</p>}
    </div>
  );
}
