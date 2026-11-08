import type { Metadata } from "next";
import { HubCard } from "@/components/seo/hub-card";
import { PublicShell } from "@/components/seo/public-shell";
import { tripPhotoSet } from "@/components/seo/trip-card";
import { PageCover } from "@/components/site/page-cover";
import { PillLink } from "@/components/site/pill";
import { JsonLd, absolute, breadcrumbs } from "@/lib/seo";
import { MONTH_HUBS, monthName, monthTrips } from "@/lib/trip-hubs";

export const metadata: Metadata = {
  title: "Best Places to Visit by Month (2026): October to March",
  description: "Where to travel each month this season, in India and abroad: October, November, December, January, February and March.",
  alternates: { canonical: "/places-to-visit" },
};

// "This month" is worked out when the page is built, so rebuild it daily.
export const revalidate = 86400;

export default function PlacesByMonthIndex() {
  const now = new Date().getMonth() + 1;
  // Lead with this month if it has a page, else the next one that does.
  const lead = MONTH_HUBS.find((m) => m.month === now) ?? MONTH_HUBS.find((m) => (m.month - now + 12) % 12 > 0) ?? MONTH_HUBS[0];
  const { india, abroad } = monthTrips(lead.month);
  const covers = [...india.slice(0, 2), ...abroad.slice(0, 1)];
  const shown = new Set<string>();
  const places = new Set(MONTH_HUBS.flatMap((m) => [...monthTrips(m.month).india, ...monthTrips(m.month).abroad].map((t) => t.slug))).size;

  return (
    <PublicShell crumbs={[{ name: "Home", href: "/" }, { name: "Places to visit", href: "/places-to-visit" }]}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Where to go, month by month",
            itemListElement: MONTH_HUBS.map((m, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(`/places-to-visit/${m.slug}`), name: `Places to visit in ${monthName(m.month)}` })),
          },
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Places to visit", path: "/places-to-visit" },
          ]),
        ]}
      />
      <div className="container-x pb-24 pt-6">
        <PageCover
          eyebrow="Month by month"
          title={
            <>
              Where to go, <span className="accent">month by month.</span>
            </>
          }
          lede={
            <>
              The trips at their best each month of the travel season, in India and abroad: the weather on your side, the festivals on, and the crowds not yet arrived. Each
              comes with a day-by-day plan and an honest budget.
            </>
          }
          stats={[
            { value: String(MONTH_HUBS.length), label: "months covered" },
            { value: String(places), label: "places in season" },
            { value: String(india.length + abroad.length), label: `good in ${monthName(lead.month)}` },
          ]}
          links={MONTH_HUBS.map((m) => ({ href: `/places-to-visit/${m.slug}`, label: monthName(m.month) }))}
          photos={covers.map((t) => ({ src: `/trips/${t.slug}/photo?w=1080&blank=1`, srcSet: tripPhotoSet(t.slug), href: `/trips/${t.slug}`, label: t.name }))}
        >
          <PillLink href={`/places-to-visit/${lead.slug}`} className="mt-8">
            Where to go in {monthName(lead.month)}
          </PillLink>
        </PageCover>

        <ul className="mt-24 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {MONTH_HUBS.map((m) => {
            const { india: home, abroad: away } = monthTrips(m.month);
            // Each month leads with a photo of its own, not one an earlier month already used.
            const top = [...home, ...away].find((t) => !shown.has(t.slug)) ?? home[0] ?? away[0];
            if (top) shown.add(top.slug);
            if (!top) return null;
            return (
              <li key={m.slug}>
                <HubCard
                  href={`/places-to-visit/${m.slug}`}
                  trip={top.slug}
                  title={monthName(m.month)}
                  meta={`${home.length} in India · ${away.length} abroad`}
                  hook={[...home.slice(0, 3), ...away.slice(0, 1)].map((t) => t.name).join(" · ")}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </PublicShell>
  );
}
