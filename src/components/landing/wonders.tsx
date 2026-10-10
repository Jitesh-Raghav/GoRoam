"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Clock3 } from "@/components/site/icons";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { WONDERS, formatCoords, type Destination } from "@/lib/destinations";
import { SCENES } from "@/components/scenes/scenes";
import { LazyScene } from "@/components/scenes/lazy-scene";
import { tripHref } from "@/components/site/trip-prompt";
import { PillLink } from "@/components/site/pill";
import { SectionHeading } from "./section-heading";

const pad = (n: number) => String(n).padStart(2, "0");
const ease = [0.16, 1, 0.3, 1] as const;
/** How long the index lingers on each wonder. */
const STEP_MS = 6000;

const TITLE = [[{ text: "Ten wonders." }], [{ text: "One tap", className: "accent" }, { text: " away." }]];
const BLURB = "Every icon here is a trip GoRoam can plan tonight. Pick one and we'll start your itinerary from there.";

/** Phones and tablets: one wonder per card in a swipe row. */
function WonderCard({ d, i }: { d: Destination; i: number }) {
  return (
    <Link
      href={tripHref(d.query)}
      data-card
      className="group relative block h-[31.25rem] w-[80vw] shrink-0 snap-start overflow-hidden rounded-panel bg-paper-2 sm:w-[380px]"
      aria-label={`Plan a trip to ${d.name}, ${d.place}`}
    >
      <div className="absolute inset-0 transition-transform duration-[1400ms] ease-out-expo group-hover:scale-[1.07]">
        <LazyScene id={d.scene} tint={SCENES[d.scene].tint} margin="900px" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-ink/85 via-ink/35 to-transparent" />
      <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
        <span className="eyebrow rounded-full bg-ink/25 px-3 py-2 text-paper backdrop-blur-md">{pad(i + 1)}</span>
        <span className="grid size-10 place-items-center rounded-full bg-paper/90 text-ink">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6 text-paper">
        <p className="font-mono text-[11px] tracking-wide text-paper/65">{formatCoords(d.lat, d.lng)}</p>
        <h3 className="display mt-2 text-[2.21rem] leading-[1.02]">{d.name}</h3>
        <p className="mt-1 text-sm text-paper/75">{d.place}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/12 px-3 py-1.5 ring-1 ring-inset ring-paper/15 backdrop-blur-md">
            <CalendarDays className="size-3.5" /> {d.bestTime}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/12 px-3 py-1.5 ring-1 ring-inset ring-paper/15 backdrop-blur-md">
            <Clock3 className="size-3.5" /> {d.days}
          </span>
        </div>
        <p className="pt-4 text-sm leading-relaxed text-paper/80">{d.blurb}</p>
      </div>
    </Link>
  );
}

/** Below lg: the swipe row, with a counter and a hairline that follow the scroll. */
function WonderRow() {
  const row = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ at: 1, progress: 0 });
  const onScroll = () => {
    const el = row.current;
    const card = el?.querySelector<HTMLElement>("[data-card]");
    if (!el || !card) return;
    const step = card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "16");
    const max = Math.max(el.scrollWidth - el.clientWidth, 1);
    setState({ at: Math.min(WONDERS.length, Math.round(el.scrollLeft / step) + 1), progress: Math.min(1, el.scrollLeft / max) });
  };
  return (
    <div className="lg:hidden">
      <div ref={row} onScroll={onScroll} className="no-scrollbar mt-10 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:scroll-px-8 sm:gap-6 sm:px-8">
        {WONDERS.map((d, i) => (
          <WonderCard key={d.slug} d={d} i={i} />
        ))}
        <div className="flex h-[31.25rem] w-[80vw] shrink-0 snap-start flex-col justify-between rounded-panel bg-ocean p-8 text-paper sm:w-[380px]">
          <p className="eyebrow text-paper/60">And everywhere else</p>
          <div>
            <p className="display text-[2.38rem] leading-[1.02]">
              Your map,
              <br />
              <span className="accent">your rules.</span>
            </p>
            <p className="mt-4 text-paper/70">From a weekend in Jaipur to a month across Patagonia. If it&apos;s on Earth, GoRoam can plan it.</p>
            <PillLink href="/dashboard" variant="paper" className="mt-8">
              Plan your own
            </PillLink>
          </div>
        </div>
      </div>
      <div className="container-x mt-5 flex items-center gap-4">
        <span className="font-mono text-xs tabular-nums text-ink">
          {pad(state.at)} <span className="text-stone">/ {pad(WONDERS.length)}</span>
        </span>
        <span className="relative h-px flex-1 bg-ink/15">
          <span className="absolute inset-y-0 left-0 w-full origin-left bg-ink transition-transform duration-200" style={{ transform: `scaleX(${Math.max(state.progress, 0.04)})` }} />
        </span>
      </div>
    </div>
  );
}

/**
 * The ten wonders. From lg up: an editorial index, with every name in view and
 * one large illustrated scene that follows the row you point at, and plays
 * through the list on its own while the section is on screen. Below lg: a swipe row.
 */
