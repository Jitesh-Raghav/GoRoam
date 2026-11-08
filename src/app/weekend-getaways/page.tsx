import type { Metadata } from "next";
import { HubCard } from "@/components/seo/hub-card";
import { PublicShell } from "@/components/seo/public-shell";
import { tripPhotoSet } from "@/components/seo/trip-card";
import { PageCover } from "@/components/site/page-cover";
import { PillLink } from "@/components/site/pill";
import { JsonLd, absolute, breadcrumbs } from "@/lib/seo";
import { CITY_HUBS, cityTrips } from "@/lib/trip-hubs";

export const metadata: Metadata = {
  title: "Weekend Getaways from Indian Cities (2026): Delhi, Mumbai, Bangalore & More",
  description: "The best short trips from Delhi, Mumbai, Bangalore, Pune, Hyderabad, Chennai, Kolkata and Ahmedabad, with travel times, budgets and day plans.",
  alternates: { canonical: "/weekend-getaways" },
};

export default function WeekendGetawaysIndex() {
  const trips = new Set(CITY_HUBS.flatMap((c) => cityTrips(c).map((x) => x.trip.slug))).size;
  // One photo from each of the first three cities' best picks.
  const covers = CITY_HUBS.slice(0, 3).flatMap((c) => {
    const top = cityTrips(c)[0]?.trip;
    return top ? [{ src: `/trips/${top.slug}/photo?w=1080&blank=1`, srcSet: tripPhotoSet(top.slug), href: `/weekend-getaways/${c.slug}`, label: `From ${c.city}` }] : [];
  });

  return (
    <PublicShell crumbs={[{ name: "Home", href: "/" }, { name: "Weekend getaways", href: "/weekend-getaways" }]}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Weekend getaways from Indian cities",
            itemListElement: CITY_HUBS.map((c, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(`/weekend-getaways/${c.slug}`), name: `Weekend getaways from ${c.city}` })),
          },
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Weekend getaways", path: "/weekend-getaways" },
          ]),
        ]}
      />
      <div className="container-x pb-24 pt-6">
        <PageCover
          eyebrow="Weekend getaways"
          title={
            <>
              Short trips from <span className="accent">your city.</span>
            </>
          }
          lede={
            <>
              The best two-to-four-day escapes from India&apos;s big cities, with how long it takes to get there, what it costs and a day-by-day plan for each. Pick your
              city.
            </>
          }
          stats={[
            { value: String(CITY_HUBS.length), label: "cities" },
            { value: String(trips), label: "short trips" },
            { value: "2–4", label: "days each" },
          ]}
          links={CITY_HUBS.map((c) => ({ href: `/weekend-getaways/${c.slug}`, label: c.city }))}
          photos={covers}
        >
          <PillLink href="/dashboard" className="mt-8">
            Plan my weekend free
          </PillLink>
        </PageCover>

        <ul className="mt-24 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {CITY_HUBS.map((c) => {
            const list = cityTrips(c);
            const top = list[0]?.trip;
            if (!top) return null;
            return (
              <li key={c.slug}>
                <HubCard
                  href={`/weekend-getaways/${c.slug}`}
                  trip={top.slug}
                  title={`From ${c.city}`}
                  meta={`${list.length} short trips`}
                  hook={list
                    .slice(0, 4)
                    .map((x) => x.trip.name)
                    .join(" · ")}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </PublicShell>
  );
}
