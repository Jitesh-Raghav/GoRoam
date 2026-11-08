import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ChapterNav, type Chapter } from "@/components/itinerary/chapter-nav";
import { PackageCard } from "@/components/packages/package-card";
import { AdventureCard } from "@/components/seo/adventure-card";
import { CreateYoursBar } from "@/components/seo/create-yours";
import { GuideCard, bestMonths } from "@/components/seo/guide-card";
import { GuideCover, GuidePhoto, SightsMap } from "@/components/seo/guide-media";
import { FaqList, PublicShell } from "@/components/seo/public-shell";
import { TripCard } from "@/components/seo/trip-card";
import { CARD_PHOTO } from "@/components/site/card-styles";
import { FactStrip } from "@/components/site/fact-strip";
import { ArrowUpRight, Bus, CalendarDays, Car, Coins, Lightbulb, MapPin, Navigation, Plane, Route, TrainFront, type LucideIcon } from "@/components/site/icons";
import { PillLink } from "@/components/site/pill";
import { SectionHead } from "@/components/site/section-head";
import { Essentials } from "@/components/trip/essentials";
import { ShareTrip } from "@/components/trip/share-trip";
import { ADVENTURES, INDIA_STATE } from "@/lib/adventures";
import { COMPANY } from "@/lib/company";
import { factsFor } from "@/lib/country-facts";
import { DESTINATION_GUIDES, MONTHS, guideBySlug, monthRatings, type MonthRating } from "@/lib/destination-guides";
import { packageCards } from "@/lib/packages-data";
import { plannerHref } from "@/lib/prompt-parse";
import { JsonLd, absolute, breadcrumbs, faqPage } from "@/lib/seo";
import { MONTH_NAMES, TRIP_IDEAS } from "@/lib/trip-ideas";
import { cn } from "@/lib/utils";

export const dynamicParams = false;
export const generateStaticParams = () => DESTINATION_GUIDES.map((d) => ({ slug: d.slug }));

// When the guides were last checked; shown as "Updated" and in the structured data.
const UPDATED = "2026-11-08";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = guideBySlug((await params).slug);
  if (!g) return {};
  const image = `/destinations/${g.slug}/photo?w=1200&h=630`;
  return {
    title: g.seoTitle,
    description: g.description,
    alternates: { canonical: `/destinations/${g.slug}` },
    openGraph: { title: g.seoTitle, description: g.description, type: "article", url: `/destinations/${g.slug}`, modifiedTime: UPDATED, images: [{ url: image, width: 1200, height: 630, alt: `${g.name}, ${g.state}` }] },
    twitter: { card: "summary_large_image", title: g.seoTitle, description: g.description, images: [image] },
  };
}

// The month grid: ink for the best months, a tint for good ones, paper for the rest.
const RATING: Record<MonthRating, { cell: string; label: string; word: string }> = {
  best: { cell: "bg-ink text-paper", label: "Best", word: "text-ink" },
  good: { cell: "bg-ink/15 text-ink", label: "Good", word: "text-ink/70" },
  avoid: { cell: "bg-paper-2 text-stone-2", label: "Avoid", word: "text-stone" },
};

/** How you get there, as an icon. */
const MODE_ICON: Record<string, LucideIcon> = { Air: Plane, Train: TrainFront, Bus: Bus, Road: Car, "Getting around": Navigation };

