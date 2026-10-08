"use client";

/* eslint-disable @next/next/no-img-element -- YouTube thumbnails, already sized. */

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import { useEffect, useState } from "react";
import type { TripVideo } from "@/lib/trip";
import { cn } from "@/lib/utils";
import { PlacePhoto, asStop } from "../place-photo";
import { Band } from "../band";
import { SectionTitle } from "./section-title";

const ease = [0.16, 1, 0.3, 1] as const;

function YouTubeGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 20" aria-hidden className={className}>
      <rect width="28" height="20" rx="6" fill="#FF0033" />
      <path d="M11 6l7 4-7 4z" fill="#fff" />
    </svg>
  );
}

/** The featured player: a still with a play button until clicked, so nothing heavy loads up front. */
function Player({ video, playing, onPlay }: { video: TripVideo; playing: boolean; onPlay: () => void }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-[26px] bg-ink">
      <AnimatePresence mode="wait">
        {playing ? (
          <motion.iframe
            key={`play-${video.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : (
          <motion.button
            key={`still-${video.id}`}
            type="button"
            onClick={onPlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="group absolute inset-0 text-left"
            aria-label={`Play: ${video.title}`}
          >
            <img src={video.thumb} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.04]" />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-ink/20" />
            <span className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-ink shadow-2xl transition-transform duration-500 group-hover:scale-110">
              <Play className="ml-1 size-7 fill-ink" />
            </span>
            <span className="absolute inset-x-0 bottom-0 p-5 text-paper sm:p-7">
              {video.channel && <span className="eyebrow block text-[0.6rem] text-paper/70">{video.channel}</span>}
              <span className="display mt-1.5 line-clamp-2 block text-[clamp(1.19rem,2.21vw,1.87rem)] leading-[1.02]">{video.title}</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* One request per search idea, shared by every tile that asks for it. */
const videoLookups = new Map<string, Promise<TripVideo | null>>();
function lookUpVideo(q: string) {
  let hit = videoLookups.get(q);
  if (!hit) {
    hit = fetch(`/api/video?q=${encodeURIComponent(q)}`)
      .then((r) => (r.ok ? r.json() : { video: null }))
      .then((d: { video?: TripVideo | null }) => d.video ?? null)
      .catch(() => null);
    videoLookups.set(q, hit);
    hit.then((v) => !v && videoLookups.delete(q));
  }
  return hit;
}

// If a search finds no video, each tile still gets its own look: a different crop and tint of the city.
const MISS_LOOKS = [
  { pos: "object-[30%_45%]", tint: "from-ink/90 via-brand/25 to-ink/10" },
  { pos: "object-[75%_60%] scale-125", tint: "from-ink/90 via-sun/25 to-ink/10" },
  { pos: "object-[10%_80%] scale-150", tint: "from-ink/90 via-ink/40 to-brand-2/20" },
  { pos: "object-[90%_20%] scale-110", tint: "from-ink/90 via-[#c0503e]/25 to-ink/10" },
];

/** A "watch before you go" idea, shown with the real thumbnail of its top YouTube video. */
function QueryTile({ q, i, city, destination }: { q: string; i: number; city: string; destination: string }) {
  const [video, setVideo] = useState<TripVideo | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    lookUpVideo(q).then((v) => live && setVideo(v));
    return () => {
      live = false;
    };
  }, [q]);
  const look = MISS_LOOKS[i % MISS_LOOKS.length];
  const href = video ? `https://www.youtube.com/watch?v=${video.id}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease, delay: i * 0.06 }}
      className={cn(
        "group relative block overflow-hidden rounded-[22px] bg-ink",
        i === 0 ? "col-span-2 aspect-[16/8] lg:row-span-2 lg:aspect-auto" : i === 3 ? "col-span-2 aspect-[16/7] lg:aspect-auto" : "aspect-video"
      )}
    >
      {video === undefined && <span className="skeleton absolute inset-0" />}
      {video && <img src={video.thumb} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.05]" />}
      {video === null && <PlacePhoto activity={asStop(city)} destination={destination} credit={false} imgClassName={cn(look.pos, "group-hover:scale-[1.05]")} />}
      <span className={cn("absolute inset-0 bg-gradient-to-t", video ? "from-ink/90 via-ink/30 to-ink/10" : look.tint)} />
      <span
        className={cn(
          "absolute grid place-items-center transition-transform duration-500 group-hover:scale-110",
          i === 0 ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" : "right-3 top-3"
        )}
      >
        <YouTubeGlyph className={cn("drop-shadow-xl", i === 0 ? "h-10 w-14" : "h-6 w-8")} />
      </span>
      <span className="absolute inset-x-0 bottom-0 p-4 text-paper sm:p-5">
        <span className="eyebrow block truncate text-[0.55rem] text-paper/60">{video?.channel ?? (video ? "YouTube" : "Search YouTube")}</span>
        <span className={cn("display mt-1 line-clamp-2 block leading-[1.02]", i === 0 ? "text-[clamp(1.27rem,2.21vw,1.87rem)]" : "text-[0.98rem]")}>{q}</span>
      </span>
    </motion.a>
  );
}

/**
 * "Watch before you go": a featured video with a short playlist beside it.
 * Without a YouTube key, the guide's search ideas become tidy link tiles instead.
 */
export function Videos({ videos, queries, destination }: { videos?: TripVideo[]; queries: string[]; destination: string }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const list = (videos ?? []).slice(0, 5);
  const city = destination.split(",")[0].trim();
  if (!list.length && !queries.length) return null;

  return (
    <Band tone="ink" className="no-print">
      <SectionTitle
        eyebrow="Watch before you go"
        title={
          <>
            See it in <span className="italic text-brand">motion.</span>
          </>
        }
      >
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${city} travel`)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 self-start rounded-full bg-paper/10 px-4 py-2.5 text-sm text-paper ring-1 ring-inset ring-paper/20 backdrop-blur transition-colors hover:bg-paper hover:text-ink sm:self-auto"
        >
          <YouTubeGlyph className="h-3.5 w-5" /> More on YouTube <ArrowUpRight className="size-4" />
        </a>
      </SectionTitle>

      {list.length ? (
        <div className="mt-8 grid gap-3 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
          <Player video={list[active]} playing={playing} onPlay={() => setPlaying(true)} />
          <ul className="no-scrollbar -mx-3 flex snap-x gap-2 overflow-x-auto px-5 scroll-px-5 min-[400px]:-mx-4 min-[400px]:px-6 min-[400px]:scroll-px-6 sm:scroll-px-0 sm:mx-0 sm:px-0 lg:flex-col lg:overflow-visible">
            {list.map((v, i) => {
              const on = i === active;
              return (
                <li key={v.id} className="w-[70%] shrink-0 snap-start sm:w-[40%] lg:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setActive(i);
                      setPlaying(true);
                    }}
                    className={cn(
                      "group flex w-full flex-col gap-3 rounded-[20px] p-2 text-left transition-colors lg:flex-row lg:items-center",
                      on ? "bg-paper text-ink" : "glass-dark text-paper hover:bg-paper/10"
                    )}
                  >
                    <span className="relative block aspect-video w-full shrink-0 overflow-hidden rounded-[14px] bg-ink lg:w-36">
                      <img src={v.thumb} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
                      <span className="absolute inset-0 grid place-items-center bg-ink/20 opacity-0 transition-opacity group-hover:opacity-100">
                        <Play className="size-5 fill-white text-white" />
                      </span>
                    </span>
                    <span className="min-w-0 px-1 pb-1 lg:pb-0">
                      <span className="line-clamp-2 block text-sm leading-snug">{v.title}</span>
                      {v.channel && <span className={cn("mt-1 block truncate text-[11px]", on ? "text-stone" : "text-paper/55")}>{v.channel}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {queries.map((q, i) => (
            <QueryTile key={q} q={q} i={i} city={city} destination={destination} />
          ))}
        </div>
      )}
    </Band>
  );
}
