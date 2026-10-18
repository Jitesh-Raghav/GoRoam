import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/seo/public-shell";
import { ArrowRight } from "@/components/site/icons";
import { MONTH_HUBS, monthName, monthTrips } from "@/lib/trip-hubs";

export const metadata: Metadata = {
  title: "Best Places to Visit by Month (2026): October to March",
  description: "Where to travel each month this season, in India and abroad: October, November, December, January, February and March.",
  alternates: { canonical: "/places-to-visit" },
};

export default function PlacesByMonthIndex() {
  return (
    <PublicShell crumbs={[{ name: "Home", href: "/" }, { name: "Places to visit", href: "/places-to-visit" }]}>
      <div className="container-x pb-24 pt-8">
        <header className="max-w-3xl">
          <p className="eyebrow text-brand">Month by month</p>
          <h1 className="display mt-5 text-[clamp(2.2rem,5vw,4rem)] leading-[1.03] text-ink">
            Where to go, <span className="accent">month by month.</span>
          </h1>
        </header>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MONTH_HUBS.map((m) => {
            const { india, abroad } = monthTrips(m.month);
            return (
              <li key={m.slug}>
                <Link href={`/places-to-visit/${m.slug}`} className="group flex h-full flex-col rounded-card bg-white p-6 ring-1 ring-line hover:shadow-float">
                  <span className="display text-2xl text-ink">{monthName(m.month)}</span>
                  <span className="mt-2 flex-1 text-sm text-stone">{india.slice(0, 4).map((t) => t.name).join(" · ")}</span>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-brand">
                    {india.length + abroad.length} places <ArrowRight className="size-4" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </PublicShell>
  );
}
