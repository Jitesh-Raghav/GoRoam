import type { Metadata } from "next";
import { PublicShell } from "@/components/seo/public-shell";
import { TripCard } from "@/components/seo/trip-card";
import { TripFilter } from "@/components/seo/trip-filter";
import { PillLink } from "@/components/site/pill";
import { JsonLd, absolute, breadcrumbs } from "@/lib/seo";
import { MONTH_NAMES, TRIP_IDEAS, inSeason } from "@/lib/trip-ideas";

// "Go this month" is worked out when the page is built, so rebuild it daily.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Trending Trips This Winter (2026): Where to Go, Budgets & Hotels",
  description: `${TRIP_IDEAS.length} trips that are at their best right now, in India and abroad: Jaisalmer, Andaman, Meghalaya, Auli, Sri Lanka, Bhutan, Baku and more, each with a day plan, budget and places to stay.`,
  alternates: { canonical: "/trips" },
  openGraph: { title: "Trending trips this winter", description: "Where to go now, with day plans, budgets and hotels.", url: "/trips" },
};

export default function TripsPage() {
  const month = new Date().getMonth() + 1;
  const now = inSeason(month).slice(0, 7);
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
        <header className="max-w-3xl">
          <p className="eyebrow text-brand">Trending trips</p>
          <h1 className="display mt-5 text-[clamp(2.4rem,5.2vw,4.25rem)] leading-[1.02] text-ink">
            Where to go <span className="accent">right now.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-stone">
            {TRIP_IDEAS.length} trips at their best this season, in India and a short flight away. Each comes with a day-by-day plan, what it really costs and three places to stay. Like one? Make it yours in 30 seconds.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PillLink href="/dashboard">Plan my own trip free</PillLink>
            <PillLink href="/itineraries" variant="outline">
              Full itineraries
            </PillLink>
          </div>
        </header>

        {lead && (
          <section aria-labelledby="now-h" className="mt-16">
            <p className="eyebrow text-brand">In season</p>
            <h2 id="now-h" className="display mt-3 text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.08] text-ink">
              Best trips for {MONTH_NAMES[month - 1]}
            </h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <li className="sm:col-span-2">
                <TripCard t={lead} big />
              </li>
              {rest.map((t) => (
                <li key={t.slug}>
                  <TripCard t={t} />
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
          <TripFilter trips={TRIP_IDEAS} />
        </section>
      </div>
    </PublicShell>
  );
}
