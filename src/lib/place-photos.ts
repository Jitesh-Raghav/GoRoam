// Server-only: finds real photos for itinerary stops.
import { photoKey, type ItineraryData, type PlacePhoto } from '@/lib/trip';

/**
 * A real photo for a recommended stop, from the first source that has one:
 *   1. Google Places (when a real Google key is configured)
 *   2. the place's Wikipedia page image
 *   3. a Wikimedia Commons file search for the place
 *   4. Openverse (openly licensed photos from Flickr and others)
 *   5. the nearest photographed landmark around its coordinates (labelled "Nearby")
 *   6. a photo of the stop's own area, then of the destination (labelled as such)
 * Each stop is searched with its area ("Zermatt") as well as the trip's destination,
 * so multi-city trips find the right place. Every result also carries an area or
 * city photo as `fallback`, for the rare link that fails to load in the browser.
 */

// Wikimedia throttles (HTTP 429) any client whose User-Agent lacks contact details,
// which is what used to leave stops without photos. Keep a URL in here.
const UA = 'GoRoam/1.0 (https://github.com/Jitesh-Raghav/GoRoam; travel itinerary planner)';
const WIKI = 'https://en.wikipedia.org/w/api.php';
const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const TIMEOUT = 6000;
const MAX_CACHE = 5000;
const CONCURRENCY = 3;

/** Proxied Google photos: Google's own links are short-lived and mustn't be stored. */
export const GOOGLE_MEDIA_PREFIX = '/api/place-photo/media?ref=';
export const isGooglePhoto = (p: PlacePhoto | undefined) => !!p?.url?.startsWith(GOOGLE_MEDIA_PREFIX);

const cache = new Map<string, PlacePhoto>();
const remember = (key: string, value: PlacePhoto) => {
  if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value!);
  cache.set(key, value);
  return value;
};

export function googleKey() {
  for (const key of [process.env.GOOGLE_PLACES_API_KEY, process.env.GOOGLE_MAPS_API_KEY, process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY]) {
    const k = key?.trim();
    if (k && /^AIza[\w-]{35}$/.test(k)) return k;
  }
  return null;
}

