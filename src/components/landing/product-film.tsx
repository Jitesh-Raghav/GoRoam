"use client";

import { Play } from "@/components/site/icons";
import { useRef, useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { track } from "@/lib/analytics";

// Bump when the film is re-exported, so browsers never mix in a cached older copy.
const VERSION = "3";
// H.264 first: every GPU decodes it; the WebM is the fallback.
const SOURCES = [`/video/goroam-film.mp4?v=${VERSION}`, `/video/goroam-film.webm?v=${VERSION}`];

/**
 * The product film (made in /video), captions burned in, beside the heading.
 * Pressing play starts it with sound: play() runs inside the click itself,
 * which is what browsers require before they allow audio.
 */
export function ProductFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [source, setSource] = useState(0);
  const resume = useRef<number | null>(null);

  // If a browser can't decode one file, switch to the other and carry on from the same moment.
  const onError = () => {
    if (source >= SOURCES.length - 1) return;
    resume.current = started ? (videoRef.current?.currentTime ?? 0) : null;
    setSource(source + 1);
  };

  const onLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video || resume.current === null) return;
    video.currentTime = resume.current;
    resume.current = null;
    video.play().catch(() => {});
  };

  const start = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.currentTime = 0;
    video.play().catch(() => {});
    setStarted(true);
    track("film_played");
  };

  return (
    <section className="container-x relative py-24 md:py-32">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
        <SectionHeading
          index="60s"
          label="The film"
          title={[[{ text: "Watch a trip" }], [{ text: "plan itself.", className: "accent" }]]}
          description="One line in, five days out: real places, real costs, a map for every day and a local guide, in about a minute."
        />

        <Reveal delay={0.1}>
          <div className="relative aspect-video overflow-hidden rounded-[1.5rem] bg-ink shadow-[0_40px_100px_-36px_rgba(10,30,44,0.55)] ring-1 ring-ink/10 md:rounded-[2rem]">
            <video
              ref={videoRef}
              className="absolute inset-0 size-full object-cover"
              poster={`/video/goroam-film-poster.jpg?v=${VERSION}`}
              controls={started}
              playsInline
              preload="metadata"
              aria-label="The GoRoam film: a five-day Tokyo and Kyoto trip planned from one sentence"
              src={SOURCES[source]}
              onError={onError}
              onLoadedMetadata={onLoadedMetadata}
            />

            {!started && (
              <button
                type="button"
                onClick={start}
                className="group absolute inset-0 flex items-center justify-center bg-gradient-to-t from-ink/45 via-ink/10 to-transparent"
                aria-label="Play the GoRoam film, about one minute, with sound"
              >
                <span className="inline-flex items-center gap-3 rounded-full bg-paper/90 py-2 pl-2 pr-5 text-sm font-medium text-ink shadow-xl backdrop-blur-md transition-transform duration-500 ease-out-expo group-hover:scale-105 md:gap-4 md:py-3 md:pl-3 md:pr-7 md:text-base">
                  <span className="grid size-10 place-items-center rounded-full bg-brand text-white md:size-12">
                    <Play className="size-4 translate-x-px fill-current md:size-5" />
                  </span>
                  Watch the film
                  <span className="text-stone">1 min</span>
                </span>
              </button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
