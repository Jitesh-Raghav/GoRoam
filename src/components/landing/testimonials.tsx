"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

const TESTIMONIALS = [
  {
    name: "Sarah Johnson",
    role: "Digital Nomad",
    content:
      "GoRoam completely transformed how I plan my travels. The AI suggestions were spot-on, and I discovered amazing hidden gems I would have never found otherwise!",
    initials: "SJ",
    tint: "bg-[#F6C995]",
  },
  {
    name: "Mike Chen",
    role: "Family Traveler",
    content:
      "Planning our family vacation to Europe was so easy with GoRoam. The downloadable PDF was perfect for offline access, and the kids loved following our custom map!",
    initials: "MC",
    tint: "bg-[#9FDCD3]",
  },
  {
    name: "Emma Rodriguez",
    role: "Business Traveler",
    content:
      "As someone who travels frequently for work, GoRoam saves me hours of planning time. The credit system is perfect: I only pay for what I actually use.",
    initials: "ER",
    tint: "bg-[#B9CCEB]",
  },
];

const DURATION = 7000;

export function Testimonials() {
  const [i, setI] = useState(0);
  const [tick, setTick] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const t = TESTIMONIALS[i];

  const go = (dir: 1 | -1) => {
    setI((v) => (v + dir + TESTIMONIALS.length) % TESTIMONIALS.length);
    setTick((k) => k + 1);
  };

  useEffect(() => {
    if (!inView) return;
    const id = window.setTimeout(() => {
      setI((v) => (v + 1) % TESTIMONIALS.length);
      setTick((k) => k + 1);
    }, DURATION);
    return () => window.clearTimeout(id);
  }, [inView, tick]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-paper-2/60 py-24 lg:py-36">
      <span aria-hidden className="display pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 select-none text-[28rem] leading-none text-ink/[0.04]">
        &ldquo;
      </span>
      <div className="container-x relative">
        <SectionHeading
          index="07"
          label="Loved by travellers"
          align="center"
          title={[[{ text: "Postcards from" }], [{ text: "our travellers.", className: "italic text-brand" }]]}
        />

        <div className="mx-auto mt-16 max-w-5xl text-center">
          <div className="flex justify-center gap-1 text-brand" aria-label="Rated 5 out of 5">
            {Array.from({ length: 5 }, (_, k) => (
              <Star key={k} className="size-4 fill-current" />
            ))}
          </div>
          <div className="relative mt-8 grid min-h-[15rem] place-items-center sm:min-h-[12rem]">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={t.name}
                initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -16, filter: "blur(10px)" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="display text-[clamp(1.9rem,3.6vw,3.3rem)] leading-[1.12] text-ink"
              >
                &ldquo;{t.content}&rdquo;
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-8 border-t border-line pt-8 sm:flex-row">
            <AnimatePresence mode="wait">
              <motion.div
                key={t.name}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-4 text-left"
              >
                <span className={cn("grid size-14 place-items-center rounded-full text-base font-medium text-ink", t.tint)}>{t.initials}</span>
                <div>
                  <p className="font-medium text-ink">{t.name}</p>
                  <p className="text-sm text-stone">{t.role}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-5">
              <div className="flex gap-2">
                {TESTIMONIALS.map((x, k) => (
                  <button
                    key={x.name}
                    type="button"
                    aria-label={`Show testimonial from ${x.name}`}
                    onClick={() => {
                      setI(k);
                      setTick((v) => v + 1);
                    }}
                    className="relative h-1 w-10 overflow-hidden rounded-full bg-ink/10"
                  >
                    {k === i && (
                      <span
                        key={tick}
                        className="hero-progress absolute inset-0 origin-left rounded-full bg-ink"
                        style={{ animationDuration: `${DURATION}ms`, animationPlayState: inView ? "running" : "paused" }}
                      />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Previous testimonial"
                  onClick={() => go(-1)}
                  className="grid size-11 place-items-center rounded-full border border-line text-ink transition-colors hover:bg-ink hover:text-paper"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next testimonial"
                  onClick={() => go(1)}
                  className="grid size-11 place-items-center rounded-full border border-line text-ink transition-colors hover:bg-ink hover:text-paper"
                >
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
