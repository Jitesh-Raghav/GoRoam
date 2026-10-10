"use client";

import { HeroPhoto } from "@/components/itinerary/hero-photo";
import { LazyScene } from "@/components/scenes/lazy-scene";
import { SCENES } from "@/components/scenes/scenes";
import { usePlacePhoto } from "@/lib/brand-photos";
import { useDestinationScene } from "@/lib/use-destination-scene";
import { cn } from "@/lib/utils";

/**
 * A wide, real photo of a destination for guide and trip pages, laid over its
 * illustrated scene: the scene shows while the photo loads, and stays if none turns up.
 */
export function DestinationHero({ destination, label, className }: { destination: string; label: string; className?: string }) {
  const { scene } = useDestinationScene(destination);
  const photo = usePlacePhoto(destination);
  return (
    <figure className={cn("relative aspect-[4/3] overflow-hidden rounded-panel bg-ink sm:aspect-[16/7]", className)}>
      <div className="absolute inset-0">
        <LazyScene id={scene} tint={SCENES[scene].tint} />
      </div>
      <HeroPhoto photo={photo} />
      <figcaption className="sr-only">{label}</figcaption>
    </figure>
  );
}
