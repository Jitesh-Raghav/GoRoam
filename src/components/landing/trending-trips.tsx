import { TripCard } from "@/components/seo/trip-card";
import { PillLink } from "@/components/site/pill";
import { MONTH_NAMES, TRIP_IDEAS, inSeason } from "@/lib/trip-ideas";
import { SectionHeading } from "./section-heading";

/** Trips that are at their best this month, as a swipeable row of photo cards linking into /trips. */
export function TrendingTrips() {
  const month = new Date().getMonth() + 1;
  const now = inSeason(month);
  // Half from India, half abroad, so the row shows the range.
  const india = now.filter((t) => t.country === "India").slice(0, 5);
  const abroad = now.filter((t) => t.country !== "India").slice(0, 3);
  const picks = india.flatMap((t, i) => (abroad[i] ? [t, abroad[i]] : [t]));
  if (!picks.length) return null;
  return (
    <section id="trending" className="container-x scroll-mt-24 py-20 lg:py-28">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <SectionHeading
          label={`Trending in ${MONTH_NAMES[month - 1]}`}
          title={[[{ text: "Where everyone's" }], [{ text: "going " }, { text: "this season.", className: "accent" }]]}
          description="Trips at their best right now, each with a day plan, an honest budget and three places to stay. Make any of them yours in 30 seconds."
        />
        <PillLink href="/trips" variant="outline" className="self-start md:self-auto">
          See all {TRIP_IDEAS.length} trips
        </PillLink>
      </div>
      <ul className="-mx-4 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
        {picks.map((t) => (
          <li key={t.slug} className="w-[78vw] max-w-[20rem] shrink-0 snap-start lg:w-auto lg:max-w-none">
            <TripCard t={t} />
          </li>
        ))}
      </ul>
    </section>
  );
}
