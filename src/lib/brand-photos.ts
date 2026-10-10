"use client";

import type { PlacePhoto } from "@/lib/trip";
import { useDestinationPhoto } from "@/lib/use-destination-photo";

/**
 * Hand-picked photos for the places where the site wants one particular shot.
 * Every slot is optional: when it's empty, the page looks up a photo of the
 * destination instead (/api/destination-photo: Unsplash, then Google Places,
 * then Wikimedia), and the illustrated scene underneath shows until a photo
 * loads, or for good if none turns up.
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
  /** Per destination ("Goa, India"), for guide heroes, trip cards and the sign-in page. */
  destinations: Record<string, BrandPhoto>;
} = {
  finalCta: null,
  destinations: {},
};

/** What the closing section looks up while no photo is pinned for it. */
export const FINAL_CTA_QUERY = "Lofoten, Norway";

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
