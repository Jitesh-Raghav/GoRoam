import { notFound } from "next/navigation";
import { TripView } from "@/components/itinerary/trip-view";
import { PACKAGES, packageBySlug } from "@/lib/packages";
import { loadPackage, packageTrip } from "@/lib/packages-data";

export const dynamicParams = false;
export const generateStaticParams = () => PACKAGES.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const pkg = packageBySlug((await params).slug);
  return { title: pkg ? `${pkg.title} · GoRoam` : "Travel package · GoRoam", description: pkg?.tagline };
}

// One ready-made trip, shown in the full itinerary view (map, photos, PDF and booking included).
export default async function PackagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = packageBySlug(slug);
  const data = pkg ? await loadPackage(slug) : null;
  if (!pkg || !data) notFound();
  return <TripView it={packageTrip(pkg, data)} variant="package" />;
}
