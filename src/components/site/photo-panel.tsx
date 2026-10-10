"use client";

import type { ReactNode } from "react";
import { HeroPhoto } from "@/components/itinerary/hero-photo";
import { LazyScene } from "@/components/scenes/lazy-scene";
import { SCENES, type SceneId } from "@/components/scenes/scenes";
import type { PlacePhoto } from "@/lib/trip";
import { cn } from "@/lib/utils";

const SHADE = {
  none: "",
  /** For text along the bottom edge. */
  bottom: "bg-gradient-to-t from-ink/85 via-ink/25 to-transparent",
  /** For text down the left side. */
  left: "bg-gradient-to-r from-ink/90 via-ink/55 to-ink/5",
  /** An even veil, for text anywhere. */
  soft: "bg-ink/40",
} as const;

/**
 * A real photo over an illustrated scene: the scene shows while the photo
 * loads, and stays if none turns up. A shade keeps text on top legible; the
 * children are laid over everything.
 */
export function PhotoPanel({
  photo,
  scene,
  intro = false,
  shade = "bottom",
  credit = true,
  creditClassName,
  lazy = true,
  drift = true,
  className,
  children,
}: {
  photo: PlacePhoto | null;
  /** The illustration underneath, and the fallback. */
  scene: SceneId;
  intro?: boolean;
  shade?: keyof typeof SHADE;
  credit?: boolean;
  creditClassName?: string;
  lazy?: boolean;
  drift?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("relative isolate overflow-hidden bg-ink", className)}>
      <LazyScene id={scene} tint={SCENES[scene].tint} intro={intro} />
      <HeroPhoto photo={photo} lazy={lazy} credit={credit} creditClassName={creditClassName} drift={drift} />
      {shade !== "none" && <div aria-hidden className={cn("pointer-events-none absolute inset-0", SHADE[shade])} />}
      {children}
    </div>
  );
}
