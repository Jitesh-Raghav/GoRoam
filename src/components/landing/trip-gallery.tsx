import Link from "next/link";
import { PackageCard } from "@/components/packages/package-card";
import { DESTINATION_GUIDES } from "@/lib/destination-guides";
import { packageCards } from "@/lib/packages-data";
import { PACKAGE_SEO } from "@/lib/packages-seo";
import { SectionHeading } from "./section-heading";

// A taste of the public trip gallery: real links into /itineraries, so visitors (and crawlers) find it from the home page.
const PICKS = ["hampi-3-days-couples", "udaipur-3-days-couples", "ladakh-5-days", "kerala-5-days", "goa-3-days-budget", "japan-5-days"];

export async function TripGallery() {
  const cards = (await packageCards()).filter((c) => PICKS.includes(c.slug)).sort((a, b) => PICKS.indexOf(a.slug) - PICKS.indexOf(b.slug));
  return (
    <section id="gallery" className="container-x scroll-mt-24 py-24 sm:py-32">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading
          index="05"
          label="Trip gallery"
          title={[[{ text: "Not sure where yet?" }], [{ text: "Start from a " }, { text: "ready-made", className: "accent" }, { text: " trip." }]]}
          description="Hand-planned itineraries with real places, timings and honest budgets. Open one free, follow it as is, or make it yours."
        />
        <Link href="/itineraries" className="shrink-0 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-ink/90">
          Browse all {PACKAGE_SEO ? Object.keys(PACKAGE_SEO).length : ""} trips →
        </Link>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((pkg, i) => (
          <PackageCard key={pkg.slug} pkg={pkg} index={i} />
        ))}
      </div>
      <p className="mt-10 flex flex-wrap items-center gap-2 text-sm text-stone">
        <span className="mr-1">Destination guides:</span>
        {DESTINATION_GUIDES.map((d) => (
          <Link key={d.slug} href={`/destinations/${d.slug}`} className="rounded-full bg-white px-3 py-1.5 text-ink ring-1 ring-line hover:bg-ink hover:text-paper">
            {d.name}
          </Link>
        ))}
      </p>
    </section>
  );
}
