import type { MetadataRoute } from "next";
import { DESTINATION_GUIDES } from "@/lib/destination-guides";
import { PACKAGES } from "@/lib/packages";
import { SITE_URL } from "@/lib/seo";
import { CITY_HUBS, MONTH_HUBS } from "@/lib/trip-hubs";
import { TRIP_IDEAS } from "@/lib/trip-ideas";
import { USE_CASES } from "@/lib/use-cases";

// Content last changed on this date; bump it when guides or itineraries are edited.
const UPDATED = new Date("2026-10-19");

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly") => ({
    url: `${SITE_URL}${path}`,
    lastModified: UPDATED,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1, "weekly"),
    page("/plan", 0.9, "weekly"),
    ...USE_CASES.map((u) => page(`/plan/${u.slug}`, 0.9)),
    page("/trips", 0.9, "weekly"),
    page("/weekend-getaways", 0.8),
    ...CITY_HUBS.map((c) => page(`/weekend-getaways/${c.slug}`, 0.8)),
    page("/places-to-visit", 0.8),
    ...MONTH_HUBS.map((m) => page(`/places-to-visit/${m.slug}`, 0.8)),
    ...TRIP_IDEAS.map((t) => page(`/trips/${t.slug}`, 0.8)),
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
