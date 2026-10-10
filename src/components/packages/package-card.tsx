"use client";

/* eslint-disable @next/next/no-img-element -- remote Wikimedia/Unsplash photos, already sized. */

import { motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, MapPin } from "@/components/site/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LazyScene } from "@/components/scenes/lazy-scene";
import { SCENES } from "@/components/scenes/scenes";
import { track } from "@/lib/analytics";
import type { PackageCardData } from "@/lib/packages-data";
import { money } from "@/lib/trip";
import { usePlacePhoto } from "@/lib/brand-photos";
import { useDestinationScene } from "@/lib/use-destination-scene";
import { cn } from "@/lib/utils";

/**
 * One ready-made trip in the packages grid: a real photo, the essentials, and a way in.
 * The photo is the trip's own (embedded) or, failing that, a looked-up photo of the
 * destination; the illustrated scene underneath shows until it loads, or if none exists.
 */
export function PackageCard({ pkg, index, href = `/itineraries/${pkg.slug}` }: { pkg: PackageCardData; index: number; /** Where the card opens; the dashboard keeps its own copy of each trip. */ href?: string }) {
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
      <Link
        ref={ref}
        href={href}
        onPointerEnter={() => router.prefetch(href)}
        className="group flex h-full flex-col overflow-hidden rounded-card bg-white ring-1 ring-line transition-shadow duration-500 hover:shadow-float"
      >
        <div className="relative h-64 overflow-hidden bg-ink">
          <div className="absolute inset-0">
            <LazyScene id={scene} tint={SCENES[scene].tint} />
          </div>
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
              className={cn(
                "absolute inset-0 size-full object-cover transition-[opacity,transform] duration-[1400ms] ease-out-expo group-hover:scale-[1.06]",
                loaded === src ? "opacity-100" : "opacity-0"
              )}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-ink shadow-card">
            {pkg.days} {pkg.days === 1 ? "day" : "days"}
          </span>
          <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/95 text-ink opacity-0 shadow-card transition-all duration-500 ease-out-expo group-hover:opacity-100">
            <ArrowUpRight className="size-4" />
          </span>
          <div className="absolute inset-x-0 bottom-0 p-5 text-paper">
            <p className="eyebrow flex items-center gap-1.5 text-[0.62rem] text-paper/80">
              <MapPin className="size-3" /> {pkg.country}
            </p>
            <h3 className="display mt-2 text-[1.6rem] leading-[1.05]">{pkg.title}</h3>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <p className="leading-relaxed text-stone">{pkg.tagline}</p>
          {pkg.highlights.length > 0 && (
            <ul className="mt-4 space-y-2 text-[0.92rem] leading-snug text-ink/85">
              {pkg.highlights.map((h) => (
                <li key={h} className="flex gap-2.5">
                  <span aria-hidden className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-brand" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-auto pt-6">
            <div className="flex items-end justify-between gap-3 border-t border-line pt-4">
              <div>
                <p className="eyebrow text-[0.6rem] text-stone">From</p>
                <p className="mt-1.5 text-ink">
                  <span className="display text-[1.4rem] leading-none">{money(Math.round(pkg.budget / 2))}</span>
                  <span className="ml-1 text-xs text-stone">per person</span>
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs text-stone">
                <CalendarDays className="size-3.5 text-brand" /> Best {pkg.bestTime}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
