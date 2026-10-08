"use client";

import createGlobe, { type Arc, type Marker } from "cobe";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { DESTINATIONS, formatCoords } from "@/lib/destinations";
import { Counter } from "@/components/motion/counter";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "./section-heading";

// Long-haul legs only: short hops would draw tall loops at a shared arc height.
const TOUR = ["taj-mahal", "santorini", "big-ben", "statue-of-liberty", "christ-the-redeemer", "machu-picchu", "golden-gate-bridge", "mount-fuji", "sydney-opera-house", "angkor-wat", "taj-mahal"];
const FOCUS = ["taj-mahal", "eiffel-tower", "mount-fuji", "santorini", "machu-picchu", "christ-the-redeemer", "sydney-opera-house", "statue-of-liberty"];

const STATS = [
  { value: 30, suffix: "", label: "days: the longest trip we'll map out" },
  { value: 3, suffix: "", label: "curated moments in every single day" },
  { value: 20, suffix: "", label: "travellers in one shared plan" },
  { value: 8, suffix: "", label: "travel styles to mix and match" },
];

const toAngles = (lat: number, lng: number): [number, number] => [
  Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2),
  (lat * Math.PI) / 180,
];

function wrap(a: number) {
  const t = Math.PI * 2;
  return ((((a + Math.PI) % t) + t) % t) - Math.PI;
}

function Globe({ focus }: { focus: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<string | null>(focus);
  focusRef.current = focus;

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = wrapRef.current;
    if (!canvas || !host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let size = host.clientWidth;

    const bySlug = new Map(DESTINATIONS.map((d) => [d.slug, d]));
    const markers: Marker[] = DESTINATIONS.map((d) => ({ location: [d.lat, d.lng], size: 0.045 }));
    const arcs: Arc[] = TOUR.slice(1).map((slug, i) => {
      const a = bySlug.get(TOUR[i])!;
      const b = bySlug.get(slug)!;
      return { from: [a.lat, a.lng], to: [b.lat, b.lng] };
    });

    let phi = toAngles(27.17, 78.04)[0];
    let theta = 0.28;
    let drag: { x: number; y: number; phi: number; theta: number } | null = null;
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
      baseColor: [0.07, 0.17, 0.24],
      markerColor: [1, 0.72, 0.36],
      glowColor: [0.16, 0.52, 0.52],
      markers,
      arcs,
      arcColor: [0.3, 0.86, 0.78],
      arcWidth: 0.7,
      arcHeight: 0.22,
      markerElevation: 0.02,
      opacity: 0.95,
    });

    let raf = 0;
    let shown: string | null = null;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const f = focusRef.current ? bySlug.get(focusRef.current) : null;
      if (focusRef.current !== shown) {
        // The destination you picked glows bigger than the rest.
        shown = focusRef.current;
        globe.update({ markers: DESTINATIONS.map((d) => ({ location: [d.lat, d.lng], size: d.slug === shown ? 0.11 : 0.045 })) });
      }
      if (!drag) {
        if (f) {
          const [tp, tt] = toAngles(f.lat, f.lng);
          phi += wrap(tp - phi) * 0.06;
          theta += (tt * 0.8 - theta) * 0.06;
        } else if (!reduced) {
          phi += 0.0022;
          theta += (0.28 - theta) * 0.02;
        }
      }
      globe.update({ phi, theta });
    };
    loop();

    const onDown = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY, phi, theta };
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
      {/* Stars, then a soft lagoon halo behind the sphere */}
      <div className="pointer-events-none absolute -inset-[6%] opacity-60 [background-image:radial-gradient(rgb(244_248_249/0.55)_1px,transparent_1.5px)] [background-size:34px_34px] [mask-image:radial-gradient(circle,transparent_42%,black_52%,transparent_72%)]" />
      <div className="pointer-events-none absolute inset-[6%] rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(52,209,191,0.28),transparent_64%)] blur-2xl" />
      {/* Atmosphere: a thin bright rim hugging the planet */}
      <div className="pointer-events-none absolute inset-[9.5%] rounded-full shadow-[0_0_60px_8px_rgba(52,209,191,0.18),inset_0_0_40px_rgba(52,209,191,0.25)] ring-1 ring-brand-2/25" />
      {/* An orbit with a little plane on it */}
      <div className="pointer-events-none absolute inset-[2%] rounded-full border border-dashed border-paper/15 [transform:rotateX(72deg)_rotateZ(-14deg)]">
        <div className="globe-orbit absolute inset-0">
          <span className="absolute left-1/2 top-0 grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-sun text-ink shadow-[0_0_18px_rgba(255,200,118,0.8)]">
            <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
            </svg>
          </span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="relative size-full scale-95 cursor-grab touch-none opacity-0 transition-[opacity,transform] duration-[1400ms] ease-out [&[style*='opacity:_1']]:scale-100"
        aria-label="Interactive globe showing GoRoam destinations"
        role="img"
      />
    </div>
  );
}

export function GlobeSection() {
  const [focus, setFocus] = useState<string | null>(null);
  const active = focus ? DESTINATIONS.find((d) => d.slug === focus) : null;

  return (
    <section className="px-3 sm:px-4">
      <div className="relative overflow-hidden rounded-[36px] bg-ocean py-24 text-paper sm:rounded-[48px] lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(11,130,120,0.16),transparent_55%)]" />
        <div className="container-x relative grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              index="04"
              label="Anywhere on Earth"
              tone="paper"
              size="md"
              title={[[{ text: "The whole map," }], [{ text: "planned with " }, { text: "care.", className: "accent" }]]}
              description="Drag the globe, or pick a wonder. GoRoam plans national getaways and big international journeys with the same care."
            />
            <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10">
              {STATS.map((s, i) => (
                <Reveal key={s.label} delay={0.1 * i}>
                  <div className="border-t border-paper/15 pt-5">
                    <Counter value={s.value} suffix={s.suffix} className="display text-5xl leading-none text-paper" />
                    <p className="mt-3 text-sm leading-relaxed text-paper/60">{s.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="mx-auto max-w-[640px]">
              <Globe focus={focus} />
              <div className="-mt-4 text-center">
                <p className="inline-flex items-center gap-2 rounded-full bg-paper/[0.08] px-4 py-2 text-xs text-paper/80 ring-1 ring-inset ring-paper/15 backdrop-blur-md">
                  <span className={cn("size-1.5 rounded-full", active ? "bg-sun shadow-[0_0_10px_rgba(255,200,118,0.9)]" : "bg-brand-2")} />
                  {active ? (
                    <>
                      Now over <span className="font-medium text-paper">{active.place}</span>
                      <span className="font-mono text-paper/50">{formatCoords(active.lat, active.lng)}</span>
                    </>
                  ) : (
                    "Drag to spin · tap a wonder to fly there"
                  )}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {FOCUS.map((slug) => {
                    const d = DESTINATIONS.find((x) => x.slug === slug)!;
                    return (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => setFocus((f) => (f === slug ? null : slug))}
                        className={cn(
                          "rounded-full px-4 py-2 text-sm transition-colors duration-300",
                          focus === slug ? "bg-brand text-white" : "bg-paper/[0.07] text-paper/80 ring-1 ring-inset ring-paper/10 hover:bg-paper/15"
                        )}
                        aria-pressed={focus === slug}
                      >
                        {d.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
