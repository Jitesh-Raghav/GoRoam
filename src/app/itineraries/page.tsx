import type { Metadata } from "next";
import { GalleryGrid } from "@/components/packages/gallery-grid";
import { GuideChip } from "@/components/seo/guide-media";
import { PublicShell } from "@/components/seo/public-shell";
import { DESTINATION_GUIDES } from "@/lib/destination-guides";
import { packageCards } from "@/lib/packages-data";
import { PACKAGE_SEO } from "@/lib/packages-seo";
import { JsonLd, absolute, breadcrumbs } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Trip Gallery: Day-by-Day Itineraries for India & Beyond",
  description:
    "Free, ready-made day-by-day itineraries with real places, timings, maps and honest budgets: Hampi, Jaipur, Udaipur, Goa, Kerala, Ladakh, Manali, Rishikesh, Varanasi, Bali, Japan, Paris and more.",
  alternates: { canonical: "/itineraries" },
};

export default async function GalleryPage() {
  const cards = await packageCards();

  return (
    <PublicShell crumbs={[{ name: "Home", href: "/" }, { name: "Trip gallery", href: "/itineraries" }]}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "GoRoam trip gallery",
            itemListElement: cards.map((c, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(`/itineraries/${c.slug}`), name: PACKAGE_SEO[c.slug]?.seoTitle ?? c.title })),
          },
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Trip gallery", path: "/itineraries" },
          ]),
        ]}
      />
      <div className="container-x pb-24 pt-8">
        <header className="max-w-3xl">
          <p className="eyebrow text-brand">Trip gallery</p>
          <h1 className="display mt-5 text-[clamp(2.4rem,5.2vw,4.25rem)] leading-[1.02] text-ink">
            Ready-made trips, <span className="accent">day by day.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-stone">
            Every itinerary here is planned stop by stop with real places, opening-time tips, map coordinates and an honest budget for two. Open one for free, follow it as is, or make it yours in the planner.
          </p>
        </header>

        <GalleryGrid cards={cards} className="mt-14" />

        <section className="mt-20 rounded-panel bg-white p-6 ring-1 ring-line sm:p-10" aria-labelledby="guides">
          <h2 id="guides" className="display text-[clamp(1.6rem,3vw,2.2rem)] text-ink">
            Destination guides
          </h2>
          <p className="mt-2 text-stone">Best time to go, where to stay, what it costs, and the sights worth your time.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {DESTINATION_GUIDES.map((d) => (
              <GuideChip key={d.slug} slug={d.slug} name={`${d.name} travel guide`} destination={d.destination} className="bg-paper" />
            ))}
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
