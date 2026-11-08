import type { Metadata } from "next";
import { PublicShell } from "@/components/seo/public-shell";
import { PageCover } from "@/components/site/page-cover";
import { PillLink } from "@/components/site/pill";
import { TripComposer } from "@/components/site/trip-composer";
import { JsonLd, absolute, breadcrumbs } from "@/lib/seo";
import { PACKAGES } from "@/lib/packages";
import { USE_CASES } from "@/lib/use-cases";
import { TripTypeCard } from "@/components/landing/trip-type-card";

export const metadata: Metadata = {
  title: "AI Trip Planner for Every Kind of Trip: Couples, Families, Road Trips",
  description:
    "Plan any kind of trip with GoRoam's free AI trip planner: honeymoons, family holidays, group trips with friends, solo travel, road trips, weekend getaways, multi-city routes and budget travel.",
  alternates: { canonical: "/plan" },
  openGraph: { title: "AI Trip Planner for Every Kind of Trip · GoRoam", url: "/plan", type: "website" },
};

export default function PlanHub() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Plan a trip", href: "/plan" },
  ];
  // A sample itinerary's photo for each of the first three kinds of trip.
  const covers = USE_CASES.slice(0, 3).flatMap((u) => (u.samples[0] ? [{ src: `/itineraries/${u.samples[0]}/photo?w=1080&blank=1`, href: `/plan/${u.slug}`, label: u.label }] : []));
  return (
    <PublicShell crumbs={crumbs}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "AI trip planner for every kind of trip",
            url: absolute("/plan"),
            hasPart: USE_CASES.map((u) => ({ "@type": "WebPage", name: u.title, url: absolute(`/plan/${u.slug}`) })),
          },
          breadcrumbs(crumbs.map((c) => ({ name: c.name, path: c.href }))),
        ]}
      />
      <div className="container-x pb-24 pt-6">
        <PageCover
          eyebrow="Plan a trip"
          title={
            <>
              An AI trip planner for <span className="accent">every kind of trip.</span>
            </>
          }
          lede={
            <>
              A honeymoon, a week with the kids, five friends in Goa or a solo month in Japan: GoRoam plans each one differently, with the pace, stays and budget that kind
              of trip needs.
            </>
          }
          stats={[
            { value: String(USE_CASES.length), label: "kinds of trip" },
            { value: String(PACKAGES.length), label: "sample itineraries" },
            { value: "Free", label: "first itinerary" },
          ]}
          links={USE_CASES.slice(0, 4).map((u) => ({ href: `/plan/${u.slug}`, label: u.label }))}
          photos={covers}
        >
          <PillLink href="/dashboard" className="mt-8">
            Plan my trip free
          </PillLink>
        </PageCover>

        <ul className="mt-24 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4">
          {USE_CASES.map((u) => (
            <li key={u.slug}>
              <TripTypeCard u={u} />
            </li>
          ))}
        </ul>

        <section className="mt-16 rounded-panel bg-ink px-5 py-10 text-center text-paper sm:px-10 sm:py-14" aria-labelledby="start-h">
          <h2 id="start-h" className="display text-[clamp(1.6rem,3vw,2.3rem)]">
            Or just describe your trip
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-paper/80">Your first itinerary is free, with no card needed.</p>
          <div className="mt-8 text-left">
            <TripComposer />
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
