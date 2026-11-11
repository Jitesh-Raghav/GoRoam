/* eslint-disable @next/next/no-img-element -- our own photo route, which redirects to a CDN image already sized by ?w= */
import { DifficultyDots, KindIcon } from "@/components/seo/adventure-kind";
import { CARD_HOOK, CARD_IMG, CARD_LINK, CARD_META, CARD_PHOTO, CARD_TITLE, PHOTO_BADGE, PHOTO_PRICE, PHOTO_PRICE_VALUE, PHOTO_TAG, cardAspect } from "@/components/site/card-styles";
import { Mountain } from "@/components/site/icons";
import { QuietLink } from "@/components/site/quiet-link";
import { KIND_LABEL, daysText, monthsText, usd, type Adventure } from "@/lib/adventures";
import { cn } from "@/lib/utils";

const WIDTHS = [480, 720, 1080];

/** An adventure's photo from our own route; with no photo it sends an empty image (`blank=1`). `s` picks one of its sights. */
export const adventurePhoto = (slug: string, w: number, s?: number) => `/adventures/${slug}/photo?w=${w}${s === undefined ? "" : `&s=${s}`}&blank=1`;
export const adventurePhotoSet = (slug: string, s?: number, widths = WIDTHS) => widths.map((w) => `${adventurePhoto(slug, w, s)} ${w}w`).join(", ");

/**
 * An adventure as a borderless photo card, in the same vocabulary as the trip cards. On the
 * photo: the kind of trip (with its icon), how hard it is, and what a day costs. Below: its
 * name, where, how long and the best months. Server-rendered with a plain lazy image.
 */
export function AdventureCard({
  a,
  big = false,
  tall = false,
  hook = false,
  compact = false,
  sizes = "(min-width: 1280px) 400px, (min-width: 1024px) 33vw, (min-width: 560px) 50vw, 100vw",
  className,
}: {
  a: Adventure;
  /** The lead card of a section: a wider photo and a larger name. */
  big?: boolean;
  /** A tall 4:5 photo, for the homepage's swipe rows. */
  tall?: boolean;
  /** Add the one-line tagline under the facts. */
  hook?: boolean;
  /** Two-across on phones (the full list): smaller words, fewer facts. */
  compact?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <QuietLink href={`/adventures/${a.slug}`} className={cn(CARD_LINK, className)}>
      <div className={cn(CARD_PHOTO, big ? "aspect-[16/10]" : cardAspect(tall))}>
        <Mountain className="absolute left-1/2 top-1/2 -z-10 size-7 -translate-x-1/2 -translate-y-1/2 text-stone-2/70" />
        <img
          data-photo=""
          referrerPolicy="no-referrer"
          src={adventurePhoto(a.slug, big ? 1080 : 720)}
          srcSet={adventurePhotoSet(a.slug)}
          sizes={big ? "(min-width: 1024px) 50vw, 100vw" : sizes}
          alt=""
          width={big ? 1080 : 720}
          height={big ? 675 : tall ? 900 : 540}
          loading="lazy"
          decoding="async"
          className={CARD_IMG}
        />
        <span className={cn(PHOTO_TAG, compact && "max-[559px]:hidden")}>
          <KindIcon kind={a.kind} className="size-3.5 text-brand" />
          {KIND_LABEL[a.kind]}
        </span>
        <span className={cn(PHOTO_BADGE, "gap-2", compact && "max-[559px]:hidden")}>
          <DifficultyDots level={a.difficulty} />
          {a.difficulty}
        </span>
        <span className={cn(PHOTO_PRICE, compact && "max-[559px]:bottom-2 max-[559px]:left-2 max-[559px]:px-2.5 max-[559px]:py-1")}>
          <span className={PHOTO_PRICE_VALUE}>{usd(a.budget[0])}</span>/day
        </span>
      </div>
      <div className={cn("px-0.5", big ? "mt-4" : compact ? "mt-2.5 min-[560px]:mt-3.5" : "mt-3.5")}>
        <span className={cn(CARD_TITLE, "block", big && "lg:text-[1.75rem]", compact && "max-[559px]:text-[1.05rem]")}>{a.title}</span>
        <span className={cn(CARD_META, "mt-1 block", compact && "max-[559px]:text-[0.8rem]")}>
          {a.country} · {daysText(a)}
          <span className={cn(compact && "max-[559px]:hidden")}> · </span>
          <span className={cn("whitespace-nowrap", compact && "max-[559px]:block")}>{monthsText(a.months, true)}</span>
        </span>
        {hook && <span className={cn(CARD_HOOK, "mt-1.5 block")}>{a.tagline}</span>}
      </div>
    </QuietLink>
  );
}
