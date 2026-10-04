"use client";

import { useEffect, useState } from "react";
import type { TripGuide } from "@/lib/trip";

/**
 * The trip's local guide. New trips carry it; for older ones (or when it failed
 * at generation) the owner's view asks the server to write it once.
 */
export function useGuide(tripId: string, stored: TripGuide | undefined, canWrite: boolean) {
  const [guide, setGuide] = useState<TripGuide | undefined>(stored);
  const [state, setState] = useState<"ready" | "writing" | "failed">(stored ? "ready" : canWrite ? "writing" : "failed");

  useEffect(() => {
    if (stored) {
      setGuide(stored);
      setState("ready");
      return;
    }
    if (!canWrite) return;
    let live = true;
    setState("writing");
    fetch(`/api/itinerary/${tripId}/guide`, { method: "POST" })
      .then((r) => r.json())
      .then((body) => {
        if (!live) return;
        if (body?.success && body.guide) {
          setGuide(body.guide);
          setState("ready");
        } else setState("failed");
      })
      .catch(() => live && setState("failed"));
    return () => {
      live = false;
    };
  }, [tripId, stored, canWrite]);

  return { guide, state };
}
