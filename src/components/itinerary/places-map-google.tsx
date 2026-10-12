"use client";

import { APIProvider, AdvancedMarker, ColorScheme, Map, useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import { MAPS_KEY } from "@/lib/maps";
import { cn } from "@/lib/utils";
import type { MapPoint } from "./places-map";

const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() || "DEMO_MAP_ID";

function Fit({ points }: { points: MapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !points.length) return;
    if (points.length === 1) {
      map.setCenter(points[0]);
      map.setZoom(14);
      return;
    }
    const b = new google.maps.LatLngBounds();
    points.forEach((p) => b.extend(p));
    map.fitBounds(b, 64);
  }, [map, points]);
  return null;
}

/** A dark Google map with a labelled pin per place; the active one is lifted and lit. */
export default function PlacesMapGoogle({ points, active, onPick, onFail }: { points: MapPoint[]; active?: string | null; onPick?: (id: string) => void; onFail?: () => void }) {
  useEffect(() => {
    const w = window as unknown as { gm_authFailure?: () => void };
    const previous = w.gm_authFailure;
    w.gm_authFailure = () => {
      previous?.();
      onFail?.();
    };
    return () => {
      w.gm_authFailure = previous;
    };
  }, [onFail]);
  return (
    <APIProvider apiKey={MAPS_KEY} onError={() => onFail?.()}>
      <Map mapId={MAP_ID} colorScheme={ColorScheme.DARK} defaultCenter={points[0]} defaultZoom={12} gestureHandling="cooperative" disableDefaultUI zoomControl clickableIcons={false} className="absolute inset-0">
        <Fit points={points} />
        {points.map((p, i) => {
          const on = p.id === active;
          return (
            <AdvancedMarker key={p.id} position={p} title={p.label} onClick={() => onPick?.(p.id)} zIndex={on ? 50 : i}>
              <span className={cn("flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-xs shadow-[0_10px_24px_-6px_rgba(0,0,0,0.6)] ring-2 ring-white transition-transform", on ? "scale-110 bg-sun text-ink" : "bg-ink text-white")}>
                <span className={cn("grid size-6 place-items-center rounded-full font-mono text-[11px]", on ? "bg-ink text-sun-2" : "bg-white/15")}>{i + 1}</span>
                {p.tag ?? p.label.split(" ").slice(0, 2).join(" ")}
              </span>
            </AdvancedMarker>
          );
        })}
      </Map>
    </APIProvider>
  );
}
