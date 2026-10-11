"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SplitText } from "@/components/motion/split-text";
import { TripComposer } from "@/components/site/trip-composer";
import { useIntro } from "@/components/site/use-intro";
import { cn } from "@/lib/utils";
import { PanoramaLandscape, PanoramaSky } from "./panorama";

const ease = [0.16, 1, 0.3, 1] as const;

export function PanoramaHero() {
  const ref = useRef<HTMLElement>(null);
  const intro = useIntro();
  const delay = intro.delay;

  // Gentle depth on scroll: sky drifts slowest, the landscape a little, the copy lifts away.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const skyY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const landY = useTransform(scrollYProgress, [0, 1], ["0%", "9%"]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  return (
    <section
      ref={ref}
      id="top"
      aria-label="Plan your next trip"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden lg:h-[100svh] lg:min-h-[46.25rem] bg-[linear-gradient(180deg,#34509F_0%,#4766C4_30%,#7392E6_62%,#A9BEF4_100%)]"
    >
      <motion.div style={{ y: skyY }} className="absolute inset-0 -z-20">
        <PanoramaSky className="size-full" />
      </motion.div>

      {/* Copy and composer. */}
      <motion.div style={{ y: copyY, opacity: copyOpacity }} className="container-x relative z-10 pb-[36svh] pt-28 text-center sm:pt-32 lg:pb-0 lg:pt-[clamp(6.5rem,13vh,8.5rem)]">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={intro.ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1, ease, delay: delay + 0.1 }}
          className="mb-6 inline-flex items-center gap-2.5 rounded-full bg-white/[0.12] py-1.5 pl-3 pr-4 text-sm font-medium text-paper/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] ring-1 ring-white/20 backdrop-blur-md"
        >
          <span className="size-1.5 rounded-full bg-sun-2 shadow-[0_0_10px_rgba(255,210,63,0.9)]" />
          AI trip planner · Your first trip is free
        </motion.div>

        <h1 className="display mx-auto max-w-[13ch] text-[clamp(2.7rem,7vw,5rem)] leading-[1] tracking-[-0.035em] text-paper drop-shadow-[0_2px_24px_rgba(14,31,59,0.35)] [&_.accent]:!text-sun-2 [@media(min-width:1024px)_and_(max-height:860px)]:text-[4.3rem]">
          <span className="block">
            <SplitText text="Where will you" trigger="mount" ready={intro.ready} delay={delay + 0.15} />
          </span>
          <span className="block">
            <SplitText segments={[{ text: "wander", className: "accent" }, { text: " next?" }]} trigger="mount" ready={intro.ready} delay={delay + 0.28} />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={intro.ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1.1, ease, delay: delay + 0.42 }}
          className="mx-auto mt-4 max-w-[36rem] text-base leading-relaxed text-paper/80 sm:text-lg"
        >
          Describe the trip you&apos;re dreaming of. GoRoam turns it into a day-by-day plan: real places, honest budgets and stays ready to book.
        </motion.p>

        <div className="mt-7">
          <TripComposer ready={intro.ready} delay={delay} />
          <motion.p
            initial={{ opacity: 0 }}
            animate={intro.ready ? { opacity: 1 } : undefined}
            transition={{ duration: 1, delay: delay + 1 }}
            className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-medium text-ink/65"
          >
            {["First trip free", "No card needed", "Any city, any country", "Works offline"].map((t, i) => (
              <span key={t} className="inline-flex items-center gap-3">
                {i > 0 && <span aria-hidden className="size-1 rounded-full bg-ink/30" />}
                {t}
              </span>
            ))}
          </motion.p>
        </div>

      </motion.div>

      {/* The panorama. Wider than the screen on phones, where it slowly pans across. */}
      <motion.div
        style={{ y: landY }}
        initial={{ opacity: 0 }}
        animate={intro.ready ? { opacity: 1 } : undefined}
        transition={{ duration: 0.6, delay: delay + 0.1 }}
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[max(42svh,calc(100vw*0.3167))] overflow-hidden"
      >
        <div className={cn("pano-track relative h-full w-[max(100%,calc(42svh*3.158))] lg:w-full")}>
          <PanoramaLandscape intro={intro.ready} className="absolute inset-0" />
          <div aria-hidden className="pano-grain absolute inset-0" />
        </div>
      </motion.div>
    </section>
  );
}
