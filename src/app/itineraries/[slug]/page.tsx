import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TripView } from "@/components/itinerary/trip-view";
import { CreateYoursBar } from "@/components/seo/create-yours";
import { FaqList, PublicShell } from "@/components/seo/public-shell";
import { FactStrip } from "@/components/site/fact-strip";
import { CalendarDays, Clock3, Coins, Footprints } from "@/components/site/icons";
import { PillLink } from "@/components/site/pill";
import { Price } from "@/components/site/price";
import { SectionHead } from "@/components/site/section-head";
import { guideBySlug } from "@/lib/destination-guides";
import { PACKAGES, packageBySlug } from "@/lib/packages";
import { loadPackage, packageTrip } from "@/lib/packages-data";
import { PACKAGE_SEO } from "@/lib/packages-seo";
import { plannerHref } from "@/lib/prompt-parse";
import { JsonLd, absolute, breadcrumbs, faqPage } from "@/lib/seo";
import { dayActivities, type DayItinerary } from "@/lib/trip";

export const dynamicParams = false;
export const generateStaticParams = () => PACKAGES.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pkg = packageBySlug(slug);
  const seo = PACKAGE_SEO[slug];
  if (!pkg) return {};
  const title = seo?.seoTitle ?? pkg.title;
  const description = seo?.description ?? pkg.tagline;
  return {
    title,
    description,
    alternates: { canonical: `/itineraries/${slug}` },
    openGraph: { title, description, type: "article", url: `/itineraries/${slug}`, images: [{ url: `/itineraries/${slug}/photo?w=1200&h=630`, width: 1200, height: 630, alt: pkg.title }] },
    twitter: { card: "summary_large_image", title, description, images: [`/itineraries/${slug}/photo?w=1200&h=630`] },
  };
}

