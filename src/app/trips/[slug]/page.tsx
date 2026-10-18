import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreateYoursBar } from "@/components/seo/create-yours";
import { GuideCover, GuidePhoto } from "@/components/seo/guide-media";
import { FaqList, PublicShell } from "@/components/seo/public-shell";
import { TripCard } from "@/components/seo/trip-card";
import { ArrowRight, ArrowUpRight, BedDouble, Check, Lightbulb, Navigation, Stamp } from "@/components/site/icons";
import { PillLink } from "@/components/site/pill";
import { stayPartners } from "@/lib/booking";
import { guideBySlug } from "@/lib/destination-guides";
import { PACKAGES } from "@/lib/packages";
import { plannerHref } from "@/lib/prompt-parse";
import { JsonLd, absolute, breadcrumbs, faqPage } from "@/lib/seo";
import { TRIP_IDEAS, inr, monthsLabel, relatedTrips, tripBySlug, tripFaqs, tripTotal, type TripIdea } from "@/lib/trip-ideas";
import { cn } from "@/lib/utils";

export const dynamicParams = false;
export const generateStaticParams = () => TRIP_IDEAS.map((t) => ({ slug: t.slug }));

const YEAR = 2026;
const title = (t: TripIdea) => `${t.name} Trip Plan ${YEAR}: ${t.days} Days, Budget & Best Hotels`;
const blurb = (t: TripIdea) =>
  `Plan ${t.days} days in ${t.name}: a day-by-day route, what it costs (from ${inr(t.budget[0])} a day), where to stay and the best time to go (${monthsLabel(t.months)}).`;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = tripBySlug((await params).slug);
  if (!t) return {};
  return {
    title: title(t),
    description: blurb(t),
    alternates: { canonical: `/trips/${t.slug}` },
    openGraph: { title: title(t), description: blurb(t), type: "article", url: `/trips/${t.slug}` },
    twitter: { card: "summary_large_image", title: title(t), description: blurb(t) },
  };
}

// A stay written as a kind of place ("Guesthouses near the lake") is searched by its area instead.
const GENERIC = /\b(guesthouses|hostels|homestays|huts|cottages|stays|lodges|camps|resorts|villas|hotels|ships|houses)\b/i;
const TIER = { Budget: "bg-emerald-50 text-emerald-700", "Mid-range": "bg-brand-soft text-brand", Luxury: "bg-sun-soft text-ink" } as const;
const LEVELS = ["Budget", "Mid-range", "Luxury"] as const;

