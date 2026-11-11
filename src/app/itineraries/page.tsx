import type { Metadata } from "next";
import { GalleryGrid, REGION_ORDER, regionId } from "@/components/packages/gallery-grid";
import { GuideCard } from "@/components/seo/guide-card";
import { PublicShell } from "@/components/seo/public-shell";
import { FactStrip } from "@/components/site/fact-strip";
import { BedDouble, Clock3, Coins, Lightbulb, MapPin } from "@/components/site/icons";
import { PageCover } from "@/components/site/page-cover";
import { PillLink } from "@/components/site/pill";
import { ROW_ITEM, ROW_SIZES, ScrollRow } from "@/components/site/scroll-row";
import { SectionHead } from "@/components/site/section-head";
import { DESTINATION_GUIDES } from "@/lib/destination-guides";
import { packageCards } from "@/lib/packages-data";
import { PACKAGE_SEO } from "@/lib/packages-seo";
import { JsonLd, absolute, breadcrumbs } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Ready-Made Itineraries: Day-by-Day Trips for India & Beyond",
  description:
    "Free, ready-made day-by-day itineraries with real places, timings, maps and honest budgets: Hampi, Jaipur, Udaipur, Goa, Kerala, Ladakh, Manali, Rishikesh, Varanasi, Bali, Japan, Paris and more.",
  alternates: { canonical: "/itineraries" },
  openGraph: { title: "Ready-made trips, day by day", description: "Planned stop by stop with timings, maps and costs. Open one free, follow it or make it yours.", url: "/itineraries" },
};

// The cover leads with these three: one Indian classic, two abroad.
const COVER = ["kerala-5-days", "japan-5-days", "bali-4-days"];

export default async function GalleryPage() {
  const cards = await packageCards();
  const countries = new Set(cards.map((c) => c.country)).size;
  const stops = cards.reduce((n, c) => n + c.stops, 0);
  const cover = COVER.flatMap((s) => cards.filter((c) => c.slug === s));
  const regions = REGION_ORDER.filter((r) => cards.some((c) => (PACKAGE_SEO[c.slug]?.region ?? "Asia") === r));

  return (
    <PublicShell crumbs={[{ name: "Home", href: "/" }, { name: "Itineraries", href: "/itineraries" }]}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "GoRoam ready-made itineraries",
            itemListElement: cards.map((c, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(`/itineraries/${c.slug}`), name: PACKAGE_SEO[c.slug]?.seoTitle ?? c.title })),
          },
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Itineraries", path: "/itineraries" },
          ]),
        ]}
      />
      <div className="container-x pb-24 pt-6">
        <PageCover
          eyebrow="Ready-made itineraries"
          title={
            <>
              Ready&#8209;made trips, <span className="accent">day by day.</span>
            </>
          }
          lede={
            <>
              Every itinerary here is planned stop by stop with real places, opening-time tips, map pins and an honest budget for two. Open one free, follow it as it is,
              or make it yours in the planner.
            </>
          }
          stats={[
            { value: String(cards.length), label: "itineraries" },
            { value: String(countries), label: "countries" },
            { value: `${stops}+`, label: "stops planned" },
          ]}
          links={regions.map((r) => ({ href: `#${regionId(r)}`, label: r }))}
          photos={cover.map((c) => ({ src: `/itineraries/${c.slug}/photo?w=1080&blank=1`, href: `/itineraries/${c.slug}`, label: c.title }))}
        >
          <PillLink href="/dashboard" className="mt-8">
            Plan my own trip free
          </PillLink>
        </PageCover>

        <section aria-labelledby="inside-h" className="mt-20">
          <h2 id="inside-h" className="eyebrow text-stone">
            In every itinerary
          </h2>
          <FactStrip
            className="mt-4"
            facts={[
              { icon: Clock3, label: "Hour by hour", value: "Each day timed, morning to night" },
              { icon: MapPin, label: "On the map", value: "Every stop pinned, in a sensible order" },
              { icon: BedDouble, label: "Where to stay", value: "Areas and stays that fit the budget" },
              { icon: Coins, label: "What it costs", value: "An honest budget for two, all in" },
              { icon: Lightbulb, label: "Local know-how", value: "Opening times, tickets and tips" },
            ]}
          />
        </section>

        <GalleryGrid cards={cards} hook className="mt-20" />

        <ScrollRow
          className="mt-24"
          label="Destination guides"
          head={<SectionHead kicker="Go deeper" title="Destination guides" intro="Best time to go, where to stay, what it costs and the sights worth your time." action={{ href: "/destinations", label: `All ${DESTINATION_GUIDES.length} guides` }} />}
        >
          {DESTINATION_GUIDES.map((g) => (
            <li key={g.slug} className={ROW_ITEM}>
              <GuideCard g={g} tall hook={false} sizes={ROW_SIZES} />
            </li>
          ))}
        </ScrollRow>
      </div>
    </PublicShell>
  );
}
