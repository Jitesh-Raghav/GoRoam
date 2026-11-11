import { KIND_ICON_PATHS } from "@/components/seo/kind-icon-paths";
import { Bike, Motorcycle, Mountain, Palmtree, Sailboat, ThumbsUp, TrainFront, Waves, iconMaker, type LucideIcon } from "@/components/site/icons";
import type { AdventureKind, Difficulty } from "@/lib/adventures";
import { DIFFICULTIES } from "@/lib/adventures";
import { cn } from "@/lib/utils";

// The icons only adventure kinds use. Their paths are generated into kind-icon-paths.ts (run
// `npm run icons` after adding a line), which only these server-rendered cards import, so
// they stay off the icon set every page loads.
const make = iconMaker(KIND_ICON_PATHS);
const Cactus = make("Cactus", "duotone", "Cactus");
const Fire = make("Fire", "duotone", "Fire");
const Fish = make("Fish", "duotone", "Fish");
const Hiker = make("PersonSimpleHike", "duotone", "Hiker");
const Horse = make("Horse", "duotone", "Horse");
const Jeep = make("Jeep", "duotone", "Jeep");
const Lifebuoy = make("Lifebuoy", "duotone", "Lifebuoy");
const Parachute = make("Parachute", "duotone", "Parachute");

/** Each kind of adventure as an icon: a thumb for hitchhiking, a horse for horse treks… */
export const KIND_ICON: Record<AdventureKind, LucideIcon> = {
  hitchhike: ThumbsUp,
  motorbike: Motorcycle,
  trek: Hiker,
  overland: Jeep,
  cycle: Bike,
  boat: Sailboat,
  dive: Fish,
  jungle: Palmtree,
  volcano: Fire,
  horse: Horse,
  rail: TrainFront,
  climb: Mountain,
  raft: Lifebuoy,
  surf: Waves,
  fly: Parachute,
  desert: Cactus,
};

export function KindIcon({ kind, className }: { kind: AdventureKind; className?: string }) {
  const Icon = KIND_ICON[kind];
  return <Icon className={className} />;
}

/** How hard, as four little bars that fill to the level: one for Easy, four for Hard. */
export function DifficultyDots({ level, className, tone = "ink" }: { level: Difficulty; className?: string; tone?: "ink" | "paper" }) {
  const n = DIFFICULTIES.indexOf(level) + 1;
  return (
    <span className={cn("inline-flex items-end gap-[3px]", className)} aria-label={`Difficulty: ${level}`} role="img">
      {DIFFICULTIES.map((d, i) => (
        <span
          key={d}
          className={cn(
            "w-[3px] rounded-full",
            i < n ? (tone === "ink" ? "bg-ink" : "bg-paper") : tone === "ink" ? "bg-ink/20" : "bg-paper/35"
          )}
          style={{ height: `${6 + i * 2.5}px` }}
        />
      ))}
    </span>
  );
}
