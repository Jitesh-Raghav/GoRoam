"use client";

/* eslint-disable @next/next/no-img-element -- a looked-up destination photo, already sized */
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { Check } from "@/components/site/icons";
import { Scene } from "@/components/scenes/scene";
import { sizedPhoto } from "@/lib/brand-photos";
import { useDestinationPhoto } from "@/lib/use-destination-photo";
import { useDestinationScene } from "@/lib/use-destination-scene";
import { cn } from "@/lib/utils";
import { cityCode } from "./boarding-pass";

/** What the traveller asked for, so the wait can show their own trip taking shape. */
export interface OverlayTrip {
  destination: string;
  days: number;
  /** Where they start from, when known (the planner asks; the homepage composer doesn't). */
  source?: string;
  /** yyyy-mm-dd. */
  startDate?: string;
  people?: number;
  /** Already formatted in their currency: "₹1,20,000". */
  budget?: string;
  /** Interest labels: "Food & drink". */
  vibes?: string[];
}

const ease = [0.16, 1, 0.3, 1] as const;
const short = (place?: string) => (place ?? "").split(",")[0].trim();
const list = (xs: string[]) => (xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * Full-screen wait while the itinerary is generated: the place behind, the traveller's
 * own ticket printing itself, and the work being done in their words. The bar eases
 * towards the end but never claims to be finished before the trip opens.
 * `finishing` is the hand-off while the new trip's page loads.
 */
export function GeneratingOverlay({ destination, days, source, startDate, people, budget, vibes, finishing = false }: OverlayTrip & { finishing?: boolean }) {
  const reduce = useReducedMotion();
  const city = short(destination) || "somewhere new";
  const from = short(source);
  const { scene } = useDestinationScene(destination);
  const photo = sizedPhoto(useDestinationPhoto(destination), 1800);
  const [loaded, setLoaded] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const steps = useMemo(
    () => [
      from ? `Comparing ways from ${from} to ${city}` : "Comparing flights, trains and buses",
      budget ? `Finding stays inside your ${budget}` : "Finding stays that match your style",
      vibes?.length ? `Fitting ${list(vibes.slice(0, 3).map((v) => v.toLowerCase()))} into ${days} ${days === 1 ? "day" : "days"}` : `Sketching all ${days} ${days === 1 ? "day" : "days"}`,
      "Writing day 1 in full",
      "Opening your trip",
    ],
    [from, city, budget, vibes, days]
  );
  // Steps move on with time; the last one waits for the trip itself.
  const done = finishing ? steps.length - 1 : Math.min(Math.floor(elapsed / 2.4), steps.length - 1);
  const progress = finishing ? 0.94 + 0.04 * (1 - Math.exp(-elapsed / 3)) : 0.92 * (1 - Math.exp(-elapsed / 9));

  useEffect(() => {
    const t0 = Date.now();
    const t = window.setInterval(() => setElapsed((Date.now() - t0) / 1000), 200);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, []);

  const when = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const facts = [
    when && !Number.isNaN(when.getTime()) ? { k: "Leaving", v: when.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) } : null,
    { k: "Days", v: String(days) },
    people ? { k: people === 1 ? "Traveller" : "Travellers", v: String(people) } : null,
    budget ? { k: "Budget", v: budget } : null,
  ].filter((f): f is { k: string; v: string } => !!f);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label={`Planning ${days} days in ${city}`}
      initial={{ opacity: finishing ? 1 : 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[80] overflow-hidden bg-ink text-paper"
    >
      {/* The place: its illustration first, its photo once it loads, drifting slowly. */}
      <motion.div initial={{ scale: reduce ? 1 : 1.12 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : 24, ease: "easeOut" }} className="absolute inset-0">
        <Scene id={scene} intro={!finishing} />
        {photo?.url && (
          <img
            src={photo.url}
            alt=""
            decoding="async"
            onLoad={() => setLoaded(true)}
            className={cn("absolute inset-0 size-full object-cover transition-opacity duration-[1400ms]", loaded ? "opacity-100" : "opacity-0")}
          />
        )}
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-ink/70" />

      <div className="relative flex h-full flex-col items-center justify-center overflow-y-auto px-5 py-[max(2rem,env(safe-area-inset-top))] text-center">
        <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] text-paper/60">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-brand-2/70 [animation-duration:1.8s]" />
            <span className="relative size-2 rounded-full bg-brand-2" />
          </span>
          {finishing ? "OPENING YOUR TRIP" : "CRAFTING YOUR ITINERARY"}
          {!finishing && <span className="tabular-nums text-paper/40">{clock(Math.floor(elapsed))}</span>}
        </p>
        <h2 className="display mt-5 max-w-3xl text-[clamp(2.3rem,6vw,4.6rem)] leading-[0.98] tracking-[-0.025em]">
          {days} {days === 1 ? "day" : "days"} in <span className="accent">{city}</span>
        </h2>

        {/* Their ticket, printing itself. */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: finishing ? 0 : 0.2 }}
          className="mt-9 w-full max-w-[34rem] rounded-[26px] bg-paper/[0.07] p-5 text-left ring-1 ring-inset ring-paper/15 sm:p-6"
        >
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-end gap-3 sm:gap-4">
            <div className={cn(!from && "invisible")}>
              <p className="font-mono text-[10px] tracking-[0.18em] text-paper/50">FROM</p>
              <p className="display mt-1 text-[2.1rem] leading-none sm:text-[2.6rem]">{from ? cityCode(from) : "···"}</p>
              <p className="mt-1.5 max-w-[7rem] truncate text-xs text-paper/60">{from || "Home"}</p>
            </div>
            <svg viewBox="0 0 200 60" className="mb-7 h-12 w-full text-paper/35" aria-hidden preserveAspectRatio="none">
              <path id="gen-arc" d="M4 54C60 4 140 4 196 54" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
              <circle cx="4" cy="54" r="3" fill="currentColor" />
              <circle cx="196" cy="54" r="3.5" fill="var(--brand-2)" />
              {!reduce && (
                <g>
                  <path d="M-8 -3L6 0L-8 3L-5 0Z" fill="#fff" />
                  <animateMotion dur="3.4s" repeatCount="indefinite" rotate="auto" calcMode="spline" keyPoints="0;1" keyTimes="0;1" keySplines="0.45 0 0.55 1">
                    <mpath href="#gen-arc" />
                  </animateMotion>
                </g>
              )}
            </svg>
            <div className="text-right">
              <p className="font-mono text-[10px] tracking-[0.18em] text-paper/50">TO</p>
              <p className="display mt-1 text-[2.1rem] leading-none text-brand-2 sm:text-[2.6rem]">{cityCode(city)}</p>
              <p className="mt-1.5 max-w-[7rem] truncate text-xs text-paper/60">{city}</p>
            </div>
          </div>
          <dl className={cn("mt-5 grid border-t border-dashed border-paper/20 pt-4", facts.length >= 4 ? "grid-cols-2 gap-y-3 sm:grid-cols-4" : facts.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
            {facts.map((f, i) => (
              <motion.div
                key={f.k}
                initial={{ opacity: 0, scale: reduce ? 1 : 1.35 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease, delay: finishing ? 0 : 0.7 + i * 0.35 }}
                className="min-w-0 origin-left"
              >
                <dt className="font-mono text-[10px] tracking-[0.18em] text-paper/45">{f.k.toUpperCase()}</dt>
                <dd className="mt-1 truncate text-[0.95rem] tabular-nums text-paper">{f.v}</dd>
              </motion.div>
            ))}
          </dl>
        </motion.div>

        {/* The work, in their words, with a bar that never runs ahead of it. */}
        <div className="mt-7 w-full max-w-[34rem] text-left">
          <div className="h-[3px] overflow-hidden rounded-full bg-paper/15" aria-hidden>
            <div className="h-full rounded-full bg-brand-2 transition-[width] duration-200 ease-linear" style={{ width: `${Math.round(progress * 1000) / 10}%` }} />
          </div>
          <ul className="mt-5 space-y-2.5">
            {steps.map((s, i) => (
              <motion.li
                key={s}
                initial={{ opacity: 0, x: reduce ? 0 : -8 }}
                animate={{ opacity: i <= done ? 1 : 0.35, x: 0 }}
                transition={{ delay: finishing ? 0 : 0.3 + i * 0.07, duration: 0.5 }}
                className="flex items-start gap-3 text-sm sm:items-center"
              >
                <span className={cn("grid size-5 shrink-0 place-items-center rounded-full transition-colors duration-500", i < done ? "bg-brand text-white" : i === done ? "ring-1 ring-paper/50" : "ring-1 ring-paper/15")}>
                  {i < done ? <Check className="size-3" /> : i === done ? <span className="size-1.5 animate-pulse rounded-full bg-paper" /> : null}
                </span>
                <span className={cn("min-w-0 leading-snug sm:truncate", i === done ? "text-paper" : i < done ? "text-paper/75" : "text-paper/60")}>{s}</span>
              </motion.li>
            ))}
          </ul>
          <p className="mt-7 text-sm text-paper/50">{days > 1 ? "Day 1 opens first; the other days fill in while you look around." : "Good plans take a moment. Please keep this tab open."}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------------------------------------
   The hand-off: the planner leaves a note as it opens the new trip, so the trip's page keeps the
   overlay up (as "Opening your trip") while it loads, instead of flashing a skeleton.
------------------------------------------------------------------------------------------------- */

const OPENING_KEY = "goroam:opening";
const OPENING_TTL = 2 * 60 * 1000;

/** Called just before navigating to a freshly generated trip. */
export function markOpening(id: string, trip: OverlayTrip) {
  try {
    window.sessionStorage.setItem(OPENING_KEY, JSON.stringify({ id, at: Date.now(), trip }));
  } catch {
    /* private mode: the page falls back to its skeleton */
  }
}

/** Called once the trip is on screen, so later visits load normally. */
export function clearOpening() {
  try {
    window.sessionStorage.removeItem(OPENING_KEY);
  } catch {
    /* ignore */
  }
}

// useSyncExternalStore needs the same object back while the note hasn't changed.
let lastRaw: string | null = null;
let lastNote: { id: string; at: number; trip: OverlayTrip } | null = null;
function readNote() {
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(OPENING_KEY);
  } catch {
    raw = null;
  }
  if (raw !== lastRaw) {
    lastRaw = raw;
    try {
      lastNote = raw ? JSON.parse(raw) : null;
    } catch {
      lastNote = null;
    }
  }
  return lastNote;
}
const noSubscribe = () => () => {};

/**
 * The overlay, finishing, while a just-generated trip loads; `fallback` otherwise.
 * With no `id` (the route's loading screen doesn't know it), any fresh note counts.
 */
export function OpeningOverlay({ id, fallback }: { id?: string | null; fallback: ReactNode }) {
  const note = useSyncExternalStore(noSubscribe, readNote, () => null);
  const fresh = !!note && Date.now() - note.at < OPENING_TTL && (!id || note.id === id);
  return fresh ? <GeneratingOverlay {...note.trip} finishing /> : <>{fallback}</>;
}
