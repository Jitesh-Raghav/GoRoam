'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { TripView } from '@/components/itinerary/trip-view';
import { Scene } from '@/components/scenes/scene';
import { PillLink } from '@/components/site/pill';
import type { ItineraryDetails } from '@/lib/trip';

function Loading() {
  return (
    <div className="mx-auto max-w-[1320px] space-y-4">
      <div className="skeleton h-[min(60vh,520px)] rounded-[32px]" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-28 rounded-3xl" />
        ))}
      </div>
      <div className="skeleton h-64 rounded-[28px]" />
    </div>
  );
}

function NotFound({ message }: { message: string }) {
  return (
    <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[36px] bg-ink">
      <div className="absolute inset-0">
        <Scene id="dunes" intro />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/50 to-transparent" />
      <div className="relative max-w-lg p-8 py-20 text-paper sm:p-14">
        <p className="eyebrow text-paper/60">Itinerary not found</p>
        <h1 className="display mt-4 text-5xl leading-[0.95]">
          This trip seems to have <span className="italic text-brand-2">wandered off.</span>
        </h1>
        <p className="mt-4 text-paper/70">{message}</p>
        <PillLink href="/dashboard/itineraries" variant="paper" className="mt-8" icon={<ArrowLeft className="size-4" />}>
          Back to itineraries
        </PillLink>
      </div>
    </div>
  );
}

function ItineraryContent() {
  const params = useParams();
  const [itinerary, setItinerary] = useState<ItineraryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await fetch(`/api/itinerary/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setItinerary(data.data);
        } else {
          setError(data.error || 'Failed to fetch itinerary');
        }
      } catch {
        setError('Failed to fetch itinerary');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchItinerary();
    }
  }, [params.id]);

  if (loading) return <Loading />;
  if (error || !itinerary) return <NotFound message={error || 'The requested itinerary could not be found.'} />;
  return <TripView it={itinerary} />;
}

export default function ItineraryPage() {
  return (
    <DashboardLayout>
      <ItineraryContent />
    </DashboardLayout>
  );
}
