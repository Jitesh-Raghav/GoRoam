/* eslint-disable @next/next/no-img-element -- our own photo route, which redirects to a CDN image already sized by ?w= */
import { CARD_HOOK, CARD_IMG, CARD_LINK, CARD_META, CARD_PHOTO, CARD_TITLE } from "@/components/site/card-styles";
import { Mountain } from "@/components/site/icons";
import { QuietLink } from "@/components/site/quiet-link";
import { monthsLabel, price, type TripIdea } from "@/lib/trip-ideas";
import { cn } from "@/lib/utils";

const WIDTHS = [480, 720, 1080];

/**
 * A trip's photo from our own route. `blank=1`: with no photo the route sends an empty image,
 * so the card's placeholder shows instead of a broken one.
 */
const tripPhoto = (slug: string, w: number) => `/trips/${slug}/photo?w=${w}&blank=1`;
/** The same photo at a few widths, so each screen downloads only what it shows. */
export const tripPhotoSet = (slug: string, widths = WIDTHS) => widths.map((w) => `${tripPhoto(slug, w)} ${w}w`).join(", ");

/**
 * A trip idea as a borderless photo card: the photo, then its name, where and how long,
 * and what it costs in which months. Rendered on the server with a plain lazy image, so a
 * grid of a hundred of them costs the browser no JavaScript. With no photo the frame keeps
 * a quiet paper fill and a small mountain.
 */
export function TripCard({
  t,
  big = false,
  sizes = "(min-width: 1280px) 400px, (min-width: 1024px) 33vw, (min-width: 560px) 50vw, 100vw",
  compact = false,
  hook = false,
  className,
  photoClassName,
}: {
  t: TripIdea;
  /** Add the trip's one-line tagline under the facts (featured rows). */
  hook?: boolean;
  /** The lead card of a section: a wider photo and a larger name. */
  big?: boolean;
  /** Two-across on phones (long catalogues): smaller words, the months on a line of their own. */
  compact?: boolean;
  /** How wide the photo shows, for the browser's pick from the set. */
  sizes?: string;
  className?: string;
  photoClassName?: string;
}) {
  const where = t.region === t.country ? t.country : t.region;
  return (
    <QuietLink href={`/trips/${t.slug}`} className={cn(CARD_LINK, className)}>
      <div className={cn(CARD_PHOTO, big ? "aspect-[16/10]" : "aspect-[4/3]", photoClassName)}>
        <Mountain className="absolute left-1/2 top-1/2 -z-10 size-7 -translate-x-1/2 -translate-y-1/2 text-stone-2/70" />
        <img
          src={tripPhoto(t.slug, big ? 1080 : 720)}
          srcSet={tripPhotoSet(t.slug)}
          sizes={big ? "(min-width: 1024px) 50vw, 100vw" : sizes}
          alt=""
          width={big ? 1080 : 720}
          height={big ? 675 : 540}
          loading="lazy"
          decoding="async"
          className={CARD_IMG}
        />
      </div>
      <div className={cn("px-0.5", big ? "mt-4" : compact ? "mt-2.5 min-[560px]:mt-3.5" : "mt-3.5")}>
        <span className={cn(CARD_TITLE, "block", big && "lg:text-[1.75rem]", compact && "max-[559px]:text-[1.05rem]")}>{t.name}</span>
        <span className={cn(CARD_META, "mt-1 block", compact && "max-[559px]:text-[0.8rem]")}>
          {where} · {t.days} days
        </span>
        <span className={cn(CARD_META, "mt-0.5 block", compact && "max-[559px]:text-[0.8rem]")}>
          From <span className="font-medium tabular-nums text-ink">{price(t, t.budget[0])}</span>/day
          <span className={cn(compact && "max-[559px]:hidden")}> · </span>
          <span className={cn(compact && "max-[559px]:block")}>{monthsLabel(t.months)}</span>
        </span>
        {hook && <span className={cn(CARD_HOOK, "mt-1.5 block")}>{t.tagline}</span>}
      </div>
    </QuietLink>
  );
}
