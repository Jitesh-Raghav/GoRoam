import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TripView } from "@/components/itinerary/trip-view";
import { GuestUnlock } from "@/components/guest/guest-unlock";
import { PublicShell } from "@/components/seo/public-shell";
import { guestPreview } from "@/lib/guest";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Your trip preview", robots: { index: false, follow: false } };


// A signed-out visitor's first trip: Day 1 open, the rest unlocked by signing in.
export default async function GuestTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await prisma.guestTrip.findUnique({ where: { id } }).catch(() => null);
  if (!trip) notFound();
  const { details, locked } = guestPreview(trip);

  return (
    <PublicShell>
      {/* The trip itself comes first: its hero is the "it's ready" moment. Days 2+ sit locked in its plan. */}
      <div className="px-3 pb-32 pt-2 min-[400px]:px-4 sm:px-6 lg:px-8">
        <TripView it={details} variant="guest" locked={locked} photosEndpoint={`/api/guest-itinerary/${trip.id}/photos`} unlockUrl={`/try/${trip.id}?claim=1`} />
      </div>
      <Suspense>
        <GuestUnlock id={trip.id} destination={trip.destination} days={trip.numberOfDays} />
      </Suspense>
    </PublicShell>
  );
}