/** Browser keys are usually restricted to the site's domain; say we're it. */
const siteOrigin = () => (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
export const googleHeaders = () => ({ Referer: `${siteOrigin()}/` });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** JSON fetch with a timeout and two polite retries when a service is busy (429) or hiccups (5xx). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- third-party JSON, narrowed where used
async function get(url: string, init?: RequestInit, attempt = 0): Promise<any> {
  const res = await fetch(url, { ...init, headers: { 'User-Agent': UA, ...init?.headers }, signal: AbortSignal.timeout(TIMEOUT) });
  if ((res.status === 429 || res.status >= 500) && attempt < 2) {
    await sleep((attempt + 1) * 900 + Math.random() * 600);
    return get(url, init, attempt + 1);
  }
  if (!res.ok) throw new Error(`${res.status} ${url.split('?')[0]}`);
  return res.json();
}

/** Great-circle distance in km. */
function km(a: [number, number], b: [number, number]) {
  const r = (d: number) => (d * Math.PI) / 180;
  const dLat = r(b[0] - a[0]);
  const dLng = r(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

const STOP = new Set(['the', 'and', 'of', 'at', 'in', 'de', 'la', 'le', 'du', 'des', 'del', 'restaurant', 'cafe', 'café', 'bar', 'hotel', 'tour', 'visit', 'to', 'lunch', 'dinner', 'breakfast', 'hike', 'exploration', 'local']);
const words = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

/** Share of the place name's meaningful words found in a title. */
function overlap(name: string, title: string) {
  const want = words(name);
  if (!want.length) return 0;
  const have = new Set(words(title));
  return want.filter((w) => have.has(w)).length / want.length;
}

/** Where a stop is: its area ("Zermatt", "Seminyak") and the trip's destination. */
interface Context {
  name: string;
  places: string[];
}

/** Whether a text mentions one of the stop's places. */
const mentionsPlace = (text: string, ctx: Context) => {
  const have = new Set(words(text));
  return ctx.places.some((p) => words(p).some((w) => have.has(w)));
};

/**
 * For results with no coordinates to check, a loose word match isn't proof
 * ("Bali Swing" is not a man called Stephen Bali; a "Fisherman's Wharf" in Goa is
 * not San Francisco's): the title must name the place and also its area or city,
 * unless the name is long and specific enough to stand alone.
 */
function namesThePlace(text: string, ctx: Context) {
  const want = words(ctx.name);
  const match = overlap(ctx.name, text);
  const place = mentionsPlace(text, ctx);
  return (match >= 0.99 && (want.length >= 3 || place)) || (match >= 0.5 && place);
}

interface WikiPage {
  pageid: number;
  title: string;
  index?: number;
  thumbnail?: { source: string };
  coordinates?: { lat: number; lon: number }[];
}

// Logos, flags, maps and diagrams make poor travel photos.
const BAD = /(logo|flag|map|locator|location|coat.of.arms|seal|menu|receipt|document|plan|diagram|chart|montage|collage)/i;
const fileName = (url: string) => decodeURIComponent(url.split('/').pop()?.split('?')[0] ?? '').replace(/^\d+px-/, '').replace(/[_.,]/g, ' ');
// Real photographs are JPEGs; PNG/SVG/GIF page images are maps, diagrams and logos.
const usable = (p: WikiPage) => !!p.thumbnail?.source && /\.jpe?g/i.test(p.thumbnail.source) && !BAD.test(decodeURIComponent(p.thumbnail.source));
const byIndex = <T extends { index?: number }>(a: T, b: T) => (a.index ?? 0) - (b.index ?? 0);

const wikiPhoto = (p: WikiPage, kind: PlacePhoto['kind']): PlacePhoto => ({
  url: p.thumbnail!.source,
  title: p.title,
  credit: 'Wikipedia',
  sourceUrl: `https://en.wikipedia.org/?curid=${p.pageid}`,
  exact: kind === 'place',
  kind,
});

const wikiQuery = (params: Record<string, string>) =>
  new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', prop: 'pageimages|coordinates', piprop: 'thumbnail', pithumbsize: '1200', pilicense: 'any', ...params });

type At = [number, number] | null;

/** "Gornergrat Railway Zermatt", then "… Lucerne", then the name alone. */
const queries = (ctx: Context) => [...new Set([...ctx.places.map((p) => `${ctx.name} ${p}`), ctx.name])];

async function fromGoogle(key: string, ctx: Context, at: At): Promise<PlacePhoto | null> {
  const body: Record<string, unknown> = { textQuery: [ctx.name, ...ctx.places].join(', '), pageSize: 1 };
  if (at) body.locationBias = { circle: { center: { latitude: at[0], longitude: at[1] }, radius: 5000 } };
  const found = await get('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'places.displayName,places.photos,places.rating,places.userRatingCount,places.googleMapsUri', ...googleHeaders() },
    body: JSON.stringify(body),
  });
  const place = found.places?.[0];
  const photo = place?.photos?.[0];
  if (!photo?.name) return null;
  const author = photo.authorAttributions?.[0];
  return {
    url: `${GOOGLE_MEDIA_PREFIX}${encodeURIComponent(photo.name)}`,
    title: place.displayName?.text ?? ctx.name,
    credit: author?.displayName ? `${author.displayName} · Google` : 'Google',
    sourceUrl: author?.uri,
    exact: true,
    kind: 'place',
    rating: typeof place.rating === 'number' ? place.rating : undefined,
    reviews: typeof place.userRatingCount === 'number' ? place.userRatingCount : undefined,
    mapsUrl: typeof place.googleMapsUri === 'string' ? place.googleMapsUri : undefined,
  };
}

async function fromWikipedia(ctx: Context, at: At): Promise<PlacePhoto | null> {
  for (const q of queries(ctx)) {
    const data = await get(`${WIKI}?${wikiQuery({ generator: 'search', gsrsearch: q, gsrlimit: '6' })}`);
    const pages: WikiPage[] = (data.query?.pages ?? []).filter(usable).sort(byIndex);
    let best: { page: WikiPage; score: number } | null = null;
    for (const page of pages) {
      // Judge by the page title or its photo's file name ("Bamboo_Grove,_Arashiyama,_Kyoto.jpg").
      const text = `${page.title} ${fileName(page.thumbnail!.source)}`;
      const match = Math.max(overlap(ctx.name, page.title), overlap(ctx.name, fileName(page.thumbnail!.source)));
      const c = page.coordinates?.[0];
      const dist = at && c ? km(at, [c.lat, c.lon]) : null;
      if (dist === null) {
        if (!namesThePlace(text, ctx)) continue;
      } else {
        // The AI's coordinates can be tens of km out, so distance only vetoes a weak name
        // match, or anything clearly in another region.
        if (dist > 150 || (dist > 30 && match < 0.75)) continue;
        // Being close isn't enough either (a city's page sits near all its sights).
        if (match < (dist <= 3 ? 0.34 : 0.5)) continue;
      }
      const score = match + (dist !== null && dist <= 3 ? 1 : 0) - ((page.index ?? 1) - 1) * 0.02;
      if (!best || score > best.score) best = { page, score };
    }
    if (best) return wikiPhoto(best.page, 'place');
  }
  return null;
}

interface CommonsPage {
  title: string;
  index?: number;
  imageinfo?: { thumburl?: string; url?: string; mime?: string; descriptionurl?: string }[];
}

/** Photos on Wikimedia Commons whose file name names the place (many cafés, markets and small sights). */
async function fromCommons(ctx: Context): Promise<PlacePhoto | null> {
  for (const q of queries(ctx)) {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      formatversion: '2',
      generator: 'search',
      gsrnamespace: '6',
      gsrsearch: `${q} filetype:bitmap`,
      gsrlimit: '10',
      prop: 'imageinfo',
      iiprop: 'url|mime',
      iiurlwidth: '1200',
    });
    const data = await get(`${COMMONS}?${params}`);
    for (const f of ((data.query?.pages ?? []) as CommonsPage[]).sort(byIndex)) {
      const info = f.imageinfo?.[0];
      const src = info?.thumburl ?? info?.url;
      if (!src || info?.mime !== 'image/jpeg' || BAD.test(f.title)) continue;
      if (!namesThePlace(f.title.replace(/^File:/, '').replace(/[_.,]/g, ' '), ctx)) continue;
      return { url: src, title: ctx.name, credit: 'Wikimedia Commons', sourceUrl: info?.descriptionurl, exact: true, kind: 'place' };
    }
  }
  return null;
}

