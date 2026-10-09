import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TripView } from "@/components/itinerary/trip-view";
import { GuestUnlock } from "@/components/guest/guest-unlock";
import { PublicShell } from "@/components/seo/public-shell";
import { guestPreview } from "@/lib/guest";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Your trip preview", robots: { index: false, follow: false } };

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

// A signed-out visitor's first trip: Day 1 open, the rest unlocked by signing in.
export default async function GuestTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await prisma.guestTrip.findUnique({ where: { id } }).catch(() => null);
  if (!trip) notFound();
  const { details, locked } = guestPreview(trip);
  const city = trip.destination.split(",")[0];

  return (
    <PublicShell>
      <section className="container-x pt-4">
        <p className="eyebrow text-brand">Your free trip is ready</p>
        <h1 className="display mt-3 max-w-3xl text-[clamp(2.2rem,5vw,3.8rem)] text-ink">
          {trip.numberOfDays} {trip.numberOfDays === 1 ? "day" : "days"} in <span className="accent">{city}</span>, planned for you.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink/70">
          Here&apos;s Day 1 in full. {locked.length > 0 ? `Days 2-${trip.numberOfDays}, your map, local guide and PDF unlock when you sign in, free.` : "Sign in, free, to save it, share it and get your local guide."}
        </p>

        {locked.length > 0 && (
          <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {locked.map((d) => (
              <li key={d.day} className="relative overflow-hidden rounded-[22px] bg-white p-5 ring-1 ring-line">
                <p className="font-mono text-xs text-brand">DAY {String(d.day).padStart(2, "0")}</p>
                <p className="mt-2 text-lg text-ink">{d.theme}</p>
                {/* Placeholder lines: the real stops stay on the server until the trip is claimed. */}
                <div aria-hidden className="mt-3 space-y-2 blur-[3px]">
                  <div className="h-3 w-4/5 rounded bg-paper-3" />
                  <div className="h-3 w-3/5 rounded bg-paper-3" />
                  <div className="h-3 w-2/3 rounded bg-paper-3" />
                </div>
                <p className="mt-3 text-xs text-stone">3 stops · about {usd(d.totalDayCost)} · locked</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="px-3 pb-32 pt-10 min-[400px]:px-4 sm:px-6 lg:px-8">
        <TripView it={details} variant="guest" photosEndpoint={`/api/guest-itinerary/${trip.id}/photos`} unlockUrl={`/try/${trip.id}?claim=1`} />
      </div>
      <Suspense>
        <GuestUnlock id={trip.id} destination={trip.destination} days={trip.numberOfDays} />
      </Suspense>
    </PublicShell>
  );
}
