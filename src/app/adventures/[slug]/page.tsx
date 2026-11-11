import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ChapterNav, type Chapter } from "@/components/itinerary/chapter-nav";
import { AdventureCard, adventurePhoto } from "@/components/seo/adventure-card";
import { Glance, HeroSights, PackingTiles, PhotoBreak, RouteLine, SightsMosaic } from "@/components/seo/adventure-parts";
import { CreateYoursBar } from "@/components/seo/create-yours";
import { GuideCover } from "@/components/seo/guide-media";
import { FaqList, PublicShell } from "@/components/seo/public-shell";
import { FactStrip } from "@/components/site/fact-strip";
import { AlertCircle, CalendarDays, Clock3, Coins, Compass, Dumbbell, MapPin } from "@/components/site/icons";
import { PillLink } from "@/components/site/pill";
import { SectionHead } from "@/components/site/section-head";
import { TripGallery, type GallerySlide } from "@/components/trip/gallery";
import { ShareTrip } from "@/components/trip/share-trip";
import { adventureSights } from "@/lib/adventure-sights";
import { ADVENTURES, KIND_LABEL, adventureBySlug, adventureFaqs, adventureName, daysText, monthsLong, monthsText, relatedAdventures, usd, type Adventure, type AdventureKind } from "@/lib/adventures";
import { COMPANY } from "@/lib/company";
import type { DestinationGuide } from "@/lib/destination-guides";
import { plannerHref } from "@/lib/prompt-parse";
import { JsonLd, absolute, breadcrumbs, faqPage } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const dynamicParams = false;
export const generateStaticParams = () => ADVENTURES.map((a) => ({ slug: a.slug }));

const YEAR = 2026;
// When the adventure guides were last checked; shown as "Updated" and in the structured data.
const UPDATED = "2026-11-08";
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "Ha Giang Loop Guide: Route…" → "Ha Giang Loop Guide (2026): Route…". */
const seoTitle = (a: Adventure) => (a.seoTitle.includes(":") ? a.seoTitle.replace(":", ` (${YEAR}):`) : `${a.seoTitle} (${YEAR})`);

// The illustration the hero shows while (or if) there's no photo.
const SCENE: Record<AdventureKind, DestinationGuide["landscape"]> = {
  hitchhike: "mountains",
  motorbike: "mountains",
  trek: "mountains",
  overland: "desert",
  cycle: "forest",
  boat: "coast",
  dive: "coast",
  jungle: "forest",
  volcano: "mountains",
  horse: "lakes",
  rail: "mountains",
  climb: "mountains",
  raft: "river",
  surf: "coast",
  fly: "lakes",
  desert: "desert",
};

const TIERS: [string, string][] = [
  ["Shoestring", "Dorms and homestays, local food, buses and shared rides."],
  ["Mid-range", "Private rooms, a guide or tour for the big days, the odd taxi."],
  ["Comfortable", "Good hotels, private transport and guided days throughout."],
];

