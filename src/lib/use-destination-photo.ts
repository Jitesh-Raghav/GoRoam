"use client";

import { useEffect, useState } from "react";
import type { PlacePhoto } from "@/lib/trip";

// One lookup per destination for the whole session.
const asked = new Map<string, Promise<PlacePhoto | null>>();

function lookup(destination: string) {
  const key = destination.toLowerCase();
  let hit = asked.get(key);
  if (!hit) {
    hit = fetch(`/api/destination-photo?q=${encodeURIComponent(destination)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((p: PlacePhoto | null) => (p?.url ? p : null))
      .catch(() => null);
    asked.set(key, hit);
    hit.then((p) => !p && asked.delete(key));
  }
  return hit;
}

/** A real photo of the destination, or null (keep showing the illustration). */
export function useDestinationPhoto(destination: string | null | undefined, enabled = true) {
  // Remember which place the photo is of, so a new place never shows the last one's photo while it loads.
  const [found, setFound] = useState<{ q: string; photo: PlacePhoto | null } | null>(null);
  const q = destination?.replace(/\s+/g, " ").trim() ?? "";
  useEffect(() => {
    if (!q || !enabled) return;
    let live = true;
    lookup(q).then((photo) => live && setFound({ q, photo }));
    return () => {
      live = false;
    };
  }, [q, enabled]);
  return found?.q === q ? found.photo : null;
}
