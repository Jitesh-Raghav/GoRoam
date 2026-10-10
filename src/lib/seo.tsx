// Server-only helpers for search: the canonical origin and JSON-LD structured data.
import { COMPANY, activeSocials } from "./company";

export const SITE_URL = "https://goroam.world";
export const SITE_NAME = "GoRoam";

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
  name: SITE_NAME,
  url: SITE_URL,
  logo: absolute("/icon-512.png"),
  email: COMPANY.email,
  address: { "@type": "PostalAddress", addressLocality: "Gurgaon", addressRegion: "Haryana", addressCountry: "IN" },
  founder: { "@type": "Person", name: COMPANY.founder.name, url: "https://jiteshraghav.xyz" },
  sameAs: activeSocials().map((s) => s.href),
};

export const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: "AI trip planner that turns one sentence into a day-by-day itinerary with real places, honest budgets and a local guide.",
};

export const softwareApp = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "GoRoam AI Trip Planner",
  applicationCategory: "TravelApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "First itinerary free" },
};