/** A step's short name, for structured data: its first clause. */
const stepName = (s: string) => {
  const head = s.split(/[:(;]|, then | \(/)[0].replace(/[.,]\s*$/, "").trim();
  return head.length > 90 ? `${head.slice(0, 87).trimEnd()}…` : head;
};

function Section({ id, kicker, title, intro, children }: { id: string; kicker: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28" aria-labelledby={`${id}-h`}>
      <SectionHead id={`${id}-h`} kicker={kicker} title={title} intro={intro} className="reveal" />
      <div className="mt-9">{children}</div>
    </section>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = adventureBySlug((await params).slug);
  if (!a) return {};
  const title = seoTitle(a);
  const image = `/adventures/${a.slug}/photo?w=1200&h=630`;
  return {
    title,
    description: a.description,
    alternates: { canonical: `/adventures/${a.slug}` },
    openGraph: { title, description: a.description, type: "article", url: `/adventures/${a.slug}`, modifiedTime: UPDATED, images: [{ url: image, width: 1200, height: 630, alt: `${a.title}, ${a.country}` }] },
    twitter: { card: "summary_large_image", title, description: a.description, images: [image] },
  };
}

export default async function AdventurePage({ params }: { params: Promise<{ slug: string }> }) {
  const a = adventureBySlug((await params).slug);
  if (!a) notFound();
  const name = adventureName(a);
  const faqs = adventureFaqs(a);
  const related = relatedAdventures(a, 3);
  const month = new Date().getMonth() + 1;
  const inSeason = a.months.includes(month);
  const plan = plannerHref({ destination: a.place, days: Math.min(a.days[0], 14), interests: [], diet: [], notes: `${a.title}: ${a.tagline}` });
  const onGround: [number, number] = [a.budget[0] * a.days[0], a.budget[1] * a.days[1]];
  const sights = adventureSights(a);

  // Every photo on the page, in order, for the full-screen viewer: the adventure's own, then its sights.
  const slides: GallerySlide[] = [
    { kind: "trip", name: a.title, caption: `${a.title}, ${a.country}`, src: `/adventures/${a.slug}/photo?w=1600&blank=1` },
    ...sights.map((x, i) => ({ kind: "trip" as const, name: x.name, caption: x.name, note: x.note, src: adventurePhoto(a.slug, 1600, i) })),
  ];

  const chapters: Chapter[] = [
    { id: "why", label: "Why go" },
    ...(sights.length ? [{ id: "sights", label: "What you'll see" }] : []),
    { id: "how", label: "How to do it" },
    { id: "route", label: "The route" },
    { id: "costs", label: "Costs" },
    { id: "pack", label: "Packing" },
    { id: "safety", label: "Safety" },
    { id: "entry", label: "Visa & travel" },
    { id: "tips", label: "Tips" },
    { id: "faq", label: "FAQ" },
  ];
  const words = [a.why, a.season, ...a.steps, ...a.route.flat(), ...a.safety, a.visa, a.getThere, a.getAround, ...a.tips, ...faqs.map((f) => f.a)].join(" ").split(/\s+/).length;
  const minutes = Math.max(3, Math.round(words / 230));
  const updated = new Date(`${UPDATED}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  const url = absolute(`/adventures/${a.slug}`);
  const image = absolute(`/adventures/${a.slug}/photo?w=1200&h=630`);
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: a.title,
      description: a.description,
      url,
      image,
      touristType: ["Backpackers", "Adventure travellers"],
      itinerary: {
        "@type": "ItemList",
        numberOfItems: a.route.length,
        itemListElement: a.route.map(([stage, detail], i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "TouristAttraction", name: stage, description: detail } })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: `${a.title}: how to do it`,
      description: a.why,
      image,
      totalTime: `P${a.days[0]}D`,
      estimatedCost: { "@type": "MonetaryAmount", currency: "USD", minValue: onGround[0], maxValue: onGround[1] },
      supply: a.gear.map((g) => ({ "@type": "HowToSupply", name: g })),
      step: a.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: stepName(s), text: s, url: `${url}#how` })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: seoTitle(a),
      description: a.description,
      image,
      dateModified: UPDATED,
      author: { "@type": "Person", name: COMPANY.founder.name, url: absolute("/about") },
      publisher: { "@type": "Organization", name: "GoRoam", url: absolute("/") },
      mainEntityOfPage: url,
    },
    faqPage(faqs),
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Adventures", path: "/adventures" },
      { name: a.title, path: `/adventures/${a.slug}` },
    ]),
  ];

  return (
    <PublicShell
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Adventures", href: "/adventures" },
        { name: a.title, href: `/adventures/${a.slug}` },
      ]}
    >
      <JsonLd data={data} />
      <div className="container-x pb-24 pt-4">
        <section aria-label={`${a.title} at a glance`} className="grid gap-3 lg:h-[min(80svh,46rem)] lg:grid-cols-[minmax(0,1fr)_19rem]">
          <GuideCover
            destination={a.place}
            landscape={SCENE[a.kind]}
            width={2000}
            src={`/adventures/${a.slug}/photo?w=2000`}
            alt={`${a.title}, ${a.country}`}
            priority
            drift
            className="min-h-[32rem] rounded-panel sm:min-h-[34rem] lg:h-full lg:min-h-0"
          >
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/45 to-transparent" />
            <div className="absolute left-5 top-5 z-[2] sm:left-8 sm:top-8">
              <TripGallery slides={slides} city={a.place} title={a.title} />
            </div>
            <header className="absolute inset-x-0 bottom-0 p-6 pb-8 text-paper sm:p-10 sm:pb-12">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/35 px-3 py-1.5 text-xs text-paper ring-1 ring-white/25">
                  <MapPin className="duo-paper size-3.5" /> {a.country} · {a.area}
                </span>
                {inSeason && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-sun-2 px-3 py-1.5 text-xs font-medium text-ink shadow-lg">
                    <span className="inline-flex size-2 rounded-full bg-ink" />
                    In season in {MONTH_NAMES[month - 1]}
                  </span>
                )}
              </div>
              <p className="eyebrow text-paper/70">
                {KIND_LABEL[a.kind]} · {daysText(a)}
              </p>
              <h1 className="display mt-4 max-w-3xl text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.96] tracking-[-0.03em]">{a.title}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-paper/85 sm:text-xl">{a.tagline}</p>
            </header>
          </GuideCover>
          <HeroSights a={a} sights={sights} />
        </section>

        <FactStrip
          className="mt-6"
          facts={[
            { icon: Compass, label: "Kind", value: KIND_LABEL[a.kind] },
            { icon: Dumbbell, label: "Difficulty", value: a.difficulty },
            { icon: Clock3, label: "Time needed", value: daysText(a) },
            { icon: Coins, label: "Daily budget", value: `${usd(a.budget[0])}–${usd(a.budget[2])}` },
            { icon: CalendarDays, label: "Best months", value: monthsText(a.months) },
            { icon: MapPin, label: "Where", value: a.country },
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
          <ShareTrip path={`/adventures/${a.slug}`} title={`${a.title}: how to do it`} />
        </div>

        <ChapterNav chapters={chapters} title={a.title} className="top-3 mt-6" />

        <div className="mt-14 grid gap-16 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-24">
            <section id="why" className="scroll-mt-28" aria-label="Why go">
              <p className="eyebrow text-brand">Why go</p>
              <p className="display mt-5 max-w-3xl text-[clamp(1.45rem,2.6vw,1.95rem)] leading-[1.3] tracking-[-0.01em] text-ink">{a.why}</p>
              <div className="mt-10">
                <Glance a={a} />
              </div>
              <div className="mt-10 max-w-3xl">
                <ol aria-label={`Best months: ${monthsLong(a.months)}`} className="grid grid-cols-12 gap-1">
                  {MONTHS.map((m, i) => {
                    const good = a.months.includes(i + 1);
                    return (
                      <li
                        key={i}
                        title={`${MONTH_NAMES[i]}${good ? ": a good month" : ""}`}
                        className={cn(
                          "grid h-10 place-items-center rounded-md text-xs font-medium",
                          good ? "bg-ink text-paper" : "bg-paper-2 text-stone",
                          i + 1 === month && "ring-2 ring-brand ring-offset-2 ring-offset-paper"
                        )}
                      >
                        {m}
                      </li>
                    );
                  })}
                </ol>
                <p className="mt-4 leading-relaxed text-stone">
                  <span className="font-medium text-ink">Best months: {monthsLong(a.months)}.</span> {a.season}
                </p>
              </div>
              <div className="mt-10 rounded-[1.25rem] bg-paper-2 p-6 lg:hidden">
                <p className="text-ink">Want it planned for you? GoRoam builds a day-by-day plan with stays and costs in about a minute.</p>
                <PillLink href={plan} className="mt-4">
                  Plan this trip free
                </PillLink>
              </div>
            </section>

            {sights.length > 0 && (
              <Section id="sights" kicker="What you'll see" title="Highlights along the way" intro="The places that make the trip. Open any photo to see it full screen.">
                <SightsMosaic a={a} sights={sights} />
              </Section>
            )}

            <Section id="how" kicker="Step by step" title="How to do it">
              <ol className="divide-y divide-line border-y border-line">
                {a.steps.map((s, i) => (
                  <li key={i} className="reveal grid grid-cols-[2.75rem_minmax(0,1fr)] gap-4 py-5 sm:grid-cols-[3.5rem_minmax(0,1fr)]">
                    <span className="display text-2xl leading-none tabular-nums text-brand">{String(i + 1).padStart(2, "0")}</span>
                    <p className="leading-relaxed text-ink">{s}</p>
                  </li>
                ))}
              </ol>
            </Section>

            <Section id="route" kicker="The route" title="Stage by stage" intro={`Plan on ${daysText(a)}. The usual way it goes:`}>
              <RouteLine route={a.route} />
            </Section>

            <PhotoBreak a={a} sights={sights} />

            <Section
              id="costs"
              kicker="Money"
              title="What it costs"
              intro={`Per person a day, in US dollars, before flights. ${daysText(a)} on the ground comes to roughly ${usd(onGround[0])}–${usd(onGround[1])}.`}
            >
              <dl className="grid gap-px border-y border-line bg-line sm:grid-cols-3">
                {TIERS.map(([tier, what], i) => (
                  <div key={tier} className={cn("bg-paper py-6 sm:px-6", i === 0 && "sm:pl-0")}>
                    <dt className="text-[0.7rem] font-medium uppercase tracking-[0.12em] text-stone">{tier}</dt>
                    <dd className="mt-2">
                      <span className="display text-[2rem] leading-none tabular-nums text-ink">
                        {usd(a.budget[i])}
                        {i === 2 && "+"}
                      </span>
                      <span className="ml-1 text-sm text-stone">a day</span>
                      <span className="mt-2 block text-sm leading-relaxed text-stone">{what}</span>
                    </dd>
                  </div>
                ))}
              </dl>
              <table className="mt-10 w-full text-left text-[0.95rem]">
                <caption className="sr-only">Typical prices for {name}</caption>
                <thead>
                  <tr className="border-b border-line-strong text-[0.7rem] uppercase tracking-[0.12em] text-stone">
                    <th scope="col" className="pb-3 font-medium">
                      What
                    </th>
                    <th scope="col" className="pb-3 text-right font-medium">
                      Typical price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {a.costs.map(([item, cost]) => (
                    <tr key={item}>
                      <th scope="row" className="py-3.5 pr-6 font-normal text-ink">
                        {item}
                      </th>
                      <td className="py-3.5 text-right tabular-nums text-ink">{cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-xs text-stone">Prices are rough guides for {YEAR}, rounded to the nearest dollar; local prices move with exchange rates.</p>
            </Section>

            <Section id="pack" kicker="Packing" title="What to bring">
              <PackingTiles gear={a.gear} />
            </Section>

            <Section id="safety" kicker="Safety" title="Staying safe">
              <ul className="space-y-5">
                {a.safety.map((s) => (
                  <li key={s} className="flex gap-3.5 leading-relaxed text-ink">
                    <AlertCircle className="mt-0.5 size-5 shrink-0 text-stone" />
                    <span className="max-w-3xl">{s}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 max-w-3xl border-t border-line pt-5 text-sm leading-relaxed text-stone">
                Read your government&apos;s advice for {a.country} before you book: the US State Department, the UK Foreign Office, Australia&apos;s Smartraveller or your
                EU country&apos;s foreign ministry. Insurers follow it, so check your policy covers where you&apos;re going and what you&apos;ll do there.
              </p>
            </Section>

            <Section id="entry" kicker="Visa & travel" title="Entry, getting there and around">
              <dl className="divide-y divide-line border-y border-line">
                {(
                  [
                    ["Visa and entry", a.visa],
                    ["Getting there", a.getThere],
                    ["Getting around", a.getAround],
                  ] as const
                ).map(([label, text]) => (
                  <div key={label} className="grid gap-2 py-6 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8">
                    <dt className="font-medium text-ink">{label}</dt>
                    <dd className="max-w-3xl leading-relaxed text-stone">{text}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs text-stone">Entry notes are for US, EU, UK and Australian passports, checked for {YEAR}. Rules change: confirm on the official immigration site before you fly.</p>
            </Section>

            <Section id="tips" kicker="From the road" title="Tips worth knowing">
              <ol className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
                {a.tips.map((tip, i) => (
                  <li key={tip} className="reveal border-t border-line pt-4">
                    <span className="font-mono text-xs text-stone">{String(i + 1).padStart(2, "0")}</span>
                    <p className="mt-2 leading-relaxed text-ink">{tip}</p>
                  </li>
                ))}
              </ol>
            </Section>

            <Section id="faq" kicker="Questions" title={`${a.title}: your questions`}>
              <FaqList faqs={faqs} />
            </Section>
          </div>

          <aside className="hidden lg:block" aria-label="Plan it">
            <div className="sticky top-24 space-y-10">
              <div>
                <p className="eyebrow text-brand">At a glance</p>
                <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
                  {(
                    [
                      ["Region", a.area],
                      ["Difficulty", a.difficulty],
                      ["Time needed", daysText(a)],
                      ["Shoestring", `${usd(a.budget[0])} a day`],
                      ["Best months", monthsText(a.months)],
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
                <p className="leading-relaxed text-ink">Want it planned for you? GoRoam builds a day-by-day plan with stays and costs in about a minute.</p>
                <PillLink href={plan} className="mt-4">
                  Plan this trip free
                </PillLink>
              </div>
              <div>
                <p className="eyebrow text-stone">Like this</p>
                <ul className="mt-3 space-y-2.5 text-sm">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/adventures/${r.slug}`} prefetch={false} className="text-ink underline decoration-line underline-offset-4 transition-colors hover:text-brand">
                        {r.title}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/adventures" prefetch={false} className="text-stone transition-colors hover:text-brand">
                      All {ADVENTURES.length} adventures →
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>

        <section aria-labelledby="more-h" className="mt-28">
          <SectionHead id="more-h" kicker="Keep exploring" title="More adventures like this" action={{ href: "/adventures", label: `All ${ADVENTURES.length} adventures` }} />
          <ul className="mt-9 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug}>
                <AdventureCard a={r} hook />
              </li>
            ))}
          </ul>
        </section>
      </div>
      <CreateYoursBar href={plan} place={a.place.split(",")[0]} days={Math.min(a.days[0], 14)} source="adventure" />
    </PublicShell>
  );
}
