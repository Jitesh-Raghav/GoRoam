"use client";

/* eslint-disable @next/next/no-img-element -- remote Wikimedia/Unsplash photos, already sized. */

import { useEffect, useRef, useState } from "react";
import { LazyScene } from "@/components/scenes/lazy-scene";
import { SCENES } from "@/components/scenes/scenes";
import { CARD_HOOK, CARD_IMG, CARD_LINK, CARD_META, CARD_PHOTO, CARD_TITLE } from "@/components/site/card-styles";
import { QuietLink } from "@/components/site/quiet-link";
import { track } from "@/lib/analytics";
import { usePlacePhoto } from "@/lib/brand-photos";
import { useMoney } from "@/lib/money";
import type { PackageCardData } from "@/lib/packages-data";
import { useDestinationScene } from "@/lib/use-destination-scene";
import { cn } from "@/lib/utils";

/**
 * One ready-made trip as a borderless photo card: the photo, the trip's name, where and
 * when, and what it costs. The photo is the trip's own (embedded) or, failing that, a
 * looked-up photo of the destination; the illustration shows until it loads (then
 * unmounts), or stays if none exists.
 */
export function PackageCard({
  pkg,
  index,
  href = `/itineraries/${pkg.slug}`,
  hook = false,
  className,
}: {
  pkg: PackageCardData;
  index: number;
  /** Where the card opens; the dashboard keeps its own copy of each trip. */
  href?: string;
  /** Add the trip's one-line tagline under the facts. */
  hook?: boolean;
  className?: string;
}) {
  const { fmt: money } = useMoney();
  const ref = useRef<HTMLAnchorElement>(null);
  const [broken, setBroken] = useState<string[]>([]);
  const [loaded, setLoaded] = useState<string | null>(null);
  const [covered, setCovered] = useState(false);
  const { scene } = useDestinationScene(pkg.destination, pkg.landscape);
  const usable = (url: string | null | undefined): url is string => !!url && !broken.includes(url);
  const ownOk = usable(pkg.cover?.url);
  const looked = usePlacePhoto(pkg.destination, !ownOk);
  const cover = ownOk ? pkg.cover : usable(looked?.url) ? looked : null;
  const src = cover?.url ?? null;
  const shown = !!src && loaded === src;

  // Once the photo has faded in, the illustration under it goes.
  useEffect(() => {
    if (!shown) return;
    const t = window.setTimeout(() => setCovered(true), 550);
    return () => window.clearTimeout(t);
  }, [shown]);

  // Count an impression once a card is properly on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          track("package_impression", { slug: pkg.slug, position: index + 1 });
          io.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pkg.slug, index]);

  return (
    <QuietLink ref={ref} href={href} className={cn(CARD_LINK, className)}>
      <div className={cn(CARD_PHOTO, "aspect-[4/3]")}>
        {!covered && <LazyScene id={scene} tint={SCENES[scene].tint} paused />}
        {src && (
          <img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(src)}
            onError={() => {
              setBroken((b) => [...b, src]);
              setCovered(false);
            }}
            className={cn(CARD_IMG, "transition-[opacity,transform]", shown ? "opacity-100" : "opacity-0")}
          />
        )}
      </div>
      <div className="mt-3.5 px-0.5">
        <h3 className={CARD_TITLE}>{pkg.title}</h3>
        <p className={cn(CARD_META, "mt-1")}>
          {pkg.country} · Best {pkg.bestTime}
        </p>
        <p className={cn(CARD_META, "mt-0.5")}>
          From <span className="font-medium tabular-nums text-ink">{money(Math.round(pkg.budget / 2))}</span> per person
        </p>
        {hook && <p className={cn(CARD_HOOK, "mt-1.5")}>{pkg.tagline}</p>}
      </div>
    </QuietLink>
  );
}
