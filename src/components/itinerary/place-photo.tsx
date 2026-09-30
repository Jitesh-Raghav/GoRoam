"use client";

/* eslint-disable @next/next/no-img-element -- remote photos from Wikimedia/Google/Openverse, already sized by the API. */

import { Camera, type LucideIcon } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
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

/** The photo for a stop, `undefined` while the trip's photos are still loading. */
export function usePlacePhoto(activity: ActivitySlot | undefined): Photo | undefined {
  const ctx = useContext(PhotosContext);
  const name = activity?.place?.name;
  if (!ctx || !name) return { url: null };
  const photo = ctx.photos[photoKey(name, ctx.city)];
  if (photo?.url) return photo;
  if (ctx.loading) return undefined;
  return ctx.fallback ? { url: ctx.fallback, kind: "city", title: ctx.city, credit: "Wikipedia" } : { url: null };
}

const caption = (p: Photo) => (p.kind === "nearby" ? `Nearby · ${p.title}` : p.kind === "city" ? `${p.title} · ${p.credit}` : `Photo · ${p.credit}`);

/**
 * A place photo that fills its (positioned) parent: shimmer while it loads, then
 * a soft fade-in. If the image fails, it swaps to the destination's photo; the
 * branded tile only appears if even that is unavailable.
 */
export function PlacePhoto({
  activity,
  icon: Icon = Camera,
  credit = true,
  eager = false,
  className,
  imgClassName,
}: {
  activity: ActivitySlot | undefined;
  /** Kept for call sites; the city now comes from the trip's photo context. */
  destination?: string;
  icon?: LucideIcon;
  credit?: boolean;
  /** Load straight away (the print copy, which is hidden until printing). */
  eager?: boolean;
  className?: string;
  imgClassName?: string;
}) {
  const photo = usePlacePhoto(activity);
  const ctx = useContext(PhotosContext);
  // Try the stop's photo, then the fallbacks, in order, skipping any that fail to load.
  const candidates = photo ? [photo.url, photo.fallback, ctx?.fallback].filter((u, i, all): u is string => !!u && all.indexOf(u) === i) : [];
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
