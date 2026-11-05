import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChapterNav, type Chapter } from "@/components/itinerary/chapter-nav";
import { CreateYoursBar } from "@/components/seo/create-yours";
import { GuideCover, GuidePhoto } from "@/components/seo/guide-media";
import { FaqList, PublicShell } from "@/components/seo/public-shell";
import { TripCard } from "@/components/seo/trip-card";
import { ArrowRight, ArrowUpRight, BedDouble, Check, Lightbulb, MapPin, Navigation, Sparkles, Stamp } from "@/components/site/icons";
import { PillLink } from "@/components/site/pill";
import { BudgetPlanner } from "@/components/trip/budget-planner";
import { CompareTrips, type CompareRow } from "@/components/trip/compare-trips";
import { Insider, Nearby, RealPrices, StayAreas } from "@/components/trip/deep-sections";
import { Essentials } from "@/components/trip/essentials";
import { GalleryOpen, type GallerySlide } from "@/components/trip/gallery";
import { PackList, type PackGroup } from "@/components/trip/pack-list";
import { PlanSteps, type PlanStep } from "@/components/trip/plan-steps";
import { SeasonBar } from "@/components/trip/season-bar";
import { ShareTrip } from "@/components/trip/share-trip";
import { TripHero, idealFor } from "@/components/trip/trip-hero";
import { VibeScores } from "@/components/trip/vibe-scores";
import { mapsSearchUrl, stayPartners } from "@/lib/booking";
import { COMPANY } from "@/lib/company";
import { factsFor, type CountryFacts } from "@/lib/country-facts";
import { guideBySlug } from "@/lib/destination-guides";
import { PACKAGES } from "@/lib/packages";
import { plannerHref } from "@/lib/prompt-parse";
import { JsonLd, absolute, breadcrumbs, faqPage } from "@/lib/seo";
import { deepFor } from "@/lib/trip-deep";
import { daysFor } from "@/lib/trip-days";
import { fromCities } from "@/lib/trip-hubs";
import { TRIP_IDEAS, firstSentence, placeLabel, price, monthsLabel, relatedTrips, stayAt, tripBySlug, tripFaqs, tripTotal, type TripIdea } from "@/lib/trip-ideas";
import { extraFor } from "@/lib/trip-ideas-extra";
import { rankSentence } from "@/lib/trip-index";
import { VIBES, vibeVerdict, vibesFor } from "@/lib/trip-vibes";
import { cn } from "@/lib/utils";

/** What to pack, from the kind of trip it is and where it is, in the groups people pack by. */
function packing(t: TripIdea, facts: CountryFacts | null): PackGroup[] {
  const has = (x: TripIdea["tags"][number]) => t.tags.includes(x);
  const docs = [t.country === "India" ? "ID (Aadhaar or licence)" : "Passport, plus a visa if you need one"];
  if (has("abroad")) docs.push("A forex card or some local cash", "Travel insurance documents");
  const tech = ["Power bank and charging cables", ...(facts && t.country !== "India" ? [`A plug adapter if yours aren't type ${facts.plugs.split(" · ")[0]}`] : []), "Offline maps downloaded"];
  const clothes: string[] = [];
  if (has("snow")) clothes.push("Thermals, gloves and a woollen cap", "Waterproof boots");
  if (has("hills")) clothes.push("Warm layers for the evenings");
  if (has("beach")) clothes.push("Swimwear and flip-flops");
  if (has("desert")) clothes.push("A warm layer for desert nights");
  if (has("heritage") || has("festival")) clothes.push("Clothes that cover shoulders and knees for temples");
  if (has("wildlife")) clothes.push("Muted, earth-coloured clothes");
  clothes.push("Comfortable walking shoes");
  const health = [...(has("beach") ? ["Reef-safe sunscreen and sunglasses"] : []), ...(has("adventure") ? ["A small first-aid kit"] : []), "A reusable water bottle"];
  const extra = [...(has("desert") ? ["A scarf for sun and sand"] : []), ...(has("wildlife") ? ["Binoculars"] : [])];
  return [
    { name: "Documents & money", items: docs },
    { name: "Tech", items: tech },
    { name: "Clothes", items: clothes },
    { name: "Sun & health", items: health },
    { name: `For ${t.name}`, items: extra },
  ].filter((g) => g.items.length);
}

export const dynamicParams = false;
export const generateStaticParams = () => TRIP_IDEAS.map((t) => ({ slug: t.slug }));
// "In season now" and the month marker follow the calendar, so rebuild daily.
export const revalidate = 86400;

const YEAR = 2026;
// When the trip pages' content last changed; shown as "Updated" and in the structured data.
const UPDATED = "2026-11-05";
// A flagship guide can set its own, where search data shows the words people use for the place.
const title = (t: TripIdea) => deepFor(t.slug)?.title ?? `${t.name} Trip: ${t.days} Days Itinerary, Budget & Hotels (${YEAR})`;
const blurb = (t: TripIdea) =>
  deepFor(t.slug)?.description ??
  `Planning a ${t.days}-day trip to ${t.name}? A day-by-day itinerary, what it costs (from ${price(t, t.budget[0])} a day), where to stay and the best time to go (${monthsLabel(t.months)}).`;

