import type { Metadata } from "next";
import Link from "next/link";
import { CopyText } from "@/components/index/copy-text";
import { IndexTable, type TableIndex } from "@/components/index/index-table";
import { ZoneChart } from "@/components/index/zone-chart";
import { FaqList, PublicShell } from "@/components/seo/public-shell";
import { ArrowRight, Download } from "@/components/site/icons";
import { COMPANY } from "@/lib/company";
import { JsonLd, absolute, breadcrumbs, faqPage } from "@/lib/seo";
import { MONTH_NAMES, TRIP_IDEAS } from "@/lib/trip-ideas";
import { INDEXES, INDEX_NAME, INDEX_UPDATED, bestValueByMonth, findings, indexFaqs, indexRows, median, money, zoneStats, type IndexId, type IndexRow } from "@/lib/trip-index";

const PATH = "/trip-cost-index";
const DESCRIPTION = `What ${TRIP_IDEAS.length} trips really cost per person a day, from Jaisalmer to Bora Bora: medians by region, the cheapest and priciest trips, best value by month and the full index to download.`;

export const metadata: Metadata = {
  title: "Trip Cost Index 2026: What 160 Trips Cost Per Day in India & Worldwide",
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: INDEX_NAME, description: DESCRIPTION, type: "article", url: PATH, modifiedTime: INDEX_UPDATED },
  twitter: { card: "summary_large_image", title: INDEX_NAME, description: DESCRIPTION },
};

