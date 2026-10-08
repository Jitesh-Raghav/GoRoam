"use client";

import { motion } from "framer-motion";
import { BedDouble, Moon, Plane, Sun } from "@/components/site/icons";
import { useEffect, useState } from "react";
import { jetLagPlan, type JetLagPlan } from "@/lib/jetlag";
import { cn } from "@/lib/utils";

/** The three nights before you fly, shifted towards the destination's clock. */
export function JetLagCard({ timezone, departure, className }: { timezone?: string | null; departure: string; className?: string }) {
  const [plan, setPlan] = useState<JetLagPlan | null>(null);
  useEffect(() => {
    if (!timezone) return;
    setPlan(jetLagPlan(Intl.DateTimeFormat().resolvedOptions().timeZone, timezone, departure));
  }, [timezone, departure]);
  if (!plan) return null;
  const hours = Math.abs(plan.diff);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn("glass-dark print-avoid relative overflow-hidden rounded-[24px] bg-ocean p-6 text-paper", className)}
    >
      <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-brand/30 blur-3xl" />
      <div className="relative grid gap-6 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-4">
          <p className="eyebrow flex items-center gap-2 text-paper/55">
            <Moon className="size-3.5 text-sun-2" /> Beat the jet lag
          </p>
          <p className="display mt-3 text-[1.7rem] leading-[1]">
            {hours}h {plan.direction === "east" ? "ahead" : "behind"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-paper/65">
            Flying {plan.direction}, start shifting your sleep three nights out. After landing, you&apos;ll feel normal in about{" "}
            <span className="text-paper">
              {plan.adjustDays} {plan.adjustDays === 1 ? "day" : "days"}
            </span>
            .
          </p>
        </div>
        <ol className="grid grid-cols-3 gap-2 lg:col-span-5">
          {plan.before.map((n) => (
            <li key={n.label} className="rounded-2xl bg-paper/[0.07] px-3 py-3 ring-1 ring-inset ring-paper/10">
              <p className="eyebrow text-[0.52rem] text-paper/50">{n.label}</p>
              <p className="mt-2 flex items-center gap-1.5 font-mono text-sm">
                <BedDouble className="size-3.5 text-brand-2" /> {n.bed}
              </p>
              <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-paper/70">
                <Sun className="size-3.5 text-sun-2" /> {n.wake}
              </p>
            </li>
          ))}
        </ol>
        <ul className="space-y-2.5 text-sm lg:col-span-3">
          <li className="flex gap-2.5">
            <Sun className="mt-0.5 size-4 shrink-0 text-sun-2" />
            <span className="text-paper/80">{plan.seekLight}</span>
          </li>
          <li className="flex gap-2.5">
            <Plane className="mt-0.5 size-4 shrink-0 text-brand-2" />
            <span className="text-paper/80">{plan.avoidLight}</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
