"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "@/components/site/icons";
import { hasMapsKey } from "@/lib/maps";
import { cn } from "@/lib/utils";

const PlacesMapGoogle = dynamic(() => import("./places-map-google"), { ssr: false });

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  label: string;
  /** Short text on the pin: a price, "Hostel". */
  tag?: string;
}

const line = { fill: "none", stroke: "currentColor", vectorEffect: "non-scaling-stroke" as const };

/**
 * Pins for a set of places (stays, rental shops). A live Google map when a key
 * is set; otherwise a drawn map: hairline contours and a street grid with the
 * pins placed at their real relative positions.
 */
export function PlacesMap({ points, active, onPick, className, searchUrl }: { points: MapPoint[]; active?: string | null; onPick?: (id: string) => void; className?: string; searchUrl?: string }) {
  const [failed, setFailed] = useState(false);
  const live = hasMapsKey && !failed;
  // Project to a 100 × 100 box with a margin, keeping the real aspect.
  const placed = useMemo(() => {
    if (!points.length) return [];
    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    const midLat = (Math.max(...lats) + Math.min(...lats)) / 2;
    const k = Math.cos((midLat * Math.PI) / 180);
    const w = Math.max((Math.max(...lngs) - Math.min(...lngs)) * k, 0.004);
    const h = Math.max(Math.max(...lats) - Math.min(...lats), 0.004);
    const span = Math.max(w, h);
    const cx = ((Math.max(...lngs) + Math.min(...lngs)) / 2) * k;
    const cy = midLat;
    return points.map((p) => ({ ...p, x: 50 + ((p.lng * k - cx) / span) * 56, y: 50 - ((p.lat - cy) / span) * 56 }));
  }, [points]);

  return (
    <div className={cn("relative isolate overflow-hidden rounded-[26px] bg-ink text-paper ring-1 ring-line", className)}>
      {live && points.length > 0 ? (
        <PlacesMapGoogle points={points} active={active} onPick={onPick} onFail={() => setFailed(true)} />
      ) : (
        <>
          <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
            <defs>
              <radialGradient id="pm-glow" cx="50%" cy="45%" r="60%">
                <stop offset="0" stopColor="#1A5FD6" stopOpacity="0.35" />
                <stop offset="1" stopColor="#0E1F3B" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100" height="100" fill="url(#pm-glow)" />
            <g className="text-paper/[0.06]" strokeWidth="1">
              {Array.from({ length: 11 }, (_, i) => (
                <path key={`v${i}`} {...line} d={`M${i * 10} 0V100`} />
              ))}
              {Array.from({ length: 11 }, (_, i) => (
                <path key={`h${i}`} {...line} d={`M0 ${i * 10}H100`} />
              ))}
            </g>
            <g className="text-brand-2/20" strokeWidth="1">
              <path {...line} d="M-5 72C18 60 30 78 52 66S82 40 105 48" />
              <path {...line} d="M-5 80C20 70 34 86 56 74S84 50 105 58" strokeDasharray="1 3" />
              <circle {...line} cx="50" cy="48" r="18" />
              <circle {...line} cx="50" cy="48" r="30" strokeDasharray="1 4" />
            </g>
          </svg>
          {placed.map((p, i) => {
            const on = p.id === active;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPick?.(p.id)}
                style={{ left: `${p.x}%`, top: `${p.y}%`, zIndex: on ? 20 : 10 - i }}
                className={cn(
                  "absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full py-1 pl-1 pr-3 text-xs shadow-[0_12px_28px_-8px_rgba(0,0,0,0.7)] ring-2 transition-all duration-300",
                  on ? "scale-110 bg-sun text-ink ring-white" : "bg-paper/10 text-paper ring-paper/30 backdrop-blur-md hover:bg-paper/20",
                )}
              >
                <span className={cn("grid size-6 place-items-center rounded-full font-mono text-[11px]", on ? "bg-ink text-sun-2" : "bg-paper/15")}>{i + 1}</span>
                <span className="max-w-[9rem] truncate">{p.tag ?? p.label}</span>
              </button>
            );
          })}
        </>
      )}
      {searchUrl && (
        <a href={searchUrl} target="_blank" rel="noreferrer" className="absolute bottom-3 right-3 z-30 inline-flex items-center gap-1 rounded-full bg-paper/90 px-3 py-1.5 text-xs text-ink backdrop-blur hover:bg-paper">
          Open in Maps <ArrowUpRight className="size-3" />
        </a>
      )}
    </div>
  );
}
