"use client";

import { motion } from "framer-motion";
import { Languages, UtensilsCrossed, Gift, CalendarHeart, Mountain, PlayCircle } from "lucide-react";

const ITEMS = [
  { icon: Languages, label: "Phrases" },
  { icon: UtensilsCrossed, label: "Must-try food" },
  { icon: Mountain, label: "Adventures" },
  { icon: CalendarHeart, label: "Events" },
  { icon: Gift, label: "Souvenirs" },
  { icon: PlayCircle, label: "Videos" },
];

/** Shown while the local guide is being written for an older trip. */
export function GuidePending() {
  return (
    <section className="no-print mt-20 overflow-hidden rounded-[32px] bg-white p-7 ring-1 ring-line sm:p-10" aria-live="polite">
      <p className="eyebrow text-stone">Your local guide</p>
      <h2 className="display mt-3 text-[clamp(2rem,4vw,3rem)] leading-[0.95] text-ink">
        Writing your <span className="italic text-brand">local guide…</span>
      </h2>
      <p className="mt-3 max-w-lg text-stone">Phrases, food, culture, events, adventures and videos for this trip. It takes about twenty seconds, and it&apos;s saved for next time.</p>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ITEMS.map((it, i) => (
          <motion.div
            key={it.label}
            initial={{ opacity: 0.35 }}
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.25 }}
            className="flex items-center gap-3 rounded-2xl bg-paper-2 px-4 py-3.5 text-sm text-ink"
          >
            <it.icon className="size-4 text-brand" /> {it.label}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