const photoAlt = (t: TripIdea) => `${t.name}, ${placeLabel(t)}`;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = tripBySlug((await params).slug);
  if (!t) return {};
  return {
    title: title(t),
    description: blurb(t),
    alternates: { canonical: `/trips/${t.slug}` },
    openGraph: { title: title(t), description: blurb(t), type: "article", url: `/trips/${t.slug}`, modifiedTime: UPDATED, images: [{ url: `/trips/${t.slug}/photo?w=1200&h=630`, width: 1200, height: 630, alt: photoAlt(t) }] },
    twitter: { card: "summary_large_image", title: title(t), description: blurb(t), images: [`/trips/${t.slug}/photo?w=1200&h=630`] },
  };
}

// Words in highlight names too common to tie a day to one of them.
const COMMON = new Set(["beach", "beaches", "island", "islands", "temple", "temples", "market", "river", "falls", "valley", "national", "village", "sunset", "sunrise", "tour", "lagoon", "gardens", "garden", "palace", "museum", "old", "town", "city", "park", "lake"]);

// A stay written as a kind of place ("Guesthouses near the lake") is searched by its area instead.
const GENERIC = /\b(guesthouses|hostels|homestays|huts|cottages|stays|lodges|camps|resorts|villas|hotels|ships|houses)\b/i;
const TIER = { Budget: "bg-emerald-50 text-emerald-700", "Mid-range": "bg-brand-soft text-brand", Luxury: "bg-sun-soft text-ink" } as const;
const TIER_BAR = { Budget: "bg-emerald-500", "Mid-range": "bg-brand", Luxury: "bg-sun" } as const;

/** Highlights on a 6-column grid: the first full width, the rest in thirds, with any odd ones out spread to fill the row. */
function highlightSpan(i: number, n: number) {
  if (i === 0) return "sm:col-span-6";
  const rest = n - 1;
  const left = rest % 3;
  const fromEnd = n - 1 - i;
  if (left === 1 && fromEnd === 0) return "sm:col-span-6";
  if (left === 2 && fromEnd < 2) return "sm:col-span-3";
  return "sm:col-span-2";
}

function Section({ id, n, eyebrow, heading, intro, children }: { id: string; n: number; eyebrow: string; heading: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28" aria-labelledby={`${id}-h`}>
      <p className="flex items-center gap-3 text-brand">
        <span className="font-mono text-xs text-stone-2">{String(n).padStart(2, "0")}</span>
        <span aria-hidden className="h-px w-8 bg-brand/30" />
        <span className="eyebrow">{eyebrow}</span>
      </p>
      <h2 id={`${id}-h`} className="display mt-3 text-[clamp(1.75rem,3.2vw,2.4rem)] leading-[1.06] tracking-[-0.02em] text-ink">
        {heading}
      </h2>
      {intro && <p className="mt-3 max-w-2xl leading-relaxed text-stone">{intro}</p>}
      <div className="mt-7">{children}</div>
    </section>
  );
}

