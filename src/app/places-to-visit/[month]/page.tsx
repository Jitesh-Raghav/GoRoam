import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreateYoursBar } from "@/components/seo/create-yours";
import { HubList } from "@/components/seo/hub-list";
import { FaqList, PublicShell } from "@/components/seo/public-shell";
import { PillLink } from "@/components/site/pill";
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
  const description = `Where to travel in ${name}: ${india.slice(0, 4).map((t) => t.name).join(", ")} and more in India, plus ${abroad.slice(0, 2).map((t) => t.name).join(" and ")} abroad, with weather, budgets and day plans.`;
  return { title, description, alternates: { canonical: `/places-to-visit/${m.slug}` }, openGraph: { title, description, url: `/places-to-visit/${m.slug}` } };
}

export default async function MonthHubPage({ params }: { params: Promise<{ month: string }> }) {
  const m = monthHub((await params).month);
  if (!m) notFound();
  const name = monthName(m.month);
  const { india, abroad } = monthTrips(m.month);
  const faqs = [
    { q: `Which is the best place to visit in India in ${name}?`, a: `Top picks for ${name} are ${india.slice(0, 5).map((t) => t.name).join(", ")}.` },
    ...(abroad.length ? [{ q: `Where can I travel abroad from India in ${name}?`, a: `${abroad.slice(0, 5).map((t) => t.name).join(", ")} are all in season in ${name}.` }] : []),
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
      <div className="container-x pb-24 pt-8">
        <header className="max-w-3xl">
          <p className="eyebrow text-brand">Where to go in {name}</p>
          <h1 className="display mt-5 text-[clamp(2.2rem,5vw,4rem)] leading-[1.03] text-ink">
            Best places to visit in <span className="accent">{name}.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-stone">{m.intro}</p>
          <div className="mt-8">
            <PillLink href="/dashboard">Plan my {name} trip</PillLink>
          </div>
        </header>
        <section className="mt-14 max-w-4xl">
          <h2 className="display mb-6 text-[clamp(1.6rem,3vw,2.2rem)] text-ink">In India ({india.length})</h2>
          <HubList items={india.map((trip) => ({ trip }))} />
        </section>
        {abroad.length > 0 && (
          <section className="mt-16 max-w-4xl">
            <h2 className="display mb-6 text-[clamp(1.6rem,3vw,2.2rem)] text-ink">Abroad, easy from India ({abroad.length})</h2>
            <HubList items={abroad.map((trip) => ({ trip }))} />
          </section>
        )}
        <section className="mt-20 max-w-4xl">
          <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)] text-ink">Good questions</h2>
          <div className="mt-6">
            <FaqList faqs={faqs} />
          </div>
        </section>
        <nav aria-label="Other months" className="mt-16 flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-2 text-stone">Other months</span>
          {MONTH_HUBS.filter((o) => o.slug !== m.slug).map((o) => (
            <Link key={o.slug} href={`/places-to-visit/${o.slug}`} className="rounded-full bg-white px-3.5 py-1.5 text-sm text-ink ring-1 ring-line hover:bg-ink hover:text-paper">
              {monthName(o.month)}
            </Link>
          ))}
        </nav>
      </div>
      <CreateYoursBar href="/dashboard" place={`${name}`} source="month-hub" />
    </PublicShell>
  );
}
