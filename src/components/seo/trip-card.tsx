/* eslint-disable @next/next/no-img-element -- our own photo route, which redirects to a CDN image already sized by ?w= */
import { CARD_HOOK, CARD_IMG, CARD_LINK, CARD_META, CARD_PHOTO, CARD_TITLE, PHOTO_PRICE, PHOTO_PRICE_VALUE, PHOTO_TAG, cardAspect } from "@/components/site/card-styles";
import { Mountain, Sun } from "@/components/site/icons";
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
 * A trip idea as a borderless photo card. On the photo: where it is (or "In season" when it
 * is) and what a day costs. Below: its name, how long, and its best months. Rendered on the
 * server with a plain lazy image, so a grid of a hundred of them costs the browser no
 * JavaScript. With no photo the frame keeps a quiet paper fill and a small mountain.
 */
export function TripCard({
  t,
  big = false,
  tall = false,
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
  /** A tall 4:5 photo, for the homepage's swipe rows. */
  tall?: boolean;
  /** Two-across on phones (long catalogues): smaller words, the months on a line of their own. */
  compact?: boolean;
  /** How wide the photo shows, for the browser's pick from the set. */
  sizes?: string;
  className?: string;
  photoClassName?: string;
}) {
  const where = t.region === t.country ? t.country : t.region;
  const inSeason = t.months.includes(new Date().getMonth() + 1);
  return (
    <QuietLink href={`/trips/${t.slug}`} className={cn(CARD_LINK, className)}>
      <div className={cn(CARD_PHOTO, big ? "aspect-[16/10]" : cardAspect(tall), photoClassName)}>
        <Mountain className="absolute left-1/2 top-1/2 -z-10 size-7 -translate-x-1/2 -translate-y-1/2 text-stone-2/70" />
        <img
          data-photo=""
          referrerPolicy="no-referrer"
          src={tripPhoto(t.slug, big ? 1080 : 720)}
          srcSet={tripPhotoSet(t.slug)}
          sizes={big ? "(min-width: 1024px) 50vw, 100vw" : sizes}
          alt=""
          width={big ? 1080 : 720}
          height={big ? 675 : tall ? 900 : 540}
          loading="lazy"
          decoding="async"
          className={CARD_IMG}
        />
        {inSeason ? (
          <span className={cn(PHOTO_TAG, compact && "max-[559px]:hidden")}>
            <Sun className="size-3.5 text-sun" /> In season
          </span>
        ) : (
          <span className={cn(PHOTO_TAG, compact && "max-[559px]:hidden")}>{where}</span>
        )}
        <span className={cn(PHOTO_PRICE, compact && "max-[559px]:bottom-2 max-[559px]:left-2 max-[559px]:px-2.5 max-[559px]:py-1")}>
          <span className={PHOTO_PRICE_VALUE}>{price(t, t.budget[0])}</span>/day
        </span>
      </div>
      <div className={cn("px-0.5", big ? "mt-4" : compact ? "mt-2.5 min-[560px]:mt-3.5" : "mt-3.5")}>
        <span className={cn(CARD_TITLE, "block", big && "lg:text-[1.75rem]", compact && "max-[559px]:text-[1.05rem]")}>{t.name}</span>
        <span className={cn(CARD_META, "mt-1 block", compact && "max-[559px]:text-[0.8rem]")}>
          {/* Out of season, the photo's tag names the region; on phones the compact card hides that tag, so the region comes down here. */}
          {inSeason ? `${where} · ` : compact && <span className="min-[560px]:hidden">{where} · </span>}
          {t.days} days<span className={cn(compact && "max-[559px]:hidden")}> · </span>
          <span className={cn(compact && "max-[559px]:block")}>Best {monthsLabel(t.months)}</span>
        </span>
        {hook && <span className={cn(CARD_HOOK, "mt-1.5 block")}>{t.tagline}</span>}
      </div>
    </QuietLink>
  );
}
