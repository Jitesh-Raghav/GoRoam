"use client";

/* eslint-disable @next/next/no-img-element -- remote photos from Wikimedia/Google/Openverse, already sized by the API. */

import { Camera, Star, type LucideIcon } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { photoKey, type ActivitySlot, type PlacePhoto as Photo } from "@/lib/trip";
import { cn } from "@/lib/utils";

/**
 * A trip's stop photos arrive in one request (see /api/itinerary/[id]/photos)
 * and are shared through this context, instead of every card fetching its own.
 */
interface TripPhotos {
  photos: Record<string, Photo>;
  /** A photo of the destination, for any stop still without one. */
  fallback: string | null;
  city: string;
  /** Still fetching: show a shimmer rather than a fallback. */
  loading: boolean;
}

const PhotosContext = createContext<TripPhotos | null>(null);

export function TripPhotosProvider({ value, children }: { value: TripPhotos; children: ReactNode }) {
  return <PhotosContext.Provider value={value}>{children}</PhotosContext.Provider>;
}

/* Things that aren't trip stops (hotels, dishes, experiences) are looked up one at a time, once per page. */
const lookups = new Map<string, Promise<Photo>>();
const ownLookup = new WeakSet<ActivitySlot>();
/** Dishes are photographed as food: no city photo stands in for them. */
const dishLookup = new WeakSet<ActivitySlot>();

function lookup(name: string, area: string | undefined, city: string, dish = false): Promise<Photo> {
  const params = new URLSearchParams({ name, city });
  if (area) params.set("area", area);
  if (dish) params.set("kind", "dish");
  const key = params.toString();
  let hit = lookups.get(key);
  if (!hit) {
    hit = fetch(`/api/place-photo?${key}`)
      .then((r) => (r.ok ? r.json() : { url: null }))
      .catch(() => ({ url: null }));
    lookups.set(key, hit);
    // A miss is usually a passing network error: let the next view ask again.
    hit.then((p) => !p.url && lookups.delete(key));
  }
  return hit;
}

/** A photo lookup for something that isn't an itinerary stop (a hotel, a dish, an experience). */
export const asStop = (name: string, area?: string): ActivitySlot => {
  const slot: ActivitySlot = { time: "", duration: "", estimatedCost: 0, place: { name, description: "", area } };
  ownLookup.add(slot);
  return slot;
};

/** A photo lookup for a dish: a picture of the food itself, never the city as a stand-in. */
export const asDish = (name: string): ActivitySlot => {
  const slot = asStop(name);
  dishLookup.add(slot);
  return slot;
};

/** A stop added after the trip's photos were fetched (a swap) looks up its own. */
export function lookUpOwnPhoto<T extends ActivitySlot>(slot: T): T {
  ownLookup.add(slot);
  return slot;
}

/** The photo for a stop, `undefined` while it's still loading. */
export function usePlacePhoto(activity: ActivitySlot | undefined, destination?: string): Photo | undefined {
  const ctx = useContext(PhotosContext);
  const name = activity?.place?.name;
  const area = activity?.place?.area;
  const city = ctx?.city || destination || "";
  const own = !!activity && ownLookup.has(activity);
  const dish = !!activity && dishLookup.has(activity);
  const ownKey = own && name ? `${name}|${area ?? ""}|${city}` : null;
  const [found, setFound] = useState<{ key: string; photo: Photo } | null>(null);

  useEffect(() => {
    if (!ownKey || !name) return;
    let live = true;
    lookup(name, area, city, dish).then((photo) => live && setFound({ key: ownKey, photo }));
    return () => {
      live = false;
    };
    // ownKey covers the name, area and city.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownKey]);

  const cityShot = (): Photo => (ctx?.fallback ? { url: ctx.fallback, kind: "city", title: ctx.city, credit: "Wikipedia" } : { url: null });

  if (!name) return { url: null };
  if (own) {
    const photo = found?.key === ownKey ? found.photo : undefined;
    if (!photo) return undefined;
    return photo.url || dish ? photo : cityShot();
  }
  if (!ctx) return { url: null };
  const photo = ctx.photos[photoKey(name, ctx.city)];
  if (photo?.url) return photo;
  if (ctx.loading) return undefined;
  return cityShot();
}

const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));

const caption = (p: Photo) => (p.kind === "nearby" ? `Nearby · ${p.title}` : p.kind === "city" ? `${p.title} · ${p.credit}` : `Photo · ${p.credit}`);

/**
 * A place photo that fills its (positioned) parent: shimmer while it loads, then
 * a soft fade-in. If the image fails, it swaps to the destination's photo; the
 * branded tile only appears if even that is unavailable.
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
  /** Used for lookups outside a trip's photo context. */
  destination?: string;
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
  const ctx = useContext(PhotosContext);
  // Try the stop's photo, then the fallbacks, in order, skipping any that fail to load.
  const dish = !!activity && dishLookup.has(activity);
  const candidates = photo ? [photo.url, photo.fallback, dish ? null : ctx?.fallback].filter((u, i, all): u is string => !!u && all.indexOf(u) === i) : [];
  const [failed, setFailed] = useState<string[]>([]);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const url = candidates.find((u) => !failed.includes(u)) ?? null;
  const loaded = !!url && loadedUrl === url;
  const usingFallback = !!url && url !== photo?.url;

  // Stable per URL, so it runs once when the <img> mounts and catches cache hits.
  const markLoaded = useCallback(
    (img: HTMLImageElement | null) => {
      if (url && img?.complete && img.naturalWidth > 0) setLoadedUrl(url);
    },
    [url]
  );

  const empty = photo !== undefined && !url;

  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-paper-2", className)}>
      {(photo === undefined || (url && !loaded)) && <div className="skeleton absolute inset-0 print:hidden" />}
      {empty && (
        <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,var(--brand)_0%,#0b4f5c_55%,var(--ink)_100%)]">
          <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-sun/30 blur-2xl" />
          <Icon className="relative size-10 text-paper/70" strokeWidth={1.4} />
        </div>
      )}
      {url && (
        <img
          key={url}
          ref={markLoaded}
          src={url}
          alt={photo?.title ?? activity?.place.name ?? ""}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setLoadedUrl(url)}
          onError={() => setFailed((f) => [...f, url])}
          className={cn(
            "absolute inset-0 size-full object-cover transition-[opacity,transform] duration-1000 ease-out-expo print:scale-100 print:opacity-100",
            loaded ? "scale-100 opacity-100" : "scale-105 opacity-0",
            imgClassName
          )}
        />
      )}
      {rating && photo?.rating && loaded && !usingFallback && (
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
      {credit && photo?.url && loaded && !usingFallback && (
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
