"use client";

/* eslint-disable @next/next/no-img-element -- remote Wikimedia/Openverse photos, already sized. */

import { motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LazyScene } from "@/components/scenes/lazy-scene";
import { SCENES } from "@/components/scenes/scenes";
import { track } from "@/lib/analytics";
import type { PackageCardData } from "@/lib/packages-data";
import { money } from "@/lib/trip";
import { useDestinationScene } from "@/lib/use-destination-scene";
import { cn } from "@/lib/utils";

/** One ready-made trip in the packages grid: a real photo, the essentials, and a way in. */
export function PackageCard({ pkg, index }: { pkg: PackageCardData; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const router = useRouter();
  const [photoOk, setPhotoOk] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const { scene } = useDestinationScene(pkg.destination, pkg.landscape);
  const href = `/dashboard/packages/${pkg.slug}`;

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
    >
      <Link
        ref={ref}
        href={href}
        onPointerEnter={() => router.prefetch(href)}
        className="group flex h-full flex-col overflow-hidden rounded-[28px] bg-white ring-1 ring-line transition-shadow duration-500 hover:shadow-[0_40px_80px_-50px_rgba(10,30,44,0.55)]"
      >
        <div className="relative h-60 overflow-hidden bg-ink">
          <div className="absolute inset-0">
            <LazyScene id={scene} tint={SCENES[scene].tint} />
          </div>
          {pkg.cover?.url && photoOk && (
            <img
              src={pkg.cover.url}
              alt={pkg.cover.title ?? pkg.name}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onLoad={() => setLoaded(true)}
              onError={() => setPhotoOk(false)}
              className={cn(
                "absolute inset-0 size-full object-cover transition-[opacity,transform] duration-[1400ms] ease-out-expo group-hover:scale-[1.06]",
                loaded ? "opacity-100" : "opacity-0"
              )}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
          <span className="absolute left-4 top-4 grid place-items-center rounded-2xl bg-white/95 px-3 py-2 text-center text-ink shadow-sm">
            <span className="display text-xl leading-none">{pkg.days}</span>
            <span className="eyebrow mt-0.5 text-[0.5rem] text-stone">days</span>
          </span>
          <span className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/90 text-ink opacity-0 transition-all duration-500 ease-out-expo group-hover:opacity-100">
            <ArrowUpRight className="size-4" />
          </span>
          <div className="absolute inset-x-0 bottom-0 p-5 text-paper">
            <p className="eyebrow flex items-center gap-1.5 text-[0.6rem] text-sun-2">
              <MapPin className="size-3" /> {pkg.country}
            </p>
            <h3 className="display mt-1.5 text-[1.87rem] leading-[0.95]">{pkg.title}</h3>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="leading-relaxed text-stone">{pkg.tagline}</p>
          {pkg.highlights.length > 0 && (
            <ul className="mt-4 space-y-1.5 text-sm text-ink/85">
              {pkg.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <Sparkles className="mt-0.5 size-3.5 shrink-0 text-brand" />
                  <span className="line-clamp-1">{h}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3 border-t border-line pt-4">
            <div>
              <p className="eyebrow text-[0.58rem] text-stone">From</p>
              <p className="mt-1 text-ink">
                <span className="display text-2xl leading-none">{money(Math.round(pkg.budget / 2))}</span>
                <span className="ml-1 text-xs text-stone">per person</span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-3 py-1.5 text-xs text-ink">
              <CalendarDays className="size-3.5 text-brand" /> Best {pkg.bestTime}
            </span>
          </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