function Section({ id, kicker, title, intro, children }: { id: string; kicker: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28" aria-labelledby={`${id}-h`}>
      <SectionHead id={`${id}-h`} kicker={kicker} title={title} intro={intro} />
      <div className="mt-9">{children}</div>
    </section>
  );
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();
  const cards = (await packageCards()).filter((c) => g.itineraries.includes(c.slug));
  const plan = plannerHref({ destination: g.destination, interests: [], diet: [], notes: "" });
  const others = DESTINATION_GUIDES.filter((d) => d.slug !== g.slug).slice(0, 3);
  const nearby = TRIP_IDEAS.filter((t) => t.country === "India" && t.region === g.state).slice(0, 4);
  const adventures = ADVENTURES.filter((a) => INDIA_STATE[a.slug] === g.state);
  const facts = factsFor({ slug: g.slug, country: "India", region: g.state });
  const year = monthRatings(g);
  const month = new Date().getMonth() + 1;
  const inSeason = year?.[month - 1] === "best";
  const midRange = g.budget.find((b) => /mid/i.test(b.style)) ?? g.budget[Math.floor(g.budget.length / 2)];
  const modes = g.gettingThere.map((t) => t.mode).filter((m) => m !== "Getting around");
  const [lead, ...overview] = g.overview;

  const chapters: Chapter[] = [
    { id: "best-time", label: "Best time" },
    { id: "getting-there", label: "Getting there" },
    { id: "where-to-stay", label: "Where to stay" },
    { id: "top-sights", label: "Top sights" },
    { id: "food", label: "Food" },
    { id: "budget", label: "Budget" },
    ...(facts ? [{ id: "essentials", label: "Essentials" }] : []),
    ...(cards.length ? [{ id: "itineraries", label: "Itineraries" }] : []),
    { id: "faq", label: "FAQ" },
  ];
  const words = [...g.overview, g.bestTime.summary, ...g.bestTime.months.map((m) => m.note), ...g.gettingThere.map((t) => t.detail), ...g.whereToStay.map((s) => s.why), ...g.attractions.map((a) => `${a.description} ${a.tip}`), ...g.food.map((f) => f.note), ...g.tips, ...g.faqs.map((f) => f.a)]
    .join(" ")
    .split(/\s+/).length;
  const minutes = Math.max(3, Math.round(words / 230));
  const updated = new Date(`${UPDATED}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  const place = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: g.name,
    description: g.overview[0],
    url: absolute(`/destinations/${g.slug}`),
    image: absolute(`/destinations/${g.slug}/photo?w=1200&h=630`),
    containedInPlace: { "@type": "State", name: g.state, containedInPlace: { "@type": "Country", name: "India" } },
    touristType: ["Couples", "Friends", "Solo travellers", "Families"],
    includesAttraction: g.attractions.map((a) => ({
      "@type": "TouristAttraction",
      name: a.name,
      description: a.description,
      geo: { "@type": "GeoCoordinates", latitude: a.lat, longitude: a.lng },
    })),
  };

  return (
    <PublicShell
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Destinations", href: "/destinations" },
        { name: g.name, href: `/destinations/${g.slug}` },
      ]}
    >
      <JsonLd
        data={[
          place,
          faqPage(g.faqs),
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Destinations", path: "/destinations" },
            { name: g.name, path: `/destinations/${g.slug}` },
          ]),
        ]}
      />
      <article className="container-x pb-24 pt-4">
        <GuideCover
          destination={g.destination}
          landscape={g.landscape}
          width={2000}
          src={`/destinations/${g.slug}/photo?w=2000`}
          alt={`${g.name}, ${g.state}`}
          priority
          className="min-h-[32rem] rounded-panel sm:min-h-[34rem] lg:h-[min(76svh,42rem)] lg:min-h-0"
        >
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/45 to-transparent" />
          <header className="absolute inset-x-0 bottom-0 p-6 pb-8 text-paper sm:p-10 sm:pb-12">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/35 px-3 py-1.5 text-xs text-paper ring-1 ring-white/25">
                <MapPin className="duo-paper size-3.5" /> {g.state}, India
              </span>
              {inSeason && (
                <span className="inline-flex items-center gap-2 rounded-full bg-sun-2 px-3 py-1.5 text-xs font-medium text-ink shadow-lg">
                  <span className="inline-flex size-2 rounded-full bg-ink" />
                  Best in {MONTH_NAMES[month - 1]}
                </span>
              )}
            </div>
            <p className="eyebrow text-paper/70">Travel guide</p>
            <h1 className="display mt-4 text-[clamp(2.5rem,6.4vw,5rem)] leading-[0.96] tracking-[-0.03em]">
              {g.name} <span className="text-brand-2">travel guide</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-paper/85 sm:text-xl">{g.tagline}</p>
          </header>
        </GuideCover>

        <FactStrip
          className="mt-6"
          facts={[
            { icon: CalendarDays, label: "Best time", value: bestMonths(g) || "Year round" },
            { icon: Coins, label: "A day, mid-range", value: midRange ? midRange.perDay : "See budgets" },
            { icon: Navigation, label: "Getting there", value: modes.join(" · ") || "By road" },
            { icon: Route, label: "Ready-made trips", value: cards.length ? `${cards.length} ${cards.length === 1 ? "itinerary" : "itineraries"}` : "Plan your own" },
          ]}
        />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="flex items-center gap-3 text-sm text-stone">
            <span className="grid size-8 place-items-center rounded-full bg-ink font-mono text-[10px] text-paper">{COMPANY.founder.initials}</span>
            <span>
              By{" "}
              <Link href="/about" className="text-ink underline decoration-line-strong underline-offset-4 hover:text-brand">
                {COMPANY.founder.name}
              </Link>{" "}
              · Updated <time dateTime={UPDATED}>{updated}</time> · {minutes} min read
            </span>
          </p>
          <ShareTrip path={`/destinations/${g.slug}`} title={`${g.name} travel guide`} />
        </div>

        <div className="mt-14 max-w-3xl">
          <p className="display text-[clamp(1.4rem,2.5vw,1.85rem)] leading-[1.32] tracking-[-0.01em] text-ink">{lead}</p>
          {overview.map((p) => (
            <p key={p.slice(0, 24)} className="mt-5 text-[1.0625rem] leading-relaxed text-stone sm:text-lg">
              {p}
            </p>
          ))}
          <div className="mt-8 flex flex-wrap gap-3">
            <PillLink href={plan}>Plan my {g.name} trip free</PillLink>
            {cards[0] && (
              <PillLink href={`/itineraries/${cards[0].slug}`} variant="outline">
                See a ready-made itinerary
              </PillLink>
            )}
          </div>
        </div>

        <ChapterNav chapters={chapters} title={`${g.name} guide`} className="top-3 mt-14" />

        <div className="mt-14 grid gap-16 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-24">
            <Section id="best-time" kicker="When to go" title={`Best time to visit ${g.name}`} intro={g.bestTime.summary}>
              {year && (
                <div>
                  <ol aria-label="Month by month" className="grid grid-cols-6 gap-1 sm:grid-cols-12">
                    {year.map((r, i) => (
                      <li
                        key={MONTHS[i]}
                        className={cn("grid h-10 place-items-center rounded-md text-xs font-medium", r ? RATING[r].cell : "bg-paper-2/60 text-stone-2", i + 1 === month && "ring-2 ring-brand ring-offset-2 ring-offset-paper")}
                      >
                        {MONTHS[i]}
                        <span className="sr-only">: {r ? RATING[r].label : "no note"}</span>
                      </li>
                    ))}
                  </ol>
                  <p aria-hidden className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone">
                    {(["best", "good", "avoid"] as const).map((r) => (
                      <span key={r} className="inline-flex items-center gap-1.5">
                        <span className={cn("size-2.5 rounded-sm", RATING[r].cell)} /> {RATING[r].label}
                      </span>
                    ))}
                  </p>
                </div>
              )}
              <dl className="mt-8 divide-y divide-line border-y border-line">
                {g.bestTime.months.map((m) => (
                  <div key={m.label} className="grid gap-1 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
                    <dt className="text-ink">
                      {m.label} <span className={cn("ml-1 text-xs uppercase tracking-[0.12em]", RATING[m.rating].word)}>{RATING[m.rating].label}</span>
                    </dt>
                    <dd className="leading-relaxed text-stone">{m.note}</dd>
                  </div>
                ))}
              </dl>
            </Section>

            <Section id="getting-there" kicker="Getting there" title={`How to reach ${g.name}`}>
              <dl className="divide-y divide-line border-y border-line">
                {g.gettingThere.map((t) => {
                  const Icon = MODE_ICON[t.mode] ?? Navigation;
                  return (
                    <div key={t.mode} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 py-5 sm:grid-cols-[2.25rem_9rem_minmax(0,1fr)] sm:gap-5">
                      <Icon className="mt-0.5 size-5 text-stone" />
                      <dt className="font-medium text-ink">{t.mode}</dt>
                      <dd className="col-start-2 leading-relaxed text-stone sm:col-start-3">{t.detail}</dd>
                    </div>
                  );
                })}
              </dl>
            </Section>

            <Section id="where-to-stay" kicker="Where to stay" title={`Where to stay in ${g.name}`}>
              <ul className="grid gap-x-5 gap-y-9 sm:grid-cols-2">
                {g.whereToStay.map((s) => (
                  <li key={s.area}>
                    <div className={cn(CARD_PHOTO, "aspect-[16/10]")}>
                      <GuidePhoto name={s.area} city={g.name} />
                    </div>
                    <h3 className="display mt-3.5 text-[1.25rem] leading-tight text-ink">{s.area}</h3>
                    <p className="mt-1.5 leading-relaxed text-stone">{s.why}</p>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="top-sights" kicker="What to see" title={`Top things to do in ${g.name}`}>
              <SightsMap sights={g.attractions} city={g.destination} className="mb-10 aspect-[16/9]" />
              <ol className="grid gap-x-6 gap-y-12 sm:grid-cols-2">
                {g.attractions.map((a, i) => (
                  <li key={a.name} className="flex flex-col">
                    <div className={cn(CARD_PHOTO, "aspect-[4/3]")}>
                      <GuidePhoto name={a.name} city={g.name} />
                    </div>
                    <p className="mt-4 font-mono text-xs text-stone">{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="display mt-1 text-[1.35rem] leading-tight text-ink">{a.name}</h3>
                    <p className="mt-2 leading-relaxed text-stone">{a.description}</p>
                    <p className="mt-3 flex gap-2.5 text-[0.95rem] leading-relaxed text-ink">
                      <Lightbulb className="mt-1 size-4 shrink-0 text-brand" />
                      <span>{a.tip}</span>
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${a.lat},${a.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 self-start text-sm text-ink underline decoration-line underline-offset-4 transition-colors hover:text-brand"
                    >
                      Open in Maps <ArrowUpRight className="size-3.5" />
                    </a>
                  </li>
                ))}
              </ol>
            </Section>

            <Section id="food" kicker="What to eat" title={`What to eat in ${g.name}`}>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 xl:grid-cols-3">
                {g.food.map((f) => (
                  <li key={f.name}>
                    <div className={cn(CARD_PHOTO, "aspect-[4/3]")}>
                      <GuidePhoto name={f.name} city={g.name} kind="dish" />
                    </div>
                    <h3 className="mt-3 text-[1.05rem] font-medium leading-snug text-ink">{f.name}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-stone">{f.note}</p>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="budget" kicker="What it costs" title={`${g.name} trip cost per day`} intro="Per person, per day, before getting there.">
              <dl className="grid gap-px border-y border-line bg-line sm:grid-cols-3">
                {g.budget.map((b, i) => (
                  <div key={b.style} className={cn("bg-paper py-6 sm:px-6", i === 0 && "sm:pl-0")}>
                    <dt className="flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-stone">
                      {b.style}
                      {b === midRange && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[0.6rem] tracking-[0.08em] text-brand">Most people</span>}
                    </dt>
                    <dd className="mt-2">
                      <span className="display block text-[1.7rem] leading-none text-ink">{b.perDay}</span>
                      <span className="mt-3 block text-sm leading-relaxed text-stone">{b.note}</span>
                    </dd>
                  </div>
                ))}
              </dl>
              <h3 className="mt-12 text-lg font-medium text-ink">Good to know</h3>
              <ol className="mt-4 grid gap-x-10 gap-y-6 sm:grid-cols-2">
                {g.tips.map((t, i) => (
                  <li key={t} className="border-t border-line pt-4">
                    <span className="font-mono text-xs text-stone">{String(i + 1).padStart(2, "0")}</span>
                    <p className="mt-1.5 leading-relaxed text-ink">{t}</p>
                  </li>
                ))}
              </ol>
            </Section>

            {facts && (
              <Section id="essentials" kicker="Before you go" title={`Know before you go: ${g.name}`}>
                <Essentials facts={facts} place={g.name} />
              </Section>
            )}

            {cards.length > 0 && (
              <Section id="itineraries" kicker="Ready-made" title={`${g.name} itineraries, planned for you`} intro="Every stop with timings, a map and costs. Open one free, follow it as it is, or make it yours.">
                <ul className="grid gap-x-5 gap-y-10 sm:grid-cols-2">
                  {cards.map((pkg, i) => (
                    <li key={pkg.slug}>
                      <PackageCard pkg={pkg} index={i} hook />
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <Section id="faq" kicker="Good questions" title={`${g.name} travel FAQs`}>
              <FaqList faqs={g.faqs} />
            </Section>
          </div>

          <aside className="hidden lg:block" aria-label="Plan it">
            <div className="sticky top-24 space-y-10">
              <div>
                <p className="eyebrow text-brand">At a glance</p>
                <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
                  {(
                    [
                      ["State", g.state],
                      ["Best time", bestMonths(g) || "Year round"],
                      ["A day, mid-range", midRange?.perDay ?? "See budgets"],
                      ["Getting there", modes.join(" · ") || "By road"],
                    ] as const
                  ).map(([label, value]) => (
                    <div key={label} className="flex items-baseline justify-between gap-4 py-3">
                      <dt className="text-stone">{label}</dt>
                      <dd className="text-right text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <p className="leading-relaxed text-ink">Tell GoRoam your dates, budget and crew, and get a day-by-day {g.name} plan in under a minute.</p>
                <PillLink href={plan} className="mt-4">
                  Plan it free
                </PillLink>
              </div>
              {cards.length > 0 && (
                <div>
                  <p className="eyebrow text-stone">Ready-made itineraries</p>
                  <ul className="mt-3 space-y-2.5 text-sm">
                    {cards.map((c) => (
                      <li key={c.slug}>
                        <Link href={`/itineraries/${c.slug}`} prefetch={false} className="text-ink underline decoration-line underline-offset-4 transition-colors hover:text-brand">
                          {c.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>

        {(nearby.length > 0 || adventures.length > 0) && (
          <section aria-labelledby="nearby-h" className="mt-28">
            <SectionHead
              id="nearby-h"
              kicker="Nearby"
              title={`More of ${g.state}`}
              intro="Trips and adventures in the same part of India, each with a full plan."
              action={{ href: "/destinations#india", label: "Every place in India" }}
            />
            <ul className="mt-9 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {adventures.map((a) => (
                <li key={a.slug}>
                  <AdventureCard a={a} sizes="(min-width: 1280px) 300px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
                </li>
              ))}
              {nearby.slice(0, Math.max(0, 4 - adventures.length)).map((t) => (
                <li key={t.slug}>
                  <TripCard t={t} sizes="(min-width: 1280px) 300px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="more-h" className="mt-24">
          <SectionHead id="more-h" kicker="Keep exploring" title="More destination guides" action={{ href: "/destinations", label: `All ${DESTINATION_GUIDES.length} guides` }} />
          <ul className="mt-9 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug}>
                <GuideCard g={o} />
              </li>
            ))}
          </ul>
        </section>
      </article>
      <CreateYoursBar href={plan} place={g.name} source="guide" />
    </PublicShell>
  );
}
