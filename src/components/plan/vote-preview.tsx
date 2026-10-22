"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ThumbsUp, Wallet, WhatsApp } from "@/components/site/icons";
import { cn } from "@/lib/utils";
import { CREW } from "./crew";

const STOPS = [
  { time: "10:00", name: "Parasailing at Calangute", votes: 4 },
  { time: "13:30", name: "Fish thali at a beach shack", votes: 5 },
  { time: "16:00", name: "Chapora Fort at sunset", votes: 3 },
  { time: "22:00", name: "Night market at Arpora", votes: 2 },
];

const LEDGER = [
  { who: "Riya", what: "Villa, 3 nights", amt: "₹18,000" },
  { who: "Arjun", what: "Scooters", amt: "₹2,400" },
  { who: "Sana", what: "Dinner at Thalassa", amt: "₹6,500" },
];

/** A day of a group trip coming together: votes ticking in, the wallet filling and the morning message. */
export function VotePreview() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 9), 900);
    return () => clearInterval(id);
  }, []);
  const shown = (target: number) => Math.min(target, Math.max(0, tick - 1));
  const top = tick >= 6;

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      {/* The day, with votes ticking in */}
      <div className="rounded-[26px] bg-white p-5 ring-1 ring-line sm:p-6">
        <div className="flex items-center justify-between">
          <p className="display text-lg text-ink">Day 2 · North Goa</p>
          <span className="flex -space-x-2">
            {CREW.map((c) => (
              <span key={c.name} className={cn("grid size-7 place-items-center rounded-full text-[11px] font-semibold text-ink ring-2 ring-white", c.tone)}>
                {c.name[0]}
              </span>
            ))}
          </span>
        </div>
        <ul className="mt-4 space-y-2">
          {STOPS.map((s, i) => {
            const v = shown(s.votes);
            const winner = top && i === 1;
            return (
              <li key={s.name} className={cn("flex items-center gap-3 rounded-2xl p-3 ring-1 transition-colors", winner ? "bg-sun-soft ring-sun/40" : "bg-paper-2/50 ring-transparent")}>
                <span className="w-12 font-mono text-xs text-stone">{s.time}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-ink">{s.name}</span>
                <AnimatePresence>
                  {winner && (
                    <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="hidden rounded-full bg-ink px-2 py-0.5 text-[10px] text-paper sm:inline">
                      Group pick
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className="inline-flex min-w-[3.25rem] items-center justify-end gap-1 text-sm text-ink">
                  <ThumbsUp className="size-4 text-brand" />
                  <motion.span key={v} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="tabular-nums">
                    {v}
                  </motion.span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid gap-4">
        {/* Wallet */}
        <div className="rounded-[26px] bg-ink p-5 text-paper">
          <p className="flex items-center gap-2 text-xs text-paper/60">
            <Wallet className="size-4 text-sun-2" /> Trip wallet
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {LEDGER.map((l) => (
              <li key={l.what} className="flex justify-between gap-3">
                <span className="text-paper/80">
                  {l.who} · {l.what}
                </span>
                <span className="font-mono">{l.amt}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-xs text-paper/85">Settle up: Kabir and Meera pay Riya ₹5,380 each · Arjun pays Riya ₹1,860 and Sana ₹1,120</p>
        </div>
        {/* WhatsApp */}
        <div className="rounded-[26px] bg-[#E7FFDB] p-4 ring-1 ring-[#BDE8A9]">
          <p className="flex items-center gap-2 text-xs text-[#1F7A3B]">
            <WhatsApp className="size-4" /> Goa squad 🌴 · 7:00 AM
          </p>
          <p className="mt-2 rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-sm leading-snug text-ink shadow-sm">
            ☀️ Day 2 in Goa, 31°C. 10:00 parasailing at Calangute, 13:30 fish thali, sunset at Chapora Fort. Map 👉 goroam.world
          </p>
        </div>
      </div>
    </div>
  );
}
