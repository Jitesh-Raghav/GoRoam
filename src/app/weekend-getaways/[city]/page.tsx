import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreateYoursBar } from "@/components/seo/create-yours";
import { HubList } from "@/components/seo/hub-list";
import { FaqList, PublicShell } from "@/components/seo/public-shell";
import { tripPhotoSet } from "@/components/seo/trip-card";
import { PageCover } from "@/components/site/page-cover";
import { PillLink } from "@/components/site/pill";
import { SectionHead } from "@/components/site/section-head";
import { JsonLd, absolute, breadcrumbs, faqPage } from "@/lib/seo";
import { CITY_HUBS, cityHub, cityTrips } from "@/lib/trip-hubs";
import { price } from "@/lib/trip-ideas";

export const dynamicParams = false;
export const generateStaticParams = () => CITY_HUBS.map((c) => ({ city: c.slug }));

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const c = cityHub((await params).city);
  if (!c) return {};
  const n = cityTrips(c).length;
  const title = `${n} Best Weekend Getaways & Short Trips from ${c.city} (2026)`;
  const description = `Where to go from ${c.city} this season: ${cityTrips(c).slice(0, 4).map((x) => x.trip.name).join(", ")} and more, with how to get there, budgets and day plans.`;
  return { title, description, alternates: { canonical: `/weekend-getaways/${c.slug}` }, openGraph: { title, description, url: `/weekend-getaways/${c.slug}` } };
}

export default async function CityHubPage({ params }: { params: Promise<{ city: string }> }) {
  const c = cityHub((await params).city);
  if (!c) notFound();
  const items = cityTrips(c);
  const cheapest = [...items].sort((a, b) => a.trip.budget[0] - b.trip.budget[0])[0];
  const others = CITY_HUBS.filter((o) => o.slug !== c.slug);
  const faqs = [
    { q: `What are the best weekend getaways from ${c.city}?`, a: `${items.slice(0, 5).map((x) => x.trip.name).join(", ")} are the most popular short trips from ${c.city} right now.` },
    { q: `What is the cheapest trip from ${c.city}?`, a: cheapest ? `${cheapest.trip.name}, from about ${price(cheapest.trip, cheapest.trip.budget[0])} a day per person on a budget, plus travel (${cheapest.how}).` : "" },
    { q: `How do I plan a trip from ${c.city}?`, a: `Pick a place below, then tell GoRoam your dates, budget and who's going; it plans every day with timings, costs, stays and how to get there from ${c.city}.` },
  ];
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Weekend getaways", path: "/weekend-getaways" },
    { name: `From ${c.city}`, path: `/weekend-getaways/${c.slug}` },
  ];
  return (
    <PublicShell crumbs={crumbs.map((x) => ({ name: x.name, href: x.path }))}>
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "ItemList", name: `Weekend getaways from ${c.city}`, itemListElement: items.map((x, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(`/trips/${x.trip.slug}`), name: x.trip.name })) },
          faqPage(faqs),
          breadcrumbs(crumbs),
        ]}
      />
      <div className="container-x pb-24 pt-6">
        <PageCover
          eyebrow={`Short trips from ${c.city}`}
          title={
            <>
              Best getaways from <span className="accent">{c.city}.</span>
            </>
          }
          lede={c.intro}
          stats={[
            { value: String(items.length), label: "short trips" },
            ...(cheapest ? [{ value: price(cheapest.trip, cheapest.trip.budget[0]), label: "a day, at the cheapest" }] : []),
            { value: String(new Set(items.map((x) => x.trip.region)).size), label: "states and regions" },
          ]}
          links={others.slice(0, 3).map((o) => ({ href: `/weekend-getaways/${o.slug}`, label: `From ${o.city}` }))}
          photos={items.slice(0, 3).map((x) => ({ src: `/trips/${x.trip.slug}/photo?w=1080&blank=1`, srcSet: tripPhotoSet(x.trip.slug), href: `/trips/${x.trip.slug}`, label: x.trip.name }))}
        >
          <PillLink href={`/dashboard?notes=${encodeURIComponent(`Starting from ${c.city}`)}`} className="mt-8">
            Plan a trip from {c.city}
          </PillLink>
        </PageCover>
        <section aria-labelledby="list-h" className="mt-24 max-w-4xl">
          <SectionHead id="list-h" kicker="The list" title={`${items.length} getaways from ${c.city}`} className="mb-8" />
          <HubList items={items} />
        </section>
        <section aria-labelledby="faq-h" className="mt-24 max-w-4xl">
          <SectionHead id="faq-h" kicker="Questions" title="Good questions" />
          <div className="mt-8">
            <FaqList faqs={faqs} />
          </div>
        </section>
        <nav aria-label="Other cities" className="mt-16 flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-2 text-stone">Getaways from</span>
          {others.map((o) => (
            <Link key={o.slug} href={`/weekend-getaways/${o.slug}`} className="rounded-full bg-paper-2 px-3.5 py-1.5 text-sm text-ink transition-colors hover:bg-ink hover:text-paper">
              {o.city}
            </Link>
          ))}
        </nav>
      </div>
      <CreateYoursBar href={`/dashboard?notes=${encodeURIComponent(`Starting from ${c.city}`)}`} place={`${c.city} getaway`} source="city-hub" />
    </PublicShell>
  );
}
