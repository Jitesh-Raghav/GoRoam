/* eslint-disable @next/next/no-img-element -- a small local portrait, already sized */
import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/seo/public-shell";
import { CloudSun, Compass, Mail, MapPin, ShieldCheck, Sparkles, Twitter } from "@/components/site/icons";
import { PillLink } from "@/components/site/pill";
import { COMPANY, SOCIALS } from "@/lib/company";
import { JsonLd, SITE_URL, breadcrumbs, organization } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About GoRoam",
  description:
    "GoRoam is an independent AI trip planner built and run by Jitesh Raghav in Gurgaon, India. How it plans a trip, what it believes, and how to reach the person behind it.",
  alternates: { canonical: "/about" },
};

const HOW = [
  {
    icon: Sparkles,
    title: "Your trip, in your words",
    body: "Describe it in one sentence or answer four quick questions: where, when, who's coming, your budget and pace, and what you love.",
  },
  {
    icon: MapPin,
    title: "Real places, pinned on a map",
    body: "The AI plans a morning, afternoon and evening for every day around real, named places, each pinned on a map with photos from Google, Wikimedia Commons and Unsplash.",
  },
  {
    icon: CloudSun,
    title: "Live details for the road",
    body: "Forecasts from Open-Meteo, current exchange rates, a local guide with phrases and dishes, and an AI concierge that knows your days.",
  },
  {
    icon: Compass,
    title: "Honest by design",
    body: "Costs are clear estimates, any stop can be swapped, and booking links go straight to the sites you know. Some are affiliate links, and we always say so.",
  },
];

const BELIEFS = [
  { title: "Your time matters", body: "A trip plan should take a minute, not a weekend of tabs and spreadsheets." },
  { title: "Honesty over hype", body: "Real places, realistic timings and costs you can plan around. No fake reviews, no invented deals." },
  { title: "Privacy by default", body: "We don't sell your data, to anyone, ever. Payments are handled by Dodo Payments, our merchant of record." },
];

