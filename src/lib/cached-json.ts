"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

/**
 * A tiny stale-while-revalidate cache for the dashboard's JSON endpoints.
 * Pages read what's already cached straight away (no skeleton on the way back),
 * refresh it quietly in the background, and share one request when several ask at once.
 */

interface Entry {
  data?: unknown;
  error?: string;
  at: number;
  promise?: Promise<unknown>;
}

const FRESH_MS = 30_000;
const entries = new Map<string, Entry>();
const listeners = new Map<string, Set<() => void>>();

const notify = (url: string) => listeners.get(url)?.forEach((fn) => fn());

function load(url: string): Promise<unknown> {
  const entry = entries.get(url) ?? { at: 0 };
  if (entry.promise) return entry.promise;
  entry.promise = fetch(url)
    .then(async (r) => {
      const json = await r.json().catch(() => null);
      if (!r.ok || json?.success === false) throw new Error(json?.error || `Request failed (${r.status})`);
      entries.set(url, { data: json, at: Date.now() });
      return json;
    })
    .catch((e: unknown) => {
      const prev = entries.get(url);
      entries.set(url, { data: prev?.data, at: prev?.at ?? 0, error: e instanceof Error ? e.message : "Request failed" });
    })
    .finally(() => notify(url));
  entries.set(url, entry);
  return entry.promise;
}

/** Warm the cache (e.g. on hover) without rendering anything. */
export function prefetchJson(url: string) {
  const entry = entries.get(url);
  if (!entry?.promise && (!entry || Date.now() - entry.at > FRESH_MS)) void load(url);
}

/** Change the cached copy in place (after a delete, say) and re-render readers. */
export function updateCached<T>(url: string, fn: (data: T) => T) {
  const entry = entries.get(url);
  if (entry?.data === undefined) return;
  entries.set(url, { ...entry, data: fn(entry.data as T) });
  notify(url);
}

/** Forget a response so the next reader fetches it fresh. */
export function invalidate(url: string) {
  entries.delete(url);
  notify(url);
}

/** Read a cached JSON endpoint. `null` skips fetching (e.g. until signed in). */
export function useCachedJson<T>(url: string | null) {
  const subscribe = useCallback(
    (fn: () => void) => {
      if (!url) return () => {};
      const set = listeners.get(url) ?? new Set();
      set.add(fn);
      listeners.set(url, set);
      return () => set.delete(fn);
    },
    [url]
  );
  const entry = useSyncExternalStore(
    subscribe,
    () => (url ? entries.get(url) : undefined),
    () => undefined
  );
  useEffect(() => {
    if (!url) return;
    const e = entries.get(url);
    if (!e || (!e.promise && Date.now() - e.at > FRESH_MS)) void load(url);
  }, [url]);

  return {
    data: entry?.data as T | undefined,
    error: entry?.data === undefined ? entry?.error : undefined,
    loading: !!url && entry?.data === undefined && !entry?.error,
  };
}
