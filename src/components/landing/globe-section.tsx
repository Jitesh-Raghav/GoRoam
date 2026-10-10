"use client";

import createGlobe, { type Arc, type Marker } from "cobe";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Counter } from "@/components/motion/counter";
import { ArrowUpRight, Moon, Sun } from "@/components/site/icons";
import { PhotoPanel } from "@/components/site/photo-panel";
import { tripHref } from "@/components/site/trip-prompt";
import { sizedPhoto, usePlacePhoto } from "@/lib/brand-photos";
import { DESTINATIONS, formatCoords, type Destination } from "@/lib/destinations";
import { clockIn, isDaytimeIn, useNow } from "@/lib/use-clock";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

const ease = [0.16, 1, 0.3, 1] as const;

// Long-haul legs only: short hops would draw tall loops at a shared arc height.
const TOUR = ["taj-mahal", "santorini", "big-ben", "statue-of-liberty", "christ-the-redeemer", "machu-picchu", "golden-gate-bridge", "mount-fuji", "sydney-opera-house", "angkor-wat", "taj-mahal"];
/** The departures board, in the order the tour visits them. */
const BOARD = ["taj-mahal", "santorini", "eiffel-tower", "statue-of-liberty", "christ-the-redeemer", "machu-picchu", "mount-fuji", "sydney-opera-house"]
  .map((slug) => DESTINATIONS.find((d) => d.slug === slug))
  .filter((d): d is Destination => !!d);
/** How long the tour lingers on each place. */
const TOUR_MS = 5200;

// Plain facts about the product, nothing inflated.
const STATS = [
  { value: 30, label: "days: the longest trip we'll plan" },
  { value: 12, label: "interests to shape every plan" },
  { value: 3, label: "moments a day: morning, afternoon, evening" },
  { value: 1, label: "free trip to start, no card needed" },
];

const toAngles = (lat: number, lng: number): [number, number] => [
  Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2),
  (lat * Math.PI) / 180,
];

function wrap(a: number) {
  const t = Math.PI * 2;
  return ((((a + Math.PI) % t) + t) % t) - Math.PI;
}

/**
 * The globe flies to `focus` whenever it changes. Dragging takes over until the
 * next change; left alone (and motion allowed) it drifts slowly eastward.
 */
function Globe({ focus, onGrab }: { focus: string; onGrab: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef(focus);
  focusRef.current = focus;
  const grabRef = useRef(onGrab);
  grabRef.current = onGrab;

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = wrapRef.current;
    if (!canvas || !host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let size = host.clientWidth;

    const bySlug = new Map(DESTINATIONS.map((d) => [d.slug, d]));
    const markersFor = (active: string | null): Marker[] => DESTINATIONS.map((d) => ({ location: [d.lat, d.lng], size: d.slug === active ? 0.1 : 0.04 }));
    const arcs: Arc[] = TOUR.slice(1).map((slug, i) => {
      const a = bySlug.get(TOUR[i])!;
      const b = bySlug.get(slug)!;
      return { from: [a.lat, a.lng], to: [b.lat, b.lng] };
    });

    const start = bySlug.get(focusRef.current);
    let phi = start ? toAngles(start.lat, start.lng)[0] : 0;
    let theta = 0.3;
    let drag: { x: number; y: number; phi: number; theta: number } | null = null;
    // Following the focus until someone grabs the globe; a new focus takes it back.
    let following = true;
    let visible = true;

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size,
      height: size,
      phi,
      theta,
      dark: 1,
      diffuse: 0.9,
      mapSamples: 36000,
      mapBrightness: 7,
      mapBaseBrightness: 0.03,
      baseColor: [0.07, 0.17, 0.23],
      markerColor: [0.91, 0.76, 0.49],
      glowColor: [0.14, 0.47, 0.46],
      markers: markersFor(focusRef.current),
      arcs,
      arcColor: [0.24, 0.81, 0.74],
      arcWidth: 0.6,
      arcHeight: 0.22,
      markerElevation: 0.02,
      opacity: 0.95,
    });

    let raf = 0;
    let shown = focusRef.current;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      if (focusRef.current !== shown) {
        shown = focusRef.current;
        following = true;
        globe.update({ markers: markersFor(shown) });
      }
      if (!drag) {
        const f = following ? bySlug.get(shown) : null;
        if (f) {
          const [tp, tt] = toAngles(f.lat, f.lng);
          phi += wrap(tp - phi) * 0.055;
          theta += (tt * 0.8 - theta) * 0.055;
        } else if (!reduced) {
          phi += 0.0018;
        }
      }
      globe.update({ phi, theta });
    };
    loop();

    const onDown = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY, phi, theta };
      following = false;
      grabRef.current();
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      phi = drag.phi + (e.clientX - drag.x) / 220;
      theta = Math.max(-0.9, Math.min(0.9, drag.theta + (e.clientY - drag.y) / 320));
    };
    const onUp = () => {
      drag = null;
      canvas.style.cursor = "grab";
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(host);
    const ro = new ResizeObserver(() => {
      size = host.clientWidth;
      globe.update({ width: size, height: size });
    });
    ro.observe(host);
    requestAnimationFrame(() => {
      canvas.style.opacity = "1";
    });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      globe.destroy();
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative aspect-square w-full">
      {/* A soft lagoon halo behind the sphere, then a thin bright rim of atmosphere. */}
      <div className="pointer-events-none absolute inset-[6%] rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(60,207,188,0.22),transparent_64%)] blur-2xl" />
      <div className="pointer-events-none absolute inset-[9.5%] rounded-full shadow-[0_0_60px_8px_rgba(60,207,188,0.14),inset_0_0_40px_rgba(60,207,188,0.2)] ring-1 ring-brand-2/20" />
      <canvas
        ref={canvasRef}
        className="relative size-full scale-95 cursor-grab touch-none opacity-0 transition-[opacity,transform] duration-[1400ms] ease-out [&[style*='opacity:_1']]:scale-100"
        aria-label="Interactive globe showing GoRoam destinations"
        role="img"
      />
    </div>
  );
}

