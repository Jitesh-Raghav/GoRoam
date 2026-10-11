"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Play } from "@/components/site/icons";
import { useRef, useState } from "react";
import { SectionHeading } from "@/components/landing/section-heading";
import { track } from "@/lib/analytics";
import { MacWindow } from "@/components/site/mac-window";
import { GLOW_FRAG, ShaderCanvas } from "@/components/site/shader-canvas";

// Bump when the film is re-exported, so browsers never mix in a cached older copy.
const VERSION = "3";
// H.264 first: every GPU decodes it; the WebM is the fallback.
const SOURCES = [`/video/goroam-film.mp4?v=${VERSION}`, `/video/goroam-film.webm?v=${VERSION}`];

/**
 * The product film (made in /video), captions burned in, in a macOS-style window on a
 * dark dotted band lit by a slow shader glow.
 * Pressing play starts it with sound: play() runs inside the click itself,
 * which is what browsers require before they allow audio.
 */
export function ProductFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [source, setSource] = useState(0);
  const resume = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  // The film grows to full size as it scrolls into view.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "start 0.25"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);

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
    <section ref={sectionRef} className="relative px-3 py-6 sm:px-4 lg:py-10">
      <div className="relative isolate overflow-hidden rounded-panel bg-ink py-20 text-paper lg:py-28">
        {/* Light pooling behind the window, under a fine dot grid. */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_55%_at_50%_60%,rgba(31,111,235,0.35),transparent_70%)]" />
        <ShaderCanvas frag={GLOW_FRAG} colors={["#0e1f3b", "#1f6feb", "#7cc4ff", "#ffd23f"]} speed={0.6} scale={0.35} className="absolute inset-0 -z-10 size-full" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(rgba(124,196,255,0.22)_1px,transparent_1.2px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_45%,#000_35%,transparent_85%)]"
        />

        <div className="container-x">
          <SectionHeading
            align="center"
            tone="paper"
            label="See it work"
            title={[[{ text: "Watch a trip " }, { text: "plan itself.", className: "accent" }]]}
            description="One line in, five days out: real places, real costs, a map for every day and a local guide, in about a minute."
          />
        </div>

        <div className="mt-12 px-3 sm:px-6 lg:mt-16 lg:px-10">
          <motion.div style={reduce ? undefined : { scale }} className="relative mx-auto w-full max-w-[1480px] origin-top">
            {/* Azure light spilling out under the window. */}
            <div aria-hidden className="absolute inset-x-[12%] -bottom-10 top-1/3 -z-10 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(31,111,235,0.55),transparent_70%)] blur-3xl" />
            <MacWindow className="mx-auto w-[min(100%,calc(80svh*16/9))]">
              <div className="relative aspect-video bg-ink">
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
                    <span className="inline-flex items-center gap-3 rounded-full bg-paper/95 py-2 pl-2 pr-5 text-sm font-medium text-ink shadow-float backdrop-blur-md transition-transform duration-500 ease-out-expo group-hover:scale-105 md:gap-4 md:py-2.5 md:pl-2.5 md:pr-6 md:text-base lg:py-3 lg:pl-3 lg:pr-7 lg:text-lg">
                      <span className="grid size-10 place-items-center rounded-full bg-brand text-white md:size-12 lg:size-14">
                        <Play className="size-4 translate-x-px fill-current md:size-5" />
                      </span>
                      Watch the film
                      <span className="text-stone">1 min</span>
                    </span>
                  </button>
                )}
              </div>
            </MacWindow>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
