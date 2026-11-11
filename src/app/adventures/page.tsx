import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { AdventureCard, adventurePhoto, adventurePhotoSet } from "@/components/seo/adventure-card";
import { FaqList, PublicShell } from "@/components/seo/public-shell";
import { KindRow } from "@/components/seo/kind-row";
import { TripFilter, type TripFilterOption } from "@/components/seo/trip-filter";
import { PageCover } from "@/components/site/page-cover";
import { PillLink } from "@/components/site/pill";
import { QuietLink } from "@/components/site/quiet-link";
import { SectionHead } from "@/components/site/section-head";
import { ADVENTURES, AREAS, DIFFICULTIES, KIND_LABEL, POPULAR, adventureBySlug, areaId, shortTitle, usd, usedKinds, type Adventure } from "@/lib/adventures";
import { JsonLd, absolute, breadcrumbs, faqPage } from "@/lib/seo";
import { MONTH_NAMES } from "@/lib/trip-ideas";

const COUNTRIES = new Set(ADVENTURES.map((a) => a.country)).size;
const CHEAPEST = Math.min(...ADVENTURES.map((a) => a.budget[0]));

// The filter: every region, then every kind of adventure, most common first.
const OPTIONS: TripFilterOption[] = [
  { id: "all", label: "All adventures", count: ADVENTURES.length },
  ...AREAS.map((area) => ({ id: areaId(area), label: area, count: ADVENTURES.filter((a) => a.area === area).length })),
  ...usedKinds().map(({ kind, count }) => ({ id: kind, label: KIND_LABEL[kind], count })),
];
const SORTS = [
  { id: "popular", label: "Popular" },
  { id: "cost", label: "Cheapest first" },
  { id: "easy", label: "Easiest first" },
  { id: "days", label: "Shortest first" },
];
// Sort keys, as CSS order values.
const rank = (key: (a: Adventure) => number) => new Map([...POPULAR].sort((a, b) => key(a) - key(b)).map((a, i) => [a.slug, i]));
const BY_COST = rank((a) => a.budget[0] * 1000 + a.budget[1]);
const BY_EASY = rank((a) => DIFFICULTIES.indexOf(a.difficulty) * 1000 + a.days[0]);
const BY_DAYS = rank((a) => a.days[0] * 1000 + a.days[1]);

const COVER = ["ha-giang-loop", "hitchhike-kyrgyzstan", "annapurna-circuit"].map((s) => adventureBySlug(s)!);

// Each kind's tile shows its most popular guide, passing over the three on the cover.
const KINDS = usedKinds().map(({ kind, count }) => {
  const of = POPULAR.filter((a) => a.kind === kind);
  return { kind, count, a: of.find((a) => !COVER.includes(a)) ?? of[0] };
});

const LEVELS: Record<Adventure["difficulty"], string> = {
  Easy: "No experience needed: transport and beds are easy to arrange and nothing is technical.",
  Moderate: "Some fitness or riding confidence: long days, simple stays and a little altitude.",
  Challenging: "Good fitness and some experience: multi-day treks, high passes, few facilities.",
  Hard: "Fit, well prepared and properly insured: high altitude, summit pushes or remote roads.",
};

const BEFORE: [string, string][] = [
  ["Insurance that names it", "Buy cover that names what you'll do: trekking to the right altitude, riding a motorbike (with a licence valid there), diving to your depth, and evacuation from remote areas."],
  ["Visas change", "Our entry notes are for US, EU, UK and Australian passports and were checked for 2026. Rules move: confirm on the destination's official immigration site and your government's travel advice before you book."],
  ["Cash still matters", "Mountain villages, yurt camps and islands often have no ATM. Carry local cash and some clean US dollar notes."],
  ["Altitude is the real danger", "Above about 3,000 m, climb slowly, rest when the guides say so, and go down if a headache turns into vomiting, confusion or breathlessness."],
  ["Hitchhiking norms differ", "Across Central Asia and Mongolia a lift often comes with a small fare. Agree before you get in, travel in daylight and share your route."],
  ["Leave it better", "Use local guides, homestays and community tourism offices, pack out your rubbish, and ask before photographing people."],
];

