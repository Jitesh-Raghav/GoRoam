"use client";

/* eslint-disable @next/next/no-img-element -- the trip photo comes from our own photo route, already sized */

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GuidePhoto } from "@/components/seo/guide-media";
import { Camera, ChevronLeft, ChevronRight, X } from "@/components/site/icons";
import { cn } from "@/lib/utils";

export interface GallerySlide {
  /** "trip" is the trip's own photo; places and dishes are looked up by name. */
  kind: "trip" | "place" | "dish";
  name: string;
  caption: string;
  src?: string;
}

const EVENT = "goroam:trip-gallery";
const ease = [0.16, 1, 0.3, 1] as const;

/** Opens the gallery at a slide from anywhere on the page, e.g. a highlight's photo. */
export function GalleryOpen({ index, label }: { index: number; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => window.dispatchEvent(new CustomEvent(EVENT, { detail: index }))}
      className="absolute inset-0 z-[1] cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
    />
  );
}

function Slide({ slide, city }: { slide: GallerySlide; city: string }) {
  if (slide.kind === "trip" && slide.src) return <img src={slide.src} alt={slide.caption} className="absolute inset-0 size-full object-cover" />;
  return <GuidePhoto name={slide.name} city={city} kind={slide.kind === "dish" ? "dish" : "place"} />;
}

/**
 * Every photo on the trip page in a full-screen viewer: arrows, keys or a swipe to move,
 * a strip of thumbnails, Esc to close. The button sits on the hero photo.
 */
export function TripGallery({ slides, city, title }: { slides: GallerySlide[]; city: string; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const go = useCallback(
    (step: number) => {
      setDir(step);
      setOpen((i) => (i === null ? i : (i + step + slides.length) % slides.length));
    },
    [slides.length]
  );

  // Opened from a highlight or dish photo elsewhere on the page.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const i = (e as CustomEvent<number>).detail;
      setDir(1);
      setOpen(Math.min(Math.max(i, 0), slides.length - 1));
    };
    window.addEventListener(EVENT, onOpen);
    return () => window.removeEventListener(EVENT, onOpen);
  }, [slides.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = before;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, go]);

  const swipe = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -500) go(1);
    else if (info.offset.x > 60 || info.velocity.x > 500) go(-1);
  };

  const current = open === null ? null : slides[open];

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setDir(1);
          setOpen(0);
        }}
        className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-2 text-xs text-paper ring-1 ring-white/30 backdrop-blur-md transition-colors hover:bg-white hover:text-ink"
      >
        <Camera className="size-4" /> View all {slides.length} photos
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {current && open !== null && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={`${title} photos`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[90] flex flex-col bg-[#060d1b]/95 text-paper backdrop-blur-xl"
              >
                <div className="flex items-center justify-between gap-4 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 sm:pt-6">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-paper/60">
                      {open + 1} / {slides.length}
                    </p>
                    <p className="display mt-0.5 truncate text-lg sm:text-xl">{current.caption}</p>
                  </div>
                  <button type="button" onClick={() => setOpen(null)} aria-label="Close photos" className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/15 transition-colors hover:bg-white hover:text-ink">
                    <X className="size-5" />
                  </button>
                </div>

                <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 sm:px-20">
                  <div className="relative aspect-[4/5] max-h-full w-full max-w-5xl overflow-hidden rounded-[22px] bg-ink sm:aspect-[16/10]">
                    <AnimatePresence initial={false} custom={dir}>
                      <motion.div
                        key={open}
                        custom={dir}
                        variants={{
                          enter: (d: number) => ({ x: d * 80, opacity: 0 }),
                          show: { x: 0, opacity: 1 },
                          gone: (d: number) => ({ x: d * -80, opacity: 0 }),
                        }}
                        initial="enter"
                        animate="show"
                        exit="gone"
                        transition={{ duration: 0.45, ease }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={swipe}
                        className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
                      >
                        <Slide slide={current} city={city} />
                        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-5 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 ring-1 ring-white/15 transition-colors hover:bg-white hover:text-ink sm:grid">
                    <ChevronLeft className="size-5" />
                  </button>
                  <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-5 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 ring-1 ring-white/15 transition-colors hover:bg-white hover:text-ink sm:grid">
                    <ChevronRight className="size-5" />
                  </button>
                </div>

                <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:justify-center sm:px-8 sm:pb-6">
                  {slides.map((s, i) => (
                    <button
                      key={`${i}-${s.name}`}
                      type="button"
                      aria-label={`Photo ${i + 1}: ${s.caption}`}
                      aria-current={i === open ? "true" : undefined}
                      onClick={() => {
                        setDir(i > open ? 1 : -1);
                        setOpen(i);
                      }}
                      className={cn("relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-ink transition-all duration-300", i === open ? "opacity-100 ring-2 ring-sun-2" : "opacity-50 hover:opacity-90")}
                    >
                      <Slide slide={s} city={city} />
                    </button>
                  ))}
                </div>
                <p className="sr-only" aria-live="polite">
                  Photo {open + 1} of {slides.length}: {current.caption}
                </p>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
