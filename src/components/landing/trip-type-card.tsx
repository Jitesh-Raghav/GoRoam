import Link from "next/link";
import { CARD_FRAME, PHOTO_ARROW, PHOTO_CHIP } from "@/components/site/card-styles";
import { ArrowUpRight } from "@/components/site/icons";
import type { UseCase } from "@/lib/use-cases";
import { cn } from "@/lib/utils";
import { TripPhoto } from "./trip-photo";

/**
 * A card for one kind of trip: a tall photo in a white frame, with the name and a
 * line on a frosted panel along its bottom edge.
 */
export function TripTypeCard({ u, index }: { u: UseCase; index?: number }) {
  return (
    <Link href={`/plan/${u.slug}`} className={CARD_FRAME}>
      <div className="relative aspect-[3/4] flex-1 overflow-hidden rounded-[1.35rem] bg-ink sm:aspect-[4/5]">
        <div className="absolute inset-0 transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.05]">
          <TripPhoto slug={u.slug} />
        </div>
        {index !== undefined && <span className={cn(PHOTO_CHIP, "absolute left-3 top-3 font-mono tracking-wide")}>{String(index + 1).padStart(2, "0")}</span>}
        <span className={cn(PHOTO_ARROW, "absolute right-3 top-3 hidden sm:grid")}>
          <ArrowUpRight className="size-4" />
        </span>
        <div className="absolute inset-x-1.5 bottom-1.5 rounded-[1.05rem] bg-white/95 p-3 shadow-[0_10px_30px_-18px_rgb(14_31_59/0.7)] ring-1 ring-white/60 backdrop-blur-xl transition-transform duration-500 ease-out-expo group-hover:-translate-y-1 sm:inset-x-2 sm:bottom-2 sm:p-4">
          {/* Phones get the short name ("Friends"); wider cards the full one, which is also the link's words. */}
          <span className="display block text-[1.15rem] leading-[1.1] tracking-[-0.01em] text-ink sm:hidden">{u.label}</span>
          <span className="display hidden text-[1.2rem] leading-[1.15] tracking-[-0.01em] text-ink sm:block">{u.h1.replace(/^./, (c) => c.toUpperCase())}</span>
          <span className="mt-1.5 hidden sm:block">
            <span className="line-clamp-3 text-[0.82rem] leading-relaxed text-ink/65">{u.lede}</span>
          </span>
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand sm:mt-3">
            Start planning <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
