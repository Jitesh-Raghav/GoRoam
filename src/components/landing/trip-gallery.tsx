import Link from "next/link";
import { PackageCard } from "@/components/packages/package-card";
import { PillLink } from "@/components/site/pill";
import { DESTINATION_GUIDES } from "@/lib/destination-guides";
import { packageCards } from "@/lib/packages-data";
import { SectionHeading } from "./section-heading";

// A taste of the public trip gallery: real links into /itineraries, so visitors (and crawlers) find it from the home page.
const PICKS = ["udaipur-3-days-couples", "kerala-5-days", "japan-5-days"];

export async function TripGallery() {
  const all = await packageCards();
  const cards = all.filter((c) => PICKS.includes(c.slug)).sort((a, b) => PICKS.indexOf(a.slug) - PICKS.indexOf(b.slug));
  return (
    <section id="gallery" className="container-x scroll-mt-24 py-20 lg:py-28">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <SectionHeading
          label="Trip gallery"
          title={[[{ text: "Not sure where yet?" }], [{ text: "Start from a " }, { text: "ready-made", className: "accent" }, { text: " trip." }]]}
          description="Hand-planned itineraries with real places, timings and honest budgets. Open one free, follow it as is, or make it yours."
        />
        <PillLink href="/itineraries" variant="outline" className="self-start md:self-auto">
          Browse all {all.length} trips
        </PillLink>
      </div>
      {/* Tablets get two across (a lone third card would sit half-empty); phones and desktops show all three. */}
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((pkg, i) => (
          <div key={pkg.slug} className={i === 2 ? "h-full sm:max-lg:hidden" : "h-full"}>
            <PackageCard pkg={pkg} index={i} />
          </div>
        ))}
      </div>
      <nav aria-label="Destination guides" className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <span className="eyebrow text-stone">Destination guides</span>
        {DESTINATION_GUIDES.map((d) => (
          <Link key={d.slug} href={`/destinations/${d.slug}`} className="text-ink/75 underline decoration-line decoration-1 underline-offset-4 transition-colors hover:text-brand hover:decoration-brand">
            {d.name}
          </Link>
        ))}
      </nav>
    </section>
  );
}
