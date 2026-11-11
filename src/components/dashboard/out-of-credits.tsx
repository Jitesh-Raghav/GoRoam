"use client";

/* eslint-disable @next/next/no-img-element -- a looked-up destination photo, already sized */
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Loader2, X } from "@/components/site/icons";
import { Scene } from "@/components/scenes/scene";
import { track } from "@/lib/analytics";
import { sizedPhoto } from "@/lib/brand-photos";
import { passAmount, usePackPrice } from "@/lib/money";
import { PLANS, type PlanId } from "@/lib/plans";
import { titleCase } from "@/lib/trip";
import { useDestinationPhoto } from "@/lib/use-destination-photo";
import { useDestinationScene } from "@/lib/use-destination-scene";
import { cn } from "@/lib/utils";
import type { OverlayTrip } from "./generating-overlay";
import { useCheckout } from "./use-checkout";

/** Where the planner stashes its answers while the traveller tops up. */
export const PLANNER_DRAFT_KEY = "goroam:planner-draft";

/** Best value first: the Year Pass, then the Week Pass. */
const ORDER = [...PLANS].sort((a, b) => Number(!!b.popular) - Number(!!a.popular));
const INCLUDED = PLANS.find((p) => p.id === "week")?.features.slice(0, 5) ?? [];
const TRUST = ["One-time payment, no auto-renew", "30-day money-back guarantee", "Cards, UPI & more, by Dodo Payments"];

/**
 * Shown when a traveller with no credits asks for an itinerary: the trip they're
 * about to get on one side, choosing a pass on the other. Their answers are saved,
 * so buying a pass brings them straight back to a filled-in plan.
 */