function Section({ id, eyebrow, heading, children }: { id: string; eyebrow: string; heading: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28" aria-labelledby={`${id}-h`}>
      <p className="eyebrow text-brand">{eyebrow}</p>
      <h2 id={`${id}-h`} className="display mt-3 text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.08] text-ink">
        {heading}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default async function TripIdeaPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = tripBySlug((await params).slug);
  if (!t) notFound();
  const plan = plannerHref({ destination: t.destination, days: t.days, interests: [], diet: [], notes: "" });
  const faqs = tripFaqs(t);
  const related = relatedTrips(t, 3);
  const guide = guideBySlug(t.slug);
  const packages = PACKAGES.filter((p) => p.destination.toLowerCase().includes(t.name.toLowerCase().split(" ")[0])).slice(0, 2);
  const city = t.name.split(" & ")[0];
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Trending trips", path: "/trips" },
    { name: t.name, path: `/trips/${t.slug}` },
  ];

  const trip = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: `${t.days} days in ${t.name}`,
    description: t.tagline,
    url: absolute(`/trips/${t.slug}`),
    touristType: t.tags.includes("honeymoon") ? ["Couples", "Friends", "Families"] : ["Friends", "Families", "Solo travellers"],
    offers: { "@type": "AggregateOffer", priceCurrency: "INR", lowPrice: t.budget[0] * t.days, highPrice: t.budget[2] * t.days, description: "Per person, excluding travel to the destination" },
    itinerary: {
      "@type": "ItemList",
      numberOfItems: t.plan.length,
      itemListElement: t.plan.map((d, i) => ({ "@type": "ListItem", position: i + 1, name: `Day ${i + 1}`, description: d })),
    },
    subjectOf: t.highlights.map(([name, note]) => ({ "@type": "TouristAttraction", name, description: note })),
  };

  return (
    <PublicShell crumbs={crumbs.map((c) => ({ name: c.name, href: c.path }))}>
      <JsonLd data={[trip, faqPage(faqs), breadcrumbs(crumbs)]} />
      <article className="container-x pb-24 pt-6">
        <GuideCover destination={t.destination} landscape={t.landscape} width={2000} className="min-h-[24rem] rounded-panel sm:min-h-[30rem]">
          <header className="absolute inset-x-0 bottom-0 p-6 text-paper sm:p-10">
            <p className="eyebrow text-paper/75">
              {t.region}
              {t.country === "India" ? ", India" : t.country !== t.region ? `, ${t.country}` : ""} · Trip plan
            </p>
            <h1 className="display mt-4 text-[clamp(2.3rem,6vw,4.5rem)] leading-[1]">
              {t.days} days in <span className="text-brand-2">{t.name}</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-paper/85 sm:text-xl">{t.tagline}</p>
          </header>
        </GuideCover>

        {/* At a glance */}
        <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-card bg-line ring-1 ring-line lg:grid-cols-4">
          {[
            { k: "Best time", v: monthsLabel(t.months) },
            { k: "Ideal length", v: `${t.days} days` },
            { k: "A day, mid-range", v: `${inr(t.budget[1])} per person` },
            { k: "Trip for two", v: `about ${inr(tripTotal(t, 1))}` },
          ].map((f) => (
            <div key={f.k} className="min-w-0 bg-white px-5 py-4 sm:px-6">
              <dt className="eyebrow text-[0.6rem] text-stone">{f.k}</dt>
              <dd className="mt-1.5 leading-snug text-ink">{f.v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 grid gap-16 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-20">
            {/* Why now */}
            <div className="max-w-3xl">
              <p className="eyebrow text-brand">Why go now</p>
              <p className="display mt-4 text-[clamp(1.35rem,2.4vw,1.75rem)] leading-snug text-ink">{t.why}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <PillLink href={plan}>Create my {city} trip</PillLink>
                {guide && (
                  <PillLink href={`/destinations/${guide.slug}`} variant="outline">
                    Full {guide.name} guide
                  </PillLink>
                )}
              </div>
            </div>

            <Section id="highlights" eyebrow="Don't miss" heading={`Best things to do in ${t.name}`}>
              <ul className="grid gap-4 sm:grid-cols-2">
                {t.highlights.map(([name, note], i) => (
                  <li key={name} className="group overflow-hidden rounded-card bg-white ring-1 ring-line">
                    <div className="relative h-44 overflow-hidden">
                      <GuidePhoto name={name} city={t.destination} />
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 font-mono text-[11px] text-ink shadow-sm">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="p-5">
                      <h3 className="display text-[1.25rem] leading-tight text-ink">{name}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{note}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="plan" eyebrow="Day by day" heading={`${t.name} itinerary for ${t.days} days`}>
              <ol className="relative space-y-3 before:absolute before:bottom-6 before:left-[1.35rem] before:top-6 before:w-px before:bg-line">
                {t.plan.map((d, i) => (
                  <li key={d} className="relative flex gap-4 rounded-card bg-white p-4 ring-1 ring-line sm:p-5">
                    <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-ink font-mono text-xs text-paper">D{i + 1}</span>
                    <p className="self-center leading-relaxed text-ink/80">{d}</p>
                  </li>
                ))}
              </ol>
              <Link
                href={plan}
                className="group mt-4 flex items-center justify-between gap-4 rounded-card bg-brand-soft/60 p-5 text-ink ring-1 ring-brand/15 transition-colors hover:bg-brand-soft"
              >
                <span>
                  <span className="block font-medium">Want it hour by hour?</span>
                  <span className="mt-0.5 block text-sm text-ink/70">GoRoam plans every stop with times, maps, costs and bookings for your dates.</span>
                </span>
                <ArrowRight className="size-5 shrink-0 text-brand transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
            </Section>

            <Section id="budget" eyebrow="What it costs" heading={`${t.name} trip budget`}>
              <div className="overflow-hidden rounded-card bg-white ring-1 ring-line">
                <table className="w-full text-left text-sm">
                  <thead className="bg-paper-2/60 text-xs text-stone">
                    <tr>
                      <th className="px-4 py-3 font-normal sm:px-6">Style</th>
                      <th className="px-4 py-3 font-normal sm:px-6">Per person, a day</th>
                      <th className="px-4 py-3 text-right font-normal sm:px-6">
                        {t.days} days for two
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {LEVELS.map((l, i) => (
                      <tr key={l}>
                        <td className="px-4 py-4 sm:px-6">
                          <span className={cn("rounded-full px-2.5 py-1 text-xs", TIER[l])}>{l}</span>
                        </td>
                        <td className="px-4 py-4 text-ink sm:px-6">{inr(t.budget[i])}{i === 2 ? "+" : ""}</td>
                        <td className="display px-4 py-4 text-right text-lg text-ink sm:px-6">{inr(tripTotal(t, i as 0 | 1 | 2))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-stone">Stay, food, local transport and entry fees; travel to {t.name} is extra. Rough guides from recent prices, so check before you book.</p>
            </Section>

            <Section id="stay" eyebrow="Where to stay" heading={`Best hotels in ${t.name} for every budget`}>
              <ul className="grid gap-4 md:grid-cols-3">
                {t.stays.map((x) => {
                  const search = GENERIC.test(x.name) ? `${x.area}, ${city}` : `${x.name}, ${city}`;
                  const book = stayPartners({ destination: t.destination, checkIn: "", checkOut: "", adults: 2 }, search)[0];
                  return (
                    <li key={x.name} className="group flex flex-col overflow-hidden rounded-card bg-white ring-1 ring-line">
                      <div className="relative h-36 overflow-hidden">
                        <GuidePhoto name={GENERIC.test(x.name) ? x.area : x.name} city={t.destination} />
                        <span className={cn("absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] shadow-sm", TIER[x.tier])}>{x.tier}</span>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="display text-[1.15rem] leading-tight text-ink">{x.name}</h3>
                        <p className="mt-1 text-xs text-stone">{x.area}</p>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/75">{x.note}</p>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="text-sm text-ink">
                            from <span className="display text-lg">{inr(x.from)}</span>
                            <span className="text-xs text-stone"> /night</span>
                          </p>
                          {book && (
                            <a href={book.href} target="_blank" rel="noopener noreferrer sponsored nofollow" className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-xs text-paper hover:bg-brand">
                              Prices <ArrowUpRight className="size-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Section>

            <Section id="reach" eyebrow="Getting there" heading={`How to reach ${t.name}`}>
              <dl className="divide-y divide-line overflow-hidden rounded-card bg-white ring-1 ring-line">
                <div className="flex gap-4 p-5 sm:p-6">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                    <Navigation className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <dt className="font-medium text-ink">Travel</dt>
                    <dd className="mt-1 leading-relaxed text-ink/70">{t.reach}</dd>
                  </div>
                </div>
                {t.visa && (
                  <div className="flex gap-4 p-5 sm:p-6">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                      <Stamp className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <dt className="font-medium text-ink">{t.country === "India" ? "Permits" : "Visa"}</dt>
                      <dd className="mt-1 leading-relaxed text-ink/70">{t.visa}</dd>
                    </div>
                  </div>
                )}
              </dl>
              <ul className="mt-6 space-y-3">
                {t.tips.map((tip) => (
                  <li key={tip} className="flex gap-3 rounded-card bg-sun-soft/60 p-4 leading-relaxed text-ink/85">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-sun" /> {tip}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="faq" eyebrow="Good questions" heading={`${t.name} trip FAQs`}>
              <FaqList faqs={faqs} />
            </Section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <GuideCover destination={t.destination} landscape={t.landscape} width={700} shade="soft" credit={false} className="rounded-panel text-paper">
              <div className="relative p-6">
                <p className="eyebrow text-paper/70">Make it yours</p>
                <p className="mt-3 text-lg leading-snug">Your dates, budget and crew: a full {t.days}-day {city} plan with maps, costs and bookings in under a minute.</p>
                <ul className="mt-4 space-y-1.5 text-sm text-paper/85">
                  {["Every stop timed and mapped", "Hotels that fit your budget", "Getting there and getting around"].map((x) => (
                    <li key={x} className="flex items-center gap-2">
                      <Check className="duo-paper size-4 text-brand-2" /> {x}
                    </li>
                  ))}
                </ul>
                <Link href={plan} className="group mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand/90">
                  Create yours free <ArrowRight className="duo-paper size-4 transition-transform duration-500 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </GuideCover>
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
            <div className="rounded-panel bg-white p-6 ring-1 ring-line">
              <p className="eyebrow flex items-center gap-2 text-stone">
                <BedDouble className="size-4 text-brand" /> Stays from
              </p>
              <p className="display mt-2 text-3xl text-ink">{inr(Math.min(...t.stays.map((x) => x.from)))}</p>
              <p className="text-sm text-stone">a night for two</p>
            </div>
          </aside>
        </div>

        <section aria-labelledby="more-h" className="mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-brand">You might also like</p>
              <h2 id="more-h" className="display mt-3 text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.08] text-ink">
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