const cheapest = [...ADVENTURES].sort((a, b) => a.budget[0] - b.budget[0]).slice(0, 5);
const listOf = (list: Adventure[]) => list.map((a) => `${a.title} (from ${usd(a.budget[0])} a day)`).join(", ");
const FAQS = [
  {
    q: "What are the cheapest adventure trips?",
    a: `On our list, the cheapest are ${listOf(cheapest)}. Prices are per person per day before flights, on a shoestring.`,
  },
  {
    q: "Where can you go hitchhiking in Asia?",
    a: `Georgia and Kyrgyzstan are among the easiest countries to hitchhike in the world, Mongolia is slow but unforgettable, and Vietnam and Cambodia work if you explain yourself well. Read our guides: ${ADVENTURES.filter((a) => a.kind === "hitchhike")
      .map((a) => a.title)
      .join(", ")}.`,
  },
  {
    q: "Which adventures suit beginners?",
    a: `Start with an Easy one: ${ADVENTURES.filter((a) => a.difficulty === "Easy")
      .slice(0, 6)
      .map((a) => a.title)
      .join(", ")}. None of them needs experience, and help is never far away.`,
  },
  {
    q: "Do I need special travel insurance?",
    a: "Usually, yes. Standard policies often exclude trekking above a set altitude, riding a motorbike without a licence valid in that country, diving, paragliding and evacuation from remote areas. Check the small print names what you'll actually do.",
  },
  {
    q: "Who are these guides written for?",
    a: "Independent travellers flying in from the US, Europe, the UK and Australia: costs are in US dollars and the visa notes cover those passports. Anyone can use the routes, costs and safety advice.",
  },
];

// "Good to go this month" is worked out when the page is built, so rebuild it daily.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "50 Cheap Adventure Trips (2026): Hitchhiking, Treks & Loops",
  description:
    "50 cheap adventure trips, step by step: hitchhiking in Kyrgyzstan and Mongolia, Vietnam's Ha Giang Loop, Himalayan treks and more, with costs in US dollars.",
  alternates: { canonical: "/adventures" },
  openGraph: {
    title: "50 cheap adventure trips, step by step",
    description: "Hitchhiking, motorbike loops, treks, volcanoes and deserts across Asia, the Middle East and Latin America.",
    url: "/adventures",
    images: [{ url: "/adventures/ha-giang-loop/photo?w=1200&h=630", width: 1200, height: 630, alt: "The Ha Giang Loop, Vietnam" }],
  },
};

