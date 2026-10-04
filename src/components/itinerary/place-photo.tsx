"use client";

/* eslint-disable @next/next/no-img-element -- remote photos from Wikimedia/Google, already sized by the API. */

import { Camera, Star, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { PlacePhoto as Photo } from "@/app/api/place-photo/route";
import type { ActivitySlot } from "@/lib/trip";
import { cn } from "@/lib/utils";

/* One request per place for the whole page, a few at a time. */
const results = new Map<string, Promise<Photo>>();
const queue: (() => void)[] = [];
let running = 0;
const MAX = 4;

function next() {
  if (running >= MAX) return;
  const job = queue.shift();
  if (!job) return;
  running++;
  job();
}

function load(activity: ActivitySlot, destination: string): Promise<Photo> {
  const { name, lat, lng } = activity.place;
  const params = new URLSearchParams({ name, city: destination });
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    params.set("lat", String(lat));
    params.set("lng", String(lng));
  }
  const key = params.toString();
  let hit = results.get(key);
  if (!hit) {
    hit = new Promise<Photo>((resolve) => {
      queue.push(() =>
        fetch(`/api/place-photo?${key}`)
          .then((r) => (r.ok ? r.json() : { url: null }))
          .catch(() => ({ url: null }))
          .then(resolve)
          .finally(() => {
            running--;
            next();
          })
      );
      next();
    });
    results.set(key, hit);
    // A miss is usually a passing network error: let the next render ask again.
    hit.then((p) => !p.url && results.delete(key));
  }
  return hit;
}

export function usePlacePhoto(activity: ActivitySlot | undefined, destination: string) {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const name = activity?.place?.name;
  useEffect(() => {
    if (!activity || !name) return;
    let live = true;
    let retry = 0;
    setPhoto(null);
    load(activity, destination).then((p) => {
      if (!live) return;
      if (p.url) return setPhoto(p);
      retry = window.setTimeout(() => load(activity, destination).then((again) => live && setPhoto(again)), 2500);
    });
    return () => {
      live = false;
      window.clearTimeout(retry);
    };
    // The place is identified by its name and coordinates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, activity?.place?.lat, activity?.place?.lng, destination]);
  return photo;
}

/** A photo lookup for something that isn't an itinerary stop (a hotel, a dish, an experience). */
export const asStop = (name: string, area?: string): ActivitySlot => ({
  time: "",
  duration: "",
  estimatedCost: 0,
  place: { name, description: "", area },
});

const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));

const caption = (p: Photo) => (p.kind === "nearby" ? `Nearby · ${p.title}` : p.kind === "city" ? `${p.title} · ${p.credit}` : `Photo · ${p.credit}`);

/**
 * A place photo that fills its (positioned) parent: shimmer while it loads, then
 * a soft fade-in. The branded tile only shows if every photo source failed.
 */
export function PlacePhoto({
  activity,
  destination,
  icon: Icon = Camera,
  credit = true,
  eager = false,
  rating = false,
  className,
  imgClassName,
}: {
  activity: ActivitySlot | undefined;
  destination: string;
  icon?: LucideIcon;
  credit?: boolean;
  /** Load straight away (the print copy, which is hidden until printing). */
  eager?: boolean;
  /** Show the Google rating chip when there is one. */
  rating?: boolean;
  className?: string;
  imgClassName?: string;
}) {
  const photo = usePlacePhoto(activity, destination);
  const url = photo?.url ?? null;
  // Keyed by URL, so a new photo starts hidden without an effect that could
  // overwrite the load event of an image that came straight from cache.
  const [status, setStatus] = useState<{ url: string; state: "loaded" | "broken" } | null>(null);
  const loaded = !!url && status?.url === url && status.state === "loaded";
  const broken = !!url && status?.url === url && status.state === "broken";
  // Stable per URL, so it runs once when the <img> mounts and catches cache hits.
  const markLoaded = useCallback(
    (img: HTMLImageElement | null) => {
      if (url && img?.complete && img.naturalWidth > 0) setStatus({ url, state: "loaded" });
    },
    [url]
  );

  const empty = photo !== null && (!url || broken);

  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-paper-2", className)}>
      {(photo === null || (url && !loaded && !broken)) && <div className="skeleton absolute inset-0 print:hidden" />}
      {empty && (
        <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,var(--brand)_0%,#0b4f5c_55%,var(--ink)_100%)]">
          <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-sun/30 blur-2xl" />
          <Icon className="relative size-10 text-paper/70" strokeWidth={1.4} />
        </div>
      )}
      {url && !broken && (
        <img
          key={url}
          ref={markLoaded}
          src={url}
          alt={photo?.title ?? activity?.place.name ?? ""}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setStatus({ url, state: "loaded" })}
          onError={() => setStatus({ url, state: "broken" })}
          className={cn(
            "absolute inset-0 size-full object-cover transition-[opacity,transform] duration-1000 ease-out-expo print:scale-100 print:opacity-100",
            loaded ? "scale-100 opacity-100" : "scale-105 opacity-0",
            imgClassName
          )}
        />
      )}
      {rating && photo?.rating && loaded && (
        <a
          href={photo.mapsUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="print:hidden absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[11px] font-medium text-ink shadow-sm"
          aria-label={`Rated ${photo.rating} on Google${photo.reviews ? ` from ${photo.reviews} reviews` : ""}`}
        >
          <Star className="size-3 fill-sun text-sun" />
          {photo.rating.toFixed(1)}
          {photo.reviews ? <span className="font-normal text-stone">· {compact(photo.reviews)}</span> : null}
        </a>
      )}
      {credit && photo?.url && loaded && (
        <a
          href={photo.sourceUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="print:hidden absolute bottom-2 right-2 max-w-[80%] truncate rounded-full bg-ink/45 px-2 py-0.5 text-[10px] text-paper/85 backdrop-blur-md transition-colors hover:bg-ink/70"
        >
          {caption(photo)}
        </a>
      )}
    </div>
  );
}
