// Server-only helpers for search: the canonical origin and JSON-LD structured data.
import { COMPANY, activeSocials } from "./company";
import { FREE_CREDITS, PLANS } from "./plans";
import { USE_CASES } from "./use-cases";

/**
 * The one canonical origin. Vercel serves www.goroam.world and 308-redirects the
 * bare domain there, so every canonical link, the sitemap and the structured data
 * must say www too, or Google can't tie the brand name to the homepage.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.goroam.world").replace(/\/+$/, "");
export const SITE_NAME = "GoRoam";
const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

export const absolute = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** One structured-data block, rendered into the page's HTML so crawlers read it without JavaScript. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // Escape "<" so a value can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export const faqPage = (faqs: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

export const breadcrumbs = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absolute(it.path) })),
});

export const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORG_ID,
  name: SITE_NAME,
  alternateName: ["GoRoam AI Trip Planner", "Go Roam"],
  url: `${SITE_URL}/`,
  logo: { "@type": "ImageObject", url: absolute("/icon-512.png"), width: 512, height: 512 },
  image: absolute("/opengraph-image"),
  slogan: "One sentence in, a whole trip out.",
  description: "GoRoam is an AI trip planner that turns one sentence into a day-by-day itinerary with real places, honest budgets, stays and a local guide.",
  foundingDate: "2025",
  email: COMPANY.email,
  contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: COMPANY.email, availableLanguage: ["English", "Hindi"] },
  address: { "@type": "PostalAddress", addressLocality: "Gurgaon", addressRegion: "Haryana", addressCountry: "IN" },
  founder: { "@type": "Person", name: COMPANY.founder.name, url: "https://jiteshraghav.xyz" },
  sameAs: activeSocials().map((s) => s.href),
};

/** The site itself. Its url must be exactly the homepage's canonical URL for Google to show "GoRoam" as the site name. */
export const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": SITE_ID,
  name: SITE_NAME,
  alternateName: ["GoRoam AI Trip Planner", "Go Roam", "goroam.world"],
  url: `${SITE_URL}/`,
  inLanguage: "en",
  publisher: { "@id": ORG_ID },
  description: "AI trip planner that turns one sentence into a day-by-day itinerary with real places, honest budgets and a local guide.",
};

export const softwareApp = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "GoRoam AI Trip Planner",
  applicationCategory: "TravelApplication",
  operatingSystem: "Web, Android, iOS",
  browserRequirements: "Requires JavaScript. Works in any modern browser.",
  url: `${SITE_URL}/`,
  publisher: { "@id": ORG_ID },
  featureList: [
    "Day-by-day itineraries from one sentence",
    "Multi-city trips with travel days",
    "Edit, reorder and replan any day",
    "One-tap rain plan",
    "Honest budgets in your currency",
    "Local guide with phrases and safety tips",
    "Shared plans with voting and a trip wallet",
    "Daily plan on WhatsApp",
    "Works offline",
  ],
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD", description: `${FREE_CREDITS} free itinerary, no card needed` },
    ...PLANS.map((p) => ({ "@type": "Offer", name: p.name, price: p.price.toFixed(2), priceCurrency: "USD", description: `Unlimited trips for ${p.days} days` })),
  ],
};

/** The main sections of the site, as a list Google can read alongside the links themselves. */
export const siteNavigation = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Plan a trip with GoRoam",
  itemListElement: [
    ...USE_CASES.map((u) => ({ name: u.h1.replace(/^./, (c) => c.toUpperCase()), path: `/plan/${u.slug}` })),
    { name: "Trip gallery", path: "/itineraries" },
    { name: "Destination guides", path: "/destinations" },
  ].map((item, i) => ({ "@type": "SiteNavigationElement", position: i + 1, name: item.name, url: absolute(item.path) })),
};
