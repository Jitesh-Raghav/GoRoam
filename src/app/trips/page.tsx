import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { PublicShell } from "@/components/seo/public-shell";
import { TripCard, tripPhotoSet } from "@/components/seo/trip-card";
import { TripFilter, type TripFilterOption } from "@/components/seo/trip-filter";
import { PageCover } from "@/components/site/page-cover";
import { PillLink } from "@/components/site/pill";
import { SectionHead } from "@/components/site/section-head";
import { JsonLd, absolute, breadcrumbs } from "@/lib/seo";
import { MONTH_NAMES, TAG_LABEL, TRIP_IDEAS, inSeason, type TripIdea, type TripTag } from "@/lib/trip-ideas";

const FILTERS: ("all" | "india" | TripTag)[] = ["all", "india", "abroad", "beach", "hills", "snow", "desert", "wildlife", "heritage", "festival", "honeymoon", "weekend", "family", "adventure"];
/** What a card answers to in the filter: its tags, plus "india" for trips in India. */
const tagsOf = (t: TripIdea) => [...t.tags, ...(t.country === "India" ? ["india"] : [])];
const OPTIONS: TripFilterOption[] = FILTERS.map((f) => ({
  id: f,
  label: f === "all" ? "All trips" : f === "india" ? "India" : TAG_LABEL[f],
  count: f === "all" ? TRIP_IDEAS.length : TRIP_IDEAS.filter((t) => tagsOf(t).includes(f)).length,
}));

// Sort keys for the "every trip" grid, as CSS order values: cheapest first, shortest first.
// Rupees and dollars are compared at a rough rate; it only orders the cards, it's never shown.
const USD_IN_INR = 88;
const daily = (t: TripIdea) => t.budget[0] * (t.currency === "USD" ? USD_IN_INR : 1);
const rank = (key: (t: TripIdea) => number) => new Map([...TRIP_IDEAS].sort((a, b) => key(a) - key(b)).map((t, i) => [t.slug, i]));
const BY_COST = rank(daily);
const BY_DAYS = rank((t) => t.days * 1000 + daily(t) / 1e6);
const COUNTRIES = new Set(TRIP_IDEAS.map((t) => t.country)).size;

// "Go this month" is worked out when the page is built, so rebuild it daily.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Trending Trips This Winter (2026): Where to Go in India & Around the World",
  description: `${TRIP_IDEAS.length} trips that are at their best right now, in India and around the world: Jaisalmer, Andaman, Lapland, Lisbon, Cape Town, Maui, Sydney and more, each with a day plan, budget and places to stay.`,
  alternates: { canonical: "/trips" },
  openGraph: { title: "Trending trips this winter", description: "Where to go now, with day plans, budgets and hotels.", url: "/trips" },
};

export default function TripsPage() {
  const month = new Date().getMonth() + 1;
  const now = inSeason(month).slice(0, 9);
  const [lead, ...rest] = now;
  return (
    <PublicShell crumbs={[{ name: "Home", href: "/" }, { name: "Where to go", href: "/trips" }]}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Trending trips this season",
            itemListElement: TRIP_IDEAS.map((t, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(`/trips/${t.slug}`), name: `${t.name} trip plan` })),
          },
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Where to go", path: "/trips" },
          ]),
        ]}
      />
      <div className="container-x pb-24 pt-6">
        <PageCover
          eyebrow="Where to go"
          title={
            <>
              Where to go <span className="accent">in {MONTH_NAMES[month - 1]}.</span>
            </>
          }
          lede={<>{TRIP_IDEAS.length} trips at their best this season, in India and around the world. Each comes with a day-by-day plan, what it really costs and three places to stay. Like one? Make it yours in 30 seconds.</>}
          stats={[
            { value: String(TRIP_IDEAS.length), label: "trips with full plans" },
            { value: String(COUNTRIES), label: "countries" },
            { value: String(inSeason(month).length), label: `in season in ${MONTH_NAMES[month - 1]}` },
          ]}
          links={[
            { href: "/places-to-visit", label: "By month" },
            { href: "/weekend-getaways", label: "From your city" },
            { href: "/trip-cost-index", label: "Trip Cost Index" },
          ]}
          photos={now.slice(0, 3).map((t) => ({ src: `/trips/${t.slug}/photo?w=1080&blank=1`, srcSet: tripPhotoSet(t.slug), href: `/trips/${t.slug}`, label: t.name }))}
        >
          <PillLink href="/dashboard" className="mt-8">
            Plan my own trip free
          </PillLink>
        </PageCover>

        {lead && (
          <section aria-labelledby="now-h" className="mt-24">
            <SectionHead id="now-h" kicker="In season" title={`Best trips for ${MONTH_NAMES[month - 1]}`} intro="At their best right now: the weather's on your side and the crowds haven't arrived, or the festival's on." />
            {/* The lead trip takes a two-by-two corner on wide screens, its photo filling the height of the two rows beside it. */}
            <ul className="mt-9 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              <li className="sm:col-span-2 lg:row-span-2">
                <TripCard t={lead} big hook className="flex h-full flex-col" photoClassName="lg:aspect-auto lg:min-h-72 lg:flex-1" />
              </li>
              {rest.map((t) => (
                <li key={t.slug}>
                  <TripCard t={t} sizes="(min-width: 1280px) 300px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section id="all" aria-labelledby="all-h" className="mt-24 scroll-mt-4">
          <SectionHead id="all-h" kicker="Every trip" title="Find your kind of trip" intro="Narrow by the kind of trip and the month you can go, then sort by cost or length." className="mb-6" />
          <TripFilter options={OPTIONS}>
            <ul data-trip-grid className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 min-[560px]:gap-x-5 min-[560px]:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
              {TRIP_IDEAS.map((t) => (
                <li
                  key={t.slug}
                  data-tags={tagsOf(t).join(" ")}
                  data-months={t.months.join(" ")}
                  style={{ "--o-cost": BY_COST.get(t.slug), "--o-days": BY_DAYS.get(t.slug) } as CSSProperties}
                  className="cv-card"
                >
                  <TripCard t={t} compact sizes="(min-width: 1280px) 300px, (min-width: 1024px) 33vw, 50vw" />
                </li>
              ))}
            </ul>
          </TripFilter>
        </section>
      </div>
    </PublicShell>
  );
}
