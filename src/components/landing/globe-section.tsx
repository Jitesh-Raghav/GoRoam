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
      diffuse: 1.25,
      mapSamples: 20000,
      mapBrightness: 5.5,
      mapBaseBrightness: 0.02,
      baseColor: [0.12, 0.24, 0.32],
      markerColor: [0.96, 0.64, 0.25],
      glowColor: [0.2, 0.62, 0.6],
      markers,
      arcs,
      arcColor: [0.2, 0.82, 0.75],
      arcWidth: 0.6,
      arcHeight: 0.2,
      markerElevation: 0.015,
      opacity: 0.9,
    });

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const f = focusRef.current ? bySlug.get(focusRef.current) : null;
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
      <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(11,130,120,0.22),transparent_62%)] blur-2xl" />
      <canvas
        ref={canvasRef}
        className="relative size-full cursor-grab touch-none opacity-0 transition-opacity duration-1000"
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
              title={[[{ text: "From Kyoto to Cusco," }], [{ text: "every corner ", className: "italic text-brand-2" }, { text: "of the map." }]]}
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
                <p className="eyebrow h-4 text-paper/60">
                  {active ? `Now over: ${active.place} · ${formatCoords(active.lat, active.lng)}` : "Drag to spin · tap a wonder to fly there"}
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
