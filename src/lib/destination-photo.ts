// Server-only: one big, real, landscape photo of a destination for the trip hero.
import { BAD, GOOGLE_MEDIA_PREFIX, cityPhoto, get, googleHeaders, googleKey } from '@/lib/place-photos';
import type { PlacePhoto } from '@/lib/trip';

/**
 * The first source with a wide, high-resolution shot wins:
 *   1. Unsplash (UNSPLASH_ACCESS_KEY): editorial-quality city photography
 *   2. Google Places: the widest landscape photo of the place itself
 *   3. Wikimedia Commons: skyline / cityscape / panorama photos, 1600px+ and landscape
 *   4. the destination's Wikipedia lead photo (what stop cards fall back to)
 */

export interface HeroPhoto extends PlacePhoto {
  /** For Unsplash: the download-tracking ping their guidelines ask for. */
  track?: string;
}

const cache = new Map<string, Promise<HeroPhoto | null>>();
const MAX_CACHE = 2000;

const words = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);

interface UnsplashPhoto {
  width: number;
  height: number;
  alt_description?: string | null;
  urls: { raw: string };
  links: { html: string; download_location: string };
  user: { name: string; links: { html: string } };
}

async function fromUnsplash(key: string, city: string, country: string): Promise<HeroPhoto | null> {
  for (const query of [`${city} ${country}`.trim(), city]) {
    const params = new URLSearchParams({ query, orientation: 'landscape', per_page: '10', content_filter: 'high', order_by: 'relevant' });
    const data = await get(`https://api.unsplash.com/search/photos?${params}`, { headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' } });
    const pick = ((data.results ?? []) as UnsplashPhoto[]).find((p) => p.width >= 2000 && p.width / p.height >= 1.25);
    if (!pick) continue;
    const ref = 'utm_source=goroam&utm_medium=referral';
    return {
      url: `${pick.urls.raw}&w=2400&q=80&fm=jpg&fit=crop&auto=format`,
      title: pick.alt_description || city,
      credit: `${pick.user.name} · Unsplash`,
      sourceUrl: `${pick.user.links.html}?${ref}`,
      exact: true,
      kind: 'city',
      track: pick.links.download_location,
    };
  }
  return null;
}

interface GooglePhoto {
  name: string;
  widthPx?: number;
  heightPx?: number;
  authorAttributions?: { displayName?: string; uri?: string }[];
}

async function fromGoogle(key: string, destination: string): Promise<HeroPhoto | null> {
  const found = await get('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'places.displayName,places.photos', ...googleHeaders() },
    body: JSON.stringify({ textQuery: destination, pageSize: 1 }),
  });
  const place = found.places?.[0];
  const photos = ((place?.photos ?? []) as GooglePhoto[]).filter((p) => (p.widthPx ?? 0) >= 1600 && (p.widthPx ?? 0) / Math.max(p.heightPx ?? 1, 1) >= 1.3);
  const best = photos.sort((a, b) => (b.widthPx ?? 0) - (a.widthPx ?? 0))[0];
  if (!best) return null;
  const author = best.authorAttributions?.[0];
  return {
    url: `${GOOGLE_MEDIA_PREFIX}${encodeURIComponent(best.name)}&w=2000`,
    title: place.displayName?.text ?? destination,
    credit: author?.displayName ? `${author.displayName} · Google` : 'Google',
    sourceUrl: author?.uri,
    exact: true,
    kind: 'city',
  };
}

interface CommonsFile {
  title: string;
  index?: number;
  imageinfo?: { thumburl?: string; width?: number; height?: number; mime?: string; descriptionurl?: string }[];
}

async function fromCommons(city: string): Promise<HeroPhoto | null> {
  const want = words(city);
  for (const kind of ['skyline', 'cityscape', 'panorama', 'aerial view']) {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      formatversion: '2',
      generator: 'search',
      gsrnamespace: '6',
      gsrsearch: `${city} ${kind} filetype:bitmap`,
      gsrlimit: '12',
      prop: 'imageinfo',
      iiprop: 'url|mime|size',
      iiurlwidth: '2400',
    });
    const data = await get(`https://commons.wikimedia.org/w/api.php?${params}`);
    const files = ((data.query?.pages ?? []) as CommonsFile[]).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    for (const f of files) {
      const info = f.imageinfo?.[0];
      if (!info?.thumburl || info.mime !== 'image/jpeg' || BAD.test(f.title)) continue;
      const w = info.width ?? 0;
      const h = info.height ?? 1;
      if (w < 1600 || w / h < 1.3 || w / h > 3) continue;
      const have = new Set(words(f.title));
      if (!want.some((x) => have.has(x))) continue;
      return { url: info.thumburl, title: city, credit: 'Wikimedia Commons', sourceUrl: info.descriptionurl, exact: true, kind: 'city' };
    }
  }
  return null;
}

/** The hero photo for "Moscow, Russia"; null when nothing good enough turns up. */
export function destinationPhoto(destination: string): Promise<HeroPhoto | null> {
  const clean = destination.replace(/\s+/g, ' ').trim().slice(0, 120);
  const key = clean.toLowerCase();
  if (!clean) return Promise.resolve(null);
  let hit = cache.get(key);
  if (!hit) {
    const parts = clean.split(',').map((p) => p.trim());
    const city = parts[0].split(/\s+and\s+|\s*&\s*/i)[0].trim();
    const country = parts.length > 1 ? parts[parts.length - 1] : '';
    hit = (async () => {
      const unsplash = process.env.UNSPLASH_ACCESS_KEY?.trim();
      const google = googleKey();
      const sources = [
        ...(unsplash ? [() => fromUnsplash(unsplash, city, country)] : []),
        ...(google ? [() => fromGoogle(google, clean)] : []),
        () => fromCommons(city),
        () => cityPhoto(city),
      ];
      let failed = false;
      for (const source of sources) {
        try {
          const found = await source();
          if (found?.url) return found;
        } catch (error) {
          failed = true;
          console.error('destination-photo:', error instanceof Error ? error.message : error);
        }
      }
      // Only a clean miss is worth remembering; a network hiccup should be retried.
      if (failed) cache.delete(key);
      return null;
    })();
    if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value!);
    cache.set(key, hit);
  }
  return hit;
}
