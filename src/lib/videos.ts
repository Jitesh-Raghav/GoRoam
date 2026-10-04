import type { TripVideo } from "./trip";

/**
 * Travel videos for a destination from the YouTube Data API (set YOUTUBE_API_KEY).
 * One search per trip (100 quota units), saved with the trip so it's never repeated.
 * Without a key the guide falls back to YouTube search links.
 */

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

export async function findVideos(destination: string): Promise<TripVideo[]> {
  const key = process.env.YOUTUBE_API_KEY?.trim();
  if (!key) return [];
  const city = destination.split(",")[0].trim();
  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    q: `${city} travel guide`,
    maxResults: "6",
    videoEmbeddable: "true",
    safeSearch: "strict",
    relevanceLanguage: "en",
    videoDuration: "medium",
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
        thumb: s.thumbnails?.high?.url ?? s.thumbnails?.medium?.url ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      } satisfies TripVideo;
    })
    .filter(Boolean)
    .slice(0, 6) as TripVideo[];
}