interface OpenverseImage {
  title?: string;
  thumbnail?: string;
  url?: string;
  creator?: string;
  foreign_landing_url?: string;
  tags?: { name: string }[];
}

/** Openverse: openly licensed photos (Flickr, museums…), searched by place and area. */
async function fromOpenverse(ctx: Context): Promise<PlacePhoto | null> {
  const params = new URLSearchParams({ q: `${ctx.name} ${ctx.places[0] ?? ''}`.trim(), page_size: '10', mature: 'false', category: 'photograph' });
  const data = await get(`https://api.openverse.org/v1/images/?${params}`);
  for (const img of (data.results ?? []) as OpenverseImage[]) {
    const src = img.thumbnail || img.url;
    if (!src || BAD.test(img.title ?? '')) continue;
    if (!namesThePlace(`${img.title ?? ''} ${(img.tags ?? []).map((t) => t.name).join(' ')}`, ctx)) continue;
    return { url: src, title: img.title || ctx.name, credit: img.creator ? `${img.creator} · Openverse` : 'Openverse', sourceUrl: img.foreign_landing_url, exact: true, kind: 'place' };
  }
  return null;
}

async function nearby(at: [number, number]): Promise<PlacePhoto | null> {
  const data = await get(`${WIKI}?${wikiQuery({ generator: 'geosearch', ggscoord: `${at[0]}|${at[1]}`, ggsradius: '1500', ggslimit: '15' })}`);
  const pages: WikiPage[] = (data.query?.pages ?? []).filter(usable);
  const dist = (p: WikiPage) => (p.coordinates?.[0] ? km(at, [p.coordinates[0].lat, p.coordinates[0].lon]) : Infinity);
  const page = pages.sort((a, b) => dist(a) - dist(b))[0];
  return page ? wikiPhoto(page, 'nearby') : null;
}

