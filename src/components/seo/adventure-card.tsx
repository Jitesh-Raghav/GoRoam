/* eslint-disable @next/next/no-img-element -- our own photo route, which redirects to a CDN image already sized by ?w= */
import { CARD_HOOK, CARD_IMG, CARD_LINK, CARD_META, CARD_PHOTO, CARD_TITLE } from "@/components/site/card-styles";
import { Mountain } from "@/components/site/icons";
import { QuietLink } from "@/components/site/quiet-link";
import { KIND_LABEL, daysText, monthsText, usd, type Adventure } from "@/lib/adventures";
import { cn } from "@/lib/utils";

const WIDTHS = [480, 720, 1080];

/** An adventure's photo from our own route; with no photo it sends an empty image (`blank=1`). */
export const adventurePhoto = (slug: string, w: number) => `/adventures/${slug}/photo?w=${w}&blank=1`;
export const adventurePhotoSet = (slug: string, widths = WIDTHS) => widths.map((w) => `${adventurePhoto(slug, w)} ${w}w`).join(", ");

/**
 * An adventure as a borderless photo card, in the same vocabulary as the trip cards: the
 * photo, its name, what kind of trip it is and where, then the daily cost, how hard it is
 * and the best months. Server-rendered with a plain lazy image.
 */
export function AdventureCard({
  a,
  big = false,
  hook = false,
  compact = false,
  sizes = "(min-width: 1280px) 400px, (min-width: 1024px) 33vw, (min-width: 560px) 50vw, 100vw",
  className,
}: {
  a: Adventure;
  /** The lead card of a section: a wider photo and a larger name. */
  big?: boolean;
  /** Add the one-line tagline under the facts. */
  hook?: boolean;
  /** Two-across on phones (the full list): smaller words, fewer facts. */
  compact?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <QuietLink href={`/adventures/${a.slug}`} className={cn(CARD_LINK, className)}>
      <div className={cn(CARD_PHOTO, big ? "aspect-[16/10]" : "aspect-[4/3]")}>
        <Mountain className="absolute left-1/2 top-1/2 -z-10 size-7 -translate-x-1/2 -translate-y-1/2 text-stone-2/70" />
        <img
          src={adventurePhoto(a.slug, big ? 1080 : 720)}
          srcSet={adventurePhotoSet(a.slug)}
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
        <span className={cn(CARD_TITLE, "block", big && "lg:text-[1.75rem]", compact && "max-[559px]:text-[1.05rem]")}>{a.title}</span>
        <span className={cn(CARD_META, "mt-1 block", compact && "max-[559px]:text-[0.8rem]")}>
          <span className={cn(compact && "max-[559px]:hidden")}>{KIND_LABEL[a.kind]} · </span>
          {a.country} · {daysText(a)}
        </span>
        <span className={cn(CARD_META, "mt-0.5 block", compact && "max-[559px]:text-[0.8rem]")}>
          From <span className="font-medium tabular-nums text-ink">{usd(a.budget[0])}</span>/day
          <span className={cn(compact && "max-[559px]:hidden")}> · {a.difficulty} · </span>
          <span className={cn("whitespace-nowrap", compact && "max-[559px]:block")}>{monthsText(a.months, true)}</span>
        </span>
        {hook && <span className={cn(CARD_HOOK, "mt-1.5 block")}>{a.tagline}</span>}
      </div>
    </QuietLink>
  );
}
