import type { TripVideo } from "./trip";

/**
 * Travel videos from YouTube. With YOUTUBE_API_KEY they come from the Data API;
 * without one, from YouTube's public search results page (the same results a
 * visitor sees). Searches are cached, and a trip's list is saved with the trip.
 */

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const thumbFor = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

async function fromApi(key: string, q: string, max: number): Promise<TripVideo[]> {
  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    q,
    maxResults: String(max),
    videoEmbeddable: "true",
    safeSearch: "strict",
    relevanceLanguage: "en",
    key,
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`YouTube ${res.status}`);
  const data = await res.json();
  return (data.items ?? [])
    .map((item: { id?: { videoId?: string }; snippet?: { title?: string; channelTitle?: string; thumbnails?: Record<string, { url?: string }> } }) => {
      const id = item.id?.videoId;
      const s = item.snippet;
      if (!id || !s?.title) return null;
      return {
        id,
        title: decode(s.title),
        channel: s.channelTitle ? decode(s.channelTitle) : undefined,
        thumb: s.thumbnails?.high?.url ?? s.thumbnails?.medium?.url ?? thumbFor(id),
      } satisfies TripVideo;
    })
    .filter(Boolean) as TripVideo[];
}

/* eslint-disable @typescript-eslint/no-explicit-any -- YouTube's page data, read defensively */
/** Every `videoRenderer` in YouTube's page data, in page order. */
function renderers(node: any, out: any[] = [], depth = 0): any[] {
  if (!node || typeof node !== "object" || depth > 40 || out.length >= 20) return out;
  if (node.videoRenderer?.videoId) out.push(node.videoRenderer);
  for (const value of Array.isArray(node) ? node : Object.values(node)) renderers(value, out, depth + 1);
  return out;
}
const text = (t: any): string | undefined => t?.runs?.map((r: any) => r.text).join("") || t?.simpleText || undefined;
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Videos from a YouTube results page's embedded data (`ytInitialData`). Exported for tests. */
export function parseResultsPage(html: string): TripVideo[] {
  const start = html.indexOf("ytInitialData");
  if (start < 0) return [];
  const open = html.indexOf("{", start);
  const end = html.indexOf(";</script>", open);
  if (open < 0 || end < 0) return [];
  let data: unknown;
  try {
    data = JSON.parse(html.slice(open, end));
  } catch {
    return [];
  }
  return renderers(data)
    .map((v): TripVideo | null => {
      const title = text(v.title);
      if (!title || v.lengthText === undefined) return null; // skip live streams and upcoming premieres
      return { id: v.videoId as string, title, channel: text(v.ownerText) ?? text(v.longBylineText), thumb: thumbFor(v.videoId) };
    })
    .filter((v): v is TripVideo => !!v);
}

async function fromPage(q: string): Promise<TripVideo[]> {
  const params = new URLSearchParams({ search_query: q, hl: "en", gl: "US", sp: "EgIQAQ==" }); // sp: videos only
  const res = await fetch(`https://www.youtube.com/results?${params}`, {
    headers: { "Accept-Language": "en-US,en;q=0.9", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36" },
    signal: AbortSignal.timeout(7000),
  });
  if (!res.ok) throw new Error(`YouTube page ${res.status}`);
  return parseResultsPage(await res.text());
}

const cache = new Map<string, Promise<TripVideo[]>>();

/** Up to `max` videos for a search, from the API when there's a key, else the results page. */
export function searchVideos(q: string, max = 6): Promise<TripVideo[]> {
  const query = q.trim().slice(0, 120);
  const key = `${query.toLowerCase()}|${max}`;
  let hit = cache.get(key);
  if (!hit) {
    const apiKey = process.env.YOUTUBE_API_KEY?.trim();
    hit = (apiKey ? fromApi(apiKey, query, max).catch(() => fromPage(query)) : fromPage(query))
      .then((list) => list.slice(0, max))
      .catch((error) => {
        cache.delete(key); // a passing failure: try again next time
        console.error("videos:", error instanceof Error ? error.message : error);
        return [];
      });
    if (cache.size > 2000) cache.delete(cache.keys().next().value!);
    cache.set(key, hit);
  }
  return hit;
}

/** A trip's travel videos, saved with its guide. */
export async function findVideos(destination: string): Promise<TripVideo[]> {
  const city = destination.split(",")[0].trim();
  return searchVideos(`${city} travel guide`, 6);
}

/** The top video for one search (a guide's "watch before you go" idea). */
export async function findVideo(q: string): Promise<TripVideo | null> {
  return (await searchVideos(q, 1))[0] ?? null;
}
