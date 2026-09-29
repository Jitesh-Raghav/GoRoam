"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { TripView } from "@/components/itinerary/trip-view";
import { Scene } from "@/components/scenes/scene";
import { Logo } from "@/components/site/logo";
import { PillLink } from "@/components/site/pill";
import type { ItineraryDetails } from "@/lib/trip";

export default function SharedTripPage() {
  const params = useParams();
  const [trip, setTrip] = useState<ItineraryDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("t") ?? "";
    fetch(`/api/shared/${params.id}?t=${encodeURIComponent(t)}`)
      .then((r) => r.json())
      .then((d) => (d.success ? setTrip(d.data) : setError(d.error || "This share link is invalid.")))
      .catch(() => setError("We couldn't load this trip."));
  }, [params.id]);

  return (
    <div className="min-h-svh bg-paper">
      <header className="no-print container-x flex h-[72px] items-center justify-between">
        <Logo />
        <PillLink href="/dashboard" size="md">
          Plan your own
        </PillLink>
      </header>
      <main className="px-4 pb-10 sm:px-6 lg:px-8">
        {error ? (
          <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[36px] bg-ink">
            <div className="absolute inset-0">
              <Scene id="dunes" intro />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/50 to-transparent" />
            <div className="relative max-w-lg p-8 py-20 text-paper sm:p-14">
              <p className="eyebrow text-paper/60">Shared trip</p>
              <h1 className="display mt-4 text-5xl leading-[0.95]">
                This link has <span className="italic text-brand-2">wandered off.</span>
              </h1>
              <p className="mt-4 text-paper/70">{error} Ask whoever sent it for a fresh link.</p>
              <PillLink href="/" variant="paper" className="mt-8">
                Discover GoRoam
              </PillLink>
            </div>
          </div>
        ) : trip ? (
          <TripView it={trip} shared />
        ) : (
          <div className="mx-auto max-w-[1320px] space-y-4">
            <div className="skeleton h-[min(74vh,660px)] rounded-[32px]" />
            <div className="skeleton h-24 rounded-[28px]" />
          </div>
        )}
      </main>
    </div>
  );
}
