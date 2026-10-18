import Link from "next/link";
import { GuidePhoto } from "@/components/seo/guide-media";
import { ArrowRight, CalendarDays, Navigation } from "@/components/site/icons";
import { inr, monthsLabel, type TripIdea } from "@/lib/trip-ideas";

/** A numbered list of trips, each with a photo, why it fits and a line on how to get there. */
export function HubList({ items }: { items: { trip: TripIdea; how?: string }[] }) {
  return (
    <ol className="space-y-4">
      {items.map(({ trip: t, how }, i) => (
        <li key={t.slug}>
          <Link href={`/trips/${t.slug}`} className="group grid overflow-hidden rounded-card bg-white ring-1 ring-line transition-shadow duration-500 hover:shadow-float sm:grid-cols-[16rem_1fr]">
            <div className="relative h-44 overflow-hidden sm:h-full">
              <GuidePhoto name={t.destination} city={t.destination} />
              <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 font-mono text-[11px] text-ink shadow-sm">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <div className="flex flex-col p-5 sm:p-6">
              <p className="eyebrow text-[0.6rem] text-stone">{t.region}</p>
              <h3 className="display mt-1.5 text-[1.5rem] leading-tight text-ink">{t.name}</h3>
              <p className="mt-2 leading-relaxed text-ink/75">{t.tagline}</p>
              <p className="mt-2 text-sm leading-relaxed text-stone">{t.why}</p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink/80">
                {how && (
                  <span className="inline-flex items-center gap-1.5">
                    <Navigation className="size-4 text-brand" /> {how}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4 text-brand" /> {monthsLabel(t.months)}
                </span>
                <span>
                  {t.days} days · from {inr(t.budget[0])}/day
                </span>
              </div>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                See the {t.days}-day plan <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
