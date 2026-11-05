"use client";

import { useEffect, useState } from "react";
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

/**
 * The card's picture: the illustration until a real photo loads, then the photo alone
 * (the illustration unmounts, its animations with it). With no photo the illustration stays.
 */
export function TripPhoto({ slug }: { slug: string }) {
  const photo = sizedPhoto(useDestinationPhoto(PLACE[slug] ?? "India"), 640);
  const [loaded, setLoaded] = useState(false);
  const [covered, setCovered] = useState(false);
  useEffect(() => {
    if (!loaded) return;
    const t = window.setTimeout(() => setCovered(true), 550);
    return () => window.clearTimeout(t);
  }, [loaded]);
  return (
    <>
      {!covered && <TripArt slug={slug} />}
      {photo?.url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.url}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            setCovered(false);
          }}
          className={cn("absolute inset-0 size-full object-cover transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}
        />
      )}
    </>
  );
}
