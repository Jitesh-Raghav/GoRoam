"use client";

/* eslint-disable @next/next/no-img-element -- small looked-up thumbnails, already sized by the photo API */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PlacePhoto, asDish, asStop } from "@/components/itinerary/place-photo";
import type { RouteStop } from "@/components/itinerary/route-map";
import type { SceneId } from "@/components/scenes/scenes";
import { MapPin, UtensilsCrossed } from "@/components/site/icons";
import { PhotoPanel } from "@/components/site/photo-panel";
import { sizedPhoto, usePlacePhoto } from "@/lib/brand-photos";
import type { DestinationGuide } from "@/lib/destination-guides";
import { hasMapsKey } from "@/lib/maps";
import { cn } from "@/lib/utils";

/** A guide's landscape as an illustrated scene: settled locally, so no classifier call is needed. */
const SCENE: Record<DestinationGuide["landscape"], SceneId> = {
  coast: "coast",
  mountains: "peaks",
  desert: "dunes",
  lakes: "lake",
  river: "hills",
  forest: "hills",
};

/** True once `ref` is near the viewport, so off-screen photos aren't looked up. */
function useNear<T extends Element>(margin = "400px") {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    if (typeof IntersectionObserver === "undefined") return setNear(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin, near]);
  return [ref, near] as const;
}

/** A destination's real photo over its landscape illustration, with anything laid on top. */
export function GuideCover({
  destination,
  landscape,
  width = 1600,
  shade = "bottom",
  credit = true,
  className,
  children,
}: {
  destination: string;
  landscape: DestinationGuide["landscape"];
  /** About how wide it's shown, so Unsplash can send a smaller file. */
  width?: number;
  shade?: "bottom" | "left" | "soft" | "none";
  credit?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const photo = sizedPhoto(usePlacePhoto(destination), width);
  return (
    <PhotoPanel photo={photo} scene={SCENE[landscape]} shade={shade} credit={credit} creditClassName="bottom-auto top-3" className={className}>
      {children}
    </PhotoPanel>
  );
}

/** A photo of one named place (a sight, an area) or dish, filling its positioned parent. */
export function GuidePhoto({ name, city, kind = "place" }: { name: string; city: string; kind?: "place" | "dish" }) {
  const [ref, near] = useNear<HTMLDivElement>();
  // One lookup object per name, so the photo isn't fetched again on every render.
  const slot = useMemo(() => (kind === "dish" ? asDish(name) : asStop(name)), [kind, name]);
  return (
    <div ref={ref} className="absolute inset-0">
      {near ? (
        <PlacePhoto activity={slot} destination={city} icon={kind === "dish" ? UtensilsCrossed : MapPin} credit={false} imgClassName="group-hover:scale-[1.05]" />
      ) : (
        <div className="absolute inset-0 bg-paper-2" />
      )}
    </div>
  );
}

/** A guide as a small chip with a round photo of the place. */
export function GuideChip({ slug, name, destination, className }: { slug: string; name: string; destination: string; className?: string }) {
  const [ref, near] = useNear<HTMLAnchorElement>();
  const photo = sizedPhoto(usePlacePhoto(destination, near), 120);
  const [broken, setBroken] = useState<string | null>(null);
  const url = photo?.url && photo.url !== broken ? photo.url : null;
  return (
    <Link
      ref={ref}
      href={`/destinations/${slug}`}
      className={cn("group inline-flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3.5 text-sm text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-paper", className)}
    >
      <span className="relative grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-paper-2 text-brand">
        {url ? <img src={url} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setBroken(url)} className="size-full object-cover" /> : <MapPin className="size-3.5" />}
      </span>
      {name}
    </Link>
  );
}

// The live map only loads (script and all) when a key is set and the map is near.
const DayMap = dynamic(() => import("@/components/itinerary/day-map"), { ssr: false });

/** Every sight on one live map, numbered like the list. Hidden without a Maps key, or if Google refuses it. */
export function SightsMap({ sights, city, className }: { sights: { name: string; lat: number; lng: number }[]; city: string; className?: string }) {
  const [ref, near] = useNear<HTMLDivElement>("300px");
  const [failed, setFailed] = useState(false);
  const stops: RouteStop[] = useMemo(
    () => sights.map((s, i) => ({ key: String(i), label: `Sight ${i + 1}`, activity: { time: "", duration: "", estimatedCost: 0, place: { name: s.name, description: "", lat: s.lat, lng: s.lng } } })),
    [sights]
  );
  if (!hasMapsKey || failed || !sights.length) return null;
  return (
    <div ref={ref} className={cn("relative overflow-hidden rounded-card bg-ink", className)}>
      {near && <DayMap stops={stops} destination={city} route={false} onFail={() => setFailed(true)} className="absolute inset-0" />}
    </div>
  );
}
