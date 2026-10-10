import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqList, PublicShell } from "@/components/seo/public-shell";
import { DESTINATION_GUIDES, guideBySlug } from "@/lib/destination-guides";
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

const RATING = { best: "bg-brand text-white", good: "bg-brand-soft text-ink", avoid: "bg-paper-2 text-stone" } as const;

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28" aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="display text-[clamp(1.6rem,3vw,2.2rem)] text-ink">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();
  const trips = g.itineraries.map((s) => packageBySlug(s)).filter((p): p is NonNullable<typeof p> => !!p);
  const plan = plannerHref({ destination: g.destination, interests: [], diet: [], notes: "" });
  const others = DESTINATION_GUIDES.filter((d) => d.slug !== g.slug).slice(0, 6);

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
        <header className="max-w-3xl">
          <p className="eyebrow text-stone">{g.state}, India · Travel guide</p>
          <h1 className="display mt-4 text-[clamp(2.3rem,5vw,4rem)] text-ink">
            {g.name} <span className="accent">travel guide</span>
          </h1>
          <p className="mt-4 text-xl text-ink/80">{g.tagline}</p>
          {g.overview.map((p) => (
            <p key={p.slice(0, 20)} className="mt-4 leading-relaxed text-ink/70">
              {p}
            </p>
          ))}
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={plan} className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-ink/90">
              Plan my {g.name} trip free →
            </Link>
            {trips[0] && (
              <Link href={`/itineraries/${trips[0].slug}`} className="rounded-full bg-white px-5 py-3 text-sm text-ink ring-1 ring-line hover:ring-brand/40">
                See a ready-made itinerary
              </Link>
            )}
          </div>
        </header>

        <nav aria-label="On this page" className="no-scrollbar mt-10 flex gap-2 overflow-x-auto">
          {[
            ["best-time", "Best time"],
            ["getting-there", "Getting there"],
            ["where-to-stay", "Where to stay"],
            ["top-sights", "Top sights"],
            ["food", "Food"],
            ["budget", "Budget"],
            ["faq", "FAQ"],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="shrink-0 rounded-full bg-paper-2 px-4 py-2 text-sm text-ink/70 hover:bg-ink hover:text-paper">
              {label}
            </a>
          ))}
        </nav>

        <div className="mt-12 grid gap-16 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-16">
            <Section id="best-time" title={`Best time to visit ${g.name}`}>
              <p className="leading-relaxed text-ink/75">{g.bestTime.summary}</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {g.bestTime.months.map((m) => (
                  <li key={m.label} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-line">
                    <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs", RATING[m.rating])}>{m.label}</span>
                    <span className="text-sm text-ink/75">{m.note}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="getting-there" title={`How to reach ${g.name}`}>
              <dl className="space-y-4">
                {g.gettingThere.map((t) => (
                  <div key={t.mode} className="rounded-2xl bg-white p-5 ring-1 ring-line">
                    <dt className="font-medium text-ink">{t.mode}</dt>
                    <dd className="mt-1 leading-relaxed text-ink/70">{t.detail}</dd>
                  </div>
                ))}
              </dl>
            </Section>

            <Section id="where-to-stay" title={`Where to stay in ${g.name}`}>
              <ul className="grid gap-3 sm:grid-cols-2">
                {g.whereToStay.map((s) => (
                  <li key={s.area} className="rounded-2xl bg-white p-5 ring-1 ring-line">
                    <h3 className="font-medium text-ink">{s.area}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink/70">{s.why}</p>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="top-sights" title={`Top things to do in ${g.name}`}>
              <ol className="space-y-4">
                {g.attractions.map((a, i) => (
                  <li key={a.name} className="rounded-2xl bg-white p-5 ring-1 ring-line">
                    <h3 className="text-lg font-medium text-ink">
                      <span className="mr-2 font-mono text-sm text-brand">{String(i + 1).padStart(2, "0")}</span>
                      {a.name}
                    </h3>
                    <p className="mt-2 leading-relaxed text-ink/75">{a.description}</p>
                    <p className="mt-2 text-sm text-stone">
                      <strong className="font-medium text-ink/80">Tip:</strong> {a.tip}{" "}
                      <a className="text-brand hover:underline" href={`https://www.google.com/maps/search/?api=1&query=${a.lat},${a.lng}`} target="_blank" rel="noreferrer">
                        Map ↗
                      </a>
                    </p>
                  </li>
                ))}
              </ol>
            </Section>

            <Section id="food" title={`What to eat in ${g.name}`}>
              <ul className="grid gap-3 sm:grid-cols-2">
                {g.food.map((f) => (
                  <li key={f.name} className="rounded-2xl bg-white p-5 ring-1 ring-line">
                    <h3 className="font-medium text-ink">{f.name}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink/70">{f.note}</p>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="budget" title={`${g.name} trip cost per day`}>
              <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-line">
                <table className="w-full text-left text-sm">
                  <thead className="bg-paper-2 text-ink/70">
                    <tr>
                      <th className="px-4 py-3 font-medium">Style</th>
                      <th className="px-4 py-3 font-medium">Per person, per day</th>
                      <th className="hidden px-4 py-3 font-medium sm:table-cell">Covers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {g.budget.map((b) => (
                      <tr key={b.style}>
                        <td className="px-4 py-3 text-ink">{b.style}</td>
                        <td className="px-4 py-3 font-mono text-ink">{b.perDay}</td>
                        <td className="hidden px-4 py-3 text-stone sm:table-cell">{b.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="mt-6 list-disc space-y-2 pl-5 text-ink/75">
                {g.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </Section>

            <Section id="faq" title={`${g.name} travel FAQs`}>
              <FaqList faqs={g.faqs} />
            </Section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            {trips.length > 0 && (
              <div className="rounded-[28px] bg-white p-6 ring-1 ring-line">
                <p className="eyebrow text-stone">Ready-made itineraries</p>
                <ul className="mt-3 space-y-3">
                  {trips.map((t) => (
                    <li key={t.slug}>
                      <Link href={`/itineraries/${t.slug}`} className="block rounded-2xl bg-paper p-4 hover:bg-brand-soft">
                        <span className="block text-ink">{PACKAGE_SEO[t.slug]?.seoTitle ?? t.title}</span>
                        <span className="mt-1 block text-xs text-stone">
                          {t.days} days · from ${t.budget.toLocaleString("en-US")} for two
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-[28px] bg-ink p-6 text-paper">
              <p className="eyebrow text-paper/60">Your trip, your way</p>
              <p className="mt-3 text-lg">Tell GoRoam your dates, budget and crew, and get a day-by-day {g.name} plan in under a minute.</p>
              <Link href={plan} className="mt-5 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-medium text-white hover:bg-brand/90">
                Plan it free →
              </Link>
            </div>
            <div className="rounded-[28px] bg-white p-6 ring-1 ring-line">
              <p className="eyebrow text-stone">More guides</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link href={`/destinations/${o.slug}`} className="inline-block rounded-full bg-paper px-3 py-1.5 text-sm text-ink hover:bg-ink hover:text-paper">
                      {o.name}
                    </Link>
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
