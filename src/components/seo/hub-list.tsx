/* eslint-disable @next/next/no-img-element -- our own photo route, which redirects to a CDN image already sized by ?w= */
import { tripPhotoSet } from "@/components/seo/trip-card";
import { CARD_IMG, CARD_LINK, CARD_PHOTO } from "@/components/site/card-styles";
import { ArrowRight, CalendarDays, Mountain, Navigation } from "@/components/site/icons";
import { QuietLink } from "@/components/site/quiet-link";
import { price, monthsLabel, type TripIdea } from "@/lib/trip-ideas";
import { cn } from "@/lib/utils";

/**
 * A numbered list of trips, each with a photo, why it fits and a line on how to get there.
 * Open rows between hairlines, no boxes; the photos come from the trips' own photo route
 * as plain lazy images, so a long month list costs the browser no lookups.
 */
export function HubList({ items }: { items: { trip: TripIdea; how?: string }[] }) {
  return (
    <ol className="divide-y divide-line border-y border-line">
      {items.map(({ trip: t, how }, i) => (
        <li key={t.slug} className="cv-card">
          <QuietLink href={`/trips/${t.slug}`} className={cn(CARD_LINK, "grid gap-5 py-7 sm:grid-cols-[15rem_minmax(0,1fr)] sm:gap-8")}>
            <div className={cn(CARD_PHOTO, "aspect-[4/3]")}>
              <Mountain className="absolute left-1/2 top-1/2 -z-10 size-7 -translate-x-1/2 -translate-y-1/2 text-stone-2/70" />
              <img
                data-photo=""
                referrerPolicy="no-referrer"
                src={`/trips/${t.slug}/photo?w=720&blank=1`}
                srcSet={tripPhotoSet(t.slug)}
                sizes="(min-width: 640px) 240px, 100vw"
                alt=""
                width={720}
                height={540}
                loading="lazy"
                decoding="async"
                className={CARD_IMG}
              />
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-stone">
                <span className="font-mono tracking-normal">{String(i + 1).padStart(2, "0")}</span>
                {t.region}
              </p>
              <h3 className="display mt-2 text-[1.5rem] leading-tight text-ink transition-colors group-hover:text-brand">{t.name}</h3>
              <p className="mt-2 leading-relaxed text-ink/80">{t.tagline}</p>
              <p className="mt-2 text-sm leading-relaxed text-stone">{t.why}</p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink/80">
                {how && (
                  <span className="inline-flex items-center gap-1.5">
                    <Navigation className="size-4 text-stone" /> {how}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4 text-stone" /> {monthsLabel(t.months)}
                </span>
                <span>
                  {t.days} days · from {price(t, t.budget[0])}/day
                </span>
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                See the {t.days}-day plan <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </div>
          </QuietLink>
        </li>
      ))}
    </ol>
  );
}
