"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { hashString, mulberry32 } from "@/components/scenes/geometry";
import type { ActivitySlot } from "@/lib/trip";
import { cn } from "@/lib/utils";

export interface RouteStop {
  key: string;
  label: string;
  activity: ActivitySlot;
}

const W = 100;
const H = 56;
const FALLBACK: [number, number][] = [
  [18, 38],
  [50, 16],
  [82, 34],
];

/** Place stops by their real coordinates when the plan has them; otherwise a pleasant default arc. */
function layout(stops: RouteStop[], seed: string): [number, number][] {
  const pts = stops.map((s) => [Number(s.activity.place.lng), Number(s.activity.place.lat)] as const);
  const valid = pts.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y) && (x !== 0 || y !== 0));
  if (valid && pts.length > 1) {
    const lats = pts.map((p) => p[1]);
    const k = Math.cos(((Math.max(...lats) + Math.min(...lats)) / 2) * (Math.PI / 180));
    const xs = pts.map((p) => p[0] * k);
    const ys = pts.map((p) => -p[1]);
    const spanX = Math.max(...xs) - Math.min(...xs);
    const spanY = Math.max(...ys) - Math.min(...ys);
    const span = Math.max(spanX, spanY * (W / H));
    // A day within a city spans well under ~2°; anything wider is a bad coordinate.
    if (span > 1e-4 && span < 2) {
      const pad = 16;
      const scale = Math.min((W - pad * 2) / Math.max(spanX, 1e-6), (H - pad * 1.4) / Math.max(spanY, 1e-6));
      const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
      const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
      return xs.map((x, i) => [W / 2 + (x - cx) * scale, H / 2 + (ys[i] - cy) * scale]);
    }
  }
  const rand = mulberry32(hashString(seed));
  return stops.map((_, i) => {
    const [x, y] = FALLBACK[i % FALLBACK.length];
    return [x + (rand() - 0.5) * 8, y + (rand() - 0.5) * 8];
  });
}

/** Nudge stops that sit on top of each other apart so pins and labels stay readable. */
function separate(points: [number, number][], min = 20): [number, number][] {
  const p = points.map(([x, y]) => [x, y] as [number, number]);
  for (let iter = 0; iter < 40; iter++) {
    let moved = false;
    for (let i = 0; i < p.length; i++) {
      for (let j = i + 1; j < p.length; j++) {
        const dx = p[j][0] - p[i][0];
        const dy = (p[j][1] - p[i][1]) * 1.8; // labels are wide, rows are short
        const d = Math.hypot(dx, dy);
        if (d >= min) continue;
        const ux = d ? dx / d : 1;
        const uy = d ? dy / d : 0.3;
        const push = (min - d) / 2;
        p[i][0] -= ux * push;
        p[i][1] -= (uy * push) / 1.8;
        p[j][0] += ux * push;
        p[j][1] += (uy * push) / 1.8;
        moved = true;
      }
    }
    for (const q of p) {
      q[0] = Math.max(8, Math.min(W - 8, q[0]));
      q[1] = Math.max(8, Math.min(H - 8, q[1]));
    }
    if (!moved) break;
  }
  return p;
}

/** Smooth path through the points (Catmull-Rom → cubic Bézier). */
function smooth(p: [number, number][]) {
  if (p.length < 2) return "";
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 5, p1[1] + (p2[1] - p0[1]) / 5];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 5, p2[1] - (p3[1] - p1[1]) / 5];
    d += `C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

/** Seeded, abstract city blocks: streets, a park and a river, unique per destination. */
function useStreets(seed: string) {
  return useMemo(() => {
    const rand = mulberry32(hashString(seed));
    const streets: string[] = [];
    for (let i = 0; i < 7; i++) {
      const y = rand() * H;
      streets.push(`M-5 ${y}C${30 + rand() * 20} ${y + (rand() - 0.5) * 20} ${60 + rand() * 20} ${y + (rand() - 0.5) * 20} 105 ${y + (rand() - 0.5) * 16}`);
    }
    for (let i = 0; i < 8; i++) {
      const x = rand() * W;
      streets.push(`M${x} -5C${x + (rand() - 0.5) * 16} 20 ${x + (rand() - 0.5) * 16} 40 ${x + (rand() - 0.5) * 12} 61`);
    }
    const ry = 10 + rand() * 36;
    const river = `M-5 ${ry}C25 ${ry + 18 * (rand() - 0.5)} 55 ${ry + 30 * (rand() - 0.5)} 105 ${ry + 20 * (rand() - 0.5)}`;
    const park = { x: 10 + rand() * 70, y: 6 + rand() * 34, w: 10 + rand() * 10, h: 6 + rand() * 8 };
    return { streets, river, park };
  }, [seed]);
}

export function RouteMap({ stops, seed, className }: { stops: RouteStop[]; seed: string; className?: string }) {
  const pts = useMemo(() => separate(layout(stops, seed)), [stops, seed]);
  const { streets, river, park } = useStreets(seed);
  const route = smooth(pts);

  return (
    <div className={cn("relative overflow-hidden rounded-[24px] bg-[#ece5d8]", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
        <rect x={park.x} y={park.y} width={park.w} height={park.h} rx={2} fill="#dcdcc0" />
        <path d={river} fill="none" stroke="#cfdbe0" strokeWidth={10} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        {streets.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#f7f2e9" strokeWidth={i % 3 === 0 ? 6 : 3} vectorEffect="non-scaling-stroke" />
        ))}
        <path d={route} fill="none" stroke="var(--ink)" strokeOpacity={0.12} strokeWidth={9} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {/* Revealed left to right; pathLength can't be used with non-scaling strokes. */}
        <motion.g
          key={route}
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1], delay: 0.2 }}
        >
          <path d={route} fill="none" stroke="var(--ink)" strokeWidth={2.5} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </motion.g>
      </svg>
      {stops.map((s, i) => {
        const [x, y] = pts[i];
        const right = x < 60;
        return (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, scale: 0.6, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.25 + i * 0.35 }}
            className="absolute"
            style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` }}
          >
            <span
              className={cn(
                "absolute left-0 top-0 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-mono text-xs text-white shadow-[0_8px_20px_-6px_rgba(21,19,15,0.6)] ring-[3px] ring-white",
                i === stops.length - 1 ? "bg-brand" : "bg-ink"
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                "absolute top-0 hidden max-w-[11rem] -translate-y-1/2 truncate rounded-full bg-white/95 px-3 py-1.5 text-xs text-ink shadow-sm ring-1 ring-line sm:block",
                right ? "left-6" : "right-6"
              )}
            >
              <span className="text-stone">{s.label} · </span>
              {s.activity.place.name}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