const updated = new Date(`${INDEX_UPDATED}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const CITATION = `Source: ${INDEX_NAME}, ${absolute(PATH)}`;
const SNIPPET = `<a href="${absolute(PATH)}">${INDEX_NAME}</a>`;

function Heading({ id, n, eyebrow, title, intro }: { id: string; n: string; eyebrow: string; title: string; intro?: string }) {
  return (
    <div>
      <p className="flex items-center gap-3 text-brand">
        <span className="font-mono text-xs text-stone-2">{n}</span>
        <span aria-hidden className="h-px w-8 bg-brand/30" />
        <span className="eyebrow">{eyebrow}</span>
      </p>
      <h2 id={id} className="display mt-3 text-[clamp(1.75rem,3.2vw,2.4rem)] leading-[1.06] tracking-[-0.02em] text-ink">
        {title}
      </h2>
      {intro && <p className="mt-3 max-w-2xl leading-relaxed text-stone">{intro}</p>}
    </div>
  );
}

/** Ten trips ranked by mid-range day, with a thin bar against the index's dearest trip. */
function Ranked({ id, title, rows, max }: { id: IndexId; title: string; rows: IndexRow[]; max: number }) {
  return (
    <div>
      <h3 className="flex items-baseline justify-between border-b border-ink pb-2.5">
        <span className="display text-[1.15rem] text-ink">{title}</span>
        <span className="text-xs text-stone">Mid-range, a day</span>
      </h3>
      <ol className="divide-y divide-line">
        {rows.map((r, i) => (
          <li key={r.slug} className="grid grid-cols-[1.75rem_minmax(0,1fr)_4.75rem] items-center gap-3 py-3">
            <span className="font-mono text-xs text-stone">{String(i + 1).padStart(2, "0")}</span>
            <span className="min-w-0">
              <Link href={`/trips/${r.slug}`} className="block truncate text-[0.95rem] text-ink hover:text-brand">
                {r.name}
              </Link>
              <span aria-hidden className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-paper-2">
                <span className="block h-full rounded-full bg-brand" style={{ width: `${Math.max(3, (r.mid / max) * 100)}%` }} />
              </span>
            </span>
            <span className="text-right text-sm tabular-nums text-ink">{money(id, r.mid)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function TripCostIndexPage() {
  const rows = { india: indexRows("india"), world: indexRows("world") };
  const home = rows.india.filter((r) => r.country === "India");
  const countries = new Set(TRIP_IDEAS.map((t) => t.country)).size;
  const facts = findings();
  const faqs = indexFaqs();
  const months = { india: bestValueByMonth("india"), world: bestValueByMonth("world") };
  const tables: TableIndex[] = INDEXES.map((ix) => ({ id: ix.id, label: ix.label, currency: ix.currency, rows: rows[ix.id].map(({ slug, name, place, zone, days, low, mid, high, forTwo, best }) => ({ slug, name, place, zone, days, low, mid, high, forTwo, best })) }));

  const stats = [
    { k: "Trips in the index", v: String(TRIP_IDEAS.length) },
    { k: "Countries", v: String(countries) },
    { k: "Median mid-range day in India", v: money("india", median(home.map((r) => r.mid))) },
    { k: "Median mid-range day worldwide", v: money("world", median(rows.world.map((r) => r.mid))) },
  ];

  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: INDEX_NAME,
    description: DESCRIPTION,
    url: absolute(PATH),
    keywords: ["travel cost", "trip budget", "cost of travel per day", "India travel cost", "travel prices 2026"],
    license: "https://creativecommons.org/licenses/by/4.0/",
    isAccessibleForFree: true,
    dateModified: INDEX_UPDATED,
    temporalCoverage: "2026",
    creator: { "@type": "Organization", name: COMPANY.name, url: absolute("/") },
    variableMeasured: ["Backpacker cost per person per day", "Mid-range cost per person per day", "Luxury cost per person per day", "Mid-range trip cost for two"],
    distribution: [{ "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: absolute(`${PATH}/data.csv`) }],
  };
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Trending trips", path: "/trips" },
    { name: "Trip Cost Index", path: PATH },
  ];

  return (
    <PublicShell crumbs={crumbs.map((c) => ({ name: c.name, href: c.path }))}>
      <JsonLd data={[dataset, faqPage(faqs), breadcrumbs(crumbs)]} />
      <article className="container-x pb-24 pt-6">
        {/* Masthead */}
        <header className="max-w-4xl">
          <p className="font-mono text-xs text-stone">
            Data · Updated <time dateTime={INDEX_UPDATED}>{updated}</time>
          </p>
          <h1 className="display mt-5 text-[clamp(2.6rem,6.4vw,4.75rem)] leading-[0.98] tracking-[-0.03em] text-ink">GoRoam Trip Cost Index 2026</h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-ink/75">
            What {TRIP_IDEAS.length} trips really cost per person a day, from Jaisalmer to Bora Bora, at backpacker, mid-range and luxury levels.
          </p>
        </header>
        <dl className="mt-12 grid grid-cols-2 border-y border-ink lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.k} className={`py-6 pr-4 ${i % 2 === 1 ? "pl-4 sm:pl-6" : ""} ${i > 0 ? "lg:border-l lg:border-line lg:pl-6" : ""} ${i === 1 ? "border-l border-line" : ""} ${i === 3 ? "border-l border-line" : ""} ${i > 1 ? "border-t border-line lg:border-t-0" : ""}`}>
              <dt className="text-sm text-stone">{s.k}</dt>
              <dd className="display mt-2 text-[clamp(2rem,4vw,3rem)] leading-none text-ink">{s.v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-20 grid grid-cols-1 gap-20">
          {/* Findings */}
          <section aria-labelledby="findings-h">
            <Heading id="findings-h" n="01" eyebrow="Key findings" title="What the numbers say" intro="Every line is worked out from the index below. Copy any of them as they are; please link back when you use one." />
            <ol className="mt-8 divide-y divide-line border-y border-line">
              {facts.map((f, i) => (
                <li key={f} className="grid gap-3 py-5 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-start sm:gap-6">
                  <span className="font-mono text-xs text-stone sm:pt-1.5">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-[1.1rem] leading-relaxed text-ink">{f}</p>
                  <CopyText text={`${f} (${CITATION})`} className="justify-self-start" />
                </li>
              ))}
            </ol>
          </section>

          {/* By region */}
          <section aria-labelledby="regions-h">
            <Heading id="regions-h" n="02" eyebrow="By region" title="Cost of a day by region" intro="The median mid-range day per person in each zone. Hover or tab to a bar for the backpacker and luxury medians and the cheapest trip there." />
            <div className="mt-10 grid gap-14 lg:grid-cols-2 lg:gap-12">
              {INDEXES.map((ix) => (
                <ZoneChart
                  key={ix.id}
                  title={`${ix.label}: median mid-range day, ${ix.currency === "USD" ? "US dollars" : "Indian rupees"}`}
                  bars={zoneStats(ix.id).map((z) => ({ zone: z.zone, value: z.mid, mid: money(ix.id, z.mid), low: money(ix.id, z.low), high: money(ix.id, z.high), count: z.count, cheapest: `${z.cheapest.name}, ${money(ix.id, z.cheapest.mid)}` }))}
                />
              ))}
            </div>
          </section>

          {/* Cheapest and dearest */}
          <section aria-labelledby="ranked-h">
            <Heading id="ranked-h" n="03" eyebrow="Rankings" title="The cheapest and priciest trips" />
            {INDEXES.map((ix) => {
              const r = rows[ix.id];
              const max = r[r.length - 1].mid;
              return (
                <div key={ix.id} className="mt-10">
                  <p className="text-sm text-stone">{ix.label}</p>
                  <div className="mt-4 grid gap-10 md:grid-cols-2 md:gap-12">
                    <Ranked id={ix.id} title="Cheapest 10" rows={r.slice(0, 10)} max={max} />
                    <Ranked id={ix.id} title="Priciest 10" rows={[...r].reverse().slice(0, 10)} max={max} />
                  </div>
                </div>
              );
            })}
          </section>

          {/* By month */}
          <section aria-labelledby="months-h">
            <Heading id="months-h" n="04" eyebrow="Best value by month" title="The cheapest trip in season, every month" intro="For each month, the lowest mid-range day among trips at their best that month." />
            <div className="no-scrollbar mt-8 overflow-x-auto border-y border-ink">
              <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                <thead className="text-xs text-stone">
                  <tr className="border-b border-line">
                    <th scope="col" className="py-3 pr-4 font-normal">
                      Month
                    </th>
                    {INDEXES.map((ix) => (
                      <th key={ix.id} scope="col" className="px-4 py-3 font-normal">
                        {ix.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {MONTH_NAMES.map((m, i) => (
                    <tr key={m}>
                      <th scope="row" className="py-3 pr-4 font-normal text-ink">
                        {m}
                      </th>
                      {INDEXES.map((ix) => {
                        const r = months[ix.id][i];
                        return (
                          <td key={ix.id} className="px-4 py-3">
                            {r ? (
                              <span className="flex items-baseline justify-between gap-4">
                                <Link href={`/trips/${r.slug}`} className="text-ink hover:text-brand">
                                  {r.name}
                                </Link>
                                <span className="tabular-nums text-stone">{money(ix.id, r.mid)}/day</span>
                              </span>
                            ) : (
                              <span className="text-stone">No trip in season</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* The whole index */}
          <section id="index" aria-labelledby="index-h" className="scroll-mt-28">
            <Heading id="index-h" n="05" eyebrow="The full index" title={`All ${TRIP_IDEAS.length} trips`} intro="Sort by any column, filter by zone or search. Every trip links to its full plan." />
            <div className="mt-8">
              <IndexTable indexes={tables} />
            </div>
          </section>

          {/* Method and reuse */}
          <section aria-labelledby="method-h" className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <Heading id="method-h" n="06" eyebrow="Methodology" title="How the index is made" />
              <div className="mt-6 space-y-4 leading-relaxed text-ink/80">
                <p>Each figure is GoRoam&apos;s estimate of what one person spends in a day on the trip: a share of the room, food, local transport and entry fees. Getting to the destination is not included.</p>
                <p>The estimates come from the research behind each GoRoam trip guide, checked against recently published prices for stays, transport and sights. They are rough guides for planning, not a price survey, and real costs move with season and booking time.</p>
                <p>India &amp; nearby trips are priced in Indian rupees and worldwide trips in US dollars. The two are never converted into each other, so the comparisons stay within each index. Zone figures are medians, so a single luxury resort doesn&apos;t skew a region.</p>
                <p className="text-sm text-stone">
                  {TRIP_IDEAS.length} trips in {countries} countries · updated {updated}
                </p>
              </div>
            </div>
            <div>
              <Heading id="use-h" n="07" eyebrow="Use this data" title="Free to use, with a link" />
              <p className="mt-6 leading-relaxed text-ink/80">
                The index is free to quote, chart and republish under{" "}
                <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-brand">
                  CC BY 4.0
                </a>
                . All we ask is a credit with a link back to this page.
              </p>
              <dl className="mt-6 divide-y divide-line border-y border-line">
                {[
                  { k: "Citation", v: CITATION },
                  { k: "Link", v: SNIPPET },
                ].map((x) => (
                  <div key={x.k} className="grid gap-3 py-4 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:items-start sm:gap-4">
                    <dt className="text-sm text-stone">{x.k}</dt>
                    <dd className="break-all font-mono text-[0.8rem] leading-relaxed text-ink">{x.v}</dd>
                    <CopyText text={x.v} className="justify-self-start" />
                  </div>
                ))}
              </dl>
              <a href={`${PATH}/data.csv`} download className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-paper transition-colors hover:bg-brand">
                <Download className="size-4" /> Download the CSV ({TRIP_IDEAS.length} trips)
              </a>
            </div>
          </section>

          <section aria-labelledby="faq-h">
            <Heading id="faq-h" n="08" eyebrow="Good questions" title="Trip costs, answered" />
            <div className="mt-8">
              <FaqList faqs={faqs} />
            </div>
          </section>

          <Link href="/trips" className="group flex flex-wrap items-center justify-between gap-6 border-t border-ink pt-6 text-ink">
            <span>
              <span className="display block text-[1.5rem]">Found one that fits your budget?</span>
              <span className="mt-1 block text-stone">Every trip in the index has a day-by-day plan, places to stay and a budget planner.</span>
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-medium">
              Browse the trips <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </article>
    </PublicShell>
  );
}
