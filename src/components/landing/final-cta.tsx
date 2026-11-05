"use client";

import { useCallback, useState } from "react";
import { HeroPhoto } from "@/components/itinerary/hero-photo";
import { LazyScene } from "@/components/scenes/lazy-scene";
import { TripPrompt } from "@/components/site/trip-prompt";
import { BRAND_PHOTOS, FINAL_CTA_QUERY, useBrandPhoto } from "@/lib/brand-photos";

/**
 * The one closing call to action: a still photo under an even ink veil (the aurora
 * illustration, held still, until it loads) and the trip prompt. Nothing moves with the scroll.
 */
export function FinalCta() {
  const photo = useBrandPhoto(BRAND_PHOTOS.finalCta, FINAL_CTA_QUERY);
  const [covered, setCovered] = useState(false);
  const onShown = useCallback(() => setCovered(true), []);

  return (
    <section className="px-3 pb-3 pt-6 sm:px-4 sm:pb-4">
      <div className="relative isolate flex min-h-[72svh] items-center overflow-hidden rounded-panel bg-ink">
        {!covered && <LazyScene id="aurora" paused tint="#0e1f3b" />}
        <HeroPhoto photo={photo} lazy credit={false} onShown={onShown} />
        <div aria-hidden className="absolute inset-0 bg-ink/50" />
        <div className="container-x relative py-24 text-center text-paper">
          <p className="eyebrow text-paper/75">Your move</p>
          <h2 className="display mt-6 text-[clamp(2.6rem,6vw,5.25rem)] leading-[1] tracking-[-0.035em]">The world is waiting.</h2>
          <div className="mx-auto mt-10 max-w-xl">
            <TripPrompt tone="glass" />
            <p className="mt-5 text-sm text-paper/75">Your first itinerary is free. No card needed.</p>
          </div>
        </div>
        {photo?.credit && (
          <a
            href={photo.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-3 right-4 z-10 max-w-[60%] truncate rounded-full bg-ink/60 px-2.5 py-1 text-[10px] text-paper/80 transition-colors hover:bg-ink hover:text-paper"
          >
            Photo · {photo.credit}
          </a>
        )}
      </div>
    </section>
  );
}