/** The place the globe is over: a real photo, the essentials, and a way to plan it. */
function Postcard({ place, className }: { place: Destination; className?: string }) {
  const photo = sizedPhoto(usePlacePhoto(place.query), 900);
  return (
    <div className={className}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={place.slug} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5, ease }}>
          {/* Side by side on phones, a tall card from small screens up. */}
          <Link
            href={tripHref(place.query)}
            className="group flex overflow-hidden rounded-card bg-ink/85 shadow-float ring-1 ring-paper/10 backdrop-blur-xl transition-colors hover:ring-paper/25 sm:block"
          >
            <PhotoPanel photo={photo} scene={place.scene} credit={false} className="w-[40%] shrink-0 sm:aspect-[16/10] sm:w-auto">
              <span className="absolute left-3 top-3 hidden rounded-full bg-ink/45 px-2.5 py-1 font-mono text-[10px] text-paper/85 backdrop-blur-md sm:inline">
                {formatCoords(place.lat, place.lng)}
              </span>
            </PhotoPanel>
            <div className="min-w-0 flex-1 p-4 sm:p-5">
              <p className="eyebrow truncate text-[0.6rem] text-paper/50">{place.place}</p>
              <p className="display mt-1.5 text-[1.2rem] leading-tight text-paper sm:text-[1.35rem]">{place.name}</p>
              <p className="mt-2 hidden text-sm leading-relaxed text-paper/65 sm:block">
                <span className="line-clamp-2">{place.blurb}</span>
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-paper/10 pt-3 sm:mt-4 sm:pt-3.5">
                <span className="text-xs text-paper/55">
                  Best {place.bestTime} · {place.days}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm text-brand-2 transition-colors group-hover:text-paper">
                  Plan it <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:rotate-45" />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function GlobeSection() {
  const [active, setActive] = useState(0);
  const [tick, setTick] = useState(0);
  const [held, setHeld] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion();
  const now = useNow();
  const place = BOARD[active];
  const touring = inView && !reduce && !held;

  // While the board is on screen the globe flies from place to place; picking or dragging pauses it.
  useEffect(() => {
    if (!touring) return;
    const t = window.setTimeout(() => setActive((i) => (i + 1) % BOARD.length), TOUR_MS);
    return () => window.clearTimeout(t);
  }, [touring, active, tick]);

  const pick = (i: number) => {
    setActive(i);
    setTick((t) => t + 1);
  };

  return (
    <section className="px-3 sm:px-4">
      <div ref={ref} className="relative overflow-hidden rounded-panel bg-ocean py-20 text-paper lg:py-24">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_30%,rgba(11,119,109,0.18),transparent_55%)]" />
        <div className="container-x relative">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
            <SectionHeading
              className="lg:col-span-7"
              label="Anywhere on Earth"
              tone="paper"
              size="md"
              title={[[{ text: "The whole map," }], [{ text: "planned with " }, { text: "care.", className: "accent" }]]}
            />
            <p className="max-w-md text-[1.0625rem] leading-relaxed text-paper/65 lg:col-span-5 lg:justify-self-end lg:pb-1.5">
              A weekend two hours from home or a month across continents: every plan gets the same care. Pick a place, or let the board fly you round.
            </p>
          </div>

          <div className="mt-12 grid items-center gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-12">
            {/* Departures board */}
            <div className="order-2 lg:order-1 lg:col-span-5" onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)} onFocus={() => setHeld(true)} onBlur={() => setHeld(false)}>
              <div className="eyebrow flex items-center justify-between border-b border-paper/15 pb-3 text-[0.62rem] text-paper/45">
                <span>Destination</span>
                <span>Local time</span>
              </div>
              <ol aria-label="Destinations on the globe">
                {BOARD.map((d, i) => {
                  const on = i === active;
                  const day = now ? isDaytimeIn(d.tz, now) : true;
                  return (
                    <li key={d.slug} className="border-b border-paper/10">
                      <button type="button" onClick={() => pick(i)} aria-pressed={on} className="group relative flex w-full items-center gap-4 py-2.5 text-left sm:py-3">
                        <span className={cn("w-9 shrink-0 font-mono text-[11px] tracking-[0.14em] transition-colors duration-500", on ? "text-sun-2" : "text-paper/35")}>{d.code}</span>
                        <span className="min-w-0 flex-1">
                          <span className={cn("display block truncate text-[1.12rem] leading-6 transition-colors duration-500", on ? "text-paper" : "text-paper/60 group-hover:text-paper/85")}>
                            {d.name}
                          </span>
                          <span className="hidden truncate text-xs text-paper/40 sm:block">{d.place}</span>
                        </span>
                        <span className={cn("inline-flex shrink-0 items-center gap-2 font-mono text-sm tabular-nums transition-colors duration-500", on ? "text-paper" : "text-paper/50")}>
                          {now && (day ? <Sun className="size-3.5 text-sun-2/90" /> : <Moon className="size-3.5 text-paper/45" />)}
                          <span className="w-11 text-right">{now ? clockIn(d.tz, now) : "--:--"}</span>
                        </span>
                        {on && (
                          <span aria-hidden className="absolute inset-x-0 -bottom-px h-px overflow-hidden">
                            <span key={`${i}-${tick}`} className={cn("block h-full origin-left bg-sun-2", touring ? "animate-fill-x" : "scale-x-100")} style={{ animationDuration: `${TOUR_MS}ms` }} />
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Globe, with a postcard of where it's over */}
            <div className="order-1 lg:order-2 lg:col-span-7">
              <div className="relative mx-auto max-w-[600px]">
                <Globe focus={place.slug} onGrab={() => setHeld(true)} />
                <p className="pointer-events-none -mt-2 text-center text-xs text-paper/40">Drag to spin the globe</p>
                <Postcard place={place} className="mx-auto mt-6 w-full max-w-sm lg:absolute lg:-left-10 lg:bottom-10 lg:mt-0 lg:w-[17.5rem]" />
              </div>
            </div>
          </div>

          {/* The product, in four plain numbers */}
          <dl className="mt-16 grid grid-cols-2 border-t border-paper/15 lg:mt-20 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <div key={s.label} className={cn("py-6 pr-4 lg:px-6 lg:first:pl-0", i % 2 === 1 && "pl-4 max-lg:border-l max-lg:border-paper/10", i > 0 && "lg:border-l lg:border-paper/10", i > 1 && "max-lg:border-t max-lg:border-paper/10")}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <Counter value={s.value} className="display block text-[2.6rem] leading-none text-paper" />
                  <span className="mt-3 block text-sm leading-relaxed text-paper/55">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
