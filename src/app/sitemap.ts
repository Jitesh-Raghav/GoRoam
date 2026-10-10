import type { MetadataRoute } from "next";
import { DESTINATION_GUIDES } from "@/lib/destination-guides";
import { PACKAGES } from "@/lib/packages";
import { SITE_URL } from "@/lib/seo";

// Content last changed on this date; bump it when guides or itineraries are edited.
const UPDATED = new Date("2026-10-10");

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly") => ({
    url: `${SITE_URL}${path}`,
    lastModified: UPDATED,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1, "weekly"),
    page("/itineraries", 0.9, "weekly"),
    page("/destinations", 0.9, "weekly"),
    ...DESTINATION_GUIDES.map((d) => page(`/destinations/${d.slug}`, 0.8)),
    ...PACKAGES.map((p) => page(`/itineraries/${p.slug}`, 0.8)),
    page("/about", 0.5, "yearly"),
    page("/contact", 0.3, "yearly"),
    page("/terms", 0.2, "yearly"),
    page("/privacy", 0.2, "yearly"),
    page("/refunds", 0.2, "yearly"),
  ];
}
