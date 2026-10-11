import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/seo/public-shell";
import { ArrowUpRight } from "@/components/site/icons";
import { TripComposer } from "@/components/site/trip-composer";
import { JsonLd, absolute, breadcrumbs } from "@/lib/seo";
import { USE_CASES } from "@/lib/use-cases";
import { FALLBACK_ICON, USE_CASE_ICON } from "@/lib/use-case-icons";

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

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map((u) => {
            const Icon = USE_CASE_ICON[u.slug] ?? FALLBACK_ICON;
            return (
              <li key={u.slug}>
                <Link href={`/plan/${u.slug}`} className="group flex h-full flex-col rounded-[24px] bg-white p-5 ring-1 ring-line transition-shadow hover:shadow-[0_24px_48px_-28px_rgba(14,31,59,0.5)]">
                  <span className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand transition-colors group-hover:bg-ink group-hover:text-paper">
                      <Icon className="size-5" />
                    </span>
                    <ArrowUpRight className="size-4 text-stone transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
                  </span>
                  <span className="display mt-5 text-xl text-ink">{u.h1.replace(/^./, (c) => c.toUpperCase())}</span>
                  <span className="mt-2 text-sm leading-relaxed text-stone">{u.lede}</span>
                </Link>
              </li>
            );
          })}
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
