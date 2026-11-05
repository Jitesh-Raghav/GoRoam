import Link from "next/link";
import { GuideCover } from "@/components/seo/guide-media";
import { CARD_FRAME, PHOTO_ARROW, PHOTO_CHIP } from "@/components/site/card-styles";
import { ArrowUpRight, MapPin } from "@/components/site/icons";
import { price, monthsLabel, type TripIdea } from "@/lib/trip-ideas";
import { cn } from "@/lib/utils";

/** The year at a glance: one bar a month, filled when the trip is in season. */
export function SeasonStrip({ months, className }: { months: number[]; className?: string }) {
  return (
    <span aria-hidden className={cn("grid grid-cols-12 gap-[3px]", className)}>
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} className={cn("h-1 rounded-full", months.includes(i + 1) ? "bg-brand" : "bg-paper-3")} />
      ))}
    </span>
  );
}

/**
 * A trip idea as a framed photo card: the place on the photo, the name, its season and price below.
 * `fill` lets the photo take up any extra height on wide screens, for a card standing beside a `big` one.
 */
export function TripCard({ t, big = false, fill = false, className }: { t: TripIdea; big?: boolean; fill?: boolean; className?: string }) {
  const where = t.region === t.country ? t.country : t.region;
  return (
    <Link href={`/trips/${t.slug}`} className={cn(CARD_FRAME, className)}>
      <div className={cn("relative shrink-0 overflow-hidden rounded-[1.35rem] bg-ink", big ? "h-72 sm:h-96" : "h-56", fill && "xl:h-auto xl:min-h-56 xl:flex-1")}>
        <GuideCover
          destination={t.destination}
          landscape={t.landscape}
          width={big ? 1200 : 700}
          credit={false}
          shade="none"
          src={`/trips/${t.slug}/photo?w=${big ? 1200 : 700}`}
          alt={`${t.name}, ${where}`}
          className="absolute inset-0 transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.04]"
        />
        <span className={cn(PHOTO_CHIP, "absolute left-3 top-3")}>{t.days} days</span>
        <span className={cn(PHOTO_ARROW, "absolute right-3 top-3")}>
          <ArrowUpRight className="size-4" />
        </span>
        <span className={cn(PHOTO_CHIP, "absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)]")}>
          <MapPin className="size-3 shrink-0 text-brand" />
          <span className="truncate">{where}</span>
        </span>
      </div>
      <div className={cn("flex flex-1 flex-col px-3 pb-3 sm:px-4", big ? "pt-6" : "pt-5", fill && "xl:flex-none")}>
        <span className={cn("display block leading-[1.04] tracking-[-0.015em] text-ink", big ? "text-[clamp(2rem,3.4vw,2.75rem)]" : "text-[1.6rem]")}>{t.name}</span>
        <p className={cn("mt-2 text-sm leading-relaxed text-ink/65", big ? "max-w-xl" : "line-clamp-2")}>{t.tagline}</p>
        <div className="mt-auto pt-5">
          {/* Labels on one row and values on the next, so both columns line up. */}
          <dl className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-5 border-t border-line pt-4">
            <dt className="text-[0.7rem] text-stone">Best time</dt>
            <dt className="text-right text-[0.7rem] text-stone">From</dt>
            <dd className="mt-1 truncate text-sm text-ink">{monthsLabel(t.months)}</dd>
            <dd className="mt-1 whitespace-nowrap text-right text-ink">
              <span className="display text-[1.3rem] leading-none tabular-nums">{price(t, t.budget[0])}</span>
              <span className="text-xs text-stone">/day</span>
            </dd>
            <dd className="col-span-2">
              <SeasonStrip months={t.months} className="mt-2.5 max-w-[11rem]" />
            </dd>
          </dl>
        </div>
      </div>
    </Link>
  );
}
