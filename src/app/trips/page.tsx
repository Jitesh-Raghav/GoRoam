import type { Metadata } from "next";
import { PublicShell } from "@/components/seo/public-shell";
import { TripCard } from "@/components/seo/trip-card";
import { TripFilter, type TripFilterOption } from "@/components/seo/trip-filter";
import { PillLink } from "@/components/site/pill";
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
    <PublicShell crumbs={[{ name: "Home", href: "/" }, { name: "Trending trips", href: "/trips" }]}>
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
            { name: "Trending trips", path: "/trips" },
          ]),
        ]}
      />
      <div className="container-x pb-24 pt-8">
        <header>
          <p className="eyebrow text-brand">Trending trips</p>
          <h1 className="display mt-5 text-[clamp(2.4rem,5.2vw,4.25rem)] leading-[1.02] text-ink">
            Where to go <span className="accent">right now.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-stone">
            {TRIP_IDEAS.length} trips at their best this season, in India and around the world. Each comes with a day-by-day plan, what it really costs and three places to stay. Like one? Make it yours in 30 seconds.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PillLink href="/dashboard">Plan my own trip free</PillLink>
            <PillLink href="/places-to-visit" variant="outline">
              By month
            </PillLink>
            <PillLink href="/weekend-getaways" variant="outline">
              From your city
            </PillLink>
            <PillLink href="/trip-cost-index" variant="outline">
              Trip Cost Index
            </PillLink>
          </div>
        </header>

        {lead && (
          <section aria-labelledby="now-h" className="mt-16">
            <p className="eyebrow text-brand">In season</p>
            <h2 id="now-h" className="display mt-3 text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.08] text-ink">
              Best trips for {MONTH_NAMES[month - 1]}
            </h2>
            {/* The lead trip takes a two-by-two corner on wide screens, its photo filling the height of the two rows beside it. */}
            <ul className="mt-8 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              <li className="sm:col-span-2 lg:row-span-2">
                <TripCard t={lead} big className="flex h-full flex-col" photoClassName="lg:aspect-auto lg:min-h-72 lg:flex-1" />
              </li>
              {rest.map((t) => (
                <li key={t.slug}>
                  <TripCard t={t} sizes="(min-width: 1280px) 300px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="all-h" className="mt-20">
          <p className="eyebrow text-brand">Every trip</p>
          <h2 id="all-h" className="display mt-3 mb-8 text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.08] text-ink">
            Find your kind of trip
          </h2>
          <TripFilter options={OPTIONS}>
            <ul data-trip-grid className="mt-5 grid grid-cols-2 gap-x-3 gap-y-8 min-[560px]:gap-x-5 min-[560px]:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
              {TRIP_IDEAS.map((t) => (
                <li key={t.slug} data-tags={tagsOf(t).join(" ")} className="cv-card">
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
