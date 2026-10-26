import { GuideCover, GuidePhoto } from "@/components/seo/guide-media";
import { CalendarDays, Clock3, Coins, Heart, MapPin, Navigation } from "@/components/site/icons";
import { MONTH_NAMES, monthsLabel, placeLabel, price, type TripIdea, type TripTag } from "@/lib/trip-ideas";

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
const firstClause = (s: string) => s.split(/[;.]| from /)[0].trim();

/**
 * The top of a trip page: a full-bleed photo with the title, two of the highlights
 * alongside on wide screens, and a floating card of the facts people look for first.
 */
export function TripHero({ t, alt, inSeason }: { t: TripIdea; alt: string; inSeason: boolean }) {
  const where = placeLabel(t);
  const side = t.highlights.slice(0, 2);
  const facts = [
    { icon: CalendarDays, k: "Best time", v: monthsLabel(t.months) },
    { icon: Clock3, k: "Ideal length", v: `${t.days} days` },
    { icon: Coins, k: "From", v: `${price(t, t.budget[0])} a day` },
    { icon: Heart, k: "Ideal for", v: idealFor(t) },
    { icon: Navigation, k: "Getting there", v: firstClause(t.reach) },
  ];

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
          <header className="absolute inset-x-0 bottom-0 p-6 pb-20 text-paper sm:p-10 sm:pb-24">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs text-paper ring-1 ring-white/25 backdrop-blur-md">
                <MapPin className="duo-paper size-3.5" /> {where}
              </span>
              {inSeason && (
                <span className="inline-flex items-center gap-2 rounded-full bg-sun-2 px-3 py-1.5 text-xs font-medium text-ink shadow-lg">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-ink/40" />
                    <span className="relative inline-flex size-2 rounded-full bg-ink" />
                  </span>
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
              <figcaption className="absolute inset-x-0 bottom-0 p-5 text-paper">
                <span className="font-mono text-[11px] text-paper/60">{String(i + 1).padStart(2, "0")}</span>
                <span className="display mt-1 block text-xl leading-tight">{name}</span>
                <span className="mt-1 line-clamp-2 block text-sm text-paper/75">{note}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <dl className="relative z-10 mx-3 -mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[22px] bg-line shadow-float ring-1 ring-line sm:mx-6 lg:mr-[calc(19rem+1.5rem)] lg:grid-cols-5">
        {facts.map((f, i) => (
          <div key={f.k} className={i === facts.length - 1 ? "col-span-2 min-w-0 bg-white px-5 py-4 lg:col-span-1" : "min-w-0 bg-white px-5 py-4"}>
            <dt className="flex items-center gap-1.5 text-[0.7rem] uppercase tracking-[0.14em] text-stone">
              <f.icon className="size-3.5 text-brand" /> {f.k}
            </dt>
            <dd className="mt-1.5 line-clamp-3 text-[0.95rem] leading-snug text-ink">{f.v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
