/* eslint-disable @next/next/no-img-element -- our own photo route, which redirects to a CDN image already sized by ?w= */
import { tripPhotoSet } from "@/components/seo/trip-card";
import { CARD_HOOK, CARD_IMG, CARD_LINK, CARD_META, CARD_PHOTO, CARD_TITLE } from "@/components/site/card-styles";
import { Mountain } from "@/components/site/icons";
import { QuietLink } from "@/components/site/quiet-link";
import { cn } from "@/lib/utils";

/**
 * A hub (a month, a city) as a borderless photo card, shown with the photo of its best
 * trip: the name, a count, and the first few places as a hook. Server-rendered.
 */
export function HubCard({ href, trip, title, meta, hook, className }: { href: string; trip: string; title: string; meta: string; hook?: string; className?: string }) {
  return (
    <QuietLink href={href} className={cn(CARD_LINK, className)}>
      <div className={cn(CARD_PHOTO, "aspect-[4/3]")}>
        <Mountain className="absolute left-1/2 top-1/2 -z-10 size-7 -translate-x-1/2 -translate-y-1/2 text-stone-2/70" />
        <img
          src={`/trips/${trip}/photo?w=720&blank=1`}
          srcSet={tripPhotoSet(trip)}
          sizes="(min-width: 1280px) 300px, (min-width: 1024px) 25vw, (min-width: 560px) 50vw, 100vw"
          alt=""
          width={720}
          height={540}
          loading="lazy"
          decoding="async"
          className={CARD_IMG}
        />
      </div>
      <div className="mt-3.5 px-0.5">
        <span className={cn(CARD_TITLE, "block")}>{title}</span>
        <span className={cn(CARD_META, "mt-1 block")}>{meta}</span>
        {hook && <span className={cn(CARD_HOOK, "mt-1.5 block")}>{hook}</span>}
      </div>
    </QuietLink>
  );
}