export function OutOfCredits({ destination, days, trip, onClose }: { destination: string; days: number; trip?: OverlayTrip; onClose: () => void }) {
  const place = titleCase(destination.split(",")[0] || "your trip");
  const { scene } = useDestinationScene(destination || "mountains");
  const photo = sizedPhoto(useDestinationPhoto(destination), 1000);
  const [loaded, setLoaded] = useState(false);
  const checkout = useCheckout(0);
  const price = usePackPrice();
  const [pick, setPick] = useState<PlanId>(ORDER[0].id);
  const chosen = ORDER.find((p) => p.id === pick) ?? ORDER[0];
  const week = PLANS.find((p) => p.id === "week");
  const year = PLANS.find((p) => p.id === "year");
  const w = week ? price(week) : null;
  const y = year ? price(year) : null;

  useEffect(() => {
    track("paywall_shown", { destination: place, days });
  }, [place, days]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [onClose]);

  const when = trip?.startDate ? new Date(`${trip.startDate}T00:00:00`) : null;
  const spec = [
    trip?.source ? { k: "From", v: titleCase(trip.source.split(",")[0]) } : null,
    when && !Number.isNaN(when.getTime()) ? { k: "Leaving", v: when.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) } : null,
    trip?.people ? { k: "Who", v: `${trip.people} ${trip.people === 1 ? "traveller" : "travellers"}` } : null,
    trip?.budget ? { k: "Budget", v: trip.budget } : null,
    trip?.vibes?.length ? { k: "Into", v: trip.vibes.slice(0, 3).join(", ") } : null,
  ].filter((r): r is { k: string; v: string } => !!r);

  const busy = checkout.pending !== null;
  const shown = price(chosen);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] grid place-items-end bg-ink/55 p-2 backdrop-blur-[2px] sm:place-items-center sm:p-6"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
        initial={{ y: 48, opacity: 0, scale: 0.985 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 28, opacity: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[94svh] w-full max-w-[60rem] overflow-y-auto overscroll-contain rounded-[30px] bg-paper shadow-[0_50px_140px_-40px_rgba(14,31,59,0.75)]"
      >
        <span aria-hidden className="absolute left-1/2 top-2 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-paper/50 lg:hidden" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 grid size-9 place-items-center rounded-full bg-paper/90 text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-paper"
        >
          <X className="size-4" />
        </button>

        <div className="grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          {/* The trip they're about to get. */}
          <div className="bg-ink p-2.5 pb-6 text-paper sm:p-3 sm:pb-8">
            <div className="relative h-28 overflow-hidden rounded-[22px] sm:h-36 lg:h-56">
              <Scene id={scene} intro />
              {photo?.url && (
                <img src={photo.url} alt="" decoding="async" referrerPolicy="no-referrer" onLoad={() => setLoaded(true)} className={cn("absolute inset-0 size-full object-cover transition-opacity duration-1000", loaded ? "opacity-100" : "opacity-0")} />
              )}
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-ink/75 px-3 py-1.5 text-[11px] font-medium text-paper ring-1 ring-inset ring-paper/20">
                <span className="size-1.5 rounded-full bg-brand-2" /> {days} {days === 1 ? "day" : "days"} · ready to plan
              </span>
            </div>
            <div className="px-3 pt-5 sm:px-5 sm:pt-6">
              <h2 id="paywall-title" className="display text-[clamp(1.9rem,4vw,2.6rem)] leading-[1.02] tracking-[-0.02em]">
                {place} is <span className="accent">one step away.</span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-paper/60">You&apos;ve used your free itinerary. A pass plans this trip, and every one after it.</p>
              {/* Phones: the trip on one line, so the passes stay in reach. */}
              {spec.length > 0 && <p className="mt-4 text-sm text-paper/85 lg:hidden">{spec.filter((r) => r.k !== "Into").map((r) => r.v).join(" · ")}</p>}
              {spec.length > 0 && (
                <dl className="mt-5 hidden divide-y divide-paper/10 border-y border-paper/10 text-sm lg:block">
                  {spec.map((r) => (
                    <div key={r.k} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 py-2.5">
                      <dt className="text-paper/45">{r.k}</dt>
                      <dd className="truncate text-paper/90">{r.v}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <p className="mt-4 flex gap-2.5 text-sm leading-relaxed text-paper/70 sm:mt-5">
                <Check className="mt-0.5 size-4 shrink-0 text-brand-2" />
                Your answers are saved. After checkout you come straight back to this trip.
              </p>
            </div>
          </div>

          {/* Choosing a pass. */}
          <div className="p-5 sm:p-8">
            <p className="text-sm text-stone">Choose your pass</p>
            <div role="radiogroup" aria-label="Pass" className="mt-3 space-y-2.5">
              {ORDER.map((p) => {
                const pp = price(p);
                const on = p.id === pick;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setPick(p.id)}
                    className={cn(
                      "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3.5 rounded-[20px] bg-white p-4 text-left transition-shadow duration-300",
                      on ? "shadow-[0_18px_40px_-26px_rgba(14,31,59,0.6)] ring-2 ring-ink" : "ring-1 ring-line hover:ring-ink/30"
                    )}
                  >
                    <span className={cn("grid size-5 place-items-center rounded-full ring-1 transition-colors", on ? "bg-ink ring-ink" : "ring-line-strong")}>
                      {on && <span className="size-2 rounded-full bg-paper" />}
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-ink">{p.name}</span>
                        {p.popular && <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-medium text-white">Best value</span>}
                      </span>
                      <span className="mt-0.5 block text-sm text-stone">Unlimited trips for {p.days} days</span>
                    </span>
                    <span className="text-right">
                      <span className="display block text-[1.6rem] leading-none tabular-nums text-ink">
                        {pp.approx && <span className="mr-0.5 text-base text-stone">≈</span>}
                        {pp.price}
                      </span>
                      <span className="mt-1 block text-xs text-stone">{pp.approx ? "≈ " : ""}{pp.each} a day</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Plain arithmetic on the real prices. */}
            {w && y && w.shown === y.shown && (
              <p className="mt-3 px-1 text-xs leading-relaxed text-stone">
                A Week Pass every week of the year would come to {w.approx ? "≈ " : ""}
                {passAmount(w.amount * 52, w.shown)}. The Year Pass is {y.approx ? "≈ " : ""}
                {y.price}.
              </p>
            )}

            <div className="sticky bottom-0 -mx-5 mt-5 bg-paper px-5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:px-0 lg:pb-0 lg:pt-0">
              <button
                type="button"
                onClick={() => checkout.start(chosen.id, "planner")}
                disabled={busy}
                className="group inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-ink px-6 text-[0.98rem] font-medium text-paper shadow-[0_18px_36px_-18px_rgba(14,31,59,0.9)] transition-colors hover:bg-brand disabled:cursor-wait disabled:opacity-80"
              >
                {busy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Opening secure checkout…
                  </>
                ) : (
                  <>
                    Get the {chosen.name} · {shown.approx ? "≈ " : ""}
                    {shown.price}
                    <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
              {shown.billed && <p className="mt-2 text-center text-xs text-stone">Charged as {shown.billed}</p>}
            </div>

            {checkout.error && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {checkout.error}
              </p>
            )}

            <div className="mt-6 border-t border-line pt-5">
              <p className="text-xs text-stone">Every pass includes</p>
              <ul className="mt-3 space-y-2">
                {INCLUDED.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm leading-snug text-ink/85">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-brand" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-4 text-xs text-stone">
              {TRUST.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>

            <button type="button" onClick={onClose} className="mt-5 text-sm text-stone underline decoration-line underline-offset-4 transition-colors hover:text-ink">
              Maybe later, keep editing
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