export default function AboutPage() {
  const founder = COMPANY.founder;
  const x = SOCIALS.find((s) => s.id === "x" && s.href);
  return (
    <PublicShell crumbs={[{ name: "Home", href: "/" }, { name: "About", href: "/about" }]}>
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "AboutPage", name: "About GoRoam", url: `${SITE_URL}/about`, about: organization },
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
        ]}
      />

      <div className="container-x pb-24 pt-8">
        <header className="max-w-3xl">
          <p className="eyebrow text-brand">About GoRoam</p>
          <h1 className="display mt-5 text-[clamp(2.5rem,5.4vw,4.25rem)] leading-[1.02] text-ink">
            Built by a traveller, <span className="accent">for travellers.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-stone sm:text-xl">
            GoRoam turns one sentence into a day-by-day trip: real places, sensible timings, honest costs and everything you need on the road. It&apos;s
            independent, made in Gurgaon, India, and run by its founder.
          </p>
        </header>

        {/* The founder */}
        <section aria-labelledby="founder" className="mt-16 grid gap-10 rounded-panel bg-white p-7 shadow-card ring-1 ring-line sm:p-10 lg:grid-cols-12 lg:gap-14 lg:p-14">
          <div className="lg:col-span-4">
            {founder.photo ? (
              <img src={founder.photo} alt={founder.name} width={96} height={96} className="size-24 rounded-full object-cover ring-1 ring-line" />
            ) : (
              <span aria-hidden className="display grid size-24 place-items-center rounded-full bg-ink text-3xl text-paper">
                {founder.initials}
              </span>
            )}
            <h2 id="founder" className="display mt-6 text-[1.6rem] leading-tight text-ink">
              {founder.name}
            </h2>
            <p className="mt-1 text-stone">Founder, GoRoam</p>
            <ul className="mt-6 space-y-2.5 text-sm">
              <li>
                <a href={`mailto:${COMPANY.email}`} className="inline-flex items-center gap-2 text-ink/80 transition-colors hover:text-brand">
                  <Mail className="size-4 text-brand" /> {COMPANY.email}
                </a>
              </li>
              {x && (
                <li>
                  <a href={x.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-ink/80 transition-colors hover:text-brand">
                    <Twitter className="size-4 text-brand" /> {x.handle} on X
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div className="space-y-5 text-[1.0625rem] leading-relaxed text-stone sm:text-lg lg:col-span-8">
            <p className="display text-[clamp(1.45rem,2.4vw,2rem)] leading-[1.25] tracking-[-0.02em] text-ink">
              &ldquo;I built GoRoam because planning a trip shouldn&apos;t take longer than <span className="accent">the trip itself.</span>&rdquo;
            </p>
            <p>
              GoRoam is built and run by Jitesh Raghav, an independent developer in Gurgaon, India. It started from a simple idea: planning a trip
              shouldn&apos;t mean dozens of tabs, a spreadsheet and a lot of guesswork.
            </p>
            <p>
              So GoRoam does the legwork. You describe the trip once and get a plan you&apos;d actually follow, with the bookings, maps, weather and local
              know-how in one place, and an easy way to change it as you go.
            </p>
            <p>
              It gets better every week from what travellers say. If something in your plan looks off, or you have an idea, email{" "}
              <a href={`mailto:${COMPANY.email}`} className="text-ink underline decoration-brand decoration-2 underline-offset-4 hover:text-brand">
                {COMPANY.email}
              </a>
              . Jitesh reads every message.
            </p>
          </div>
        </section>

        {/* How it plans */}
        <section aria-labelledby="how" className="mt-20">
          <p className="eyebrow text-brand">How GoRoam plans a trip</p>
          <h2 id="how" className="display mt-5 max-w-2xl text-[clamp(2rem,3.4vw,2.875rem)] leading-[1.04] text-ink">
            <span className="block">One sentence in.</span>
            <span className="block">
              <span className="accent">A whole journey</span> out.
            </span>
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {HOW.map((h) => (
              <li key={h.title} className="rounded-card bg-white p-6 ring-1 ring-line sm:p-7">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
                  <h.icon className="size-5" />
                </span>
                <h3 className="display mt-5 text-[1.3rem] leading-tight text-ink">{h.title}</h3>
                <p className="mt-2.5 leading-relaxed text-stone">{h.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Beliefs */}
        <section aria-labelledby="beliefs" className="mt-20">
          <p className="eyebrow text-brand">What we believe</p>
          <h2 id="beliefs" className="sr-only">
            What we believe
          </h2>
          <ul className="mt-8 grid gap-10 border-t border-line pt-10 md:grid-cols-3">
            {BELIEFS.map((b) => (
              <li key={b.title}>
                <h3 className="display text-[1.3rem] leading-tight text-ink">{b.title}</h3>
                <p className="mt-2.5 leading-relaxed text-stone">{b.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Company details */}
        <section aria-labelledby="company" className="mt-20 grid gap-8 rounded-panel bg-ocean p-7 text-paper sm:p-10 lg:grid-cols-12 lg:p-14">
          <div className="lg:col-span-7">
            <p className="eyebrow text-brand-2">Company details</p>
            <h2 id="company" className="display mt-5 text-[clamp(1.8rem,3vw,2.5rem)] leading-[1.06]">
              A real company, <span className="accent">reachable by a real person.</span>
            </h2>
            <dl className="mt-8 grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="eyebrow text-paper/50">Operated by</dt>
                <dd className="mt-2 text-paper/90">{COMPANY.operator}</dd>
              </div>
              <div>
                <dt className="eyebrow text-paper/50">Based in</dt>
                <dd className="mt-2 text-paper/90">{COMPANY.location}</dd>
              </div>
              <div>
                <dt className="eyebrow text-paper/50">Contact</dt>
                <dd className="mt-2">
                  <a href={`mailto:${COMPANY.email}`} className="text-paper/90 underline decoration-brand-2 underline-offset-4 hover:text-paper">
                    {COMPANY.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-paper/50">Payments</dt>
                <dd className="mt-2 text-paper/90">Dodo Payments, our merchant of record</dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-col justify-between gap-8 lg:col-span-5">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-paper/70">
              <Link href="/terms" className="hover:text-paper">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-paper">
                Privacy
              </Link>
              <Link href="/refunds" className="hover:text-paper">
                Refunds
              </Link>
              <Link href="/contact" className="hover:text-paper">
                Contact
              </Link>
            </div>
            <div className="flex items-center gap-3 rounded-card bg-paper/[0.06] p-5 ring-1 ring-inset ring-paper/10">
              <ShieldCheck className="size-6 shrink-0 text-brand-2" />
              <p className="text-sm leading-relaxed text-paper/75">Every purchase has a 30-day money-back guarantee. Email us and we refund it in full.</p>
            </div>
          </div>
        </section>

        <div className="mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="display text-[1.6rem] leading-tight text-ink">Ready when you are.</p>
          <PillLink href="/dashboard" size="lg">
            Plan your first trip free
          </PillLink>
        </div>
      </div>
    </PublicShell>
  );
}
