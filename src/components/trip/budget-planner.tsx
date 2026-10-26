"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { BedDouble, Minus, Plus, Ticket, TramFront, UtensilsCrossed } from "@/components/site/icons";
import { cn } from "@/lib/utils";

const LEVELS = ["Budget", "Mid-range", "Luxury"] as const;
const ease = [0.16, 1, 0.3, 1] as const;

function Stepper({ label, value, min, max, onChange, unit }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; unit: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-paper-2/60 px-4 py-3">
      <span className="text-sm text-stone">{label}</span>
      <span className="flex items-center gap-3">
        <button type="button" aria-label={`Fewer ${unit}`} disabled={value <= min} onClick={() => onChange(value - 1)} className="grid size-8 place-items-center rounded-full bg-white text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-paper disabled:opacity-30">
          <Minus className="size-3.5" />
        </button>
        <span className="display w-14 text-center text-lg tabular-nums text-ink" aria-live="polite">
          {value} <span className="text-xs text-stone">{unit}</span>
        </span>
        <button type="button" aria-label={`More ${unit}`} disabled={value >= max} onClick={() => onChange(value + 1)} className="grid size-8 place-items-center rounded-full bg-white text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-paper disabled:opacity-30">
          <Plus className="size-3.5" />
        </button>
      </span>
    </div>
  );
}

/**
 * What the trip costs your group: pick how many, how long and the style, and see
 * the total, the cost each and where the money goes. The bed share comes from this
 * trip's own hotel prices; the rest is a typical split of food, transport and sights.
 */
export function BudgetPlanner({
  name,
  currency,
  budget,
  days: start,
  stays,
}: {
  name: string;
  currency: "INR" | "USD";
  /** Per person a day: budget, mid-range, luxury. */
  budget: [number, number, number];
  days: number;
  /** A night for two at each level. */
  stays: [number, number, number];
}) {
  const [people, setPeople] = useState(2);
  const [days, setDays] = useState(start);
  const [level, setLevel] = useState<0 | 1 | 2>(1);
  const fmt = (n: number) => (currency === "USD" ? `$${Math.round(n).toLocaleString("en-US")}` : `₹${Math.round(n).toLocaleString("en-IN")}`);

  const perDay = budget[level];
  const each = perDay * days;
  const total = each * people;
  // A bed for one is half a double room, capped so food and fun always get a share.
  const bed = Math.min(perDay * 0.6, stays[level] / 2);
  const rest = perDay - bed;
  const split = [
    { k: "Stay", icon: BedDouble, v: bed, tone: "bg-brand" },
    { k: "Food", icon: UtensilsCrossed, v: rest * 0.45, tone: "bg-sun-2" },
    { k: "Getting around", icon: TramFront, v: rest * 0.25, tone: "bg-brand-2" },
    { k: "Sights & fun", icon: Ticket, v: rest * 0.3, tone: "bg-coral" },
  ];

  return (
    <div className="grid overflow-hidden rounded-panel bg-white ring-1 ring-line lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="space-y-3 p-5 sm:p-6">
        <div role="radiogroup" aria-label="Travel style" className="grid grid-cols-3 gap-1.5 rounded-2xl bg-paper-2/60 p-1.5">
          {LEVELS.map((l, i) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={level === i}
              onClick={() => setLevel(i as 0 | 1 | 2)}
              className={cn("relative rounded-xl px-2 py-2.5 text-center transition-colors", level === i ? "text-paper" : "text-ink hover:bg-white")}
            >
              {level === i && <motion.span layoutId="budget-level" transition={{ type: "spring", stiffness: 420, damping: 36 }} className="absolute inset-0 rounded-xl bg-ink" />}
              <span className="relative block text-sm">{l}</span>
              <span className={cn("relative block text-xs tabular-nums", level === i ? "text-paper/70" : "text-stone")}>
                {fmt(budget[i])}
                {i === 2 ? "+" : ""}/day
              </span>
            </button>
          ))}
        </div>
        <Stepper label="Travellers" value={people} min={1} max={10} onChange={setPeople} unit={people === 1 ? "person" : "people"} />
        <Stepper label="Length" value={days} min={1} max={14} onChange={setDays} unit={days === 1 ? "day" : "days"} />
        <p className="px-1 text-xs leading-relaxed text-stone">Per person: stay, food, local transport and entry fees. Getting to {name} is extra.</p>
      </div>

      <div className="relative flex flex-col bg-[linear-gradient(160deg,var(--ink),var(--ink-2))] p-5 text-paper sm:p-6">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-brand/30 blur-3xl" />
        <div className="relative grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-paper/60">
              {people} {people === 1 ? "person" : "people"}, {days} {days === 1 ? "day" : "days"}
            </p>
            <motion.p key={`${total}`} initial={{ opacity: 0.4, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }} className="display mt-1 text-[2.4rem] leading-none tabular-nums">
              {fmt(total)}
            </motion.p>
          </div>
          <div>
            <p className="text-xs text-paper/60">Each</p>
            <p className="display mt-1 text-[2.4rem] leading-none tabular-nums text-sun-2">{fmt(each)}</p>
          </div>
        </div>

        <p className="relative mt-6 text-xs text-paper/60">Where a day&apos;s {fmt(perDay)} goes, per person</p>
        <div className="relative mt-2 flex h-3 overflow-hidden rounded-full bg-white/10">
          {split.map((s) => (
            <motion.span key={s.k} className={cn("h-full", s.tone)} animate={{ width: `${(s.v / perDay) * 100}%` }} transition={{ duration: 0.6, ease }} />
          ))}
        </div>
        <ul className="relative mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
          {split.map((s) => (
            <li key={s.k} className="flex items-center gap-2.5">
              <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl text-ink", s.tone)}>
                <s.icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-paper/60">{s.k}</span>
                <span className="block text-sm tabular-nums">{fmt(s.v)}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="relative mt-auto pt-5 text-[11px] leading-relaxed text-paper/45">The stay share is from this page&apos;s hotel prices; the rest is a typical split. Rough guide; check before you book.</p>
      </div>
    </div>
  );
}
