import type { Metadata } from "next";
import { GuideCard, guidePhoto, guidePhotoSet } from "@/components/seo/guide-card";
import { PublicShell } from "@/components/seo/public-shell";
import { PageCover } from "@/components/site/page-cover";
import { PillLink } from "@/components/site/pill";
import { QuietLink } from "@/components/site/quiet-link";
import { SectionHead } from "@/components/site/section-head";
import { ADVENTURES, INDIA_STATE, shortTitle } from "@/lib/adventures";
import { DESTINATION_GUIDES } from "@/lib/destination-guides";
import { JsonLd, absolute, breadcrumbs } from "@/lib/seo";
import { CITY_HUBS, MONTH_HUBS } from "@/lib/trip-hubs";
import { MONTH_NAMES, TRIP_IDEAS } from "@/lib/trip-ideas";

interface Place {
  href: string;
  label: string;
  /** "3 days", "Guide", "Adventure". */
  note: string;
}
interface Group {
  name: string;
  places: Place[];
}

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);
const add = (map: Map<string, Place[]>, key: string, place: Place) => map.set(key, [...(map.get(key) ?? []), place]);

/** India by state, abroad by country: every trip, guide and adventure, A to Z. */
function aToZ() {
  const india = new Map<string, Place[]>();
  const abroad = new Map<string, Place[]>();
  for (const g of DESTINATION_GUIDES) add(india, g.state, { href: `/destinations/${g.slug}`, label: `${g.name} travel guide`, note: "Guide" });
  for (const t of TRIP_IDEAS) {
    const place = { href: `/trips/${t.slug}`, label: t.name, note: `${t.days} days` };
    if (t.country === "India") add(india, t.region, place);
    else add(abroad, t.country, place);
  }
  for (const a of ADVENTURES) {
    const place = { href: `/adventures/${a.slug}`, label: shortTitle(a), note: "Adventure" };
    if (a.country === "India") add(india, INDIA_STATE[a.slug] ?? "India", place);
    else add(abroad, a.country, place);
  }
  const groups = (map: Map<string, Place[]>): Group[] =>
    [...map.entries()].map(([name, places]) => ({ name, places: places.sort((x, y) => (x.note === "Guide" ? -1 : y.note === "Guide" ? 1 : x.label.localeCompare(y.label))) })).sort(byName);
  return { india: groups(india), abroad: groups(abroad) };
}

const { india: INDIA, abroad: ABROAD } = aToZ();
const PLACES = INDIA.concat(ABROAD).reduce((n, g) => n + g.places.length, 0);
const COUNTRIES = ABROAD.length + 1;
const LETTERS = [...new Set(ABROAD.map((g) => g.name[0].toUpperCase()))];
const letterId = (l: string) => `abroad-${l.toLowerCase()}`;

export const metadata: Metadata = {
  title: "Travel Guides & Every Destination A–Z (2026): Best Time & Budgets",
  description: `In-depth guides to Goa, Jaipur, Kerala, Ladakh and more, plus every place we cover A to Z: ${TRIP_IDEAS.length} trips and ${ADVENTURES.length} adventures in ${COUNTRIES} countries, with best times, budgets and stays.`,
  alternates: { canonical: "/destinations" },
  openGraph: {
    title: "Destination guides, and every place A to Z",
    description: "When to go, how to get there, where to stay and what it costs, for every place we cover.",
    url: "/destinations",
  },
};

