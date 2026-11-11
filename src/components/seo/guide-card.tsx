/* eslint-disable @next/next/no-img-element -- our own photo route, which redirects to a CDN image already sized by ?w= */
import { CARD_HOOK, CARD_IMG, CARD_LINK, CARD_META, CARD_PHOTO, CARD_TITLE } from "@/components/site/card-styles";
import { Mountain } from "@/components/site/icons";
import { QuietLink } from "@/components/site/quiet-link";
import type { DestinationGuide } from "@/lib/destination-guides";
import { cn } from "@/lib/utils";

/** A guide's photo from our own route; `blank=1` sends an empty image when there's none, so the placeholder shows. */
export const guidePhoto = (slug: string, w: number) => `/destinations/${slug}/photo?w=${w}&blank=1`;
export const guidePhotoSet = (slug: string) => [480, 720, 1080].map((w) => `${guidePhoto(slug, w)} ${w}w`).join(", ");

/** "Nov - Feb, Oct" → "Nov – Feb, Oct": the guide's best months, typeset. */
export const bestMonths = (g: DestinationGuide) =>
  g.bestTime.months
    .filter((m) => m.rating === "best")
    .map((m) => m.label.replace(/\s*-\s*/g, " – "))
    .join(", ");

/**
 * A destination guide as a borderless photo card: the photo, the place, its state and
 * best months, and (unless `hook` is off) its one-line tagline. Server-rendered with a
 * plain lazy image, like the trip cards.
 */
export function GuideCard({
  g,
  big = false,
  hook = true,
  sizes = "(min-width: 1280px) 400px, (min-width: 1024px) 33vw, (min-width: 560px) 50vw, 100vw",
  className,
  photoClassName,
}: {
  g: DestinationGuide;
  big?: boolean;
  hook?: boolean;
  sizes?: string;
  className?: string;
  photoClassName?: string;
}) {
  return (
    <QuietLink href={`/destinations/${g.slug}`} className={cn(CARD_LINK, className)}>
      <div className={cn(CARD_PHOTO, big ? "aspect-[16/10]" : "aspect-[4/3]", photoClassName)}>
        <Mountain className="absolute left-1/2 top-1/2 -z-10 size-7 -translate-x-1/2 -translate-y-1/2 text-stone-2/70" />
        <img
          data-photo=""
          referrerPolicy="no-referrer"
          src={guidePhoto(g.slug, big ? 1080 : 720)}
          srcSet={guidePhotoSet(g.slug)}
          sizes={big ? "(min-width: 1024px) 60vw, 100vw" : sizes}
          alt=""
          width={big ? 1080 : 720}
          height={big ? 675 : 540}
          loading="lazy"
          decoding="async"
          className={CARD_IMG}
        />
      </div>
      <div className={cn("px-0.5", big ? "mt-4" : "mt-3.5")}>
        <span className={cn(CARD_TITLE, "block", big && "lg:text-[1.9rem]")}>{g.name}</span>
        <span className={cn(CARD_META, "mt-1 block")}>
          {g.state} · Best {bestMonths(g)}
        </span>
        {hook && <span className={cn(CARD_HOOK, "mt-1.5", big ? "block max-w-xl" : "block")}>{g.tagline}</span>}
      </div>
    </QuietLink>
  );
}
