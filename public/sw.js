/*
 * GoRoam offline support. Trips you've opened keep working without signal:
 *   - your itinerary pages and their data: network first, saved copy when offline
 *   - the app's static files: cached once, served from cache
 * Signing out clears every saved trip from this device.
 */
const VERSION = "goroam-v1";
const STATIC = `${VERSION}-static`;
const PAGES = `${VERSION}-pages`;
const DATA = `${VERSION}-data`;

const PAGE = /^\/(dashboard(\/itineraries|\/itinerary\/[^/]+)?|trip\/[^/]+)\/?$/;
const API = /^\/api\/(itinerary\/[^/]+(\/photos)?|itineraries|shared\/[^/]+(\/photos)?|auth\/session|user\/credits|weather|fx|destination-photo)$/;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (!key.startsWith(VERSION)) await caches.delete(key);
      await self.clients.claim();
    })()
  );
});

async function networkFirst(request, cacheName, timeoutMs) {
  const cache = await caches.open(cacheName);
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), timeoutMs)),
    ]);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const saved = await cache.match(request);
    if (saved) return saved;
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC);
  const saved = await cache.match(request);
  if (saved) return saved;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

/** Signed out (an empty session): forget every saved trip on this device. */
async function watchSession(request) {
  const response = await networkFirst(request, DATA, 6000);
  try {
    const body = await response.clone().json();
    if (!body || !body.user) {
      await caches.delete(DATA);
      await caches.delete(PAGES);
    }
  } catch {}
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }
  // Client-side navigations fetch RSC payloads; leave those to the network.
  if (url.searchParams.has("_rsc") || request.headers.get("RSC") === "1") return;

  if (request.mode === "navigate" && PAGE.test(url.pathname)) {
    event.respondWith(networkFirst(request, PAGES, 5000));
    return;
  }
  if (url.pathname === "/api/auth/session") {
    event.respondWith(watchSession(request));
    return;
  }
  if (API.test(url.pathname)) {
    event.respondWith(networkFirst(request, DATA, 8000));
  }
});
