"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { HeroPhoto } from "@/components/itinerary/hero-photo";
import { LazyScene } from "@/components/scenes/lazy-scene";
import { Reveal } from "@/components/motion/reveal";
import { TripPrompt } from "@/components/site/trip-prompt";
import { BRAND_PHOTOS, FINAL_CTA_QUERY, useBrandPhoto } from "@/lib/brand-photos";

/** The one closing call to action: a cinematic photo (the aurora illustration until it loads) and the trip prompt. */
export function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const photo = useBrandPhoto(BRAND_PHOTOS.finalCta, FINAL_CTA_QUERY);

  return (
    <section ref={ref} className="px-3 pb-3 pt-6 sm:px-4 sm:pb-4">
      <div className="relative flex min-h-[80svh] items-center overflow-hidden rounded-panel bg-ink">
        <motion.div style={{ y }} className="absolute -inset-y-[6%] inset-x-0">
          <LazyScene id="aurora" intro interactive margin="0px" tint="#0E2837" />
          <HeroPhoto photo={photo} lazy credit={false} />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/30 to-ink/70" />
        <div className="container-x relative py-24 text-center text-paper">
          <Reveal y={12}>
            <p className="eyebrow text-paper/75">Your move</p>
          </Reveal>
          <Reveal y={16} delay={0.08}>
            <h2 className="display mt-6 text-[clamp(2.6rem,6vw,5.25rem)] leading-[1] tracking-[-0.035em]">The world is waiting.</h2>
          </Reveal>
          <Reveal delay={0.25} className="mx-auto mt-10 max-w-xl">
            <TripPrompt tone="glass" />
            <p className="mt-5 text-sm text-paper/70">Your first itinerary is free. No card needed.</p>
          </Reveal>
        </div>
        {photo?.credit && (
          <a
            href={photo.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-3 right-4 z-10 max-w-[60%] truncate rounded-full bg-ink/40 px-2.5 py-1 text-[10px] text-paper/75 backdrop-blur-md transition-colors hover:bg-ink/70 hover:text-paper"
          >
            Photo · {photo.credit}
          </a>
        )}
      </div>
    </section>
  );
}
