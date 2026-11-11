import { PackageCard } from "@/components/packages/package-card";
import { AdventureCard } from "@/components/seo/adventure-card";
import { GuideCard } from "@/components/seo/guide-card";
import { TripCard } from "@/components/seo/trip-card";
import { ROW_ITEM, ROW_SIZES, ScrollRow } from "@/components/site/scroll-row";
import { SectionHead } from "@/components/site/section-head";
import { ADVENTURES, POPULAR as POPULAR_ADVENTURES, shortTitle } from "@/lib/adventures";
import { DESTINATION_GUIDES } from "@/lib/destination-guides";
import { packageCards } from "@/lib/packages-data";
import { CITY_HUBS, MONTH_HUBS } from "@/lib/trip-hubs";
import { MONTH_NAMES, TRIP_IDEAS, inSeason, tripBySlug } from "@/lib/trip-ideas";
import { USE_CASES } from "@/lib/use-cases";
import { ExploreTrips, type ExploreLink } from "./explore-trips";
import { SectionHeading } from "./section-heading";
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

/**
 * "Start from a trip": five rows, all on show. What's in season this month, the
 * ready-made itineraries, cheap adventures abroad, the destination guides and each kind of
 * trip, then the photo
 * chips of popular trips, cities and months. All rendered on the server, so every link is
 * in the page for search engines; each row swipes on phones and pages with arrows on laptops.
 */
export async function StartTrips() {
  const month = new Date().getMonth() + 1;
  const now = inSeason(month);
  // Half from India, half abroad, so the row shows the range.
  const india = now.filter((t) => t.country === "India").slice(0, 5);
  const abroad = now.filter((t) => t.country !== "India").slice(0, 3);
  const picks = india.flatMap((t, i) => (abroad[i] ? [t, abroad[i]] : [t]));
  const all = await packageCards();
  const ready = [...READY.flatMap((slug) => all.filter((c) => c.slug === slug)), ...all.filter((c) => !READY.includes(c.slug))].slice(0, 8);

  return (
    <section id="trips" aria-label="Start from a trip" className="container-x scroll-mt-24 py-20 lg:py-28">
      <SectionHeading
        label="Start from a trip"
        title={[[{ text: "Not sure where yet?" }], [{ text: "Start from a " }, { text: "trip.", className: "accent" }]]}
        description="What's at its best this month, itineraries planned stop by stop, in-depth guides and a planner for every kind of trip. Open any of them free, then make it yours in 30 seconds."
      />

      <div className="mt-16 space-y-16 lg:mt-20 lg:space-y-20">
        <ScrollRow
          label={`Trips in season in ${MONTH_NAMES[month - 1]}`}
          head={<SectionHead as="h3" size="sm" title={`In season in ${MONTH_NAMES[month - 1]}`} intro="At their best this month, each with a day-by-day plan, an honest budget and three places to stay." action={{ href: "/trips", label: `All ${TRIP_IDEAS.length} trips` }} />}
        >
          {picks.map((t) => (
            <li key={t.slug} className={ROW_ITEM}>
              <TripCard t={t} tall sizes={ROW_SIZES} />
            </li>
          ))}
        </ScrollRow>

        <ScrollRow
          label="Ready-made itineraries"
          head={<SectionHead as="h3" size="sm" title="Ready-made itineraries" intro="Planned stop by stop with timings, maps and costs. Open one free, follow it as is, or make it yours." action={{ href: "/itineraries", label: `All ${all.length} itineraries` }} />}
        >
          {ready.map((pkg, i) => (
            <li key={pkg.slug} className={ROW_ITEM}>
              <PackageCard pkg={pkg} index={i} tall />
            </li>
          ))}
        </ScrollRow>

        <ScrollRow
          label="Cheap adventures abroad"
          head={
            <SectionHead
              as="h3"
              size="sm"
              title="Cheap adventures abroad"
              intro="Hitchhike Kyrgyzstan, ride the Ha Giang Loop, cross a Himalayan pass: step-by-step guides with real costs in dollars, visas and safety."
              action={{ href: "/adventures", label: `All ${ADVENTURES.length} adventures` }}
            />
          }
        >
          {POPULAR_ADVENTURES.slice(0, 10).map((a) => (
            <li key={a.slug} className={ROW_ITEM}>
              <AdventureCard a={a} tall sizes={ROW_SIZES} />
            </li>
          ))}
        </ScrollRow>

        <ScrollRow
          label="Destination guides"
          head={<SectionHead as="h3" size="sm" title="Destination guides" intro="When to go, how to get there, where to stay and what a day really costs, in depth." action={{ href: "/destinations", label: `All ${DESTINATION_GUIDES.length} guides` }} />}
        >
          {DESTINATION_GUIDES.map((g) => (
            <li key={g.slug} className={ROW_ITEM}>
              <GuideCard g={g} tall hook={false} sizes={ROW_SIZES} />
            </li>
          ))}
        </ScrollRow>

        <ScrollRow
          label="Plan by kind of trip"
          head={<SectionHead as="h3" size="sm" title="Plan by kind of trip" intro="Honeymoons, family holidays, friends in Goa or a solo month in Japan, each paced and budgeted for who's going." action={{ href: "/plan", label: "All trip types" }} />}
        >
          {USE_CASES.map((u) => (
            <li key={u.slug} className={ROW_ITEM}>
              <TripTypeCard u={u} />
            </li>
          ))}
        </ScrollRow>
      </div>

      <nav aria-label="Popular trip plans" className="mt-20 border-t border-line pt-10">
        <ExploreTrips
          groups={[
            { id: "india", label: "Popular in India", links: tripLinks(POPULAR_INDIA) },
            { id: "abroad", label: "Popular abroad", links: tripLinks(POPULAR_ABROAD) },
            {
              id: "adventures",
              label: "Adventures",
              links: POPULAR_ADVENTURES.slice(0, 12).map((a) => ({ href: `/adventures/${a.slug}`, label: shortTitle(a), photo: `/adventures/${a.slug}/photo?w=120` })),
            },
            { id: "cities", label: "From your city", links: CITY_HUBS.map((c) => ({ href: `/weekend-getaways/${c.slug}`, label: `Getaways from ${c.city}`, icon: "city" as const })) },
            { id: "months", label: "By month", links: MONTH_HUBS.map((m) => ({ href: `/places-to-visit/${m.slug}`, label: `Where to go in ${MONTH_NAMES[m.month - 1]}`, icon: "month" as const })) },
          ]}
        />
      </nav>
    </section>
  );
}
