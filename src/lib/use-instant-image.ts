"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Whether a photo should simply appear rather than fade in: because it has
 * loaded on this device before (so the service worker or the browser has it
 * cached), or because it arrived too fast to have come from the network.
 * A reopened trip then looks ready at once. Call `start` when the <img>
 * mounts and `done` when it loads.
 */
const SEEN_KEY = "goroam:seen-photos";
const SEEN_MAX = 600;
let seen: string[] | null = null;
let saveTimer: number | undefined;

function seenList() {
  if (!seen) {
    try {
      seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]") as string[];
    } catch {
      seen = [];
    }
  }
  return seen;
}

function remember(url: string) {
  const list = seenList();
  if (list.includes(url)) return;
  list.push(url);
  if (list.length > SEEN_MAX) list.splice(0, list.length - SEEN_MAX);
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(list));
    } catch {}
  }, 500);
}

export function useInstantImage(url: string | null, thresholdMs = 150) {
  const startedAt = useRef(0);
  const [instant, setInstant] = useState<string | null>(null);
  // After hydration, so server and client agree on the first render.
  useEffect(() => {
    if (url && seenList().includes(url)) setInstant(url);
  }, [url]);
  return {
    instant: !!url && instant === url,
    start: () => {
      startedAt.current = performance.now();
    },
    done: (cached = false) => {
      if (!url) return;
      if (cached || performance.now() - startedAt.current < thresholdMs) setInstant(url);
      remember(url);
    },
  };
}
