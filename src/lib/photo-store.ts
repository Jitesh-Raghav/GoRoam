"use client";

import { useEffect, useState } from "react";
import type { PlacePhoto } from "./trip";

/**
 * Each trip's photo list, remembered on this device, so reopening a trip
 * renders its photos straight away while the fresh list loads behind it.
 * The 30 most recently opened trips are kept. Images themselves are cached
 * by the service worker.
 */
const KEY = (id: string) => `goroam:photos:${id}`;
const INDEX = "goroam:photos:index";
const MAX_TRIPS = 30;

export function readPhotoMap(id: string): Record<string, PlacePhoto> | null {
  try {
    const raw = localStorage.getItem(KEY(id));
    return raw ? (JSON.parse(raw) as Record<string, PlacePhoto>) : null;
  } catch {
    return null;
  }
}

export function savePhotoMap(id: string, photos: Record<string, PlacePhoto>) {
  try {
    const index = (JSON.parse(localStorage.getItem(INDEX) ?? "[]") as string[]).filter((x) => x !== id);
    index.push(id);
    for (const old of index.splice(0, Math.max(0, index.length - MAX_TRIPS))) localStorage.removeItem(KEY(old));
    localStorage.setItem(KEY(id), JSON.stringify(photos));
    localStorage.setItem(INDEX, JSON.stringify(index));
  } catch {
    // Storage full or blocked: photos still load, just not instantly next time.
  }
}

/** Forget every remembered photo list, and which photos were seen (on sign-out). */
export function clearPhotoMaps() {
  try {
    const index = JSON.parse(localStorage.getItem(INDEX) ?? "[]") as string[];
    for (const id of index) localStorage.removeItem(KEY(id));
    localStorage.removeItem(INDEX);
    localStorage.removeItem("goroam:seen-photos");
  } catch {}
  // The service worker's photo cache (public/sw.js).
  if (typeof caches !== "undefined") void caches.delete("goroam-v1-images").catch(() => {});
}

/** The remembered photos for a trip, and saves `fresh` whenever it changes. */
export function useStoredPhotos(id: string, fresh: Record<string, PlacePhoto> | undefined) {
  const [stored, setStored] = useState<Record<string, PlacePhoto> | null>(null);
  useEffect(() => setStored(readPhotoMap(id)), [id]);
  useEffect(() => {
    if (fresh && Object.keys(fresh).length) savePhotoMap(id, fresh);
  }, [id, fresh]);
  return stored;
}
