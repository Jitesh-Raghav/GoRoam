import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TripView } from "@/components/itinerary/trip-view";
import { FaqList, PublicShell } from "@/components/seo/public-shell";
import { ArrowRight } from "@/components/site/icons";
import { guideBySlug } from "@/lib/destination-guides";
import { PACKAGES, packageBySlug } from "@/lib/packages";
import { loadPackage, packageTrip } from "@/lib/packages-data";
import { PACKAGE_SEO } from "@/lib/packages-seo";
import { plannerHref } from "@/lib/prompt-parse";
import { JsonLd, absolute, breadcrumbs, faqPage } from "@/lib/seo";
import type { DayItinerary } from "@/lib/trip";

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
    openGraph: { title, description, type: "article", url: `/itineraries/${slug}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

const SLOTS = ["morning", "afternoon", "evening"] as const;
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

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
      numberOfItems: days.length * 3,
      itemListElement: days.flatMap((d, di) =>
        SLOTS.map((s) => d[s]).filter(Boolean).map((a, si) => ({
          "@type": "ListItem",
          position: di * 3 + si + 1,
          item: {
            "@type": "TouristAttraction",
            name: a.place.name,
            description: a.place.description,
            ...(a.place.lat && a.place.lng ? { geo: { "@type": "GeoCoordinates", latitude: a.place.lat, longitude: a.place.lng } } : {}),
            ...(a.place.area ? { address: { "@type": "PostalAddress", addressLocality: a.place.area, addressCountry: pkg.country } } : {}),
          },
        }))
      ),
    },
  };

  return (
    <PublicShell
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Trip gallery", href: "/itineraries" },
        { name: pkg.title, href: `/itineraries/${slug}` },
      ]}
    >
      <JsonLd
        data={[
          trip,
          ...(seo ? [faqPage(seo.faqs)] : []),
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Trip gallery", path: "/itineraries" },
            { name: pkg.title, path: `/itineraries/${slug}` },
          ]),
        ]}
      />

      {/* What the search result promised, readable before any script runs. */}
      <section className="container-x pt-6">
        <div className="max-w-3xl">
          <p className="eyebrow text-brand">
            {pkg.country} · Ready-made itinerary
          </p>
          <h1 className="display mt-5 text-[clamp(2.1rem,4.6vw,3.5rem)] leading-[1.04] text-ink">{seo?.seoTitle ?? pkg.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-stone">{seo?.intro ?? pkg.tagline}</p>
        </div>
        <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: "Length", v: `${pkg.days} days` },
            { k: "Budget for two", v: `${usd(pkg.budget)} incl. stays` },
            { k: "Best time", v: pkg.bestTime },
            { k: "Pace", v: pkg.pace[0].toUpperCase() + pkg.pace.slice(1) },
          ].map((f) => (
            <div key={f.k} className="rounded-card bg-white p-4 ring-1 ring-line">
              <dt className="eyebrow text-[0.6rem] text-stone">{f.k}</dt>
              <dd className="mt-1.5 text-ink">{f.v}</dd>
            </div>
          ))}
        </dl>
        {seo?.whoFor && (
          <p className="mt-4 max-w-3xl text-ink/70">
            <strong className="font-medium text-ink">Who it suits:</strong> {seo.whoFor}
          </p>
        )}

        {/* The plan at a glance, as plain text for readers and crawlers. */}
        <ol className="mt-10 grid gap-3 md:grid-cols-2">
          {days.map((d, i) => (
            <li key={i} className="rounded-card bg-white p-5 ring-1 ring-line">
              <h2 className="text-lg font-medium text-ink">
                Day {i + 1}: {d.theme}
              </h2>
              <ul className="mt-2 space-y-1 text-sm text-stone">
                {SLOTS.map((s) => d[s]).filter(Boolean).map((a) => (
                  <li key={a.place.name}>
                    <span className="text-ink/80">{a.time.split(" - ")[0]}</span> · {a.place.name}
                    {a.place.area ? `, ${a.place.area}` : ""}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <div className="px-3 pt-12 min-[400px]:px-4 sm:px-6 lg:px-8">
        <TripView it={packageTrip(pkg, data)} variant="package" />
      </div>

      <section className="container-x pb-20 pt-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div>
            {seo && (
              <>
                <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)] text-ink">Questions about this trip</h2>
                <div className="mt-6">
                  <FaqList faqs={seo.faqs} />
                </div>
              </>
            )}
          </div>
          <aside className="space-y-4">
            <div className="rounded-panel bg-ink p-6 text-paper">
              <p className="eyebrow text-paper/60">Make it yours</p>
              <p className="mt-3 text-lg">Different dates, budget or crew? Plan your own version in a minute.</p>
              <Link href={plan} className="group mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-medium text-white hover:bg-brand/90">
                Customise this trip <ArrowRight className="duo-paper size-4 transition-transform duration-500 group-hover:translate-x-0.5" />
              </Link>
            </div>
            {guide && (
              <Link href={`/destinations/${guide.slug}`} className="block rounded-panel bg-white p-6 ring-1 ring-line hover:ring-brand/40">
                <p className="eyebrow text-stone">Destination guide</p>
                <p className="mt-2 inline-flex items-center gap-2 text-lg text-ink">
                  {guide.name} travel guide <ArrowRight className="size-4 text-brand" />
                </p>
                <p className="mt-1 text-sm text-stone">Best time, where to stay, costs and top sights.</p>
              </Link>
            )}
            {related.length > 0 && (
              <div className="rounded-panel bg-white p-6 ring-1 ring-line">
                <p className="eyebrow text-stone">More trips like this</p>
                <ul className="mt-3 space-y-2">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/itineraries/${r.slug}`} className="inline-flex items-center gap-2 text-ink hover:text-brand">
                        {r.title} <ArrowRight className="size-3.5 text-brand" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>
    </PublicShell>
  );
}
