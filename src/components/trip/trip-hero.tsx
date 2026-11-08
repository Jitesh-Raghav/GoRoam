import { GuideCover, GuidePhoto } from "@/components/seo/guide-media";
import { MapPin } from "@/components/site/icons";
import { MONTH_NAMES, placeLabel, type TripIdea, type TripTag } from "@/lib/trip-ideas";
import { GalleryOpen, TripGallery, type GallerySlide } from "./gallery";

/** Who a trip suits, from its tags, in the order people search for them. */
const FOR: [TripTag, string][] = [
  ["honeymoon", "Couples"],
  ["family", "Families"],
  ["adventure", "Adventure seekers"],
  ["wildlife", "Wildlife lovers"],
  ["heritage", "History lovers"],
  ["beach", "Beach lovers"],
  ["snow", "Snow chasers"],
  ["festival", "Festival goers"],
  ["hills", "Mountain lovers"],
  ["desert", "Desert nights"],
  ["weekend", "A long weekend"],
];

export const idealFor = (t: TripIdea) => {
  const list = FOR.filter(([tag]) => t.tags.includes(tag)).map(([, label]) => label);
  return (list.length ? list : ["Friends", "Couples"]).slice(0, 2).join(" · ");
};

/** "Fly to Port Blair (IXZ) from Chennai…" → "Fly to Port Blair (IXZ)": the first clause, for a one-line fact. */
export const firstClause = (s: string) => s.split(/[;.]| from /)[0].trim();

/**
 * The top of a trip page: a full-bleed photo with the title, and two of the highlights
 * alongside on wide screens. The facts people look for first follow it as a FactStrip.
 */
export function TripHero({ t, alt, inSeason, slides }: { t: TripIdea; alt: string; inSeason: boolean; slides: GallerySlide[] }) {
  const where = placeLabel(t);
  const side = t.highlights.slice(0, 2);

  return (
    <section aria-label={`${t.name} at a glance`}>
      <div className="grid gap-3 lg:h-[min(80svh,46rem)] lg:grid-cols-[minmax(0,1fr)_19rem]">
        <GuideCover
          destination={t.destination}
          landscape={t.landscape}
          width={2000}
          src={`/trips/${t.slug}/photo?w=2000`}
          alt={alt}
          priority
          className="min-h-[34rem] rounded-panel sm:min-h-[36rem] lg:h-full lg:min-h-0"
        >
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/45 to-transparent" />
          <div className="absolute left-5 top-5 z-[2] sm:left-8 sm:top-8">
            <TripGallery slides={slides} city={t.destination} title={t.name} />
          </div>
          <header className="absolute inset-x-0 bottom-0 p-6 pb-8 text-paper sm:p-10 sm:pb-12">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/35 px-3 py-1.5 text-xs text-paper ring-1 ring-white/25">
                <MapPin className="duo-paper size-3.5" /> {where}
              </span>
              {inSeason && (
                <span className="inline-flex items-center gap-2 rounded-full bg-sun-2 px-3 py-1.5 text-xs font-medium text-ink shadow-lg">
                  <span className="inline-flex size-2 rounded-full bg-ink" />
                  In season in {MONTH_NAMES[new Date().getMonth()]}
                </span>
              )}
            </div>
            <p className="eyebrow text-paper/70">Trip plan · {t.days} days</p>
            <h1 className="display mt-4 max-w-3xl text-[clamp(2.6rem,7vw,5.25rem)] leading-[0.95] tracking-[-0.03em]">
              {t.days} days in <span className="text-brand-2">{t.name}</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-paper/85 sm:text-xl">{t.tagline}</p>
          </header>
        </GuideCover>

        <div className="hidden gap-3 lg:grid lg:grid-rows-2">
          {side.map(([name, note], i) => (
            <figure key={name} className="group relative overflow-hidden rounded-panel bg-paper-2">
              <GuidePhoto name={name} city={t.destination} />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
              <GalleryOpen index={i + 1} label={`Open the photo of ${name}`} />
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-paper">
                <span className="font-mono text-[11px] text-paper/60">{String(i + 1).padStart(2, "0")}</span>
                <span className="display mt-1 block text-xl leading-tight">{name}</span>
                <span className="mt-1 line-clamp-2 block text-sm text-paper/75">{note}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

    </section>
  );
}
