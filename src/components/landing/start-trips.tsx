import { PackageCard } from "@/components/packages/package-card";
import { GuideChip } from "@/components/seo/guide-media";
import { TripCard } from "@/components/seo/trip-card";
import { DESTINATION_GUIDES } from "@/lib/destination-guides";
import { packageCards } from "@/lib/packages-data";
import { CITY_HUBS, MONTH_HUBS } from "@/lib/trip-hubs";
import { MONTH_NAMES, TRIP_IDEAS, inSeason, tripBySlug } from "@/lib/trip-ideas";
import { USE_CASES } from "@/lib/use-cases";
import { ExploreTrips, type ExploreLink } from "./explore-trips";
import { SectionHeading } from "./section-heading";
import { TripTabs } from "./trip-tabs";
import { TripTypeCard } from "./trip-type-card";

// The trips people search for most, linked from the home page so it passes them its weight.
const POPULAR_INDIA = ["andaman", "gokarna", "jaisalmer", "varkala", "pondicherry", "coorg", "meghalaya", "darjeeling", "rann-of-kutch", "jim-corbett", "auli", "mcleodganj"];
const POPULAR_ABROAD = ["sri-lanka", "phuket", "bhutan", "nepal", "singapore", "maldives", "baku", "tbilisi", "rovaniemi", "london", "new-york", "sydney"];
// A taste of the ready-made itineraries: two in India, two abroad.
const READY = ["udaipur-3-days-couples", "kerala-5-days", "japan-5-days", "bali-4-days"];

const tripLinks = (slugs: string[]): ExploreLink[] =>
  slugs.flatMap((slug) => {
    const t = tripBySlug(slug);
    return t ? [{ href: `/trips/${t.slug}`, label: `${t.name} · ${t.days} days`, photo: `/trips/${t.slug}/photo?w=120` }] : [];
  });

/** A row that swipes sideways on phones and tablets and settles into a grid on laptops. */
const ROW = "no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:gap-5 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-x-5 lg:gap-y-10 lg:overflow-visible lg:px-0 lg:pb-0";
const ITEM = "w-[74vw] max-w-[19rem] shrink-0 snap-start lg:w-auto lg:max-w-none";
const SIZES = "(min-width: 1280px) 300px, (min-width: 1024px) 25vw, 74vw";

/**
 * "Start from a trip": one section in place of three card grids. Tabs for what's in season,
 * the ready-made itineraries and each kind of trip, then the photo chips of popular trips,
 * cities and months, and the destination guides. All rendered on the server, so every link
 * is in the page for search engines.
 */
export async function StartTrips() {
  const month = new Date().getMonth() + 1;
  const now = inSeason(month);
  // Half from India, half abroad, so the row shows the range.
  const india = now.filter((t) => t.country === "India").slice(0, 5);
  const abroad = now.filter((t) => t.country !== "India").slice(0, 3);
  const picks = india.flatMap((t, i) => (abroad[i] ? [t, abroad[i]] : [t]));
  const all = await packageCards();
  const ready = READY.flatMap((slug) => all.filter((c) => c.slug === slug));

  return (
    <section id="trips" aria-label="Start from a trip" className="container-x scroll-mt-24 py-20 lg:py-28">
      <SectionHeading
        label="Start from a trip"
        title={[[{ text: "Not sure where yet?" }], [{ text: "Start from a " }, { text: "trip.", className: "accent" }]]}
        description="What's at its best this month, itineraries planned stop by stop, and a planner for every kind of trip. Open any of them free, then make it yours in 30 seconds."
      />

      <TripTabs
        className="mt-12"
        tabs={[
          {
            id: "season",
            label: `In season · ${MONTH_NAMES[month - 1]}`,
            more: { href: "/trips", label: `See all ${TRIP_IDEAS.length} trips` },
            panel: (
              <ul className={ROW}>
                {picks.map((t) => (
                  <li key={t.slug} className={ITEM}>
                    <TripCard t={t} sizes={SIZES} />
                  </li>
                ))}
              </ul>
            ),
          },
          {
            id: "ready",
            label: "Ready-made itineraries",
            more: { href: "/itineraries", label: `Browse all ${all.length} itineraries` },
            panel: (
              <ul className={ROW}>
                {ready.map((pkg, i) => (
                  <li key={pkg.slug} className={ITEM}>
                    <PackageCard pkg={pkg} index={i} />
                  </li>
                ))}
              </ul>
            ),
          },
          {
            id: "types",
            label: "By kind of trip",
            more: { href: "/plan", label: "All trip types" },
            panel: (
              <ul className={ROW}>
                {USE_CASES.map((u) => (
                  <li key={u.slug} className={ITEM}>
                    <TripTypeCard u={u} />
                  </li>
                ))}
              </ul>
            ),
          },
        ]}
      />

      <nav aria-label="Popular trip plans" className="mt-20">
        <ExploreTrips
          groups={[
            { id: "india", label: "Popular in India", links: tripLinks(POPULAR_INDIA) },
            { id: "abroad", label: "Popular abroad", links: tripLinks(POPULAR_ABROAD) },
            { id: "cities", label: "From your city", links: CITY_HUBS.map((c) => ({ href: `/weekend-getaways/${c.slug}`, label: `Getaways from ${c.city}`, icon: "city" as const })) },
            { id: "months", label: "By month", links: MONTH_HUBS.map((m) => ({ href: `/places-to-visit/${m.slug}`, label: `Where to go in ${MONTH_NAMES[m.month - 1]}`, icon: "month" as const })) },
          ]}
        />
      </nav>

      <nav aria-label="Destination guides" className="mt-10 flex flex-wrap items-center gap-2 border-t border-line pt-8">
        <span className="mr-2 text-sm text-stone">Destination guides</span>
        {DESTINATION_GUIDES.map((d) => (
          <GuideChip key={d.slug} slug={d.slug} name={d.name} destination={d.destination} />
        ))}
      </nav>
    </section>
  );
}