export default async function TripIdeaPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = tripBySlug((await params).slug);
  if (!t) notFound();
  const plan = plannerHref({ destination: t.destination, days: t.days, interests: [], diet: [], notes: "" });
  const extra = extraFor(t.slug);
  const days = daysFor(t.slug);
  const from = fromCities(t.slug);
  const facts = factsFor(t);
  const deep = deepFor(t.slug);
  const inSeason = t.months.includes(new Date().getMonth() + 1);
  const shorter = Math.max(1, t.days - 1);
  const longer = t.days + 2;
  const nearby = relatedTrips(t, 6).filter((o) => o.region === t.region || o.country === t.country)[0];
  const city = t.name.split(" & ")[0];
  const stayOf = (tier: "Budget" | "Mid-range" | "Luxury") => t.stays.find((x) => x.tier === tier);
  const nights: [number, number, number] = [
    stayOf("Budget")?.from ?? Math.min(...t.stays.map((x) => x.from)),
    stayOf("Mid-range")?.from ?? t.stays[Math.floor(t.stays.length / 2)].from,
    stayOf("Luxury")?.from ?? Math.max(...t.stays.map((x) => x.from)),
  ];
  const [h1, h2, h3] = t.highlights.map((h) => h[0]);

  // Every photo on the page, in the order it appears, for the full-screen gallery.
  const slides: GallerySlide[] = [
    { kind: "trip", name: t.name, caption: `${t.name}, ${placeLabel(t)}`, src: `/trips/${t.slug}/photo?w=2000` },
    ...t.highlights.map(([name]) => ({ kind: "place" as const, name, caption: name })),
    ...(extra?.food ?? []).map(([dish]) => ({ kind: "dish" as const, name: dish, caption: dish })),
    ...t.stays.map((x) => ({ kind: "place" as const, name: GENERIC.test(x.name) ? x.area : x.name, caption: `${x.name} · ${x.area}` })),
  ];
  const foodStart = 1 + t.highlights.length;

  // Each day's photo: the highlight its plan mentions, then any not yet used, then the trip's own photo (-1).
  const fold = (x: string) => x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const keys = t.highlights.map(([name]) => {
    const full = fold(name).replace(/^the /, "");
    return [full, ...full.split(/[^a-z0-9]+/).filter((w) => w.length >= 5 && !COMMON.has(w))];
  });
  const used = new Set<number>();
  const dayPhotos = (days ?? []).map((d) => {
    const text = fold(d.slice(0, 4).join(" "));
    const free = (j: number) => !used.has(j);
    let hit = keys.findIndex((k, j) => free(j) && text.includes(k[0]));
    if (hit < 0) hit = keys.findIndex((k, j) => free(j) && k.slice(1).some((w) => text.includes(w)));
    if (hit < 0) hit = keys.findIndex((_, j) => free(j));
    if (hit >= 0) used.add(hit);
    return hit;
  });

  const vibeScores = vibesFor(t, deep?.vibes);
  const vibeRows = VIBES.map((v) => ({ label: v.label, score: vibeScores[v.id] }));

  // "Plan it for {month}": the 10th of that month next time it comes round, or two weeks out for this month.
  const today = new Date();
  const monthHrefs = Array.from({ length: 12 }, (_, i) => {
    const start = i === today.getMonth() ? new Date(today.getTime() + 14 * 86400000) : new Date(Date.UTC(today.getFullYear() + (i < today.getMonth() ? 1 : 0), i, 10));
    return plannerHref({ destination: t.destination, days: t.days, startDate: start.toISOString().slice(0, 10), interests: [], diet: [], notes: "" });
  });

  // The comparison: the trips people weigh this one against, then similar trips priced the same way.
  const rivals = (deep?.rivals ?? []).map(tripBySlug).filter((o): o is TripIdea => !!o);
  const similar = relatedTrips(t, 12).filter((o) => (o.currency ?? "INR") === (t.currency ?? "INR") && !rivals.includes(o));
  const compareRows: CompareRow[] = [t, ...[...rivals, ...similar].slice(0, 3)].map((o) => ({
    slug: o.slug,
    name: o.name,
    place: placeLabel(o),
    days: `${o.days} days`,
    from: price(o, o.budget[0]),
    mid: price(o, o.budget[1]),
    best: monthsLabel(o.months),
    idealFor: idealFor(o),
    current: o.slug === t.slug,
  }));

  const quick = `A ${t.days}-day ${t.name} trip costs about ${price(t, t.budget[0] * t.days)}–${price(t, t.budget[1] * t.days)} per person (${price(t, t.budget[0])}–${price(t, t.budget[1])} a day), not counting travel to get there. The best time to go is ${monthsLabel(t.months)}. Stay in ${(stayOf("Mid-range") ?? t.stays[0]).area} for comfort or ${(stayOf("Budget") ?? t.stays[0]).area} on a budget, and don't miss ${[h1, h2, h3].filter(Boolean).join(", ").replace(/, ([^,]*)$/, " and $1")}.`;

  // How to plan it: the page's answers as six decisions, each linking to its chapter.
  const midStay = stayOf("Mid-range") ?? t.stays[0];
  const budgetStay = stayOf("Budget") ?? t.stays[0];
  const area = deep?.areas[0];
  const reachRest = t.reach.slice(firstSentence(t.reach).length).trim();
  const plugs = facts ? `Plugs ${facts.plugs.replace(" · ", " at ")}.` : "";
  const steps: PlanStep[] = [
    { title: "Pick your dates", fact: `The best months are ${monthsLabel(t.months)}.`, detail: extra ? firstSentence(extra.weather) : undefined, href: "#when", cta: "Check a month" },
    {
      title: "Decide how long",
      fact: `${t.days} ${t.days === 1 ? "day covers" : "days cover"} it.`,
      detail: t.days > 1 ? `${shorter} ${shorter === 1 ? "day works" : "days work"} if you focus; ${longer} let you slow down.` : `${longer} days let you slow down.`,
      href: "#itinerary",
      cta: "See the day-by-day plan",
    },
    {
      title: "Set a budget",
      fact: `About ${price(t, t.budget[0])}–${price(t, t.budget[1])} a day per person, before travel.`,
      detail: `Luxury from ${price(t, t.budget[2])} a day. Two people mid-range spend about ${price(t, tripTotal(t, 1))} for ${t.days} ${t.days === 1 ? "day" : "days"}.`,
      href: "#budget",
      cta: "Work out yours",
    },
    {
      title: "Choose where to stay",
      fact: `Mid-range: ${stayAt(midStay)}, from ${price(t, midStay.from)} a night.`,
      detail: area ? `Best area: ${area[0].replace(/\s*\(.*\)$/, "")}. ${firstSentence(area[1])}` : budgetStay !== midStay ? `On a budget: ${stayAt(budgetStay)}, from ${price(t, budgetStay.from)} a night.` : undefined,
      href: "#stay",
      cta: "Compare the hotels",
    },
    {
      title: "Book getting there",
      fact: firstSentence(t.reach),
      detail: from[0] ? `From ${from[0].city}: ${from[0].how}.` : reachRest || undefined,
      href: "#reach",
      cta: "All the routes",
    },
    {
      title: t.visa ? "Sort the paperwork" : "Check the essentials",
      fact: t.visa ? firstSentence(t.visa) : facts ? `Money: ${facts.currency}. ${plugs}` : `Pack for ${monthsLabel(t.months)}.`,
      detail: t.visa && facts ? `Money: ${facts.currency}. ${plugs}` : facts ? `Tap water: ${facts.water}` : undefined,
      href: "#essentials",
      cta: facts ? "Know before you go" : "The packing list",
    },
  ];

  const own = deep?.faqs ?? [];
  const [planFaq, ...general] = tripFaqs(t);
  const faqs = [
    // "How do I plan a trip to X?" first, then the questions written for this place; skip a generic one if they already ask it.
    ...(own.some((o) => o.q.startsWith("How do I plan a trip to")) ? [] : [planFaq]),
    ...own,
    ...general.filter((f) => !(f.q.startsWith("How many days") && own.some((o) => o.q.startsWith("How many days")))),
    {
      q: `Is ${shorter} ${shorter === 1 ? "day" : "days"} enough for ${t.name}?`,
      a: `Yes, if you focus: follow days 1 to ${shorter} of the itinerary above${days?.[t.days - 1] ? ` and skip "${days[t.days - 1][0]}"` : ""}. ${t.days} days is the comfortable length.`,
    },
    ...from.slice(0, 2).map((f) => ({ q: `How do I plan a trip to ${t.name} from ${f.city}?`, a: `${f.how}. Then follow the ${t.days}-day itinerary above; budget from about ${price(t, t.budget[0])} a day per person plus travel.` })),
    ...(extra
      ? [
          { q: `What is the weather like in ${t.name}?`, a: extra.weather },
          { q: `What food should I try in ${t.name}?`, a: extra.food.map(([d, n]) => `${d}: ${n}`).join(" ") },
          { q: `How do I get around ${t.name}?`, a: extra.around },
        ]
      : []),
    ...(deep
      ? [
          { q: `How much do things cost in ${t.name}?`, a: deep.prices.slice(0, 5).map(([item, cost]) => `${item}: ${cost}.`).join(" ") },
          { q: `Which area is best to stay in ${t.name}?`, a: deep.areas.map(([area, note]) => `${area}: ${note}`).join(" ") },
        ]
      : []),
    ...(facts
      ? [
          { q: `What currency is used in ${t.name}?`, a: `${facts.currency}. Tipping: ${facts.tipping}` },
          { q: `What plug type is used in ${t.name}?`, a: `Plug types ${facts.plugs.replace(" · ", " at ")}.` },
          { q: `What language is spoken in ${t.name}?`, a: `${facts.language}.${facts.phrases ? ` "Hello" is ${facts.phrases[0]} and "thank you" is ${facts.phrases[1]}.` : ""}` },
        ]
      : []),
  ];
  const related = relatedTrips(t, 3);
  const guide = guideBySlug(t.slug);
  const packages = PACKAGES.filter((p) => p.destination.toLowerCase().includes(t.name.toLowerCase().split(" ")[0])).slice(0, 2);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Trending trips", path: "/trips" },
    { name: t.name, path: `/trips/${t.slug}` },
  ];

  // The page's chapters, in order; the numbers on each section heading follow this list.
  const chapters: Chapter[] = [
    { id: "overview", label: "Overview" },
    { id: "highlights", label: "Highlights" },
    { id: "itinerary", label: "Itinerary" },
    { id: "budget", label: "Budget" },
    { id: "stay", label: "Stay" },
    ...(extra ? [{ id: "food", label: "Food" }] : []),
    ...(deep ? [{ id: "insider", label: "Insider" }, { id: "nearby", label: "Day trips" }] : []),
    { id: "reach", label: "Getting there" },
    { id: "essentials", label: facts ? "Essentials" : "Packing" },
    { id: "compare", label: "Compare" },
    { id: "faq", label: "FAQ" },
  ];
  const n = (id: string) => chapters.findIndex((c) => c.id === id) + 1;

  const words = [t.why, t.tagline, extra?.about, ...(days ?? []).flat(), ...t.highlights.flat(), ...faqs.map((f) => f.a), ...(deep ? [...deep.secrets, ...deep.mistakes] : [])].join(" ").split(/\s+/).length;
  const minutes = Math.max(3, Math.round(words / 230));
  const updated = new Date(`${UPDATED}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  const trip = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: `${t.days} days in ${t.name}`,
    description: t.tagline,
    url: absolute(`/trips/${t.slug}`),
    image: absolute(`/trips/${t.slug}/photo`),
    touristType: t.tags.includes("honeymoon") ? ["Couples", "Friends", "Families"] : ["Friends", "Families", "Solo travellers"],
    offers: { "@type": "AggregateOffer", priceCurrency: t.currency ?? "INR", lowPrice: t.budget[0] * t.days, highPrice: t.budget[2] * t.days, description: "Per person, excluding travel to the destination" },
    itinerary: {
      "@type": "ItemList",
      numberOfItems: t.plan.length,
      itemListElement: t.plan.map((d, i) => ({ "@type": "ListItem", position: i + 1, name: days?.[i] ? `Day ${i + 1}: ${days[i][0]}` : `Day ${i + 1}`, description: days?.[i] ? days[i].slice(1, 4).join(" ") : d })),
    },
    subjectOf: t.highlights.map(([name, note]) => ({ "@type": "TouristAttraction", name, description: note })),
  };
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title(t),
    url: absolute(`/trips/${t.slug}`),
    dateModified: UPDATED,
    author: { "@type": "Person", name: COMPANY.founder.name, url: absolute("/about") },
    publisher: { "@type": "Organization", name: COMPANY.name, url: absolute("/") },
  };

  return (
    <PublicShell crumbs={crumbs.map((c) => ({ name: c.name, href: c.path }))}>
      <JsonLd data={[trip, webPage, faqPage(faqs), breadcrumbs(crumbs)]} />
      <article className="container-x pb-24 pt-6">
        <TripHero t={t} alt={photoAlt(t)} inSeason={inSeason} slides={slides} />

        {/* Byline */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-ink font-mono text-xs text-paper">{COMPANY.founder.initials}</span>
            <div>
              <p className="text-sm text-ink">
                By{" "}
                <Link href="/about" className="underline decoration-line-strong underline-offset-4 hover:text-brand">
                  {COMPANY.founder.name}
                </Link>
                , GoRoam
              </p>
              <p className="text-xs text-stone">
                Updated <time dateTime={UPDATED}>{updated}</time> · {minutes} min read
              </p>
            </div>
          </div>
          <ShareTrip path={`/trips/${t.slug}`} title={`${t.days} days in ${t.name}: itinerary, budget and hotels`} />
        </div>

        <ChapterNav chapters={chapters} title={`${t.name} · ${t.days} days`} className="top-3 mt-6" />

        <div className="mt-14 grid gap-16 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <div className="min-w-0 space-y-24">
            {/* Overview */}
            <section id="overview" className="scroll-mt-28" aria-label="Overview">
              <div className="relative overflow-hidden rounded-panel bg-white p-6 ring-1 ring-line sm:p-7">
                <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-brand" />
                <p className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.16em] text-brand">
                  <Sparkles className="size-4" /> The short answer
                </p>
                <p className="mt-3 text-[1.08rem] leading-relaxed text-ink/85">{quick}</p>
              </div>
              <div className="mt-4">
                <VibeScores name={t.name} verdict={vibeVerdict(vibeScores)} scores={vibeRows} />
              </div>

              <p className="mt-12 flex items-center gap-3 text-brand">
                <span className="font-mono text-xs text-stone-2">01</span>
                <span aria-hidden className="h-px w-8 bg-brand/30" />
                <span className="eyebrow">Why go now</span>
              </p>
              <blockquote className="display mt-4 max-w-3xl text-[clamp(1.45rem,2.6vw,2rem)] leading-[1.25] tracking-[-0.01em] text-ink">&ldquo;{t.why}&rdquo;</blockquote>
              <p className="mt-6 max-w-3xl text-[1.0625rem] leading-relaxed text-stone">
                {extra?.about ?? `Planning a ${t.days}-day trip to ${t.name}? Here's a day-by-day itinerary with what it costs, where to stay and how to get there.`}
              </p>
              <div id="when" className="mt-8 scroll-mt-28">
                <SeasonBar months={t.months} weather={extra?.weather} name={city} hrefs={monthHrefs} />
              </div>
              <div className="mt-16">
                <PlanSteps name={t.name} steps={steps}>
                  <span className="text-sm text-stone">Or skip the homework:</span>
                  <PillLink href={plan}>Create my {city} trip</PillLink>
                  {guide && (
                    <PillLink href={`/destinations/${guide.slug}`} variant="outline">
                      Full {guide.name} guide
                    </PillLink>
                  )}
                </PlanSteps>
              </div>
            </section>

            <Section id="highlights" n={n("highlights")} eyebrow="Don't miss" heading={`Best things to do in ${t.name}`}>
              <ul className="grid gap-4 sm:grid-cols-6">
                {t.highlights.map(([name, note], i) => (
                  <li key={name} className={cn("group relative overflow-hidden rounded-card bg-white ring-1 ring-line", highlightSpan(i, t.highlights.length))}>
                    <div className={cn("relative overflow-hidden", i === 0 ? "h-64 sm:h-[22rem]" : "h-44")}>
                      <GuidePhoto name={name} city={t.destination} />
                      {i === 0 && <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />}
                      <GalleryOpen index={1 + i} label={`Open the photo of ${name}`} />
                      <span className="pointer-events-none absolute left-3 top-3 z-[2] rounded-full bg-white/95 px-2.5 py-1 font-mono text-[11px] text-ink shadow-sm">{String(i + 1).padStart(2, "0")}</span>
                      {i === 0 && (
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] p-6 text-paper">
                          <h3 className="display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight">{name}</h3>
                          <p className="mt-1.5 max-w-xl text-paper/85">{note}</p>
                        </div>
                      )}
                    </div>
                    {i > 0 && (
                      <div className="p-5">
                        <h3 className="display text-[1.2rem] leading-tight text-ink">{name}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{note}</p>
                      </div>
                    )}
                    <a
                      href={mapsSearchUrl(name, t.destination)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${name} on Google Maps`}
                      className={cn(
                        "absolute right-3 top-3 z-[2] inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] shadow-sm transition-colors",
                        "bg-white/95 text-ink hover:bg-ink hover:text-paper"
                      )}
                    >
                      <MapPin className="size-3" /> Map
                    </a>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="itinerary" n={n("itinerary")} eyebrow="Day by day" heading={`${t.name} itinerary for ${t.days} days`}>
              {days ? (
                <>
                  {/* The trip at a glance: one line, a dot a day. */}
                  <nav aria-label={`${t.name}, day by day`} className="no-scrollbar -mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
                    <ol className="relative grid min-w-max gap-0 sm:min-w-0" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(9.5rem, 1fr))` }}>
                      <span aria-hidden className="absolute inset-x-0 top-[5px] h-px bg-line-strong" />
                      {days.map(([dayTitle], i) => (
                        <li key={dayTitle} className="relative pr-5">
                          <a href={`#day-${i + 1}`} className="group block">
                            <span className="relative block size-[11px] rounded-full border-2 border-ink bg-paper transition-colors duration-300 group-hover:bg-ink" />
                            <span className="mt-3 block font-mono text-[11px] text-stone">Day {i + 1}</span>
                            <span className="mt-0.5 block text-sm leading-snug text-ink transition-colors group-hover:text-brand">{dayTitle}</span>
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>

                  <ol className="mt-14 space-y-16 sm:space-y-20">
                    {days.map(([dayTitle, morning, afternoon, evening, tip], i) => {
                      const h = dayPhotos[i];
                      const place = h >= 0 ? t.highlights[h][0] : t.name;
                      return (
                        <li key={dayTitle} id={`day-${i + 1}`} className="scroll-mt-28">
                          <p className="flex items-center gap-4 font-mono text-xs text-stone">
                            <span className="text-ink">Day {String(i + 1).padStart(2, "0")}</span>
                            <span aria-hidden className="h-px flex-1 bg-line-strong" />
                            <span>of {String(days.length).padStart(2, "0")}</span>
                          </p>
                          <div className="mt-6 grid gap-6 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] sm:gap-10">
                            <figure className={cn("group relative aspect-[16/10] overflow-hidden rounded-[18px] bg-paper-2 sm:aspect-auto sm:min-h-[21rem]", i % 2 === 1 && "sm:order-2")}>
                              {h >= 0 ? (
                                <>
                                  <GuidePhoto name={place} city={t.destination} />
                                  <GalleryOpen index={1 + h} label={`Open the photo of ${place}`} />
                                </>
                              ) : (
                                <GuideCover destination={t.destination} landscape={t.landscape} width={900} src={`/trips/${t.slug}/photo?w=900`} alt={photoAlt(t)} shade="none" credit={false} className="absolute inset-0" />
                              )}
                              <figcaption className="pointer-events-none absolute bottom-3 left-3 z-[2] inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs text-ink">
                                <MapPin className="size-3 text-brand" /> {place}
                              </figcaption>
                            </figure>
                            <div className="min-w-0">
                              <h3 className="display text-[clamp(1.55rem,2.6vw,2rem)] leading-[1.1] tracking-[-0.015em] text-ink">
                                <span className="sr-only">Day {i + 1}: </span>
                                {dayTitle}
                              </h3>
                              <dl className="mt-6">
                                {[
                                  ["Morning", morning],
                                  ["Afternoon", afternoon],
                                  ["Evening", evening],
                                ].map(([k, v]) => (
                                  <div key={k} className="grid gap-1 border-t border-line py-4 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-4">
                                    <dt className="text-sm text-stone">{k}</dt>
                                    <dd className="text-[1.0625rem] leading-relaxed text-ink/85">{v}</dd>
                                  </div>
                                ))}
                              </dl>
                              {tip && (
                                <p className="mt-3 border-l-2 border-sun pl-4 text-[0.95rem] leading-relaxed text-ink/75">
                                  <span className="font-medium text-ink">Local tip. </span>
                                  {tip}
                                </p>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </>
              ) : (
                <ol className="divide-y divide-line border-y border-line">
                  {t.plan.map((d, i) => (
                    <li key={d} className="grid gap-1 py-4 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-4">
                      <span className="font-mono text-xs text-stone sm:pt-1">Day {String(i + 1).padStart(2, "0")}</span>
                      <p className="text-[1.0625rem] leading-relaxed text-ink/85">{d}</p>
                    </li>
                  ))}
                </ol>
              )}

              <Link href={plan} className="group mt-16 flex items-center justify-between gap-6 border-t border-ink pt-5 text-ink">
                <span>
                  <span className="display block text-[1.2rem]">Want it hour by hour?</span>
                  <span className="mt-1 block text-sm text-stone">GoRoam plans every stop with times, maps, costs and bookings for your dates.</span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-2 text-sm font-medium">
                  Plan it <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
                </span>
              </Link>

              <h3 className="display mt-14 text-[1.4rem] text-ink">
                {t.name} in {shorter}, {t.days} or {longer} days
              </h3>
              <div className="mt-5 grid gap-8 border-t border-line pt-6 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-line">
                <div className="sm:pr-8">
                  <p className="display text-[2.6rem] leading-none text-ink">
                    {shorter}
                    <span className="ml-2 font-sans text-base text-stone">{shorter === 1 ? "day" : "days"}</span>
                  </p>
                  <p className="mt-3 leading-relaxed text-ink/75">
                    Follow days 1 to {shorter} above{days?.[t.days - 1] ? <> and leave out &ldquo;{days[t.days - 1][0]}&rdquo;</> : null}. Start early each day and book the main sights ahead.
                  </p>
                </div>
                <div className="sm:pl-8">
                  <p className="display text-[2.6rem] leading-none text-ink">
                    {longer}
                    <span className="ml-2 font-sans text-base text-stone">days</span>
                  </p>
                  <p className="mt-3 leading-relaxed text-ink/75">
                    Slow down with a free day for a spa, a cooking class or simply wandering
                    {nearby ? (
                      <>
                        , then add {longer - t.days - 1} {longer - t.days - 1 === 1 ? "day" : "days"} in{" "}
                        <Link href={`/trips/${nearby.slug}`} className="text-brand underline underline-offset-2">
                          {nearby.name}
                        </Link>
                      </>
                    ) : null}
                    .
                  </p>
                </div>
              </div>
            </Section>

            <Section id="budget" n={n("budget")} eyebrow="What it costs" heading={`${t.name} trip budget`} intro={`About ${price(t, t.budget[0])} a day per person on a budget, ${price(t, t.budget[1])} mid-range and ${price(t, t.budget[2])}+ for luxury. For two people mid-range, that's about ${price(t, tripTotal(t, 1))} for ${t.days} days.`}>
              <BudgetPlanner name={t.name} currency={t.currency === "USD" ? "USD" : "INR"} budget={t.budget} days={t.days} stays={nights} />
              {deep && <RealPrices prices={deep.prices} place={t.name} />}
              <Link href="/trip-cost-index#index" className="group mt-10 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <span className="text-sm leading-relaxed text-stone">{rankSentence(t)}</span>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-ink transition-colors group-hover:text-brand">
                  See how it compares <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Section>

            <Section id="stay" n={n("stay")} eyebrow="Where to stay" heading={`Best hotels in ${t.name} for every budget`}>
              {deep && <StayAreas areas={deep.areas} />}
              <ul className="grid gap-4 md:grid-cols-3">
                {t.stays.map((x) => {
                  const search = GENERIC.test(x.name) ? `${x.area}, ${city}` : `${x.name}, ${city}`;
                  const book = stayPartners({ destination: t.destination, checkIn: "", checkOut: "", adults: 2 }, search)[0];
                  return (
                    <li key={x.name} className="group flex flex-col overflow-hidden rounded-card bg-white ring-1 ring-line transition-shadow duration-500 hover:shadow-float">
                      <span aria-hidden className={cn("h-1", TIER_BAR[x.tier])} />
                      <div className="relative h-40 overflow-hidden">
                        <GuidePhoto name={GENERIC.test(x.name) ? x.area : x.name} city={t.destination} />
                        <span className={cn("absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] shadow-sm", TIER[x.tier])}>{x.tier}</span>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="display text-[1.15rem] leading-tight text-ink">{x.name}</h3>
                        <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-stone">
                          <MapPin className="size-3" /> {x.area}
                        </p>
                        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink/75">{x.note}</p>
                        <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-4">
                          <p className="text-sm text-ink">
                            <span className="block text-[11px] text-stone">from, a night for two</span>
                            <span className="display text-xl tabular-nums">{price(t, x.from)}</span>
                          </p>
                          {book && (
                            <a href={book.href} target="_blank" rel="noopener noreferrer sponsored nofollow" className="inline-flex items-center gap-1 rounded-full bg-ink px-3.5 py-2 text-xs text-paper transition-colors hover:bg-brand">
                              Check prices <ArrowUpRight className="size-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Section>

            {extra && (
              <Section id="food" n={n("food")} eyebrow="What to eat" heading={`Food to try in ${t.name}`}>
                <ul className="grid gap-4 sm:grid-cols-3">
                  {extra.food.map(([dish, note], i) => (
                    <li key={dish} className="group overflow-hidden rounded-card bg-white ring-1 ring-line">
                      <div className="relative h-36 overflow-hidden">
                        <GuidePhoto name={dish} city={t.destination} kind="dish" />
                        <GalleryOpen index={foodStart + i} label={`Open the photo of ${dish}`} />
                        <span className="pointer-events-none absolute left-3 top-3 z-[2] rounded-full bg-white/95 px-2.5 py-1 font-mono text-[11px] text-ink shadow-sm">{String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <div className="p-5">
                        <h3 className="display text-[1.15rem] leading-tight text-ink">{dish}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{note}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {deep && (
              <Section id="insider" n={n("insider")} eyebrow="Insider" heading={`${t.name} like a local`}>
                <Insider deep={deep} />
              </Section>
            )}

            {deep && (
              <Section id="nearby" n={n("nearby")} eyebrow="Beyond the plan" heading={`Day trips and events around ${t.name}`}>
                <Nearby deep={deep} />
              </Section>
            )}

            <Section id="reach" n={n("reach")} eyebrow="Getting there" heading={`How to reach ${t.name}`}>
              <dl className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: Navigation, k: "Getting there", v: t.reach },
                  ...(extra ? [{ icon: MapPin, k: "Getting around", v: extra.around }] : []),
                  ...(t.visa ? [{ icon: Stamp, k: t.country === "India" ? "Permits" : "Visa", v: t.visa }] : []),
                ].map((r, i, all) => (
                  <div key={r.k} className={cn("flex gap-4 rounded-card bg-white p-5 ring-1 ring-line sm:p-6", all.length % 2 === 1 && i === all.length - 1 && "sm:col-span-2")}>
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                      <r.icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <dt className="font-medium text-ink">{r.k}</dt>
                      <dd className="mt-1 leading-relaxed text-ink/70">{r.v}</dd>
                    </div>
                  </div>
                ))}
              </dl>
              {from.length > 0 && (
                <div className="mt-3 rounded-card bg-white p-5 ring-1 ring-line sm:p-6">
                  <h3 className="font-medium text-ink">{t.name} trip from your city</h3>
                  <ul className="mt-3 divide-y divide-line text-sm">
                    {from.map((f) => (
                      <li key={f.city} className="flex flex-wrap gap-x-2 py-2.5 leading-relaxed text-ink/75 first:pt-0 last:pb-0">
                        <Link href={`/weekend-getaways/${f.hub}`} className="font-medium text-ink hover:text-brand">
                          From {f.city}:
                        </Link>
                        {f.how}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <h3 className="mt-8 text-sm font-medium text-ink">Good to know</h3>
              <ul className="mt-3 space-y-3">
                {t.tips.map((tip) => (
                  <li key={tip} className="flex gap-3 rounded-card bg-sun-soft/60 p-4 leading-relaxed text-ink/85">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-sun" /> {tip}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="essentials" n={n("essentials")} eyebrow="Before you go" heading={facts ? `Know before you go: ${t.name}` : `What to pack for ${t.name}`}>
              {facts && <Essentials facts={facts} place={city} />}
              {facts && <h3 className="display mb-4 mt-12 text-[1.4rem] text-ink">What to pack for {t.name}</h3>}
              <PackList slug={t.slug} title={`${t.name} packing list`} groups={packing(t, facts)} />
            </Section>

            <Section
              id="compare"
              n={n("compare")}
              eyebrow="Weighing it up"
              heading={rivals.length ? `${t.name} vs ${rivals.slice(0, 2).map((o) => o.name).join(" vs ")}` : `${t.name} compared with similar trips`}
              intro={`How ${t.name} stacks up on length, cost and the best time to go. Prices are per person a day, not counting travel${new Set([t, ...rivals].map((o) => o.currency ?? "INR")).size > 1 ? ", in each trip's own currency" : ""}.`}
            >
              <CompareTrips rows={compareRows} />
            </Section>

            <Section id="faq" n={n("faq")} eyebrow="Good questions" heading={`${t.name} trip FAQs`}>
              <FaqList faqs={faqs} />
            </Section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <GuideCover destination={t.destination} landscape={t.landscape} width={700} src={`/trips/${t.slug}/photo?w=700`} alt={photoAlt(t)} shade="soft" credit={false} className="rounded-panel text-paper">
              <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/55 to-ink/90" />
              <div className="relative p-6">
                <p className="eyebrow text-sun-2">Make it yours</p>
                <p className="display mt-3 text-[1.45rem] leading-snug">Your dates, your budget, your crew.</p>
                <p className="mt-2 text-sm leading-relaxed text-paper/80">A full {t.days}-day {city} plan with maps, costs and bookings in under a minute.</p>
                <ul className="mt-4 space-y-1.5 text-sm text-paper/90">
                  {["Every stop timed and mapped", "Hotels that fit your budget", "Getting there and getting around"].map((x) => (
                    <li key={x} className="flex items-center gap-2">
                      <Check className="duo-paper size-4 text-brand-2" /> {x}
                    </li>
                  ))}
                </ul>
                <Link href={plan} className="group mt-6 flex items-center justify-center gap-2 rounded-full bg-sun-2 px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-white">
                  Create yours free <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5" />
                </Link>
                <p className="mt-3 text-center text-xs text-paper/60">First trip free · no card needed</p>
              </div>
            </GuideCover>

            <div className="rounded-panel bg-white p-6 ring-1 ring-line">
              <p className="eyebrow text-stone">At a glance</p>
              <dl className="mt-4 divide-y divide-line text-sm">
                {[
                  ["Best time", monthsLabel(t.months)],
                  ["Length", `${t.days} days`],
                  ["A day each", `${price(t, t.budget[0])}–${price(t, t.budget[2])}+`],
                  ["Stays from", `${price(t, nights[0])} a night`],
                  ...(facts ? [["Currency", facts.currency.split(" (")[0]] as [string, string]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                    <dt className="text-stone">{k}</dt>
                    <dd className="text-right text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-xs text-stone">
                <BedDouble className="size-4 text-brand" /> Prices are rough guides for {YEAR}.
              </p>
            </div>

            {(packages.length > 0 || guide) && (
              <div className="rounded-panel bg-white p-6 ring-1 ring-line">
                <p className="eyebrow text-stone">Go deeper</p>
                <ul className="mt-3 space-y-1">
                  {guide && (
                    <li>
                      <Link href={`/destinations/${guide.slug}`} className="flex items-center justify-between gap-3 rounded-xl p-2 text-ink hover:bg-paper">
                        {guide.name} travel guide <ArrowRight className="size-4 text-stone" />
                      </Link>
                    </li>
                  )}
                  {packages.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/itineraries/${p.slug}`} className="flex items-center justify-between gap-3 rounded-xl p-2 text-ink hover:bg-paper">
                        {p.title}, full itinerary <ArrowRight className="size-4 text-stone" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        <section aria-labelledby="more-h" className="mt-28 border-t border-line pt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-brand">You might also like</p>
              <h2 id="more-h" className="display mt-3 text-[clamp(1.75rem,3.2vw,2.4rem)] leading-[1.06] tracking-[-0.02em] text-ink">
                More trips like {t.name}
              </h2>
            </div>
            <Link href="/trips" className="inline-flex items-center gap-1.5 text-sm text-ink hover:text-brand">
              All trending trips <ArrowRight className="size-4" />
            </Link>
          </div>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {related.map((o) => (
              <li key={o.slug}>
                <TripCard t={o} />
              </li>
            ))}
          </ul>
        </section>
      </article>
      <CreateYoursBar href={plan} place={city} days={t.days} source="trip-idea" />
    </PublicShell>
  );
}
