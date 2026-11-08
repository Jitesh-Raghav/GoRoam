/* eslint-disable @next/next/no-img-element -- our own photo routes, already sized */
import { ArrowRight } from "@/components/site/icons";
import { QuietLink } from "@/components/site/quiet-link";
import { ADVENTURES, adventureBySlug, shortTitle } from "@/lib/adventures";
import { DESTINATION_GUIDES, guideBySlug } from "@/lib/destination-guides";
import { PACKAGES, packageBySlug } from "@/lib/packages";
import { MONTH_NAMES, TRIP_IDEAS, inSeason } from "@/lib/trip-ideas";
import { USE_CASES } from "@/lib/use-cases";
import type { ExploreLink } from "./site-header-client";

interface Column {
  href: string;
  title: string;
  note: string;
  photo: string;
  links: ExploreLink[];
}

const GUIDE_PICKS = ["goa", "jaipur", "ladakh", "kerala"];
const PACKAGE_PICKS = ["kerala-5-days", "japan-5-days", "bali-4-days", "udaipur-3-days-couples"];
const ADVENTURE_PICKS = ["hitchhike-kyrgyzstan", "ha-giang-loop", "annapurna-circuit", "hitchhike-mongolia"];

/** The Explore menu's columns, built from the site's own data on the server. */
function columns(): Column[] {
  const month = new Date().getMonth() + 1;
  const now = inSeason(month);
  const lead = now[0] ?? TRIP_IDEAS[0];
  const countries = new Set(TRIP_IDEAS.map((t) => t.country)).size;
  return [
    {
      href: "/trips",
      title: "Where to go",
      note: `${TRIP_IDEAS.length} trips · ${countries} countries`,
      photo: `/trips/${lead.slug}/photo?w=640&blank=1`,
      links: [
        { href: "/trips", label: `In season in ${MONTH_NAMES[month - 1]}` },
        { href: "/places-to-visit", label: "Where to go, by month" },
        { href: "/weekend-getaways", label: "Getaways from your city" },
        { href: "/trip-cost-index", label: "Trip Cost Index" },
      ],
    },
    {
      href: "/itineraries",
      title: "Ready-made itineraries",
      note: `${PACKAGES.length} day-by-day plans`,
      photo: `/itineraries/${PACKAGE_PICKS[0]}/photo?w=640&blank=1`,
      links: PACKAGE_PICKS.flatMap((s) => {
        const p = packageBySlug(s);
        return p ? [{ href: `/itineraries/${p.slug}`, label: p.title }] : [];
      }),
    },
    {
      href: "/adventures",
      title: "Adventures",
      note: `${ADVENTURES.length} cheap adventures abroad`,
      photo: `/adventures/${ADVENTURE_PICKS[0]}/photo?w=640&blank=1`,
      links: ADVENTURE_PICKS.flatMap((s) => {
        const a = adventureBySlug(s);
        return a ? [{ href: `/adventures/${a.slug}`, label: shortTitle(a) }] : [];
      }),
    },
    {
      href: "/destinations",
      title: "Destination guides",
      note: `${DESTINATION_GUIDES.length} in-depth guides`,
      photo: `/destinations/${GUIDE_PICKS[0]}/photo?w=640&blank=1`,
      links: GUIDE_PICKS.flatMap((s) => {
        const g = guideBySlug(s);
        return g ? [{ href: `/destinations/${g.slug}`, label: `${g.name} travel guide` }] : [];
      }),
    },
  ];
}

/** The same places, for the phone menu. */
export const EXPLORE_LINKS: ExploreLink[] = [
  { href: "/trips", label: "Where to go" },
  { href: "/itineraries", label: "Itineraries" },
  { href: "/adventures", label: "Adventures" },
  { href: "/destinations", label: "Guides" },
  { href: "/places-to-visit", label: "By month" },
  { href: "/weekend-getaways", label: "From your city" },
  { href: "/trip-cost-index", label: "Cost index" },
];

/**
 * The Explore menu's panel: one column each for where to go, ready-made itineraries,
 * adventures and destination guides (a photo, a count and a few ways in), with the kinds of trip along
 * the bottom. Rendered on the server; its photos load only when the panel first opens.
 */
export function ExplorePanel() {
  return (
    <div className="container-x py-8">
      <div className="grid grid-cols-4 gap-7 xl:gap-9">
        {columns().map((c) => (
          <div key={c.href} className="min-w-0">
            <QuietLink href={c.href} className="group block outline-none">
              <span className="relative block aspect-[16/9] overflow-hidden rounded-[1.1rem] bg-paper-2 ring-offset-2 ring-offset-paper group-focus-visible:ring-2 group-focus-visible:ring-brand">
                <img src={c.photo} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]" />
              </span>
              <span className="mt-3.5 flex items-baseline justify-between gap-3">
                <span className="display text-[1.25rem] leading-tight text-ink transition-colors group-hover:text-brand">{c.title}</span>
                <ArrowRight className="size-4 shrink-0 text-stone transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
              <span className="mt-0.5 block text-sm text-stone">{c.note}</span>
            </QuietLink>
            <ul className="mt-4 border-t border-line pt-2">
              {c.links.map((l) => (
                <li key={l.href}>
                  <QuietLink href={l.href} className="-mx-2 flex items-center rounded-lg px-2 py-1.5 text-[0.95rem] text-ink/80 transition-colors hover:bg-paper-2 hover:text-ink">
                    <span className="truncate">{l.label}</span>
                  </QuietLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-x-1 gap-y-2 border-t border-line pt-5 text-sm">
        <span className="mr-3 text-stone">Plan by kind of trip</span>
        {USE_CASES.map((u) => (
          <QuietLink key={u.slug} href={`/plan/${u.slug}`} className="rounded-full px-3 py-1.5 text-ink/80 transition-colors hover:bg-paper-2 hover:text-ink">
            {u.label}
          </QuietLink>
        ))}
      </div>
    </div>
  );
}
