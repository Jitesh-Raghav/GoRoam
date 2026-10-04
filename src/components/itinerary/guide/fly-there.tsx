"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Plane } from "lucide-react";
import { airportCode, cityOf, flightPartners, type BookingQuery } from "@/lib/booking";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;
const short = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

/** The flight leg, as a boarding-pass strip right under the plan. */
export function FlyThere({ query, className }: { query: BookingQuery; className?: string }) {
  const partners = flightPartners(query);
  const people = query.adults + (query.children ?? 0);
  const fromCity = query.origin ? cityOf(query.origin) : "Your city";
  const toCity = cityOf(query.destination);
  const from = airportCode(query.origin) ?? (query.origin ? fromCity.slice(0, 3).toUpperCase() : "YOU");
  const to = airportCode(query.destination) ?? toCity.slice(0, 3).toUpperCase();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease }}
      className={cn("no-print relative overflow-hidden rounded-[28px] bg-ocean text-paper", className)}
      aria-label="Book flights"
    >
      <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-brand/30 blur-3xl" />
      <div className="relative grid md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="p-6 sm:p-8">
          <p className="eyebrow flex items-center gap-2 text-paper/55">
            <Plane className="size-3.5 text-brand-2" /> Fly there
          </p>
          <div className="mt-5 flex items-center gap-4 sm:gap-6">
            <div className="min-w-0">
              <p className="display text-5xl leading-none sm:text-6xl">{from}</p>
              <p className="mt-1 truncate text-xs text-paper/60">{fromCity}</p>
            </div>
            <div className="relative h-px min-w-12 flex-1 border-t border-dashed border-paper/30">
              <motion.span
                initial={{ left: "0%" }}
                whileInView={{ left: "calc(100% - 1.25rem)" }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, ease, delay: 0.3 }}
                className="absolute -top-2.5 grid size-5 place-items-center"
              >
                <Plane className="size-5 text-sun-2" />
              </motion.span>
            </div>
            <div className="min-w-0 text-right">
              <p className="display text-5xl leading-none sm:text-6xl">{to}</p>
              <p className="mt-1 truncate text-xs text-paper/60">{toCity}</p>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-paper/10 pt-4 text-sm">
            <div>
              <dt className="eyebrow text-[0.55rem] text-paper/45">Depart</dt>
              <dd className="mt-1">{short(query.checkIn)}</dd>
            </div>
            <div>
              <dt className="eyebrow text-[0.55rem] text-paper/45">Return</dt>
              <dd className="mt-1">{short(query.checkOut)}</dd>
            </div>
            <div>
              <dt className="eyebrow text-[0.55rem] text-paper/45">Travellers</dt>
              <dd className="mt-1">{people}</dd>
            </div>
          </dl>
        </div>
        {/* The stub: perforation, then the airlines. */}
        <div className="relative border-t border-dashed border-paper/20 p-6 sm:p-8 md:w-[300px] md:border-l md:border-t-0">
          <span aria-hidden className="absolute -left-3 -top-3 hidden size-6 rounded-full bg-paper md:block" />
          <span aria-hidden className="absolute -bottom-3 -left-3 hidden size-6 rounded-full bg-paper md:block" />
          <p className="eyebrow text-[0.6rem] text-paper/50">Compare fares on</p>
          <div className="mt-3 space-y-2">
            {partners.map((p, i) => (
              <a
                key={p.id}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className={cn(
                  "group flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm transition-colors",
                  i === 0 ? "bg-paper text-ink hover:bg-sun" : "bg-paper/[0.07] hover:bg-paper hover:text-ink"
                )}
              >
                <span className="min-w-0">
                  <span className="block font-medium">{p.name}</span>
                  <span className={cn("block truncate text-[11px]", i === 0 ? "text-ink/60" : "text-paper/50 group-hover:text-ink/60")}>{p.blurb}</span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 transition-transform duration-500 group-hover:rotate-45" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
