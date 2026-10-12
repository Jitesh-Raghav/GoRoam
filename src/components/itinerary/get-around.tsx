"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ArrowUpRight, Bike, Car, Check, Fuel, Loader2, MapPin, Motorcycle, Scooter, Star, type LucideIcon } from "@/components/site/icons";
import { cityOf, isoDay, mapsSearchUrl, rentalLinks } from "@/lib/booking";
import { useMoney } from "@/lib/money";
import type { ItineraryDetails, RentalKind } from "@/lib/trip";
import { cn } from "@/lib/utils";
import type { useLogistics } from "./getting-there";
import { PlacePhoto, asStop } from "./place-photo";
import { PlacesMap } from "./places-map";

const ease = [0.16, 1, 0.3, 1] as const;

const KIND: Record<RentalKind, { icon: LucideIcon; label: string }> = {
  scooter: { icon: Scooter, label: "Scooter" },
  bike: { icon: Motorcycle, label: "Motorbike" },
  car: { icon: Car, label: "Car" },
  cycle: { icon: Bike, label: "Bicycle" },
};

/** Scooter, motorbike and car rentals: kinds as tabs, the shops as cards and pins, and a budget toggle. */
export function GetAroundSection({ it, logistics }: { it: ItineraryDetails; logistics: ReturnType<typeof useLogistics> }) {
  const { fmt: money } = useMoney();
  const { getAround, state, setRental, canWrite } = logistics;
  const kinds = useMemo(() => [...new Set(getAround?.picks.map((p) => p.kind) ?? [])], [getAround]);
  // Opens on scooters (what most people rent), or the first kind there is.
  const [picked, setKind] = useState<RentalKind | "all" | null>(null);
  const kind: RentalKind | "all" = picked ?? (kinds.includes("scooter") ? "scooter" : kinds[0] ?? "all");
  const [active, setActive] = useState<string | null>(null);
  if (!getAround?.picks.length) {
    return state === "loading" ? (
      <div className="mt-8 flex items-center gap-3 rounded-[28px] bg-white p-8 text-stone ring-1 ring-line">
        <Loader2 className="size-5 animate-spin text-brand" /> Finding scooter, bike and car rentals…
      </div>
    ) : null;
  }
  const dest = it.itineraryData.summary?.destination || it.destination;
  const days = it.numberOfDays;
  const shown = getAround.picks.map((p, i) => ({ p, i })).filter(({ p }) => kind === "all" || p.kind === kind);
  const chosen = getAround.picks[getAround.chosen ?? 0];
  const points = shown.filter(({ p }) => p.lat && p.lng).map(({ p, i }) => ({ id: String(i), lat: p.lat!, lng: p.lng!, label: p.name, tag: `${money(p.pricePerDayUsd)}/day` }));

  return (
    <div className="mt-8 overflow-hidden rounded-[32px] bg-white ring-1 ring-line">
      {/* A faded photo of the place, then the kinds and the budget switch */}
      <div className="relative h-36 overflow-hidden sm:h-44">
        <PlacePhoto activity={asStop(`${cityOf(dest)} road`)} destination={dest} credit={false} />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
      </div>
      <div className="-mt-14 px-5 pb-6 sm:px-8 sm:pb-8">
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div role="tablist" aria-label="Vehicle" className="flex flex-wrap gap-2">
            {kinds.length > 1 && (
              <button
                type="button"
                role="tab"
                aria-selected={kind === "all"}
                onClick={() => setKind("all")}
                className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm shadow-sm ring-1 transition-colors", kind === "all" ? "bg-ink text-paper ring-ink" : "bg-white text-ink ring-line hover:bg-paper-2")}
              >
                All
              </button>
            )}
            {kinds.map((k) => {
              const K = KIND[k];
              const on = k === kind;
              return (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setKind(k)}
                  className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm shadow-sm ring-1 transition-colors", on ? "bg-ink text-paper ring-ink" : "bg-white text-ink ring-line hover:bg-paper-2")}
                >
                  <K.icon className="size-4" /> {K.label}
                </button>
              );
            })}
          </div>
          {canWrite && chosen && (
            <button
              type="button"
              onClick={() => setRental({ inBudget: !getAround.inBudget })}
              aria-pressed={!!getAround.inBudget}
              className="inline-flex items-center gap-3 rounded-full bg-paper-2 py-1.5 pl-4 pr-1.5 text-sm text-ink ring-1 ring-line"
            >
              <span>
                Add to budget <span className="text-stone">· {money(chosen.pricePerDayUsd * days)} for {days} days</span>
              </span>
              <span className={cn("relative inline-block h-6 w-11 shrink-0 rounded-full transition-colors", getAround.inBudget ? "bg-brand" : "bg-ink/15")}>
                <span className={cn("absolute left-0 top-0.5 size-5 rounded-full bg-white shadow transition-transform", getAround.inBudget ? "translate-x-[1.375rem]" : "translate-x-0.5")} />
              </span>
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-7">
            {shown.map(({ p, i }, n) => {
              const K = KIND[p.kind];
              const isChosen = i === (getAround.chosen ?? 0);
              const link = p.mapsUrl ?? mapsSearchUrl(p.name, dest);
              const book = rentalLinks(p.kind, dest, isoDay(it.startDate, 0), isoDay(it.startDate, days - 1))[0];
              return (
                <motion.article
                  key={`${p.name}-${i}`}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease, delay: n * 0.05 }}
                  onMouseEnter={() => setActive(String(i))}
                  className={cn("rounded-[22px] p-4 ring-1 transition-colors sm:p-5", active === String(i) ? "bg-brand-soft/60 ring-brand/30" : "bg-paper-2/50 ring-transparent")}
                >
                  <div className="flex items-start gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-brand shadow-sm ring-1 ring-line">
                      <K.icon className="size-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                        <h4 className="display text-lg leading-tight text-ink">{p.name}</h4>
                        <p className="text-right">
                          <span className="display text-xl text-ink">{money(p.pricePerDayUsd)}</span>
                          <span className="text-xs text-stone"> / day</span>
                        </p>
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3 text-brand" /> {p.area}
                        </span>
                        {p.rating && (
                          <span className="inline-flex items-center gap-1 text-ink/80">
                            <Star className="size-3 text-sun" /> {p.rating.toFixed(1)}
                          </span>
                        )}
                        {p.priceNote && <span>· {p.priceNote}</span>}
                      </p>
                      <dl className="mt-3 grid gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
                        {p.deposit && (
                          <div>
                            <dt className="inline text-stone">Deposit </dt>
                            <dd className="inline text-ink/85">{p.deposit}</dd>
                          </div>
                        )}
                        {p.needs && (
                          <div>
                            <dt className="inline text-stone">You need </dt>
                            <dd className="inline text-ink/85">{p.needs}</dd>
                          </div>
                        )}
                      </dl>
                      {p.tip && <p className="mt-2 text-sm leading-relaxed text-ink/80">{p.tip}</p>}
                      <div className="no-print mt-3 flex flex-wrap gap-2">
                        {canWrite && (
                          <button
                            type="button"
                            onClick={() => setRental({ chosen: i })}
                            className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors", isChosen ? "bg-brand text-white" : "bg-white text-ink ring-1 ring-line hover:bg-ink hover:text-paper")}
                          >
                            {isChosen && <Check className="size-3.5" />} {isChosen ? "Your pick" : "Pick this"}
                          </button>
                        )}
                        <a href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs text-ink ring-1 ring-line hover:bg-ink hover:text-paper">
                          <MapPin className="size-3.5" /> Map
                        </a>
                        {book && (
                          <a href={book.href} target="_blank" rel="noopener noreferrer sponsored nofollow" className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs text-paper hover:bg-brand">
                            {book.name} <ArrowUpRight className="size-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
          <div className="order-first lg:order-none lg:col-span-5">
            <div className="space-y-3 lg:sticky lg:top-24">
              {points.length > 0 && <PlacesMap points={points} active={active} onPick={setActive} className="h-64 sm:h-80" searchUrl={mapsSearchUrl(`${kind === "all" ? "bike" : KIND[kind].label.toLowerCase()} rental`, dest)} />}
              {getAround.notes.length > 0 && (
                <ul className="space-y-2 rounded-[22px] bg-ink p-5 text-sm text-paper/85">
                  <li className="eyebrow mb-1 flex items-center gap-2 text-[0.58rem] text-paper/55">
                    <Fuel className="size-3.5 text-sun-2" /> Rules of the road
                  </li>
                  {getAround.notes.map((n) => (
                    <li key={n} className="flex gap-2 leading-snug">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-sun-2" /> {n}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
