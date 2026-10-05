"use client";

import type { PostHog } from "posthog-js";

/**
 * Product analytics via PostHog. Nothing loads unless NEXT_PUBLIC_POSTHOG_KEY is
 * set, and even then the library is fetched in idle time after the page is up,
 * so it never slows first paint. Events tracked before it's ready are queued.
 */

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() ?? "";
export const analyticsEnabled = KEY.length > 0;

let client: PostHog | null = null;
let loading: Promise<PostHog | null> | null = null;
const queue: ((ph: PostHog) => void)[] = [];

export function loadAnalytics() {
  if (!analyticsEnabled || typeof window === "undefined") return Promise.resolve(null);
  loading ??= import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(KEY, {
        // Proxied through our own domain (next.config.ts) so ad-blockers don't drop it.
        api_host: "/ingest",
        ui_host: process.env.NEXT_PUBLIC_POSTHOG_UI_HOST || "https://us.posthog.com",
        capture_pageview: "history_change",
        capture_pageleave: true,
        person_profiles: "identified_only",
      });
      client = posthog;
      queue.splice(0).forEach((fn) => fn(posthog));
      return posthog;
    })
    .catch(() => null);
  return loading;
}

function withClient(fn: (ph: PostHog) => void) {
  if (!analyticsEnabled) return;
  if (client) fn(client);
  else queue.push(fn);
}

export type AnalyticsEvent =
  | "trip_generated"
  | "itinerary_viewed"
  | "package_impression"
  | "package_viewed"
  | "package_customized"
  | "booking_partner_clicked"
  | "directions_clicked"
  | "share_link_created"
  | "pdf_downloaded"
  | "calendar_downloaded"
  | "checkout_started"
  | "film_played";

export function track(event: AnalyticsEvent, properties?: Record<string, string | number | boolean | null | undefined>) {
  withClient((ph) => ph.capture(event, properties));
}

/** Tie events to a signed-in traveller by their GoRoam id only (no email or name). */
export function identify(userId: string | null) {
  withClient((ph) => {
    if (userId) {
      if (ph.get_distinct_id() !== userId) ph.identify(userId);
    } else ph.reset();
  });
}
