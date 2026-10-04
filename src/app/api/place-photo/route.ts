import { NextRequest, NextResponse } from 'next/server';

/**
 * A real photo for a recommended stop, from the first source that has one:
 *   1. Google Places (when GOOGLE_PLACES_API_KEY / GOOGLE_MAPS_API_KEY is a real key)
 *   2. the place's Wikipedia page image
 *   3. a Wikimedia Commons file search for the place
 *   4. the nearest photographed landmark around its coordinates (labelled "Nearby")
 *   5. a photo of the destination city itself (labelled with the city)
 * Public on purpose, so shared trips get photos too.
 */

export interface PlacePhoto {
  url: string | null;
  /** What the photo actually shows (the matched page or place). */
  title?: string;
  credit?: string;
  sourceUrl?: string;
  /** false when it's a nearby landmark or the city rather than the place itself. */
  exact?: boolean;
  kind?: 'place' | 'nearby' | 'city';
  /** Google rating and review count, when the photo came from Google Places. */
  rating?: number;
  reviews?: number;
  mapsUrl?: string;
}

const UA = 'GoRoam/1.0 (AI travel itinerary planner; place photos)';
const WIKI = 'https://en.wikipedia.org/w/api.php';
const TIMEOUT = 5000;
const MAX_CACHE = 3000;
const NONE: PlacePhoto = { url: null };

// Bump when the source chain changes, so earlier misses aren't served from memory.
const VERSION = 'v3';
const cache = new Map<string, PlacePhoto>();
const remember = (key: string, value: PlacePhoto) => {
  if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value!);
  cache.set(key, value);
  return value;
};

const googleKey = () => {
  for (const key of [process.env.GOOGLE_PLACES_API_KEY, process.env.GOOGLE_MAPS_API_KEY]) {
    const k = key?.trim();
    if (k && /^AIza[\w-]{35}$/.test(k)) return k;
  }
  return null;
};

const get = async (url: string, init?: RequestInit) => {
  const res = await fetch(url, { ...init, headers: { 'User-Agent': UA, ...init?.headers }, signal: AbortSignal.timeout(TIMEOUT) });
  if (!res.ok) throw new Error(`${res.status} ${url.split('?')[0]}`);
  return res.json();
};

/** Great-circle distance in km. */
function km(a: [number, number], b: [number, number]) {
  const r = (d: number) => (d * Math.PI) / 180;
  const dLat = r(b[0] - a[0]);
  const dLng = r(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

const STOP = new Set(['the', 'and', 'of', 'at', 'in', 'de', 'la', 'le', 'du', 'des', 'del', 'restaurant', 'cafe', 'café', 'bar', 'hotel', 'tour', 'visit']);
const words = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

/** Share of the place name's meaningful words found in a page title. */
function overlap(name: string, title: string) {
  const want = words(name);
  if (!want.length) return 0;
  const have = new Set(words(title));
  return want.filter((w) => have.has(w)).length / want.length;
}

interface WikiPage {
  pageid: number;
  title: string;
  index?: number;
  thumbnail?: { source: string };
  coordinates?: { lat: number; lon: number }[];
}

// Logos, flags, maps and diagrams are SVGs; they make poor travel photos.
const usable = (p: WikiPage) => !!p.thumbnail?.source && !/\.svg/i.test(p.thumbnail.source) && !/(logo|flag|map|coat.of.arms|seal)/i.test(p.thumbnail.source);

const wikiPhoto = (p: WikiPage, exact: boolean): PlacePhoto => ({
  url: p.thumbnail!.source,
  title: p.title,
  credit: 'Wikipedia',
  sourceUrl: `https://en.wikipedia.org/?curid=${p.pageid}`,
  exact,
  kind: exact ? 'place' : 'nearby',
});

async function fromGoogle(key: string, name: string, city: string, at: [number, number] | null): Promise<PlacePhoto | null> {
  const body: Record<string, unknown> = { textQuery: `${name}, ${city}`, pageSize: 1 };
  if (at) body.locationBias = { circle: { center: { latitude: at[0], longitude: at[1] }, radius: 5000 } };
  const found = await get('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'places.displayName,places.photos,places.rating,places.userRatingCount,places.googleMapsUri' },
    body: JSON.stringify(body),
  });
  const place = found.places?.[0];
  const photo = place?.photos?.[0];
  if (!photo?.name) return null;
  const media = await get(`https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=1200&skipHttpRedirect=true&key=${key}`);
  if (!media.photoUri) return null;
  const author = photo.authorAttributions?.[0];
  return {
    url: media.photoUri,
    title: place.displayName?.text ?? name,
    credit: author?.displayName ? `${author.displayName} · Google` : 'Google',
    sourceUrl: author?.uri,
    exact: true,
    kind: 'place',
    rating: typeof place.rating === 'number' ? place.rating : undefined,
    reviews: typeof place.userRatingCount === 'number' ? place.userRatingCount : undefined,
    mapsUrl: typeof place.googleMapsUri === 'string' ? place.googleMapsUri : undefined,
  };
}

async function fromWikipedia(name: string, city: string, at: [number, number] | null): Promise<PlacePhoto | null> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    generator: 'search',
    gsrsearch: `${name} ${city}`.trim(),
    gsrlimit: '6',
    prop: 'pageimages|coordinates',
    piprop: 'thumbnail',
    pithumbsize: '1200',
    pilicense: 'any',
  });
  const data = await get(`${WIKI}?${params}`);
  const pages: WikiPage[] = (data.query?.pages ?? []).filter(usable).sort((a: WikiPage, b: WikiPage) => (a.index ?? 0) - (b.index ?? 0));

  let best: { page: WikiPage; score: number } | null = null;
  for (const page of pages) {
    const match = overlap(name, page.title);
    const c = page.coordinates?.[0];
    const dist = at && c ? km(at, [c.lat, c.lon]) : null;
    if (dist !== null && dist > 30) continue; // Same name, different place.
    let score = match;
    if (dist !== null && dist <= 3) score += 1;
    else if (dist === null && match < 0.6) continue;
    else if (dist !== null && match < 0.34) continue;
    if (!best || score > best.score) best = { page, score };
  }
  return best ? wikiPhoto(best.page, true) : null;
}

