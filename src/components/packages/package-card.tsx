"use client";

import { useMoney } from "@/lib/money";
/* eslint-disable @next/next/no-img-element -- remote Wikimedia/Unsplash photos, already sized. */

import { motion } from "framer-motion";
import { ArrowUpRight, MapPin } from "@/components/site/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LazyScene } from "@/components/scenes/lazy-scene";
import { SCENES } from "@/components/scenes/scenes";
import { track } from "@/lib/analytics";
import type { PackageCardData } from "@/lib/packages-data";

import { usePlacePhoto } from "@/lib/brand-photos";
import { useDestinationScene } from "@/lib/use-destination-scene";
import { CARD_FRAME, PHOTO_ARROW, PHOTO_CHIP } from "@/components/site/card-styles";
import { cn } from "@/lib/utils";

/**
 * One ready-made trip in the packages grid: a real photo, the essentials, and a way in.
 * The photo is the trip's own (embedded) or, failing that, a looked-up photo of the
 * destination; the illustrated scene underneath shows until it loads, or if none exists.
 */
export function PackageCard({ pkg, index, href = `/itineraries/${pkg.slug}` }: { pkg: PackageCardData; index: number; /** Where the card opens; the dashboard keeps its own copy of each trip. */ href?: string }) {
  const { fmt: money } = useMoney();
  const ref = useRef<HTMLAnchorElement>(null);
  const router = useRouter();
  const [broken, setBroken] = useState<string[]>([]);
  const [loaded, setLoaded] = useState<string | null>(null);
  const { scene } = useDestinationScene(pkg.destination, pkg.landscape);
  const usable = (url: string | null | undefined): url is string => !!url && !broken.includes(url);
  const ownOk = usable(pkg.cover?.url);
  const looked = usePlacePhoto(pkg.destination, !ownOk);
  const cover = ownOk ? pkg.cover : usable(looked?.url) ? looked : null;
  const src = cover?.url ?? null;

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
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: Math.min(index * 0.06, 0.4) }}
      className="h-full"
    >
      <Link ref={ref} href={href} onPointerEnter={() => router.prefetch(href)} className={CARD_FRAME}>
        <div className="relative h-60 shrink-0 overflow-hidden rounded-[1.35rem] bg-ink">
          {/* Only the picture zooms on hover; the labels stay put. */}
          <div className="absolute inset-0 transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.04]">
            <LazyScene id={scene} tint={SCENES[scene].tint} />
            {src && (
              <img
                key={src}
                src={src}
                alt={cover?.title ?? pkg.name}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onLoad={() => setLoaded(src)}
                onError={() => setBroken((b) => [...b, src])}
                className={cn("absolute inset-0 size-full object-cover transition-opacity duration-700", loaded === src ? "opacity-100" : "opacity-0")}
              />
            )}
          </div>
          <span className={cn(PHOTO_CHIP, "absolute left-3 top-3")}>
            {pkg.days} {pkg.days === 1 ? "day" : "days"}
          </span>
          <span className={cn(PHOTO_ARROW, "absolute right-3 top-3")}>
            <ArrowUpRight className="size-4" />
          </span>
          <span className={cn(PHOTO_CHIP, "absolute bottom-3 left-3")}>
            <MapPin className="size-3 text-brand" /> {pkg.country}
          </span>
        </div>
        <div className="flex flex-1 flex-col px-3 pb-3 pt-5 sm:px-4">
          <h3 className="display text-[1.55rem] leading-[1.06] tracking-[-0.015em] text-ink">{pkg.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/65">{pkg.tagline}</p>
          {pkg.highlights.length > 0 && (
            // The highlights as stops on a route, the way the plan itself reads.
            <ol className="mt-5">
              {pkg.highlights.map((h, i) => (
                <li key={h} className="relative flex gap-3 pb-3 last:pb-0">
                  {i < pkg.highlights.length - 1 && <span aria-hidden className="absolute bottom-0 left-[4.5px] top-[1.15rem] w-px bg-line-strong" />}
                  <span aria-hidden className="relative mt-[0.4rem] size-2.5 shrink-0 rounded-full border-2 border-brand bg-white" />
                  <span className="text-[0.92rem] leading-snug text-ink/85">{h}</span>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-auto pt-6">
            <dl className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 border-t border-line pt-4">
              <dt className="text-[0.7rem] text-stone">From</dt>
              <dt className="text-right text-[0.7rem] text-stone">Best time</dt>
              <dd className="mt-1 text-ink">
                <span className="display text-[1.35rem] leading-none tabular-nums">{money(Math.round(pkg.budget / 2))}</span>
                <span className="ml-1 text-xs text-stone">per person</span>
              </dd>
              <dd className="mt-1 text-right text-sm text-ink">{pkg.bestTime}</dd>
            </dl>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
