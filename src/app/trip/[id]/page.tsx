import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { verifyShareToken } from "@/lib/share";
import { SharedTrip } from "./shared-trip";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string }> };

// A shared link pasted into a chat unfurls as that trip, but only with its token.
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ id }, { t }] = await Promise.all([params, searchParams]);
  if (!t || !verifyShareToken(id, t)) return { title: "A shared trip · GoRoam", robots: { index: false } };
  const trip = await prisma.itinerary
    .findUnique({ where: { id }, select: { destination: true, numberOfDays: true } })
    .catch(() => null);
  if (!trip) return { title: "A shared trip · GoRoam", robots: { index: false } };
  const city = trip.destination.split(",")[0].trim();
  const title = `${trip.numberOfDays} days in ${city} · GoRoam`;
  const description = `A day-by-day plan for ${trip.destination}, with real places and an honest budget.`;
  const image = { url: `/api/og/trip/${id}?t=${encodeURIComponent(t)}`, width: 1200, height: 630, alt: title };
  return {
    title,
    description,
    robots: { index: false },
    openGraph: { title, description, type: "article", images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}

export default function SharedTripPage() {
  return <SharedTrip />;
}
