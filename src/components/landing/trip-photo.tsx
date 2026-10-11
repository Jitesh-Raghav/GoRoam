"use client";

import { useState } from "react";
import { sizedPhoto } from "@/lib/brand-photos";
import { useDestinationPhoto } from "@/lib/use-destination-photo";
import { cn } from "@/lib/utils";
import { TripArt } from "./trip-art";

/** A real place that says "this kind of trip", looked up like every other site photo. */
const PLACE: Record<string, string> = {
  couples: "Maldives",
  family: "Kerala, India",
  friends: "Goa, India",
  solo: "Ladakh, India",
  "road-trip": "Spiti Valley, India",
  "weekend-getaway": "Rishikesh, India",
  "multi-city": "Jaipur, India",
  budget: "Hampi, India",
};

/** The card's picture: a real photo once it loads, the illustration until then (or for good if none turns up). */
export function TripPhoto({ slug }: { slug: string }) {
  const photo = sizedPhoto(useDestinationPhoto(PLACE[slug] ?? "India"), 640);
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <TripArt slug={slug} />
      {photo?.url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.url}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
          className={cn("absolute inset-0 size-full object-cover transition-opacity duration-700", loaded ? "opacity-100" : "opacity-0")}
        />
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
    </>
  );
}