const placeCache = new Map<string, Promise<PlacePhoto | null>>();

/**
 * A photo of a place itself: the destination, or a stop's area. `within` narrows an
 * area to its destination ("Old Town" → "Old Town Lucerne"), and the page title must
 * name the place, so a generic "Old town" article isn't used.
 */
export function cityPhoto(place: string, within?: string): Promise<PlacePhoto | null> {
  const key = `${place}|${within ?? ''}`.toLowerCase().trim();
  if (!place.trim()) return Promise.resolve(null);
  let hit = placeCache.get(key);
  if (!hit) {
    hit = (async () => {
      const q = within ? `${place} ${within}` : place;
      const data = await get(`${WIKI}?${wikiQuery({ generator: 'search', gsrsearch: q, gsrlimit: '5' })}`);
      const pages: WikiPage[] = (data.query?.pages ?? []).filter(usable).sort(byIndex);
      const page = pages.find((p) => overlap(place, p.title) >= 0.5) ?? (within ? undefined : pages[0]);
      return page ? { ...wikiPhoto(page, 'city'), title: page.title } : null;
    })().catch((error) => {
      placeCache.delete(key); // try again next time
      console.error('city-photo:', error instanceof Error ? error.message : error);
      return null;
    });
    placeCache.set(key, hit);
  }
  return hit;
}

export interface StopQuery {
  name: string;
  area?: string;
  lat?: number;
  lng?: number;
}

const coords = (s: StopQuery): At =>
  Number.isFinite(s.lat) && Number.isFinite(s.lng) && Math.abs(s.lat!) <= 90 && Math.abs(s.lng!) <= 180 && (s.lat !== 0 || s.lng !== 0) ? [s.lat!, s.lng!] : null;

/** The destination's main city: "Lucerne, Interlaken and Zermatt, Switzerland" → "Lucerne". */
const mainCity = (destination: string) => destination.split(',')[0].split(/\s+and\s+|\s*&\s*/i)[0].trim().slice(0, 80);

/** The stop's area, when it names a real place rather than "Old Town" or "Downtown". */
const GENERIC_AREA = /^(old town|city cent(er|re)|downtown|centre|center|historic cent(er|re)|waterfront|beach|harbour|harbor|airport|various|citywide|n\/a)$/i;
const areaOf = (stop: StopQuery) => {
  const a = stop.area?.trim();
  return a && !GENERIC_AREA.test(a) ? a.slice(0, 80) : undefined;
};

