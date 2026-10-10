import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChapterNav } from "@/components/itinerary/chapter-nav";
import { GuideChip, GuideCover, GuidePhoto, SightsMap } from "@/components/seo/guide-media";
import { FaqList, PublicShell } from "@/components/seo/public-shell";
import { ArrowRight, ArrowUpRight, Bus, Car, Check, Lightbulb, MapPin, Navigation, Plane, TrainFront, type LucideIcon } from "@/components/site/icons";
import { PillLink } from "@/components/site/pill";
import { DESTINATION_GUIDES, MONTHS, guideBySlug, monthRatings, type MonthRating } from "@/lib/destination-guides";
import { packageBySlug } from "@/lib/packages";
import { PACKAGE_SEO } from "@/lib/packages-seo";
import { plannerHref } from "@/lib/prompt-parse";
import { JsonLd, absolute, breadcrumbs, faqPage } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const dynamicParams = false;
export const generateStaticParams = () => DESTINATION_GUIDES.map((d) => ({ slug: d.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = guideBySlug((await params).slug);
  if (!g) return {};
  return {
    title: g.seoTitle,
    description: g.description,
    alternates: { canonical: `/destinations/${g.slug}` },
    openGraph: { title: g.seoTitle, description: g.description, type: "article", url: `/destinations/${g.slug}` },
    twitter: { card: "summary_large_image", title: g.seoTitle, description: g.description },
  };
}

const RATING: Record<MonthRating, { chip: string; cell: string; label: string }> = {
  best: { chip: "bg-brand text-white", cell: "bg-brand text-white", label: "Best" },
  good: { chip: "bg-brand-soft text-ink", cell: "bg-brand-soft text-ink", label: "Good" },
  avoid: { chip: "bg-paper-2 text-stone", cell: "bg-paper-2 text-stone-2", label: "Avoid" },
};

/** How you get there, as an icon. */
const MODE_ICON: Record<string, LucideIcon> = { Air: Plane, Train: TrainFront, Bus: Bus, Road: Car, "Getting around": Navigation };

const CHAPTERS = [
  { id: "best-time", label: "Best time" },
  { id: "getting-there", label: "Getting there" },
  { id: "where-to-stay", label: "Where to stay" },
  { id: "top-sights", label: "Top sights" },
  { id: "food", label: "Food" },
  { id: "budget", label: "Budget" },
  { id: "faq", label: "FAQ" },
];

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-40" aria-labelledby={`${id}-h`}>
      <p className="eyebrow text-brand">{eyebrow}</p>
      <h2 id={`${id}-h`} className="display mt-3 text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.08] text-ink">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();
  const trips = g.itineraries.map((s) => packageBySlug(s)).filter((p): p is NonNullable<typeof p> => !!p);
  const plan = plannerHref({ destination: g.destination, interests: [], diet: [], notes: "" });
  const others = DESTINATION_GUIDES.filter((d) => d.slug !== g.slug).slice(0, 6);
  const year = monthRatings(g);
  const best = g.bestTime.months.filter((m) => m.rating === "best").map((m) => m.label);
  const midRange = g.budget.find((b) => /mid/i.test(b.style)) ?? g.budget[Math.floor(g.budget.length / 2)];
  const modes = g.gettingThere.map((t) => t.mode).filter((m) => m !== "Getting around");

  const place = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: g.name,
    description: g.overview[0],
    url: absolute(`/destinations/${g.slug}`),
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
      <article className="container-x pb-24 pt-6">
        {/* The place first: a real photo, with the title on it. */}
        <GuideCover destination={g.destination} landscape={g.landscape} width={2000} className="min-h-[26rem] rounded-panel sm:min-h-[32rem]">
          <header className="absolute inset-x-0 bottom-0 p-6 text-paper sm:p-10">
            <p className="eyebrow text-paper/75">{g.state}, India · Travel guide</p>
            <h1 className="display mt-4 text-[clamp(2.5rem,6vw,4.75rem)] leading-[1]">
              {g.name} <span className="text-brand-2">travel guide</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-paper/85 sm:text-xl">{g.tagline}</p>
          </header>
        </GuideCover>

        {/* At a glance */}
        <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-card bg-line ring-1 ring-line lg:grid-cols-4">
          {[
            { k: "Best time", v: best.join(", ") || "Year round" },
            { k: "A day, mid-range", v: midRange ? `${midRange.perDay} per person` : "See budgets" },
            { k: "Getting there", v: modes.join(" · ") || "By road" },
            { k: "Ready-made trips", v: trips.length ? `${trips.length} ${trips.length === 1 ? "itinerary" : "itineraries"}` : "Plan your own" },
          ].map((f) => (
            <div key={f.k} className="min-w-0 bg-white px-5 py-4 sm:px-6">
              <dt className="eyebrow text-[0.6rem] text-stone">{f.k}</dt>
              <dd className="mt-1.5 leading-snug text-ink">{f.v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 max-w-3xl">
          {g.overview.map((p) => (
            <p key={p.slice(0, 20)} className="mt-4 text-[1.0625rem] leading-relaxed text-stone first:mt-0 sm:text-lg">
              {p}
            </p>
          ))}
          <div className="mt-8 flex flex-wrap gap-3">
            <PillLink href={plan}>Plan my {g.name} trip free</PillLink>
            {trips[0] && (
              <PillLink href={`/itineraries/${trips[0].slug}`} variant="outline">
                See a ready-made itinerary
              </PillLink>
            )}
          </div>
        </div>

        <ChapterNav chapters={CHAPTERS} title={`${g.name} guide`} className="top-[5.25rem] mt-12 sm:top-24" />

        <div className="mt-12 grid gap-16 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-20">
            <Section id="best-time" eyebrow="When to go" title={`Best time to visit ${g.name}`}>
              <p className="max-w-2xl leading-relaxed text-ink/75">{g.bestTime.summary}</p>
              {year && (
                <div className="mt-6">
                  <ol aria-label="Month by month" className="grid grid-cols-6 gap-1.5 sm:grid-cols-12">
                    {year.map((r, i) => (
                      <li key={MONTHS[i]} className={cn("rounded-lg py-2.5 text-center font-mono text-xs", r ? RATING[r].cell : "bg-paper-2/60 text-stone-2")}>
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
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {g.bestTime.months.map((m) => (
                  <li key={m.label} className="flex items-start gap-3 rounded-card bg-white p-4 ring-1 ring-line">
                    <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs", RATING[m.rating].chip)}>{m.label}</span>
                    <span className="text-sm leading-relaxed text-ink/75">{m.note}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="getting-there" eyebrow="Getting there" title={`How to reach ${g.name}`}>
              <dl className="divide-y divide-line overflow-hidden rounded-card bg-white ring-1 ring-line">
                {g.gettingThere.map((t) => {
                  const Icon = MODE_ICON[t.mode] ?? Navigation;
                  return (
                    <div key={t.mode} className="flex gap-4 p-5 sm:p-6">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                        <Icon className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <dt className="font-medium text-ink">{t.mode}</dt>
                        <dd className="mt-1 leading-relaxed text-ink/70">{t.detail}</dd>
                      </div>
                    </div>
                  );
                })}
              </dl>
            </Section>

            <Section id="where-to-stay" eyebrow="Where to stay" title={`Where to stay in ${g.name}`}>
              <ul className="grid gap-4 sm:grid-cols-2">
                {g.whereToStay.map((s) => (
                  <li key={s.area} className="group overflow-hidden rounded-card bg-white ring-1 ring-line">
                    <div className="relative h-40 overflow-hidden">
                      <GuidePhoto name={s.area} city={g.name} />
                    </div>
                    <div className="p-5">
                      <h3 className="display text-[1.25rem] leading-tight text-ink">{s.area}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{s.why}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="top-sights" eyebrow="What to see" title={`Top things to do in ${g.name}`}>
              <SightsMap sights={g.attractions} city={g.destination} className="mb-6 aspect-[16/9]" />
              <ol className="grid gap-4 sm:grid-cols-2">
                {g.attractions.map((a, i) => (
                  <li key={a.name} className="group flex flex-col overflow-hidden rounded-card bg-white ring-1 ring-line">
                    <div className="relative h-48 overflow-hidden">
                      <GuidePhoto name={a.name} city={g.name} />
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 font-mono text-[11px] text-ink shadow-sm">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="display text-[1.3rem] leading-tight text-ink">{a.name}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/75">{a.description}</p>
                      <p className="mt-4 flex gap-2.5 rounded-xl bg-brand-soft/60 p-3 text-sm leading-relaxed text-ink">
                        <Lightbulb className="mt-0.5 size-4 shrink-0 text-brand" />
                        <span>{a.tip}</span>
                      </p>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${a.lat},${a.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 self-start text-sm text-brand hover:underline"
                      >
                        <MapPin className="size-4" /> Open in Maps <ArrowUpRight className="size-3.5" />
                      </a>
                    </div>
                  </li>
                ))}
              </ol>
            </Section>

            <Section id="food" eyebrow="What to eat" title={`What to eat in ${g.name}`}>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {g.food.map((f) => (
                  <li key={f.name} className="group overflow-hidden rounded-card bg-white ring-1 ring-line">
                    <div className="relative h-36 overflow-hidden">
                      <GuidePhoto name={f.name} city={g.name} kind="dish" />
                    </div>
                    <div className="p-5">
                      <h3 className="display text-[1.2rem] leading-tight text-ink">{f.name}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{f.note}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="budget" eyebrow="What it costs" title={`${g.name} trip cost per day`}>
              <ul className="grid gap-3 sm:grid-cols-3">
                {g.budget.map((b) => (
                  <li key={b.style} className={cn("rounded-card p-5 ring-1", b === midRange ? "bg-ink text-paper ring-ink" : "bg-white text-ink ring-line")}>
                    <p className={cn("eyebrow text-[0.62rem]", b === midRange ? "text-paper/60" : "text-stone")}>{b.style}</p>
                    <p className="display mt-3 text-[1.6rem] leading-none">{b.perDay}</p>
                    <p className={cn("mt-1 text-xs", b === midRange ? "text-paper/60" : "text-stone")}>per person, per day</p>
                    <p className={cn("mt-4 text-sm leading-relaxed", b === midRange ? "text-paper/80" : "text-ink/70")}>{b.note}</p>
                  </li>
                ))}
              </ul>
              <ul className="mt-6 space-y-3">
                {g.tips.map((t) => (
                  <li key={t} className="flex gap-3 leading-relaxed text-ink/80">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                      <Check className="size-3.5" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="faq" eyebrow="Good questions" title={`${g.name} travel FAQs`}>
              <FaqList faqs={g.faqs} />
            </Section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-44 lg:self-start">
            {trips.length > 0 && (
              <div className="rounded-panel bg-white p-6 ring-1 ring-line">
                <p className="eyebrow text-stone">Ready-made itineraries</p>
                <ul className="mt-4 space-y-2">
                  {trips.map((t) => (
                    <li key={t.slug}>
                      <Link href={`/itineraries/${t.slug}`} className="group flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-paper">
                        <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-paper-2">
                          <GuidePhoto name={t.destination} city={t.destination} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-ink">{PACKAGE_SEO[t.slug]?.seoTitle ?? t.title}</span>
                          <span className="mt-0.5 block text-xs text-stone">
                            {t.days} days · from ${t.budget.toLocaleString("en-US")} for two
                          </span>
                        </span>
                        <ArrowRight className="size-4 shrink-0 text-stone transition-transform duration-500 group-hover:translate-x-0.5 group-hover:text-ink" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <GuideCover destination={g.destination} landscape={g.landscape} width={700} shade="soft" credit={false} className="rounded-panel text-paper">
              <div className="relative p-6">
                <p className="eyebrow text-paper/70">Your trip, your way</p>
                <p className="mt-3 text-lg leading-snug">Tell GoRoam your dates, budget and crew, and get a day-by-day {g.name} plan in under a minute.</p>
                <Link href={plan} className="group mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand/90">
                  Plan it free <ArrowRight className="duo-paper size-4 transition-transform duration-500 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </GuideCover>
            <div className="rounded-panel bg-white p-6 ring-1 ring-line">
              <p className="eyebrow text-stone">More guides</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {others.map((o) => (
                  <li key={o.slug}>
                    <GuideChip slug={o.slug} name={o.name} destination={o.destination} className="bg-paper ring-0" />
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </article>
    </PublicShell>
  );
}
