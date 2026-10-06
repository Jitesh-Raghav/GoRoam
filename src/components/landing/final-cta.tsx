"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { LazyScene } from "@/components/scenes/lazy-scene";
import { SplitText } from "@/components/motion/split-text";
import { Reveal } from "@/components/motion/reveal";
import { TripPrompt } from "@/components/site/trip-prompt";

export function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const radius = useTransform(scrollYProgress, [0, 0.35], [72, 40]);

  return (
    <section ref={ref} className="px-3 py-3 sm:px-4 sm:py-4">
      <motion.div style={{ borderRadius: radius }} className="relative flex min-h-[92svh] items-center overflow-hidden bg-ink">
        <motion.div style={{ y }} className="absolute -inset-y-[8%] inset-x-0">
          <LazyScene id="aurora" intro interactive margin="0px" tint="#0E2837" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/20 to-ink/60" />
        <div className="container-x relative py-28 text-center text-paper">
          <Reveal y={12}>
            <p className="eyebrow text-paper/70">(09) / Your move</p>
          </Reveal>
          <h2 className="display mt-8 text-[clamp(2.89rem,7.65vw,7.65rem)] leading-[0.88]">
            <SplitText text="The world is waiting." className="block" />
            {/* <SplitText text="Where to first?" className="block italic text-white" delay={0.2} /> */}
          </h2>
          <Reveal delay={0.35} className="mx-auto mt-12 max-w-xl">
            <TripPrompt tone="glass" />
            <p className="mt-5 text-sm text-paper/60">Your first itinerary is free. No card needed.</p>
          </Reveal>
        </div>
      </motion.div>
    </section>
  );
}