/** The best photo for one stop; `null` only if every source is empty or unreachable. */
export async function resolvePhoto(stop: StopQuery, destination: string): Promise<PlacePhoto | null> {
  const name = stop.name.trim().slice(0, 140);
  const city = mainCity(destination);
  if (!name) return null;
  const area = areaOf(stop);
  const ctx: Context = { name, places: [...new Set([area, city, destination.split(',')[0].trim()].filter((p): p is string => !!p))] };
  const at = coords(stop);
  const key = `${photoKey(name, destination)}|${area ?? ''}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const google = googleKey();
  const sources = [
    ...(google ? [() => fromGoogle(google, ctx, at)] : []),
    () => fromWikipedia(ctx, at),
    () => fromCommons(ctx),
    () => fromOpenverse(ctx),
    ...(at ? [() => nearby(at)] : []),
    ...(area ? [() => cityPhoto(area, city)] : []),
    () => cityPhoto(city),
  ];
  let failed = false;
  for (const source of sources) {
    try {
      const found = await source();
      if (found?.url) return remember(key, found);
    } catch (error) {
      failed = true;
      console.error('place-photo:', error instanceof Error ? error.message : error);
    }
  }
  // Don't pin a miss that was only a network hiccup.
  if (!failed) remember(key, { url: null });
  return null;
}

/** Run jobs a few at a time, so photo services aren't hit with a burst. */
async function pool<T>(items: T[], limit: number, run: (item: T) => Promise<void>) {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) await run(items[i++]);
    })
  );
}

/** Every stop in a trip, de-duplicated by place. */
export function tripStops(data: ItineraryData): StopQuery[] {
  const seen = new Set<string>();
  const out: StopQuery[] = [];
  for (const day of data.itinerary ?? []) {
    for (const slot of [day.morning, day.afternoon, day.evening]) {
      const p = slot?.place;
      if (!p?.name || seen.has(p.name)) continue;
      seen.add(p.name);
      out.push({ name: p.name, area: p.area, lat: p.lat, lng: p.lng });
    }
  }
  return out;
}

/**
 * Photos for every stop in a trip: what's already saved on it, plus lookups for
 * the rest. `save` holds the entries worth persisting (never Google's links).
 */
export async function resolveTripPhotos(data: ItineraryData, destination: string) {
  const city = mainCity(destination);
  const saved = data.photos ?? {};
  const photos: Record<string, PlacePhoto> = { ...saved };
  const fresh: Record<string, PlacePhoto> = {};
  const fallback = await cityPhoto(city);
  const stops = tripStops(data);

  const missing = stops.filter((s) => !photos[photoKey(s.name, destination)]?.url);
  await pool(missing, CONCURRENCY, async (stop) => {
    const found = await resolvePhoto(stop, destination);
    if (!found?.url) return;
    // Every stop keeps a second real photo (its area's, else the city's) in case the first won't load.
    const area = areaOf(stop);
    const areaShot = area ? await cityPhoto(area, city) : null;
    const backup = [areaShot?.url, fallback?.url].find((u) => u && u !== found.url);
    const entry = backup ? { ...found, fallback: backup } : found;
    const key = photoKey(stop.name, destination);
    photos[key] = entry;
    if (!isGooglePhoto(entry)) fresh[key] = entry;
  });

  for (const key of Object.keys(photos)) {
    if (fallback?.url && !photos[key].fallback && photos[key].url !== fallback.url) photos[key] = { ...photos[key], fallback: fallback.url };
  }
  return { photos, fallback: fallback?.url ?? null, save: Object.keys(fresh).length ? { ...saved, ...fresh } : null };
}

/**
 * Photos for a stored trip. Anything newly found is saved back onto the trip,
 * so the next view (by anyone) needs no lookups at all.
 */
export async function photosForItinerary(record: { id: string; destination: string; itineraryData: string }) {
  const { prisma } = await import('@/lib/prisma');
  let data: ItineraryData;
  try {
    data = JSON.parse(record.itineraryData);
  } catch {
    return { photos: {}, fallback: null };
  }
  const destination = data.summary?.destination || record.destination;
  const { photos, fallback, save } = await resolveTripPhotos(data, destination);
  if (save) {
    // Re-read before writing, so a concurrent edit to the trip isn't lost.
    const latest = await prisma.itinerary.findUnique({ where: { id: record.id }, select: { itineraryData: true } });
    if (latest) {
      try {
        const current: ItineraryData = JSON.parse(latest.itineraryData);
        current.photos = { ...current.photos, ...save };
        await prisma.itinerary.update({ where: { id: record.id }, data: { itineraryData: JSON.stringify(current) } });
      } catch (error) {
        console.error('Saving trip photos failed:', error);
      }
    }
  }
  return { photos, fallback };
}
