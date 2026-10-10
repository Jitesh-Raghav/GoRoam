"use client";

import { APIProvider, AdvancedMarker, ColorScheme, InfoWindow, Map, Polyline, useMap } from "@vis.gl/react-google-maps";
import { ArrowUpRight } from "@/components/site/icons";
import { useEffect, useMemo, useState } from "react";
import { track } from "@/lib/analytics";
import { mapsSearchUrl } from "@/lib/booking";
import { MAPS_KEY, locatedStops } from "@/lib/maps";
import { cn } from "@/lib/utils";
import type { RouteStop } from "./route-map";

const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() || "DEMO_MAP_ID";

type Located = RouteStop & { position: google.maps.LatLngLiteral };

/** Frames every stop once the map is ready. */
function FitBounds({ points }: { points: google.maps.LatLngLiteral[] }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !points.length) return;
    if (points.length === 1) {
      map.setCenter(points[0]);
      map.setZoom(15);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    points.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, 72);
  }, [map, points]);
  return null;
}

/**
 * A live, dark Google map of one day: numbered pins in visiting order, a dashed
 * route between them, and a card with directions when a pin is tapped.
 * Zooms with the controls, Ctrl + scroll, or two fingers (so it never traps page scrolling).
 */
export default function DayMap({
  stops,
  destination,
  className,
  onFail,
  route = true,
}: {
  stops: RouteStop[];
  destination: string;
  className?: string;
  onFail?: () => void;
  /** Draw the visiting order (a day's route). Off for places that aren't a sequence, like a guide's sights. */
  route?: boolean;
}) {
  const located: Located[] = useMemo(
    () => locatedStops(stops).map((s) => ({ ...s, position: { lat: s.activity.place.lat!, lng: s.activity.place.lng! } })),
    [stops]
  );
  const points = useMemo(() => located.map((s) => s.position), [located]);
  const [open, setOpen] = useState<string | null>(null);
  const selected = located.find((s) => s.key === open);

  // Google calls this global when the key is rejected; fall back to the illustrated route.
  useEffect(() => {
    const w = window as unknown as { gm_authFailure?: () => void };
    const previous = w.gm_authFailure;
    w.gm_authFailure = () => {
      console.warn(
        "GoRoam map: Google rejected NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. Enable the Maps JavaScript API for it and allow this site in its HTTP referrer restrictions. Showing the illustrated route instead."
      );
      previous?.();
      onFail?.();
    };
    return () => {
      w.gm_authFailure = previous;
    };
  }, [onFail]);

  return (
    <div className={cn("relative overflow-hidden rounded-[24px] bg-ink ring-1 ring-line", className)}>
      <APIProvider apiKey={MAPS_KEY} onError={() => onFail?.()}>
        <Map
          mapId={MAP_ID}
          colorScheme={ColorScheme.DARK}
          defaultCenter={points[0]}
          defaultZoom={13}
          gestureHandling="cooperative"
          disableDefaultUI
          zoomControl
          fullscreenControl
          clickableIcons={false}
          className="absolute inset-0"
        >
          <FitBounds points={points} />
          {route && points.length > 1 && (
            <Polyline
              path={points}
              strokeOpacity={0}
              icons={[{ icon: { path: "M 0,-1 0,1", strokeOpacity: 0.95, strokeColor: "#34D1BF", scale: 3 }, offset: "0", repeat: "14px" }]}
              geodesic
            />
          )}
          {located.map((s, i) => {
            const last = route && i === located.length - 1;
            return (
              <AdvancedMarker key={s.key} position={s.position} title={`${i + 1}. ${s.activity.place.name}`} onClick={() => setOpen(s.key)} zIndex={open === s.key ? 10 : i}>
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-full font-mono text-sm shadow-[0_10px_24px_-6px_rgba(0,0,0,0.6)] ring-[3px] ring-white transition-transform hover:scale-110",
                    last ? "bg-sun text-ink" : "bg-ink text-white"
                  )}
                >
                  {i + 1}
                </span>
              </AdvancedMarker>
            );
          })}
          {selected && (
            <InfoWindow position={selected.position} pixelOffset={[0, -40]} onCloseClick={() => setOpen(null)} headerDisabled>
              <div className="max-w-[220px] p-1 text-ink">
                <p className="eyebrow text-[0.58rem] text-brand">
                  {selected.label}
                  {selected.activity.time ? ` · ${selected.activity.time}` : ""}
                </p>
                <p className="mt-1 text-[0.95rem] font-medium leading-snug">{selected.activity.place.name}</p>
                {selected.activity.place.area && <p className="text-xs text-stone">{selected.activity.place.area}</p>}
                <a
                  href={mapsSearchUrl(selected.activity.place.name, destination)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track("directions_clicked", { where: "map" })}
                  className="mt-2 inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-xs text-paper hover:bg-brand"
                >
                  Directions <ArrowUpRight className="size-3" />
                </a>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
