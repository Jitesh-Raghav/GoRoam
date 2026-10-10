"use client";

import type { BookingKind } from "@/lib/booking";
import type { PlanId } from "@/lib/plans";
import type { PlacePhoto } from "@/lib/trip";
import { useDestinationPhoto } from "@/lib/use-destination-photo";

/**
 * Hand-picked photos for the places where the site wants one particular shot.
 * Every slot is optional: when it's empty, the page looks up a photo of the
 * slot's place in PHOTO_QUERIES instead (/api/destination-photo: Unsplash, then
 * Google Places, then Wikimedia), and the illustrated scene underneath shows
 * until a photo loads, or for good if none turns up.
 *
 * To pin a photo: put the file in /public/photos and add it here, with its credit.
 */
export interface BrandPhoto {
  src: string;
  alt: string;
  credit?: string;
  sourceUrl?: string;
}

export const BRAND_PHOTOS: {
  /** Behind "The world is waiting." at the foot of the home page. */
  finalCta: BrandPhoto | null;
  /** Behind the balance on the credits page. */
  credits: BrandPhoto | null;
  /** The header of each credit pack. */
  packs: Record<PlanId, BrandPhoto | null>;
  /** The book travel banner, per tab, while no destination is typed. */
  book: Record<BookingKind, BrandPhoto | null>;
  /** Per destination ("Goa, India"), for guide heroes, trip cards and the sign-in page. */
  destinations: Record<string, BrandPhoto>;
} = {
  finalCta: null,
  credits: null,
  packs: { starter: null, explorer: null, adventurer: null },
  book: { flights: null, stays: null, experiences: null, transport: null },
  destinations: {},
};

/** What the closing section looks up while no photo is pinned for it. */
export const FINAL_CTA_QUERY = "Lofoten, Norway";

/** What each slot looks up while nothing is pinned: places, so the lookup finds a real, wide shot. */
export const PHOTO_QUERIES: {
  credits: string;
  packs: Record<PlanId, string>;
  book: Record<BookingKind, string>;
} = {
  credits: "Santorini, Greece",
  // A getaway, the next big trip, and the far ends of the map.
  packs: { starter: "Udaipur, India", explorer: "Kyoto, Japan", adventurer: "Patagonia, Chile" },
  book: { flights: "Maldives", stays: "Amalfi Coast, Italy", experiences: "Cappadocia, Turkey", transport: "Swiss Alps, Switzerland" },
};

const asPlacePhoto = (p: BrandPhoto): PlacePhoto => ({ url: p.src, title: p.alt, credit: p.credit, sourceUrl: p.sourceUrl, exact: true, kind: "city" });

/** A pinned photo when there is one, otherwise a looked-up photo of `query` (or null while it loads). */
export function useBrandPhoto(pinned: BrandPhoto | null | undefined, query: string, enabled = true): PlacePhoto | null {
  const looked = useDestinationPhoto(query, enabled && !pinned);
  return pinned ? asPlacePhoto(pinned) : looked;
}

/** The photo for a destination: pinned in BRAND_PHOTOS, or looked up. */
export function usePlacePhoto(destination: string, enabled = true): PlacePhoto | null {
  return useBrandPhoto(BRAND_PHOTOS.destinations[destination], destination, enabled);
}

/**
 * The same photo at about `width` px, for cards and thumbnails, where the source
 * resizes for free (Unsplash's CDN). Other sources keep their URL: a new width
 * would be a new, billed request to Google.
 */
export function sizedPhoto(photo: PlacePhoto | null, width: number): PlacePhoto | null {
  if (!photo?.url?.startsWith("https://images.unsplash.com/")) return photo;
  return { ...photo, url: photo.url.replace(/([?&])w=\d+/, `$1w=${Math.round(width)}`) };
}
