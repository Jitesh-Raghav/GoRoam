import type { Metadata } from "next";
import Link from "next/link";
import { GuideCover } from "@/components/seo/guide-media";
import { PublicShell } from "@/components/seo/public-shell";
import { ArrowUpRight, CalendarDays, MapPin } from "@/components/site/icons";
import { DESTINATION_GUIDES } from "@/lib/destination-guides";
import { cn } from "@/lib/utils";
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
        {/* Photo cards; the first guide leads, twice as wide. */}
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {DESTINATION_GUIDES.map((d, i) => {
            const lead = i === 0;
            const best = d.bestTime.months.filter((m) => m.rating === "best").map((m) => m.label).join(", ");
            return (
              <li key={d.slug} className={cn(lead && "sm:col-span-2")}>
                <Link href={`/destinations/${d.slug}`} className="group flex h-full flex-col overflow-hidden rounded-panel bg-white ring-1 ring-line transition-shadow duration-500 hover:shadow-float">
                  <GuideCover destination={d.destination} landscape={d.landscape} width={lead ? 1400 : 800} credit={false} className={cn("shrink-0", lead ? "h-72 sm:h-80" : "h-56")}>
                    <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/95 text-ink opacity-0 shadow-card transition-opacity duration-500 group-hover:opacity-100">
                      <ArrowUpRight className="size-4" />
                    </span>
                    <span className="absolute inset-x-0 bottom-0 p-5 text-paper sm:p-6">
                      <span className="eyebrow flex items-center gap-1.5 text-[0.62rem] text-paper/80">
                        <MapPin className="size-3" /> {d.state}
                      </span>
                      <span className={cn("display mt-2 block leading-[1.02]", lead ? "text-[clamp(2.2rem,4vw,3rem)]" : "text-[2rem]")}>{d.name}</span>
                    </span>
                  </GuideCover>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <p className="leading-relaxed text-stone">{d.tagline}</p>
                    <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-5 text-sm text-ink/75">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-4 text-brand" /> Best {best}
                      </span>
                      {d.itineraries.length > 0 && (
                        <span className="text-stone">
                          {d.itineraries.length} ready-made {d.itineraries.length === 1 ? "trip" : "trips"}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </PublicShell>
  );
}