function Column({ group, id }: { group: Group; id?: string }) {
  return (
    <div id={id} className="mb-9 break-inside-avoid scroll-mt-24">
      <h3 className="display text-lg leading-tight text-ink">{group.name}</h3>
      <ul className="mt-3 space-y-1.5">
        {group.places.map((p) => (
          <li key={p.href} className="flex items-baseline justify-between gap-3 text-[0.95rem]">
            <QuietLink href={p.href} className="min-w-0 text-ink/85 underline-offset-4 transition-colors hover:text-brand hover:underline">
              {p.label}
            </QuietLink>
            <span className={p.note === "Guide" ? "shrink-0 text-xs font-medium text-brand" : "shrink-0 text-xs tabular-nums text-stone"}>{p.note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DestinationsPage() {
  const [lead, ...rest] = DESTINATION_GUIDES;
  // The first column for each letter carries the anchor the letter index jumps to.
  const firstOfLetter = new Set(LETTERS.map((l) => ABROAD.find((g) => g.name[0].toUpperCase() === l)!.name));

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
      <div className="container-x pb-24 pt-6">
        <PageCover
          eyebrow="Destination guides"
          title={
            <>
              Know before <span className="accent">you go.</span>
            </>
          }
          lede={
            <>
              Honest, in-depth guides to India&apos;s favourite trips: the months that work, how to get there, which area to stay in, the sights worth your time and what a day
              really costs. Below them, every place we cover, A to Z.
            </>
          }
          stats={[
            { value: String(DESTINATION_GUIDES.length), label: "in-depth guides" },
            { value: String(PLACES), label: "places, A to Z" },
            { value: String(COUNTRIES), label: "countries" },
          ]}
          links={[
            { href: "#a-z", label: "Every destination" },
            { href: "/places-to-visit", label: "By month" },
            { href: "/weekend-getaways", label: "From your city" },
          ]}
          photos={DESTINATION_GUIDES.slice(0, 3).map((g) => ({ src: guidePhoto(g.slug, 1080), srcSet: guidePhotoSet(g.slug), href: `/destinations/${g.slug}`, label: g.name }))}
        >
          <PillLink href="/dashboard" className="mt-8">
            Plan my own trip free
          </PillLink>
        </PageCover>

        <section aria-labelledby="guides-h" className="mt-24">
          <SectionHead id="guides-h" kicker="In depth" title="The guides" intro="Best months, getting there, where to stay, sights on a map, food and a day-by-day budget." />
          <ul className="mt-9 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            <li className="sm:col-span-2 lg:row-span-2">
              <GuideCard g={lead} big className="flex h-full flex-col" photoClassName="lg:aspect-auto lg:min-h-72 lg:flex-1" />
            </li>
            {rest.map((g) => (
              <li key={g.slug}>
                <GuideCard g={g} sizes="(min-width: 1280px) 300px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
              </li>
            ))}
          </ul>
        </section>

        <section id="a-z" aria-labelledby="az-h" className="mt-28 scroll-mt-4">
          <SectionHead
            id="az-h"
            kicker="A to Z"
            title="Every destination we cover"
            intro={`${PLACES} trips, guides and adventures: India state by state, then the rest of the world country by country.`}
          />
          <nav aria-label="Jump to" className="mt-8 flex flex-wrap items-center gap-1 border-y border-line py-3 text-sm">
            <a href="#india" className="rounded-full px-3 py-1.5 font-medium text-ink transition-colors hover:bg-paper-2">
              India
            </a>
            <span aria-hidden className="mx-1 h-4 w-px bg-line" />
            <span className="mr-1 text-stone">Abroad</span>
            {LETTERS.map((l) => (
              <a key={l} href={`#${letterId(l)}`} className="grid size-8 place-items-center rounded-full text-ink/80 transition-colors hover:bg-paper-2 hover:text-ink">
                {l}
              </a>
            ))}
          </nav>

          <h3 id="india" className="eyebrow mt-12 scroll-mt-24 text-brand">
            India, state by state
          </h3>
          <div className="mt-6 gap-10 sm:columns-2 lg:columns-3 xl:columns-4">
            {INDIA.map((g) => (
              <Column key={g.name} group={g} />
            ))}
          </div>

          <h3 className="eyebrow mt-10 border-t border-line pt-10 text-brand">Abroad, country by country</h3>
          <div className="mt-6 gap-10 sm:columns-2 lg:columns-3 xl:columns-4">
            {ABROAD.map((g) => (
              <Column key={g.name} group={g} id={firstOfLetter.has(g.name) ? letterId(g.name[0]) : undefined} />
            ))}
          </div>
        </section>

        <section aria-labelledby="ways-h" className="mt-24 grid gap-12 border-t border-line pt-14 lg:grid-cols-2">
          <div>
            <h2 id="ways-h" className="display text-[clamp(1.5rem,2.4vw,1.9rem)] leading-tight text-ink">
              Where to go, by month
            </h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {MONTH_HUBS.map((m) => (
                <li key={m.slug}>
                  <QuietLink href={`/places-to-visit/${m.slug}`} className="inline-flex rounded-full bg-paper-2 px-4 py-2 text-sm text-ink transition-colors hover:bg-ink hover:text-paper">
                    {MONTH_NAMES[m.month - 1]}
                  </QuietLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="display text-[clamp(1.5rem,2.4vw,1.9rem)] leading-tight text-ink">Getaways from your city</h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {CITY_HUBS.map((c) => (
                <li key={c.slug}>
                  <QuietLink href={`/weekend-getaways/${c.slug}`} className="inline-flex rounded-full bg-paper-2 px-4 py-2 text-sm text-ink transition-colors hover:bg-ink hover:text-paper">
                    {c.city}
                  </QuietLink>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
