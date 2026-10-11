import type { Metadata } from "next";
import { PublicShell } from "@/components/seo/public-shell";
import { TripComposer } from "@/components/site/trip-composer";
import { JsonLd, absolute, breadcrumbs } from "@/lib/seo";
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
      <div className="container-x pb-24 pt-8">
        <header className="max-w-3xl">
          <p className="eyebrow text-brand">Plan a trip</p>
          <h1 className="display mt-5 text-[clamp(2.4rem,5.2vw,4.25rem)] leading-[1.02] text-ink">
            An AI trip planner for <span className="accent">every kind of trip.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-stone">
            A honeymoon, a week with the kids, five friends in Goa or a solo month in Japan: GoRoam plans each one differently, with the pace, stays and budget that kind of trip needs.
          </p>
        </header>

        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {USE_CASES.map((u) => (
            <li key={u.slug}>
              <TripTypeCard u={u} />
            </li>
          ))}
        </ul>

        <section className="mt-16 rounded-panel bg-[linear-gradient(160deg,#22397A_0%,#4766C4_60%,#86A3EC_100%)] px-5 py-10 text-center text-paper sm:px-10 sm:py-14" aria-labelledby="start-h">
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
