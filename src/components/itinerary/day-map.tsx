"use client";

import { APIProvider, AdvancedMarker, ColorScheme, InfoWindow, Map, Polyline, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
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
 * The day's route along real streets, from Google's Directions service, with
 * the time it takes. Walking when the stops are close, driving otherwise.
 * Until it answers (or if the key isn't allowed Directions) the dashed
 * straight-line route stays.
 */
function StreetRoute({ points, drive, onRoute }: { points: google.maps.LatLngLiteral[]; drive?: boolean; onRoute: (r: { path: google.maps.LatLngLiteral[]; mins: number; km: number; mode: string } | null) => void }) {
  const routes = useMapsLibrary("routes");
  useEffect(() => {
    if (!routes || points.length < 2) return;
    let live = true;
    const straight = points.slice(1).reduce((n, p, i) => n + Math.hypot(p.lat - points[i].lat, (p.lng - points[i].lng) * Math.cos((p.lat * Math.PI) / 180)) * 111, 0);
    const mode = drive || straight > 5 ? google.maps.TravelMode.DRIVING : google.maps.TravelMode.WALKING;
    new routes.DirectionsService()
      .route({ origin: points[0], destination: points[points.length - 1], waypoints: points.slice(1, -1).map((location) => ({ location, stopover: true })), travelMode: mode })
      .then((res) => {
        if (!live) return;
        const r = res.routes[0];
        const legs = r?.legs ?? [];
        onRoute(
          r
            ? {
                path: r.overview_path.map((p) => p.toJSON()),
                mins: Math.round(legs.reduce((n, l) => n + (l.duration?.value ?? 0), 0) / 60),
                km: legs.reduce((n, l) => n + (l.distance?.value ?? 0), 0) / 1000,
                mode: mode === google.maps.TravelMode.WALKING ? "on foot" : "by road",
              }
            : null
        );
      })
      .catch(() => live && onRoute(null));
    return () => {
      live = false;
    };
  }, [routes, points, drive, onRoute]);
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
  drive,
}: {
  stops: RouteStop[];
  destination: string;
  className?: string;
  onFail?: () => void;
  /** Draw the visiting order (a day's route). Off for places that aren't a sequence, like a guide's sights. */
  route?: boolean;
  /** Travelling by car or taxi: route by road. */
  drive?: boolean;
}) {
  const located: Located[] = useMemo(
    () => locatedStops(stops).map((s) => ({ ...s, position: { lat: s.activity.place.lat!, lng: s.activity.place.lng! } })),
    [stops]
  );
  const points = useMemo(() => located.map((s) => s.position), [located]);
  const [open, setOpen] = useState<string | null>(null);
  const selected = located.find((s) => s.key === open);
  const [street, setStreet] = useState<{ path: google.maps.LatLngLiteral[]; mins: number; km: number; mode: string } | null>(null);

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
          {route && points.length > 1 && <StreetRoute points={points} drive={drive} onRoute={setStreet} />}
          {route && street && <Polyline path={street.path} strokeColor="#7cc4ff" strokeOpacity={0.95} strokeWeight={4} />}
          {route && !street && points.length > 1 && (
            <Polyline
              path={points}
              strokeOpacity={0}
              icons={[{ icon: { path: "M 0,-1 0,1", strokeOpacity: 0.95, strokeColor: "#7cc4ff", scale: 3 }, offset: "0", repeat: "14px" }]}
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
      {street && (
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1.5 font-mono text-[11px] text-paper backdrop-blur">
          {street.km.toFixed(1)} km · ~{street.mins} min {street.mode}
        </span>
      )}
    </div>
  );
}
