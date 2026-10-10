"use client";

import { motion } from "framer-motion";
import { CalendarHeart, Info, MapPin, Sparkles } from "@/components/site/icons";
import type { ActivitySlot, TripEvent } from "@/lib/trip";
import { Band } from "../band";
import { PlacePhoto, asStop } from "../place-photo";
import { SectionTitle } from "./section-title";

const ease = [0.16, 1, 0.3, 1] as const;

/** Festivals, fixtures and seasonal happenings around the travel dates, as photo tickets. */
export function Events({ events, month, destination }: { events: TripEvent[]; month: string; destination: string }) {
  if (!events.length) return null;
  const mon = month.slice(0, 3).toUpperCase();
  return (
    <Band>
      <SectionTitle
        eyebrow={`Happening in ${month}`}
        title={
          <>
            While you&apos;re <span className="accent">there.</span>
          </>
        }
      >
        <p className="flex max-w-xs items-start gap-2 text-xs leading-relaxed text-stone">
          <Info className="mt-px size-3.5 shrink-0 text-brand" /> Dates shift from year to year, so check the official listing before you plan around one.
        </p>
      </SectionTitle>
      <ol className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {events.map((e, i) => (
          <motion.li
            key={`${e.name}-${i}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease, delay: i * 0.06 }}
            className="glass print-avoid group grid min-w-0 overflow-hidden rounded-card sm:grid-cols-[10.5rem_minmax(0,1fr)] print:block"
          >
            <div className="relative h-40 overflow-hidden sm:h-auto sm:min-h-[12rem] print:hidden">
              {/* Where it happens; the destination stands in when the place has no photo. */}
              <PlacePhoto activity={asStop(e.where || e.name)} destination={destination} icon={CalendarHeart} credit={false} imgClassName="group-hover:scale-[1.05]" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 to-transparent" />
              {/* A desk-calendar leaf for the month. */}
              <span className="absolute left-3 top-3 w-12 overflow-hidden rounded-lg bg-white text-center shadow-[0_10px_24px_-12px_rgba(10,28,39,0.7)]">
                <span className="block bg-sun py-0.5 font-mono text-[9px] tracking-[0.16em] text-ink">{mon}</span>
                <CalendarHeart className="duo-sun mx-auto my-1.5 size-5 text-ink" />
              </span>
            </div>
            <div className="min-w-0 p-5 sm:p-6">
              <p className="eyebrow text-[0.6rem] text-brand">{e.when}</p>
              <h3 className="display mt-1.5 text-[1.4rem] leading-[1.05] text-ink">{e.name}</h3>
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

/** Three things to tell everyone at dinner: a photo of the place beside the facts, numbered like a magazine feature. */
export function CoolFacts({ facts, city, stop, destination }: { facts: { title: string; fact: string }[]; city: string; stop?: ActivitySlot; destination: string }) {
  if (!facts.length) return null;
  return (
    <section className="print-avoid mt-24 grid gap-6 lg:grid-cols-12 lg:gap-12 print:block">
      <div className="relative min-h-[17rem] overflow-hidden rounded-panel bg-ink sm:min-h-[21rem] lg:col-span-5 lg:min-h-0 print:hidden">
        <PlacePhoto activity={stop} destination={destination} icon={Sparkles} credit={false} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-ink/5" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-paper sm:p-8">
          <p className="eyebrow flex items-center gap-2 text-paper/75">
            <Sparkles className="duo-sun size-3.5 text-sun-2" /> {facts.length} things you didn&apos;t know
          </p>
          <h2 className="display mt-3 text-[clamp(2.04rem,4vw,3rem)] leading-[1.02]">
            {city}, <span className="text-brand-2">unexpectedly.</span>
          </h2>
        </div>
      </div>
      <h2 className="display hidden text-3xl text-ink print:mb-4 print:block">
        {city}, unexpectedly.
      </h2>
      <ol className="self-center border-t border-line lg:col-span-7">
        {facts.map((f, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease, delay: i * 0.1 }}
            className="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-4 border-b border-line py-6 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-6 sm:py-8"
          >
            {/* Outlined numerals: the colour comes from the photo, the page stays light. */}
            <span aria-hidden className="display text-[3.4rem] leading-[0.82] text-transparent [-webkit-text-stroke:1.25px_var(--brand)] sm:text-[4.5rem]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h3 className="display text-[1.4rem] leading-[1.1] text-ink">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-stone">{f.fact}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