export function Wonders() {
  const [active, setActive] = useState(0);
  const [tick, setTick] = useState(0);
  const [held, setHeld] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hover = useRef<number | undefined>(undefined);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const playing = inView && !reduce && !held;
  const d = WONDERS[active];

  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => setActive((i) => (i + 1) % WONDERS.length), STEP_MS);
    return () => window.clearTimeout(t);
  }, [playing, active, tick]);
  useEffect(() => () => window.clearTimeout(hover.current), []);

  const pick = (i: number) => {
    setActive((i + WONDERS.length) % WONDERS.length);
    setTick((t) => t + 1);
  };
  // Pointing settles for a moment before the scene changes, so sweeping across the list doesn't flicker.
  const point = (i: number) => {
    window.clearTimeout(hover.current);
    hover.current = window.setTimeout(() => pick(i), 110);
  };

  return (
    <section id="wonders" className="relative scroll-mt-16 bg-paper py-20 lg:py-28">
      <div className="container-x lg:hidden">
        <SectionHeading label="Wonders of the world" title={TITLE} description={BLURB} />
      </div>
      <WonderRow />

      <div
        ref={ref}
        className="container-x hidden lg:grid lg:grid-cols-12 lg:gap-12"
        onPointerEnter={() => setHeld(true)}
        onPointerLeave={() => {
          window.clearTimeout(hover.current);
          setHeld(false);
        }}
        onFocus={() => setHeld(true)}
        onBlur={() => setHeld(false)}
      >
        <div className="flex flex-col lg:col-span-5">
          <SectionHeading label="Wonders of the world" size="md" title={TITLE} description={BLURB} />
          <ol className="mt-8 border-t border-line" aria-label="Ten wonders">
            {WONDERS.map((w, i) => {
              const on = i === active;
              return (
                <li key={w.slug} className="border-b border-line">
                  <Link
                    href={tripHref(w.query)}
                    onPointerEnter={() => point(i)}
                    onFocus={() => pick(i)}
                    aria-current={on ? "true" : undefined}
                    aria-label={`Plan a trip to ${w.name}, ${w.place}`}
                    className="group relative flex items-center gap-4 py-2.5"
                  >
                    <span className={cn("w-7 shrink-0 font-mono text-xs tabular-nums transition-colors duration-500", on ? "text-brand" : "text-ink/30")}>{pad(i + 1)}</span>
                    <span className={cn("display min-w-0 flex-1 truncate text-[1.3rem] leading-7 transition-colors duration-500", on ? "text-ink" : "text-ink/45 group-hover:text-ink/70")}>
                      {w.name}
                    </span>
                    <span className={cn("hidden shrink-0 text-sm transition-colors duration-500 xl:inline", on ? "text-stone" : "text-stone/60")}>{w.place}</span>
                    <ArrowUpRight className={cn("size-4 shrink-0 transition-all duration-500", on ? "text-ink opacity-100" : "-translate-x-1 text-ink/40 opacity-0 group-hover:translate-x-0 group-hover:opacity-100")} />
                    {on && (
                      <span aria-hidden className="absolute inset-x-0 -bottom-px h-px overflow-hidden">
                        <span key={`${i}-${tick}`} className={cn("block h-full origin-left bg-ink", playing ? "animate-fill-x" : "scale-x-100")} style={{ animationDuration: `${STEP_MS}ms` }} />
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ol>
          <p className="mt-6 text-sm text-stone">
            Somewhere else in mind?{" "}
            <Link href="/dashboard" className="group inline-flex items-center gap-1 text-ink underline decoration-line underline-offset-4 transition-colors hover:text-brand hover:decoration-brand">
              Plan your own <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-0.5" />
            </Link>
          </p>
        </div>

        {/* The chosen wonder, large */}
        <div className="relative min-h-[36rem] overflow-hidden rounded-panel bg-ink text-paper lg:col-span-7">
          <AnimatePresence initial={false}>
            <motion.div
              key={d.slug}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease }}
              className="absolute inset-0"
            >
              <LazyScene id={d.scene} tint={SCENES[d.scene].tint} intro interactive title={`${d.name}, ${d.place}`} />
            </motion.div>
          </AnimatePresence>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />

          <div className="absolute inset-x-6 top-6 flex items-center justify-between">
            <span className="rounded-full bg-ink/30 px-3 py-1.5 font-mono text-xs tabular-nums text-paper backdrop-blur-md">
              {pad(active + 1)} <span className="text-paper/60">/ {pad(WONDERS.length)}</span>
            </span>
            <div className="flex gap-2">
              {[-1, 1].map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => pick(active + dir)}
                  aria-label={dir < 0 ? "Previous wonder" : "Next wonder"}
                  className="grid size-10 place-items-center rounded-full bg-paper/15 text-paper ring-1 ring-inset ring-paper/25 backdrop-blur-md transition-colors hover:bg-paper hover:text-ink"
                >
                  {dir < 0 ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={d.slug}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.55, ease }}
              className="absolute inset-x-0 bottom-0 p-8 xl:p-10"
            >
              <p className="font-mono text-[11px] tracking-wide text-paper/65">{formatCoords(d.lat, d.lng)}</p>
              <h3 className="display mt-2 text-[clamp(2.4rem,3.6vw,3.25rem)] leading-[1.02]">{d.name}</h3>
              <p className="mt-1 text-paper/75">{d.place}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/12 px-3 py-1.5 ring-1 ring-inset ring-paper/15 backdrop-blur-md">
                  <CalendarDays className="size-3.5" /> Best {d.bestTime}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/12 px-3 py-1.5 ring-1 ring-inset ring-paper/15 backdrop-blur-md">
                  <Clock3 className="size-3.5" /> {d.days}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
                <p className="max-w-md text-sm leading-relaxed text-paper/80">{d.blurb}</p>
                <PillLink href={tripHref(d.query)} variant="paper">
                  Plan a trip to {d.name}
                </PillLink>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
