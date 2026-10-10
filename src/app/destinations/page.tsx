import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/seo/public-shell";
import { DESTINATION_GUIDES } from "@/lib/destination-guides";
import { JsonLd, absolute, breadcrumbs } from "@/lib/seo";

export const metadata: Metadata = {
  title: "India Travel Guides: Best Time, Where to Stay & Budgets",
  description:
    "Practical travel guides for Goa, Hampi, Jaipur, Udaipur, Kerala, Manali, Rishikesh, Varanasi and Ladakh: when to go, how to get there, where to stay, what to see and what it costs.",
  alternates: { canonical: "/destinations" },
};

export default function DestinationsPage() {
  return (
    <PublicShell crumbs={[{ name: "Home", href: "/" }, { name: "Destinations", href: "/destinations" }]}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "GoRoam destination guides",
            itemListElement: DESTINATION_GUIDES.map((d, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(`/destinations/${d.slug}`), name: `${d.name} travel guide` })),
          },
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Destinations", path: "/destinations" },
          ]),
        ]}
      />
      <div className="container-x pb-24 pt-8">
        <header className="max-w-3xl">
          <p className="eyebrow text-brand">Destination guides</p>
          <h1 className="display mt-5 text-[clamp(2.4rem,5.2vw,4.25rem)] leading-[1.02] text-ink">
            Know before <span className="accent">you go.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-stone">
            Honest, practical guides to India&apos;s favourite trips: the months that work, how to get there, which area to stay in, the sights worth your time and what a day really costs.
          </p>
        </header>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {DESTINATION_GUIDES.map((d) => (
            <li key={d.slug}>
              <Link href={`/destinations/${d.slug}`} className="group block h-full rounded-panel bg-white p-6 ring-1 ring-line transition-shadow hover:shadow-float">
                <p className="eyebrow text-stone">{d.state}</p>
                <h2 className="display mt-3 text-3xl text-ink group-hover:text-brand">{d.name}</h2>
                <p className="mt-3 leading-relaxed text-stone">{d.tagline}</p>
                <p className="mt-5 text-sm text-ink/70">Best time: {d.bestTime.months.filter((m) => m.rating === "best").map((m) => m.label).join(", ")}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </PublicShell>
  );
}
