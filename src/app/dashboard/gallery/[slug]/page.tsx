import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TripView } from "@/components/itinerary/trip-view";
import { PACKAGES, packageBySlug } from "@/lib/packages";
import { loadPackage, packageTrip } from "@/lib/packages-data";

// A ready-made trip inside the dashboard. The public copy at /itineraries/[slug] is the one search engines see.
export const dynamicParams = false;
export const generateStaticParams = () => PACKAGES.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pkg = packageBySlug(slug);
  if (!pkg) return {};
  return { title: pkg.title, robots: { index: false, follow: true }, alternates: { canonical: `/itineraries/${slug}` } };
}

export default async function DashboardGalleryTripPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = packageBySlug(slug);
  const data = pkg ? await loadPackage(slug) : null;
  if (!pkg || !data) notFound();
  return <TripView it={packageTrip(pkg, data)} variant="package" backHref="/dashboard/gallery" />;
}
