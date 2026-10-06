"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, BedDouble, Plane, TrainFront, Ticket } from "lucide-react";
import { useState } from "react";
import {
  airportCode,
  cityOf,
  experiencePartners,
  flightPartners,
  stayPartners,
  transportPartners,
  type BookingKind,
  type BookingQuery,
  type Partner,
} from "@/lib/booking";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

export const BOOKING_TABS: { id: BookingKind; label: string; icon: typeof Plane }[] = [
  { id: "flights", label: "Flights", icon: Plane },
  { id: "stays", label: "Stays", icon: BedDouble },
  { id: "experiences", label: "Tickets", icon: Ticket },
  { id: "transport", label: "Transport", icon: TrainFront },
];

export function partnersFor(kind: BookingKind, q: BookingQuery): Partner[] {
  if (kind === "flights") return flightPartners(q);
  if (kind === "stays") return stayPartners(q);
  if (kind === "experiences") return experiencePartners(q);
  return transportPartners(q);
}

const shortDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export function PartnerRow({ partner, dark, index = 0 }: { partner: Partner; dark?: boolean; index?: number }) {
  return (
    <motion.a
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
      href={partner.href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => track("booking_partner_clicked", { partner: partner.id, where: "trip" })}
      className={cn(
        "group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-colors",
        dark ? "bg-paper/[0.06] hover:bg-paper hover:text-ink" : "bg-paper/70 ring-1 ring-line hover:bg-ink hover:text-paper"
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{partner.name}</span>
        <span className={cn("block truncate text-xs transition-colors", dark ? "text-paper/55 group-hover:text-ink/60" : "text-stone group-hover:text-paper/60")}>
          {partner.blurb}
        </span>
      </span>
      <ArrowUpRight className="size-4 shrink-0 transition-transform duration-500 ease-out-expo group-hover:rotate-45" />
    </motion.a>
  );
}

/** Tabbed booking box: flights, stays, tickets and ground transport for one trip. */
export function BookingPanel({ query, className, dark = true }: { query: BookingQuery; className?: string; dark?: boolean }) {
  const [tab, setTab] = useState<BookingKind>("flights");
  const partners = partnersFor(tab, query);
  const people = query.adults + (query.children ?? 0);
  const from = airportCode(query.origin) ?? (query.origin ? cityOf(query.origin).slice(0, 3).toUpperCase() : "ANY");
  const to = airportCode(query.destination) ?? cityOf(query.destination).slice(0, 3).toUpperCase();

  return (
    <div className={cn("relative overflow-hidden rounded-[28px] p-5 sm:p-6", dark ? "bg-ocean text-paper" : "bg-white/80 text-ink ring-1 ring-line", className)}>
      {dark && <div className="pointer-events-none absolute -right-20 -top-24 size-56 rounded-full bg-brand/25 blur-3xl" />}
      <div className="relative">
        <p className={cn("eyebrow", dark ? "text-paper/55" : "text-stone")}>Book this trip</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="display flex items-center gap-2.5 text-3xl leading-none">
              <span>{from}</span>
              <Plane className={cn("size-5 shrink-0", dark ? "text-brand-2" : "text-brand")} />
              <span>{to}</span>
            </p>
            <p className={cn("mt-2 text-sm", dark ? "text-paper/60" : "text-stone")}>
              {shortDate(query.checkIn)} – {shortDate(query.checkOut)} · {people} {people === 1 ? "traveller" : "travellers"}
            </p>
          </div>
        </div>

        <div role="tablist" aria-label="What to book" className={cn("mt-5 grid grid-cols-4 gap-1 rounded-2xl p-1", dark ? "bg-paper/[0.06]" : "bg-paper-2")}>
          {BOOKING_TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] transition-colors",
                  active ? (dark ? "text-ink" : "text-paper") : dark ? "text-paper/60 hover:text-paper" : "text-ink/60 hover:text-ink"
                )}
              >
                {active && (
                  <motion.span
                    layoutId={`booking-tab-${dark ? "d" : "l"}`}
                    className={cn("absolute inset-0 rounded-xl", dark ? "bg-paper" : "bg-ink")}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <t.icon className="relative size-4" />
                <span className="relative">{t.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            role="tabpanel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 space-y-2"
          >
            {partners.map((p, i) => (
              <PartnerRow key={p.id} partner={p} dark={dark} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
        <p className={cn("mt-4 text-[11px] leading-relaxed", dark ? "text-paper/40" : "text-stone-2")}>
          Opens our partners with your dates and party filled in. Prices and availability are theirs.
        </p>
      </div>
    </div>
  );
}
