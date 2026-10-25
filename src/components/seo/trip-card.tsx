import Link from "next/link";
import { GuideCover } from "@/components/seo/guide-media";
import { ArrowUpRight, CalendarDays, MapPin } from "@/components/site/icons";
import { price, monthsLabel, type TripIdea } from "@/lib/trip-ideas";
import { cn } from "@/lib/utils";

/** A trip idea as a photo card: place over the photo, best months and price below. */
export function TripCard({ t, big = false, className }: { t: TripIdea; big?: boolean; className?: string }) {
  return (
    <Link href={`/trips/${t.slug}`} className={cn("group flex h-full flex-col overflow-hidden rounded-panel bg-white ring-1 ring-line transition-shadow duration-500 hover:shadow-float", className)}>
      <GuideCover destination={t.destination} landscape={t.landscape} width={big ? 1200 : 700} credit={false} src={`/trips/${t.slug}/photo?w=${big ? 1200 : 700}`} alt={`${t.name}, ${t.region === t.country ? t.country : t.region}`} className={cn("shrink-0", big ? "h-72 sm:h-80" : "h-52")}>
        <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/95 text-ink opacity-0 shadow-card transition-opacity duration-500 group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
        <span className="absolute inset-x-0 bottom-0 p-5 text-paper">
          <span className="eyebrow flex items-center gap-1.5 text-[0.62rem] text-paper/80">
            <MapPin className="size-3" /> {t.region}
          </span>
          <span className={cn("display mt-2 block leading-[1.02]", big ? "text-[clamp(2rem,3.6vw,2.8rem)]" : "text-[1.75rem]")}>{t.name}</span>
        </span>
      </GuideCover>
      <div className="flex flex-1 flex-col p-5">
        <p className="line-clamp-2 text-sm leading-relaxed text-ink/75">{t.tagline}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-xs text-stone">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-brand" /> {monthsLabel(t.months)}
          </span>
          <span>
            {t.days} days · from <span className="text-ink">{price(t, t.budget[0])}</span>/day
          </span>
        </div>
      </div>
    </Link>
  );
}