export default async function ItineraryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = packageBySlug(slug);
  const data = pkg ? await loadPackage(slug) : null;
  if (!pkg || !data) notFound();
  const seo = PACKAGE_SEO[slug];
  const guide = seo?.guide ? guideBySlug(seo.guide) : undefined;
  const days: DayItinerary[] = data.itinerary ?? [];
  const related = PACKAGES.filter((p) => p.slug !== slug && PACKAGE_SEO[p.slug]?.region === seo?.region).slice(0, 3);
  const plan = plannerHref({ destination: pkg.destination, days: pkg.days, budget: pkg.budget, interests: pkg.interests, diet: [], notes: "" });

  const trip = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: seo?.seoTitle ?? pkg.title,
    description: seo?.description ?? pkg.tagline,
    url: absolute(`/itineraries/${slug}`),
    touristType: seo?.whoFor,
    provider: { "@type": "Organization", name: "GoRoam", url: absolute("/") },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free itinerary" },
    itinerary: {
      "@type": "ItemList",
      numberOfItems: days.reduce((n, d) => n + dayActivities(d).length, 0),
      itemListElement: days
        .flatMap((d) => dayActivities(d))
        .map((a, n) => ({
          "@type": "ListItem",
          position: n + 1,
          item: {
            "@type": "TouristAttraction",
            name: a.place.name,
            description: a.place.description,
            ...(a.place.lat && a.place.lng ? { geo: { "@type": "GeoCoordinates", latitude: a.place.lat, longitude: a.place.lng } } : {}),
            ...(a.place.area ? { address: { "@type": "PostalAddress", addressLocality: a.place.area, addressCountry: pkg.country } } : {}),
          },
        })),
    },
  };

  return (
    <PublicShell
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Itineraries", href: "/itineraries" },
        { name: pkg.title, href: `/itineraries/${slug}` },
      ]}
    >
      <JsonLd
        data={[
          trip,
          ...(seo ? [faqPage(seo.faqs)] : []),
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Itineraries", path: "/itineraries" },
            { name: pkg.title, path: `/itineraries/${slug}` },
          ]),
        ]}
      />

      {/* What the search result promised, readable before any script runs. */}
      <section className="container-x pt-6">
        <div className="max-w-3xl">
          <p className="eyebrow text-brand">{pkg.country} · Ready-made itinerary</p>
          <h1 className="display mt-5 text-[clamp(2.2rem,4.8vw,3.75rem)] leading-[1.02] tracking-[-0.025em] text-ink">{seo?.seoTitle ?? pkg.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-stone">{seo?.intro ?? pkg.tagline}</p>
        </div>
        <FactStrip
          className="mt-9"
          facts={[
            { icon: Clock3, label: "Length", value: `${pkg.days} days` },
            {
              icon: Coins,
              label: "Budget for two",
              value: (
                <>
                  <Price usd={pkg.budget} /> incl. stays
                </>
              ),
            },
            { icon: CalendarDays, label: "Best time", value: pkg.bestTime },
            { icon: Footprints, label: "Pace", value: pkg.pace[0].toUpperCase() + pkg.pace.slice(1) },
          ]}
        />
        {seo?.whoFor && (
          <p className="mt-5 max-w-3xl text-stone">
            <span className="font-medium text-ink">Who it suits:</span> {seo.whoFor}
          </p>
        )}

        {/* The route at a glance, as plain text for readers and crawlers. */}
        <section aria-labelledby="glance-h" className="mt-14">
          <SectionHead id="glance-h" kicker="Route at a glance" title={`${pkg.days} days, stop by stop`} size="sm" as="h2" />
          <ol className="mt-8 grid gap-x-12 md:grid-cols-2">
            {days.map((d, i) => (
              <li key={i} className="relative border-l border-line pb-9 pl-7 last:pb-0 md:[&:nth-last-child(2):nth-child(odd)]:pb-0">
                <span aria-hidden className={i === 0 ? "absolute -left-[6px] top-1.5 size-3 rounded-full bg-brand ring-4 ring-paper" : "absolute -left-[6px] top-1.5 size-3 rounded-full bg-ink ring-4 ring-paper"} />
                <p className="font-mono text-xs text-stone">Day {i + 1}</p>
                <h3 className="mt-1 text-lg font-medium leading-snug text-ink">{d.theme}</h3>
                <ul className="mt-2.5 space-y-1.5 text-[0.95rem]">
                  {dayActivities(d).map((a) => (
                    <li key={a.place.name} className="flex gap-3 text-stone">
                      <span className="w-[4.75rem] shrink-0 whitespace-nowrap tabular-nums text-ink/70">{a.time.split(" - ")[0]}</span>
                      <span className="min-w-0">
                        {a.place.name}
                        {a.place.area ? `, ${a.place.area}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>
      </section>

      <div className="px-3 pt-12 min-[400px]:px-4 sm:px-6 lg:px-8">
        <TripView it={packageTrip(pkg, data)} variant="package" />
      </div>

      <section className="container-x pb-20 pt-16">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <div className="min-w-0">
            {seo && (
              <>
                <SectionHead kicker="Questions" title="Questions about this trip" />
                <div className="mt-8">
                  <FaqList faqs={seo.faqs} />
                </div>
              </>
            )}
          </div>
          <aside className="space-y-10 lg:pt-2">
            <div>
              <p className="eyebrow text-brand">Make it yours</p>
              <p className="mt-3 leading-relaxed text-ink">Different dates, budget or crew? Plan your own version in about a minute.</p>
              <PillLink href={plan} className="mt-4">
                Customise this trip
              </PillLink>
            </div>
            {guide && (
              <div className="border-t border-line pt-6">
                <p className="eyebrow text-stone">Destination guide</p>
                <Link href={`/destinations/${guide.slug}`} prefetch={false} className="mt-2 block text-lg text-ink underline decoration-line underline-offset-4 transition-colors hover:text-brand">
                  {guide.name} travel guide
                </Link>
                <p className="mt-1 text-sm text-stone">Best time, where to stay, costs and top sights.</p>
              </div>
            )}
            {related.length > 0 && (
              <div className="border-t border-line pt-6">
                <p className="eyebrow text-stone">More trips like this</p>
                <ul className="mt-3 space-y-2.5">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/itineraries/${r.slug}`} prefetch={false} className="text-ink underline decoration-line underline-offset-4 transition-colors hover:text-brand">
                        {r.title}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/itineraries" prefetch={false} className="text-sm text-stone transition-colors hover:text-brand">
                      All itineraries →
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>
      <CreateYoursBar href={plan} place={pkg.name} days={pkg.days} source="itinerary" />
    </PublicShell>
  );
}
