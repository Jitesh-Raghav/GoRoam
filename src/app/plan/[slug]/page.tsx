import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageCard } from "@/components/packages/package-card";
import { FaqList, PublicShell } from "@/components/seo/public-shell";
import { ArrowRight, Check } from "@/components/site/icons";
import { TripComposer } from "@/components/site/trip-composer";
import { packageCards } from "@/lib/packages-data";
import { JsonLd, absolute, breadcrumbs, faqPage } from "@/lib/seo";
import { USE_CASES, tripTypeBySlug } from "@/lib/use-cases";
import { FALLBACK_ICON, USE_CASE_ICON } from "@/lib/use-case-icons";

export const dynamicParams = false;
export const generateStaticParams = () => USE_CASES.map((u) => ({ slug: u.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const u = tripTypeBySlug((await params).slug);
  if (!u) return {};
  return {
    title: u.title,
    description: u.description,
    alternates: { canonical: `/plan/${u.slug}` },
    openGraph: { title: `${u.title} · GoRoam`, description: u.description, type: "website", url: `/plan/${u.slug}` },
    twitter: { card: "summary_large_image", title: u.title, description: u.description },
  };
}

const STEPS = [
  { title: "Describe it in a sentence", text: "Where, how long, who's coming and what you love. Or use the pickers." },
  { title: "Get every day planned", text: "Real places with times, costs, a map and stays, in about a minute." },
  { title: "Make it yours", text: "Edit any day, swap stops, share it, and take it on the trip offline." },
];

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const u = tripTypeBySlug((await params).slug);
  if (!u) notFound();
  const Icon = USE_CASE_ICON[u.slug] ?? FALLBACK_ICON;
  const all = await packageCards();
  const samples = u.samples.map((slug) => all.find((c) => c.slug === slug)).filter((c): c is NonNullable<typeof c> => !!c).slice(0, 3);
  const others = USE_CASES.filter((o) => o.slug !== u.slug);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Plan a trip", href: "/plan" },
    { name: u.label, href: `/plan/${u.slug}` },
  ];

  return (
    <PublicShell crumbs={crumbs}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: u.title,
            description: u.description,
            url: absolute(`/plan/${u.slug}`),
            isPartOf: { "@id": absolute("/#website") },
            about: { "@type": "Thing", name: u.h1 },
          },
          breadcrumbs(crumbs.map((c) => ({ name: c.name, path: c.href }))),
          faqPage(u.faqs),
        ]}
      />
      <div className="container-x pb-24 pt-8">
        {/* Hero: the phrase people search, and the composer to start right away. */}
        <header className="relative overflow-hidden rounded-panel bg-[linear-gradient(160deg,#22397A_0%,#4766C4_55%,#86A3EC_100%)] px-5 pb-10 pt-12 text-center text-paper sm:px-10 sm:pb-14 sm:pt-16">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]" />
          <div className="relative">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
              <Icon className="size-6" />
            </span>
            <p className="eyebrow mt-5 text-paper/70">GoRoam AI trip planner</p>
            <h1 className="display mx-auto mt-3 max-w-[18ch] text-[clamp(2.3rem,5.4vw,4.2rem)] leading-[1.02] tracking-[-0.03em] [&_.accent]:!text-sun-2">
              {u.h1.split(" ").slice(0, -1).join(" ")} <span className="accent">{u.h1.split(" ").slice(-1)}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-[38rem] text-base leading-relaxed text-paper/80 sm:text-lg">{u.lede}</p>
            <div className="mt-8 text-left">
              <TripComposer seed={u.prompt} />
            </div>
          </div>
        </header>

        {/* What GoRoam does for this kind of trip. */}
        <section className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16" aria-labelledby="how-h">
          <div>
            <p className="eyebrow text-brand">How it plans</p>
            <h2 id="how-h" className="display mt-3 text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.08] text-ink">
              {u.label === "Solo" ? "Solo trips" : u.label}, planned the way you&apos;d plan them yourself
            </h2>
            <div className="mt-5 space-y-4 text-[1.05rem] leading-relaxed text-stone">
              {u.body.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>
          <ul className="grid content-start gap-3">
            {u.perks.map((perk) => (
              <li key={perk.title} className="flex gap-4 rounded-[22px] bg-white p-5 ring-1 ring-line">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Check className="size-4" />
                </span>
                <span>
                  <span className="block text-ink">{perk.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-stone">{perk.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Steps */}
        <section className="mt-16 rounded-panel bg-ink p-6 text-paper sm:p-10" aria-labelledby="steps-h">
          <h2 id="steps-h" className="display text-[clamp(1.5rem,2.8vw,2rem)]">
            From one sentence to a whole trip
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-[22px] bg-white/[0.06] p-5 ring-1 ring-white/10">
                <span className="font-mono text-xs text-sun-2">0{i + 1}</span>
                <span className="mt-2 block text-lg">{s.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-paper/70">{s.text}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Sample itineraries */}
        {samples.length > 0 && (
          <section className="mt-16" aria-labelledby="samples-h">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow text-brand">Sample itineraries</p>
                <h2 id="samples-h" className="display mt-3 text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.08] text-ink">
                  Trips {u.label === "Solo" ? "solo travellers" : u.label.toLowerCase()} love
                </h2>
              </div>
              <Link href="/itineraries" className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-ink">
                All itineraries <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {samples.map((pkg, i) => (
                <PackageCard key={pkg.slug} pkg={pkg} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="mt-16" aria-labelledby="faq-h">
          <p className="eyebrow text-brand">Good questions</p>
          <h2 id="faq-h" className="display mt-3 text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.08] text-ink">
            {u.h1.replace(/^./, (c) => c.toUpperCase())}: FAQs
          </h2>
          <div className="mt-6">
            <FaqList faqs={u.faqs} />
          </div>
        </section>

        {/* Other kinds of trip */}
        <nav className="mt-16" aria-labelledby="more-h">
          <h2 id="more-h" className="display text-[clamp(1.4rem,2.6vw,1.8rem)] text-ink">
            Plan another kind of trip
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {others.map((o) => {
              const OIcon = USE_CASE_ICON[o.slug] ?? FALLBACK_ICON;
              return (
                <li key={o.slug}>
                  <Link href={`/plan/${o.slug}`} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-paper">
                    <OIcon className="size-4 text-brand" />
                    {o.h1.replace(/^./, (c) => c.toUpperCase())}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </PublicShell>
  );
}
