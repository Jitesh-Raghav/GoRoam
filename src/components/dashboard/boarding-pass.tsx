"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plane } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useDestinationScene } from "@/lib/use-destination-scene";
import { hashString, mulberry32 } from "@/components/scenes/geometry";
import { Scene } from "@/components/scenes/scene";
import type { SceneId } from "@/components/scenes/scenes";

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setV(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return v;
}

const code = (place: string) => {
  const letters = place.split(",")[0].replace(/[^a-zA-Z]/g, "").toUpperCase();
  return letters.length >= 3 ? letters.slice(0, 3) : "···";
};

function Barcode({ seed }: { seed: string }) {
  const bars = useMemo(() => {
    const rand = mulberry32(hashString(seed || "goroam"));
    const out: { x: number; w: number }[] = [];
    let x = 0;
    while (x < 150) {
      const w = 1 + Math.floor(rand() * 3.2);
      out.push({ x, w });
      x += w + 1 + Math.floor(rand() * 2.4);
    }
    return out;
  }, [seed]);
  return (
    <svg viewBox="0 0 150 40" className="h-10 w-[150px] text-ink" aria-hidden>
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={40} fill="currentColor" />
      ))}
    </svg>
  );
}

export interface PassData {
  source: string;
  destination: string;
  startDate: string;
  numberOfDays: number;
  numberOfPeople: number;
  budget: number;
  /** Short label for the chip on the pass, e.g. "Couple". */
  tripType: string;
  interests: string[];
  /** Extra line under the travel style, e.g. pace and stay. */
  note?: string;
}

export function BoardingPass({
  data,
  interestLabels,
  scene: fixed,
  className,
}: {
  data: PassData;
  interestLabels: Record<string, string>;
  /** The trip's poster, when the caller already knows it. */
  scene?: SceneId;
  className?: string;
}) {
  const dest = useDebounced(data.destination, 450);
  const guessed = useDestinationScene(fixed ? "" : dest).scene;
  const scene = fixed ?? (dest.trim() ? guessed : "peaks");
  const date = data.startDate
    ? new Date(`${data.startDate}T00:00:00`).toLocaleDateString("en-US", { day: "2-digit", month: "short" }).toUpperCase()
    : "· · ·";
  const serial = `GR-${(hashString(`${data.source}${data.destination}${data.startDate}`) % 900000) + 100000}`;

  return (
    <div className={cn("overflow-hidden rounded-[28px] bg-white shadow-[0_40px_80px_-50px_rgba(10,30,44,0.55)] ring-1 ring-line", className)}>
      <div className="relative h-52 overflow-hidden bg-paper-2">
        <AnimatePresence initial={false}>
          <motion.div
            key={scene}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.9 } }}
            exit={{ opacity: 1, transition: { duration: 1 } }}
          >
            <Scene id={scene} intro />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/35 via-transparent to-transparent" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-paper">
          <span className="eyebrow text-[0.62rem]">GoRoam · Boarding pass</span>
          <span className="eyebrow rounded-full bg-paper/15 px-2.5 py-1.5 text-[0.6rem] backdrop-blur">{data.tripType}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow text-[0.62rem] text-stone">From</p>
            <p className="display mt-1 text-5xl leading-none tracking-tight">{code(data.source)}</p>
            <p className="mt-1 truncate text-sm text-stone">{data.source || "Your city"}</p>
          </div>
          <div className="relative mb-9 flex flex-1 items-center">
            <span className="h-px flex-1 border-t border-dashed border-ink/25" />
            <span className="mx-2 grid size-8 place-items-center rounded-full bg-brand-soft text-brand">
              <Plane className="size-4" />
            </span>
            <span className="h-px flex-1 border-t border-dashed border-ink/25" />
          </div>
          <div className="min-w-0 text-right">
            <p className="eyebrow text-[0.62rem] text-stone">To</p>
            <p className="display mt-1 text-5xl leading-none tracking-tight text-brand">{code(data.destination)}</p>
            <p className="mt-1 truncate text-sm text-stone">{data.destination || "Anywhere"}</p>
          </div>
        </div>

        <dl className="mt-7 grid grid-cols-4 gap-3 border-t border-line pt-5">
          {[
            ["Date", date],
            ["Days", String(data.numberOfDays || "-")],
            ["Guests", String(data.numberOfPeople || "-")],
            ["Budget", data.budget ? `$${data.budget.toLocaleString("en-US")}` : "-"],
          ].map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="eyebrow text-[0.58rem] text-stone">{k}</dt>
              <dd className="mt-1.5 truncate font-mono text-sm text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative flex items-center" aria-hidden>
        <span className="absolute -left-3 size-6 rounded-full bg-paper ring-1 ring-line" />
        <span className="mx-6 h-px flex-1 border-t border-dashed border-ink/20" />
        <span className="absolute -right-3 size-6 rounded-full bg-paper ring-1 ring-line" />
      </div>

      <div className="flex items-end justify-between gap-4 p-6">
        <div className="min-w-0">
          <p className="eyebrow text-[0.58rem] text-stone">Travel style</p>
          <p className="mt-2 line-clamp-2 text-sm text-ink">
            {data.interests.length ? data.interests.map((i) => interestLabels[i] ?? i).join(" · ") : "Pick what you love"}
          </p>
          {data.note && <p className="mt-1 truncate text-xs text-stone">{data.note}</p>}
          <p className="mt-3 font-mono text-[11px] text-stone-2">{serial}</p>
        </div>
        <Barcode seed={`${data.destination}${data.startDate}`} />
      </div>
    </div>
  );
}
