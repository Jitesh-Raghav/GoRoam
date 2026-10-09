import type { RouteStop } from "@/components/itinerary/route-map";

// Kept apart from the map component, so checking for a key doesn't pull in the maps library.
export const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";
export const hasMapsKey = /^AIza[\w-]{35}$/.test(MAPS_KEY);

/** Stops with real coordinates, the only ones a map can pin. */
export const locatedStops = (stops: RouteStop[]) =>
  stops.filter((s) => Number.isFinite(s.activity.place.lat) && Number.isFinite(s.activity.place.lng) && (s.activity.place.lat !== 0 || s.activity.place.lng !== 0));

if (typeof window !== "undefined" && !hasMapsKey) {
  console.info(
    MAPS_KEY
      ? "GoRoam map: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY doesn't look like a Google key (AIza…, 39 characters); using the illustrated route."
      : "GoRoam map: set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (and redeploy) for live Google maps; using the illustrated route."
  );
}
