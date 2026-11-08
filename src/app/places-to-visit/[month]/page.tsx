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
import { MONTH_HUBS, monthHub, monthName, monthTrips } from "@/lib/trip-hubs";

export const dynamicParams = false;
export const generateStaticParams = () => MONTH_HUBS.map((m) => ({ month: m.slug }));

export async function generateMetadata({ params }: { params: Promise<{ month: string }> }): Promise<Metadata> {
  const m = monthHub((await params).month);
  if (!m) return {};
  const { india, abroad } = monthTrips(m.month);
  const name = monthName(m.month);
  const title = `Best Places to Visit in ${name} 2026: ${india.length} in India + ${abroad.length} Abroad`;
  const description = `Where to travel in ${name}: ${india.slice(0, 4).map((t) => t.name).join(", ")} and more in India, plus ${abroad.slice(0, 3).map((t) => t.name).join(", ")} and more around the world, with weather, budgets and day plans.`;
  return { title, description, alternates: { canonical: `/places-to-visit/${m.slug}` }, openGraph: { title, description, url: `/places-to-visit/${m.slug}` } };
}

export default async function MonthHubPage({ params }: { params: Promise<{ month: string }> }) {
  const m = monthHub((await params).month);
  if (!m) notFound();
  const name = monthName(m.month);
  const { india, abroad } = monthTrips(m.month);
  const faqs = [
    { q: `Which is the best place to visit in India in ${name}?`, a: `Top picks for ${name} are ${india.slice(0, 5).map((t) => t.name).join(", ")}.` },
    ...(abroad.length ? [{ q: `Where can I travel abroad in ${name}?`, a: `${abroad.slice(0, 5).map((t) => t.name).join(", ")} are all in season in ${name}.` }] : []),
    { q: `Where can I see snow in ${name}?`, a: india.filter((t) => t.tags.includes("snow")).map((t) => t.name).join(", ") || `Snow is unlikely in most of India in ${name}.` },
  ];
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Places to visit", path: "/places-to-visit" },
    { name: name, path: `/places-to-visit/${m.slug}` },
  ];
  const all = [...india, ...abroad];
  return (
    <PublicShell crumbs={crumbs.map((x) => ({ name: x.name, href: x.path }))}>
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "ItemList", name: `Best places to visit in ${name}`, itemListElement: all.map((t, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(`/trips/${t.slug}`), name: t.name })) },
          faqPage(faqs),
          breadcrumbs(crumbs),
        ]}
      />
      <div className="container-x pb-24 pt-6">
        <PageCover
          eyebrow={`Where to go in ${name}`}
          title={
            <>
              Best places to visit in <span className="accent">{name}.</span>
            </>
          }
          lede={m.intro}
          stats={[
            { value: String(india.length), label: "in India" },
            { value: String(abroad.length), label: "around the world" },
            { value: String(all.filter((t) => t.tags.includes("festival")).length), label: "with a festival on" },
          ]}
          links={[
            { href: "#india", label: "In India" },
            ...(abroad.length ? [{ href: "#abroad", label: "Around the world" }] : []),
            { href: "/trips", label: "Every trip" },
          ]}
          photos={[...india.slice(0, 2), ...abroad.slice(0, 1)].map((t) => ({ src: `/trips/${t.slug}/photo?w=1080&blank=1`, srcSet: tripPhotoSet(t.slug), href: `/trips/${t.slug}`, label: t.name }))}
        >
          <PillLink href="/dashboard" className="mt-8">
            Plan my {name} trip
          </PillLink>
        </PageCover>
        <section id="india" aria-labelledby="india-h" className="mt-24 max-w-4xl scroll-mt-24">
          <SectionHead id="india-h" kicker="In India" title={`${india.length} places at their best in ${name}`} className="mb-8" />
          <HubList items={india.map((trip) => ({ trip }))} />
        </section>
        {abroad.length > 0 && (
          <section id="abroad" aria-labelledby="abroad-h" className="mt-20 max-w-4xl scroll-mt-24">
            <SectionHead id="abroad-h" kicker="Around the world" title={`${abroad.length} trips abroad for ${name}`} className="mb-8" />
            <HubList items={abroad.map((trip) => ({ trip }))} />
          </section>
        )}
        <section aria-labelledby="faq-h" className="mt-24 max-w-4xl">
          <SectionHead id="faq-h" kicker="Questions" title="Good questions" />
          <div className="mt-8">
            <FaqList faqs={faqs} />
          </div>
        </section>
        <nav aria-label="Other months" className="mt-16 flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-2 text-stone">Other months</span>
          {MONTH_HUBS.filter((o) => o.slug !== m.slug).map((o) => (
            <Link key={o.slug} href={`/places-to-visit/${o.slug}`} className="rounded-full bg-paper-2 px-3.5 py-1.5 text-sm text-ink transition-colors hover:bg-ink hover:text-paper">
              {monthName(o.month)}
            </Link>
          ))}
        </nav>
      </div>
      <CreateYoursBar href="/dashboard" place={`${name}`} source="month-hub" />
    </PublicShell>
  );
}
