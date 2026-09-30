// Server-only: reads the ready-made package itineraries (bundled at build time).
import { isoDay } from "@/lib/booking";
import { PACKAGES, type TravelPackage } from "@/lib/packages";
import type { ItineraryData, ItineraryDetails, PlacePhoto } from "@/lib/trip";

const LOADERS: Record<string, () => Promise<{ default: unknown }>> = {
  "thailand-3-days": () => import("@/data/packages/thailand-3-days.json"),
  "paris-7-days": () => import("@/data/packages/paris-7-days.json"),
  "japan-5-days": () => import("@/data/packages/japan-5-days.json"),
  "bali-4-days": () => import("@/data/packages/bali-4-days.json"),
  "dubai-4-days": () => import("@/data/packages/dubai-4-days.json"),
  "rome-5-days": () => import("@/data/packages/rome-5-days.json"),
  "switzerland-6-days": () => import("@/data/packages/switzerland-6-days.json"),
  "kerala-5-days": () => import("@/data/packages/kerala-5-days.json"),
  "goa-3-days": () => import("@/data/packages/goa-3-days.json"),
};

export async function loadPackage(slug: string): Promise<ItineraryData | null> {
  const load = LOADERS[slug];
  return load ? ((await load()).default as ItineraryData) : null;
}

/** A package as a trip the itinerary view can show: starting a month from now, for two. */
export function packageTrip(pkg: TravelPackage, data: ItineraryData, now = new Date()): ItineraryDetails {
  const start = `${isoDay(now.toISOString(), 30)}T00:00:00.000Z`;
  const end = `${isoDay(now.toISOString(), 30 + pkg.days - 1)}T00:00:00.000Z`;
  return {
    id: `package-${pkg.slug}`,
    destination: pkg.name,
    startDate: start,
    endDate: end,
    numberOfDays: pkg.days,
    budget: pkg.budget,
    numberOfPeople: 2,
    tripType: "couple",
    interests: pkg.interests,
    itineraryData: data,
    createdAt: start,
  };
}

export interface PackageCardData extends TravelPackage {
  highlights: string[];
  landscape?: string;
  /** A real photo of one of its best stops, for the card. */
  cover: PlacePhoto | null;
  stops: number;
}

/** Everything the packages grid shows, without shipping whole itineraries to the browser. */
export async function packageCards(): Promise<PackageCardData[]> {
  return Promise.all(
    PACKAGES.map(async (pkg) => {
      const data = await loadPackage(pkg.slug);
      const photos = Object.values(data?.photos ?? {});
      const cover = photos.find((p) => p.kind === "place" && p.url) ?? photos.find((p) => p.url) ?? null;
      return {
        ...pkg,
        highlights: (data?.summary?.highlights ?? []).slice(0, 3),
        landscape: data?.summary?.landscape,
        cover,
        stops: (data?.itinerary ?? []).length * 3,
      };
    })
  );
}
