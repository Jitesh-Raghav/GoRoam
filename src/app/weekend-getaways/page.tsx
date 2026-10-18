import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/seo/public-shell";
import { ArrowRight } from "@/components/site/icons";
import { CITY_HUBS, cityTrips } from "@/lib/trip-hubs";

export const metadata: Metadata = {
  title: "Weekend Getaways from Indian Cities (2026): Delhi, Mumbai, Bangalore & More",
  description: "The best short trips from Delhi, Mumbai, Bangalore, Pune, Hyderabad, Chennai, Kolkata and Ahmedabad, with travel times, budgets and day plans.",
  alternates: { canonical: "/weekend-getaways" },
};

export default function WeekendGetawaysIndex() {
  return (
    <PublicShell crumbs={[{ name: "Home", href: "/" }, { name: "Weekend getaways", href: "/weekend-getaways" }]}>
      <div className="container-x pb-24 pt-8">
        <header className="max-w-3xl">
          <p className="eyebrow text-brand">Weekend getaways</p>
          <h1 className="display mt-5 text-[clamp(2.2rem,5vw,4rem)] leading-[1.03] text-ink">
            Short trips from <span className="accent">your city.</span>
          </h1>
        </header>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CITY_HUBS.map((c) => (
            <li key={c.slug}>
              <Link href={`/weekend-getaways/${c.slug}`} className="group flex h-full flex-col rounded-card bg-white p-6 ring-1 ring-line hover:shadow-float">
                <span className="display text-2xl text-ink">From {c.city}</span>
                <span className="mt-2 flex-1 text-sm text-stone">{cityTrips(c).slice(0, 4).map((x) => x.trip.name).join(" · ")}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-brand">
                  {cityTrips(c).length} trips <ArrowRight className="size-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </PublicShell>
  );
}