async function nearby(at: [number, number]): Promise<PlacePhoto | null> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    generator: 'geosearch',
    ggscoord: `${at[0]}|${at[1]}`,
    ggsradius: '1200',
    ggslimit: '12',
    prop: 'pageimages|coordinates',
    piprop: 'thumbnail',
    pithumbsize: '1200',
    pilicense: 'any',
  });
  const data = await get(`${WIKI}?${params}`);
  const pages: WikiPage[] = (data.query?.pages ?? []).filter(usable);
  const dist = (p: WikiPage) => (p.coordinates?.[0] ? km(at, [p.coordinates[0].lat, p.coordinates[0].lon]) : Infinity);
  const page = pages.sort((a, b) => dist(a) - dist(b))[0];
  return page ? wikiPhoto(page, false) : null;
}

interface CommonsPage {
  title: string;
  index?: number;
  imageinfo?: { thumburl?: string; url?: string; mime?: string; descriptionurl?: string }[];
}

/** Photos on Wikimedia Commons whose file name matches the place (covers many cafés, markets and small sights). */
async function fromCommons(name: string, city: string): Promise<PlacePhoto | null> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    generator: 'search',
    gsrnamespace: '6',
    gsrsearch: `${name} ${city} filetype:bitmap`.trim(),
    gsrlimit: '10',
    prop: 'imageinfo',
    iiprop: 'url|mime',
    iiurlwidth: '1200',
  });
  const data = await get(`${WIKI.replace('en.wikipedia.org', 'commons.wikimedia.org')}?${params}`);
  const files: CommonsPage[] = (data.query?.pages ?? []).sort((a: CommonsPage, b: CommonsPage) => (a.index ?? 0) - (b.index ?? 0));
  for (const f of files) {
    const info = f.imageinfo?.[0];
    const src = info?.thumburl ?? info?.url;
    if (!src || info?.mime !== 'image/jpeg') continue;
    if (/(logo|flag|map|coat.of.arms|seal|menu|receipt|document|plan)/i.test(f.title)) continue;
    if (overlap(name, f.title.replace(/^File:/, '').replace(/[_.]/g, ' ')) < 0.5) continue;
    return { url: src, title: name, credit: 'Wikimedia Commons', sourceUrl: info?.descriptionurl, exact: true, kind: 'place' };
  }
  return null;
}

const cityCache = new Map<string, PlacePhoto | null>();

/** Last resort: the destination itself, so a stop never shows an empty frame. */
async function cityPhoto(city: string): Promise<PlacePhoto | null> {
  const key = city.toLowerCase();
  if (cityCache.has(key)) return cityCache.get(key)!;
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    generator: 'search',
    gsrsearch: city,
    gsrlimit: '3',
    prop: 'pageimages',
    piprop: 'thumbnail',
    pithumbsize: '1200',
    pilicense: 'any',
  });
  const data = await get(`${WIKI}?${params}`);
  const pages: WikiPage[] = (data.query?.pages ?? []).filter(usable).sort((a: WikiPage, b: WikiPage) => (a.index ?? 0) - (b.index ?? 0));
  const page = pages.find((p) => overlap(city, p.title) >= 0.5) ?? pages[0];
  const photo: PlacePhoto | null = page ? { ...wikiPhoto(page, false), title: page.title, kind: 'city' } : null;
  cityCache.set(key, photo);
  return photo;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const name = (q.get('name') ?? '').trim().slice(0, 140);
  const city = (q.get('city') ?? '').split(',')[0].trim().slice(0, 80);
  const lat = Number(q.get('lat'));
  const lng = Number(q.get('lng'));
  const at: [number, number] | null =
    q.get('lat') && q.get('lng') && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && (lat !== 0 || lng !== 0) ? [lat, lng] : null;

  if (!name) return NextResponse.json(NONE, { status: 400 });

  const key = [VERSION, name, city, at?.map((n) => n.toFixed(3)).join(',')].join('|').toLowerCase();
  let photo = cache.get(key);
  let failed = false;
  if (!photo) {
    photo = NONE;
    const google = googleKey();
    const sources = [
      ...(google ? [() => fromGoogle(google, name, city, at)] : []),
      () => fromWikipedia(name, city, at),
      () => fromCommons(name, city),
      ...(at ? [() => nearby(at)] : []),
      ...(city ? [() => cityPhoto(city)] : []),
    ];
    for (const source of sources) {
      try {
        const found = await source();
        if (found?.url) {
          photo = found;
          break;
        }
      } catch (error) {
        failed = true;
        console.error('place-photo:', error instanceof Error ? error.message : error);
      }
    }
    // Don't pin a miss that was only a network hiccup.
    if (photo.url || !failed) remember(key, photo);
  }

  return NextResponse.json(photo, {
    headers: {
      // Google photo links expire, so those are only cached for a day.
      'Cache-Control': !photo.url
        ? failed
          ? 'no-store'
          : 'public, max-age=600'
        : photo.credit?.includes('Google')
          ? 'public, max-age=3600, s-maxage=86400'
          : 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
    },
  });
}
