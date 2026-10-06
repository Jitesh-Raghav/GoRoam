"use client";

import { motion } from "framer-motion";
import { CalendarHeart, Info, MapPin, Sparkles } from "lucide-react";
import type { TripEvent } from "@/lib/trip";
import { Band } from "../band";
import { SectionTitle } from "./section-title";

const ease = [0.16, 1, 0.3, 1] as const;

/** Festivals, fixtures and seasonal happenings around the travel dates. */
export function Events({ events, month }: { events: TripEvent[]; month: string }) {
  if (!events.length) return null;
  return (
    <Band tone="sun">
      <SectionTitle
        eyebrow={`Happening in ${month}`}
        title={
          <>
            While you&apos;re <span className="italic text-brand">there.</span>
          </>
        }
      >
        <p className="flex max-w-xs items-start gap-2 text-xs leading-relaxed text-ink/60">
          <Info className="mt-px size-3.5 shrink-0 text-brand" /> Dates shift from year to year, so check the official listing before you plan around one.
        </p>
      </SectionTitle>
      <ol className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
        {events.map((e, i) => (
          <motion.li
            key={`${e.name}-${i}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease, delay: i * 0.06 }}
            className="glass print-avoid group relative flex min-w-0 gap-4 overflow-hidden rounded-[26px] p-5 sm:gap-5 sm:p-6"
          >
            <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--sun-2),var(--sun))] text-ink shadow-[0_12px_26px_-14px_rgba(244,163,64,0.9)] transition-transform duration-500 group-hover:-rotate-6 sm:size-14">
              <CalendarHeart className="size-6" />
            </span>
            <div className="min-w-0">
              <p className="eyebrow text-[0.6rem] text-brand">{e.when}</p>
              <h3 className="display mt-1.5 text-[1.4rem] leading-[1.02] text-ink">{e.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone">{e.what}</p>
              {e.where && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink/80">
                  <MapPin className="size-3.5 text-brand" /> {e.where}
                </p>
              )}
            </div>
          </motion.li>
        ))}
      </ol>
    </Band>
  );
}

/** Three things to tell everyone at dinner. */
export function CoolFacts({ facts, city }: { facts: { title: string; fact: string }[]; city: string }) {
  if (!facts.length) return null;
  return (
    <section className="print-avoid relative mt-24 overflow-hidden rounded-[32px] bg-ocean px-5 py-10 text-paper sm:rounded-[40px] sm:p-12">
      <div className="pointer-events-none absolute -right-24 -top-32 size-96 rounded-full bg-brand/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 size-80 rounded-full bg-sun/15 blur-3xl" />
      <div className="relative">
        <p className="eyebrow flex items-center gap-2 text-paper/55">
          <Sparkles className="size-3.5 text-sun-2" /> {facts.length} things you didn&apos;t know
        </p>
        <h2 className="display mt-3 text-[clamp(2.04rem,4.25vw,3.23rem)] leading-[0.95]">
          {city}, <span className="italic text-brand-2">unexpectedly.</span>
        </h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
          {facts.map((f, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, ease, delay: i * 0.12 }}
              className="border-t border-paper/15 pt-5"
            >
              <span className="display block text-[3.82rem] leading-[0.8] text-sun-2">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="display mt-4 text-[1.36rem] leading-[1.05]">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-paper/75">{f.fact}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
