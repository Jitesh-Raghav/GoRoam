"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Bus, Car, Check, Clock3, Loader2, Plane, Repeat, Sailboat, TrainFront, Zap, type LucideIcon } from "@/components/site/icons";
import { cityOf, isoDay, travelOptionLinks } from "@/lib/booking";
import { updateCached } from "@/lib/cached-json";
import { useMoney } from "@/lib/money";
import { getThereCost, type GetAround, type GetThere, type ItineraryData, type ItineraryDetails, type TravelOption } from "@/lib/trip";
import { cn } from "@/lib/utils";
import { PlacePhoto, asStop } from "./place-photo";

const ease = [0.16, 1, 0.3, 1] as const;

/* ---------------------------------------------------------------------------------------------- */
/* Data: written with new trips; fetched once for older ones; the traveller's picks saved back.    */
/* ---------------------------------------------------------------------------------------------- */

export function useLogistics(it: ItineraryDetails, canWrite: boolean) {
  const data = it.itineraryData;
  const [getThere, setGetThere] = useState<GetThere | undefined>(data.getThere);
  const [getAround, setGetAround] = useState<GetAround | undefined>(data.getAround);
  const [state, setState] = useState<"ready" | "loading" | "failed">(data.getThere || data.getAround ? "ready" : canWrite && data.trip?.source ? "loading" : "failed");

  // Newer copies of the trip (polling while days are written) carry the latest.
  useEffect(() => {
    if (data.getThere) setGetThere(data.getThere);
    if (data.getAround) setGetAround(data.getAround);
  }, [data.getThere, data.getAround]);

  useEffect(() => {
    if (data.getThere || data.getAround || !canWrite || !data.trip?.source) return;
    let live = true;
    setState("loading");
    fetch(`/api/itinerary/${it.id}/logistics`, { method: "POST" })
      .then((r) => r.json())
      .then((b) => {
        if (!live) return;
        if (b?.success) {
          setGetThere(b.getThere);
          setGetAround(b.getAround);
          setState("ready");
        } else setState("failed");
      })
      .catch(() => live && setState("failed"));
    return () => {
      live = false;
    };
    // Only once per trip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [it.id]);

  const save = useCallback(
    (body: Record<string, unknown>, next: Partial<Pick<ItineraryData, "getThere" | "getAround">>) => {
      updateCached<{ data: ItineraryDetails }>(`/api/itinerary/${it.id}`, (d) => ({ ...d, data: { ...d.data, itineraryData: { ...d.data.itineraryData, ...next } } }));
      if (!canWrite) return;
      fetch(`/api/itinerary/${it.id}/logistics`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => {});
    },
    [it.id, canWrite],
  );
  const pick = (i: number) => {
    if (!getThere) return;
    const next = { ...getThere, pick: i };
    setGetThere(next);
    save({ pick: i }, { getThere: next });
  };
  const setRental = (r: { inBudget?: boolean; chosen?: number }) => {
    if (!getAround) return;
    const next = { ...getAround, ...r };
    setGetAround(next);
    save({ rental: { inBudget: next.inBudget, chosen: next.chosen ?? 0 } }, { getAround: next });
  };
  return { getThere, getAround, state, pick, setRental, canWrite };
}

/* ---------------------------------------------------------------------------------------------- */
/* UI                                                                                             */
/* ---------------------------------------------------------------------------------------------- */

export const MODE: Record<TravelOption["mode"], { icon: LucideIcon; label: string }> = {
  flight: { icon: Plane, label: "Flight" },
  train: { icon: TrainFront, label: "Train" },
  bus: { icon: Bus, label: "Bus" },
  drive: { icon: Car, label: "Drive" },
  ferry: { icon: Sailboat, label: "Ferry" },
};

const BEST_LABEL: Record<NonNullable<TravelOption["best"]>, string> = { "best value": "Best value", cheapest: "Cheapest", fastest: "Fastest" };

const BEST_STYLE: Record<NonNullable<TravelOption["best"]>, string> = {
  "best value": "bg-sun text-ink",
  cheapest: "bg-emerald-400 text-ink",
  fastest: "bg-brand text-white",
};

/** The route as a hairline arc, origin to destination, with the chosen mode riding it. */
function RouteArc({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="relative h-16 min-w-0 flex-1">
      <svg aria-hidden viewBox="0 0 200 60" preserveAspectRatio="none" className="absolute inset-0 size-full text-paper/50">
        <path d="M4 52C60 4 140 4 196 52" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 5" vectorEffect="non-scaling-stroke" />
        <circle cx="4" cy="52" r="3" className="fill-paper" />
        <circle cx="196" cy="52" r="3" className="fill-sun-2" />
      </svg>
      <span className="absolute left-1/2 top-0 grid size-10 -translate-x-1/2 place-items-center rounded-full bg-paper text-ink shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
        <Icon className="size-5" />
      </span>
    </div>
  );
}

export function GettingThere({ it, logistics }: { it: ItineraryDetails; logistics: ReturnType<typeof useLogistics> }) {
  const { fmt: money } = useMoney();
  const { getThere, state, pick, canWrite } = logistics;
  const source = it.itineraryData.trip?.source;
  const people = it.numberOfPeople;
  const dest = it.itineraryData.summary?.destination || it.destination;
  if (!source) return null;
  if (!getThere) {
    return state === "loading" ? (
      <div className="mt-8 flex items-center gap-3 rounded-[28px] bg-ink p-8 text-paper/80">
        <Loader2 className="size-5 animate-spin text-sun-2" /> Comparing flights, trains and buses from {cityOf(source)}…
      </div>
    ) : null;
  }
  const chosen = getThere.options[getThere.pick] ?? getThere.options[0];
  const ChosenIcon = MODE[chosen.mode].icon;
  const roundTrip = getThereCost({ getThere }, people);
  const trip = { origin: source, destination: dest, depart: isoDay(it.startDate, 0), back: isoDay(it.startDate, it.numberOfDays - 1), people };

  return (
    <div className="mt-8">
      {/* The route, over a photo of where you're going */}
      <div className="relative isolate overflow-hidden rounded-[32px] bg-ink text-paper">
        <div className="absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_left,black_30%,transparent_85%)]">
          <PlacePhoto activity={asStop(cityOf(dest))} destination={dest} credit={false} />
        </div>
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <p className="eyebrow text-[0.6rem] text-paper/60">Your journey</p>
            <div className="mt-4 flex items-end gap-4">
              <div className="min-w-0">
                <p className="text-xs text-paper/60">From</p>
                <p className="display truncate text-[clamp(1.8rem,4.5vw,3.4rem)] leading-none">{cityOf(source)}</p>
              </div>
              <RouteArc icon={ChosenIcon} />
              <div className="min-w-0 text-right">
                <p className="text-xs text-paper/60">To</p>
                <p className="display truncate text-[clamp(1.8rem,4.5vw,3.4rem)] leading-none text-sun-2">{cityOf(dest)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-[24px] bg-paper/10 p-5 ring-1 ring-paper/15 backdrop-blur-md">
            <p className="flex items-center gap-2 text-xs text-paper/70">
              <Repeat className="size-3.5" /> In your budget · return for {people}
            </p>
            <p className="display mt-1 text-4xl tabular-nums">{money(roundTrip)}</p>
            <p className="mt-1 text-sm text-paper/75">
              {MODE[chosen.mode].label} · {chosen.title} · {chosen.duration}
            </p>
          </div>
        </div>
      </div>

      {/* Every sensible way there */}
      <div className={cn("no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto pb-2 md:grid md:overflow-visible md:pb-0", getThere.options.length >= 4 ? "md:grid-cols-2 xl:grid-cols-4" : getThere.options.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
        {getThere.options.map((o, i) => {
          const on = i === getThere.pick;
          const Icon = MODE[o.mode].icon;
          const links = travelOptionLinks(o, trip);
          return (
            <motion.article
              key={`${o.mode}-${o.title}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease, delay: i * 0.06 }}
              className={cn("group relative flex min-w-[82%] snap-start flex-col overflow-hidden rounded-[26px] bg-white ring-1 transition-shadow sm:min-w-[55%] md:min-w-0", on ? "ring-2 ring-brand shadow-[0_30px_60px_-36px_rgba(26,95,214,0.8)]" : "ring-line hover:shadow-[0_24px_48px_-32px_rgba(14,31,59,0.6)]")}
            >
              <div className="relative h-32 overflow-hidden [mask-image:linear-gradient(to_bottom,black_55%,transparent)]">
                <PlacePhoto activity={asStop(o.from || cityOf(source))} destination={source} credit={false} icon={Icon} imgClassName="group-hover:scale-[1.05]" />
              </div>
              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs text-ink backdrop-blur-md">
                <Icon className="size-3.5 text-brand" /> {MODE[o.mode].label}
              </span>
              {o.best && <span className={cn("absolute right-4 top-4 rounded-full px-2.5 py-1 text-[11px] font-medium", BEST_STYLE[o.best])}>{BEST_LABEL[o.best]}</span>}
              <div className="-mt-6 flex flex-1 flex-col px-5 pb-5">
                <h4 className="display text-xl leading-tight text-ink">{o.title}</h4>
                <p className="mt-1.5 text-xs leading-snug text-stone">
                  {o.from} <span className="text-brand">→</span> {o.to}
                </p>
                <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink/80">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="size-3.5 text-brand" /> {o.duration}
                  </span>
                  {o.frequency && <span>{o.frequency}</span>}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-stone">{o.pros}</p>
                <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-4">
                  <div>
                    <p className="display text-2xl leading-none text-ink">
                      {money(o.priceUsd)}
                      <span className="ml-1 text-xs text-stone">{o.mode === "drive" ? "fuel, one way" : "each, one way"}</span>
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-stone">
                      {o.live ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <Zap className="size-3" /> Live fare
                        </span>
                      ) : (
                        "Typical fare"
                      )}
                      {o.priceNote && <span>· {o.priceNote}</span>}
                    </p>
                  </div>
                </div>
                <div className="no-print mt-4 flex flex-wrap gap-2">
                  {canWrite && (
                    <button
                      type="button"
                      onClick={() => pick(i)}
                      aria-pressed={on}
                      className={cn("inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm transition-colors", on ? "bg-brand text-white" : "bg-paper-2 text-ink hover:bg-ink hover:text-paper")}
                    >
                      {on ? <Check className="size-4" /> : null} {on ? "In budget" : "Use this"}
                    </button>
                  )}
                  {links.slice(0, 2).map((l) => (
                    <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer sponsored nofollow" className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-sm text-paper transition-colors hover:bg-brand">
                      {l.name} <ArrowUpRight className="size-3.5" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-stone">Fares are typical {new Date(it.startDate).getUTCFullYear()} prices for your dates unless marked live; check the partner for today&apos;s price.</p>
    </div>
  );
}