export default function AdventuresPage() {
  const month = new Date().getMonth() + 1;
  const now = POPULAR.filter((a) => a.months.includes(month));
  const [lead, ...rest] = (now.length >= 5 ? now : POPULAR).slice(0, 5);
  const levels = DIFFICULTIES.map((d) => ({ d, list: POPULAR.filter((a) => a.difficulty === d) }));

  return (
    <PublicShell crumbs={[{ name: "Home", href: "/" }, { name: "Adventures", href: "/adventures" }]}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Cheap adventure trips",
            itemListElement: POPULAR.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(`/adventures/${a.slug}`), name: a.title })),
          },
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Adventures", path: "/adventures" },
          ]),
          faqPage(FAQS),
        ]}
      />
      <div className="container-x pb-24 pt-6">
        <PageCover
          eyebrow="Adventures"
          title={
            <>
              Cheap adventures, <span className="accent">far from the tour bus.</span>
            </>
          }
          lede={
            <>
              {ADVENTURES.length} step-by-step guides to the trips backpackers swap stories about: hitchhiking across Kyrgyzstan and Mongolia, motorbike loops in Vietnam
              and Laos, Himalayan passes, volcanoes at night and desert camps. Each one has the route, real costs in US dollars, entry rules for US, EU, UK and Australian
              passports, and how to stay safe.
            </>
          }
          stats={[
            { value: String(ADVENTURES.length), label: "how-to guides" },
            { value: String(COUNTRIES), label: "countries" },
            { value: usd(CHEAPEST), label: "a day, at the cheapest" },
          ]}
          links={[
            { href: "#all", label: "Browse all" },
            { href: "#regions", label: "By region" },
            { href: "#how-hard", label: "How hard is it?" },
          ]}
          photos={COVER.map((a) => ({ src: adventurePhoto(a.slug, 1080), srcSet: adventurePhotoSet(a.slug), href: `/adventures/${a.slug}`, label: shortTitle(a) }))}
        >
          <PillLink href="/dashboard" className="mt-8">
            Plan my own adventure free
          </PillLink>
        </PageCover>

        {lead && (
          <section aria-labelledby="now-h" className="mt-24">
            <SectionHead
              id="now-h"
              kicker="In season"
              title={`Good to go in ${MONTH_NAMES[month - 1]}`}
              intro="At their best right now, when the weather is on your side."
              action={{ href: "#all", label: `All ${ADVENTURES.length} adventures` }}
            />
            <ul className="mt-9 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              <li className="sm:col-span-2 lg:row-span-2">
                <AdventureCard a={lead} big hook />
              </li>
              {rest.map((a) => (
                <li key={a.slug}>
                  <AdventureCard a={a} sizes="(min-width: 1280px) 300px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
                </li>
              ))}
            </ul>
          </section>
        )}

        <KindRow kinds={KINDS} className="mt-24" />

        <section id="all" aria-labelledby="all-h" className="mt-24 scroll-mt-4">
          <SectionHead id="all-h" kicker="Every adventure" title="Find your kind of adventure" intro="Narrow by region, kind of trip or the month you can go, then sort by cost, difficulty or length." className="mb-6" />
          <TripFilter options={OPTIONS} label="Region or kind of adventure" noun={["adventure", "adventures"]} sorts={SORTS} wrap>
            <ul data-trip-grid className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 min-[560px]:gap-x-5 min-[560px]:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
              {POPULAR.map((a) => (
                <li
                  key={a.slug}
                  data-tags={`${a.kind} ${areaId(a.area)}`}
                  data-months={a.months.join(" ")}
                  style={{ "--o-cost": BY_COST.get(a.slug), "--o-easy": BY_EASY.get(a.slug), "--o-days": BY_DAYS.get(a.slug) } as CSSProperties}
                  className="cv-card"
                >
                  <AdventureCard a={a} compact sizes="(min-width: 1280px) 300px, (min-width: 1024px) 33vw, 50vw" />
                </li>
              ))}
            </ul>
          </TripFilter>
        </section>

        <section id="regions" aria-labelledby="regions-h" className="mt-28 scroll-mt-4">
          <SectionHead id="regions-h" kicker="By region" title="Every adventure, region by region" intro="The whole list at a glance, with the cheapest daily budget for each." />
          <div className="mt-10 grid gap-x-10 gap-y-12 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-3">
            {AREAS.map((area) => (
              <div key={area} id={areaId(area)} className="min-w-0 scroll-mt-24">
                <h3 className="display text-xl leading-tight text-ink">{area}</h3>
                <ul className="mt-4 space-y-2.5">
                  {POPULAR.filter((a) => a.area === area).map((a) => (
                    <li key={a.slug} className="flex items-baseline justify-between gap-4 text-[0.95rem]">
                      <QuietLink href={`/adventures/${a.slug}`} className="min-w-0 text-ink underline-offset-4 transition-colors hover:text-brand hover:underline">
                        {a.title}
                      </QuietLink>
                      <span className="shrink-0 text-sm tabular-nums text-stone">{usd(a.budget[0])}/day</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="how-hard" aria-labelledby="hard-h" className="mt-28 scroll-mt-4">
          <SectionHead id="hard-h" kicker="Difficulty" title="How hard is it?" intro="Every guide carries one of four levels. Pick the one that matches your fitness and experience, not your ambition." />
          <ol className="mt-10 grid gap-px border-y border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {levels.map(({ d, list }, i) => (
              <li key={d} className="bg-paper py-7 sm:px-6 sm:max-lg:[&:nth-child(odd)]:pl-0 lg:first:pl-0">
                <p className="font-mono text-xs text-stone">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="display mt-2 text-2xl text-ink">{d}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-stone">{LEVELS[d]}</p>
                <p className="mt-4 text-sm text-stone">
                  {list.length} {list.length === 1 ? "guide" : "guides"}, such as{" "}
                  {list.slice(0, 3).map((a, j) => (
                    <span key={a.slug}>
                      {j > 0 && (j === Math.min(list.length, 3) - 1 ? " and " : ", ")}
                      <QuietLink href={`/adventures/${a.slug}`} className="text-ink underline decoration-line underline-offset-4 transition-colors hover:text-brand">
                        {a.title.replace(/^The /, "the ")}
                      </QuietLink>
                    </span>
                  ))}
                  .
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="before-h" className="mt-28">
          <SectionHead id="before-h" kicker="Before you go" title="Six things to sort first" />
          <ol className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {BEFORE.map(([title, text], i) => (
              <li key={title} className="border-t border-line pt-5">
                <p className="font-mono text-xs text-stone">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 text-lg font-medium text-ink">{title}</h3>
                <p className="mt-2 leading-relaxed text-stone">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="faq-h" className="mt-28 grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
          <SectionHead id="faq-h" kicker="Questions" title="Adventure travel, answered" className="self-start lg:sticky lg:top-24" />
          <FaqList faqs={FAQS} />
        </section>
      </div>
    </PublicShell>
  );
}
