"use client";

/* eslint-disable @next/next/no-img-element -- remote photo already sized by the source (Unsplash, Google, Wikimedia). */

import { useCallback, useState } from "react";
import type { PlacePhoto } from "@/lib/trip";
import { cn } from "@/lib/utils";

/**
 * A real photo of the destination laid over the illustrated scene. The scene
 * shows while it loads (and stays if there's no photo); the photo fades in and
 * drifts slowly, Ken Burns style.
 */
export function HeroPhoto({ photo, className, credit = true, lazy = false, drift = true }: { photo: PlacePhoto | null; className?: string; credit?: boolean; lazy?: boolean; drift?: boolean }) {
  const url = photo?.url ?? null;
  const [state, setState] = useState<{ url: string; ok: boolean } | null>(null);
  const loaded = !!url && state?.url === url && state.ok;
  const broken = !!url && state?.url === url && !state.ok;
  // Catches a photo that came straight from the browser cache before onLoad was attached.
  const markLoaded = useCallback(
    (img: HTMLImageElement | null) => {
      if (url && img?.complete && img.naturalWidth > 0) setState({ url, ok: true });
    },
    [url]
  );

  if (!url || broken) return null;
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      <div className={cn("absolute inset-0 overflow-hidden transition-opacity duration-[1600ms] ease-out", loaded ? "opacity-100" : "opacity-0")}>
        <img
          key={url}
          ref={markLoaded}
          src={url}
          alt={photo?.title ?? ""}
          decoding="async"
          fetchPriority={lazy ? "low" : "high"}
          loading={lazy ? "lazy" : "eager"}
          referrerPolicy="no-referrer"
          onLoad={() => setState({ url, ok: true })}
          onError={() => setState({ url, ok: false })}
          className={cn("absolute inset-0 size-full object-cover", drift && "hero-kenburns")}
        />
        {/* Photos are brighter than the illustrations: a touch more shade keeps the title legible. */}
        <div className="absolute inset-0 bg-ink/15" />
      </div>
      {credit && loaded && photo?.credit && (
        <a
          href={photo.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="no-print pointer-events-auto absolute bottom-2.5 right-4 z-10 max-w-[60%] truncate rounded-full bg-ink/40 px-2.5 py-1 text-[10px] text-paper/80 backdrop-blur-md transition-colors hover:bg-ink/70 hover:text-paper"
        >
          Photo · {photo.credit}
        </a>
      )}
    </div>
  );
}
