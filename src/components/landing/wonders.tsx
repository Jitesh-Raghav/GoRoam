"use client";

import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, CalendarDays, Clock3 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { WONDERS, formatCoords, type Destination } from "@/lib/destinations";
import { SCENES } from "@/components/scenes/scenes";
import { LazyScene } from "@/components/scenes/lazy-scene";
import { SplitText } from "@/components/motion/split-text";
import { tripHref } from "@/components/site/trip-prompt";
import { PillLink } from "@/components/site/pill";

const pad = (n: number) => String(n).padStart(2, "0");

function WonderCard({ d, i }: { d: Destination; i: number }) {
  return (
    <Link
      href={tripHref(d.query)}
      className={cn(
        "group relative block h-[500px] w-[80vw] shrink-0 snap-start overflow-hidden rounded-[28px] bg-paper-2 sm:w-[380px] lg:h-[min(72vh,640px)] lg:w-[min(30vw,430px)]",
        i % 2 === 1 && "lg:translate-y-10"
      )}
      aria-label={`Plan a trip to ${d.name}, ${d.place}`}
    >
      <div className="absolute inset-0 transition-transform duration-[1400ms] ease-out-expo group-hover:scale-[1.07]">
        <LazyScene id={d.scene} tint={SCENES[d.scene].tint} margin="900px" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-ink/85 via-ink/35 to-transparent" />
      <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
        <span className="eyebrow rounded-full bg-ink/25 px-3 py-2 text-paper backdrop-blur-md">{pad(i + 1)}</span>
        <span className="grid size-10 place-items-center rounded-full bg-paper/90 text-ink opacity-100 transition-all duration-500 ease-out-expo lg:scale-75 lg:opacity-0 lg:group-hover:scale-100 lg:group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6 text-paper">
        <p className="font-mono text-[11px] tracking-wide text-paper/65">{formatCoords(d.lat, d.lng)}</p>
        <h3 className="display mt-2 text-[2.6rem] leading-[0.95]">{d.name}</h3>
        <p className="mt-1 text-sm text-paper/75">{d.place}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/12 px-3 py-1.5 ring-1 ring-inset ring-paper/15 backdrop-blur-md">
            <CalendarDays className="size-3.5" /> {d.bestTime}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/12 px-3 py-1.5 ring-1 ring-inset ring-paper/15 backdrop-blur-md">
            <Clock3 className="size-3.5" /> {d.days}
          </span>
        </div>
        <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-700 ease-out-expo lg:grid-rows-[0fr] lg:group-hover:grid-rows-[1fr]">
          <p className="overflow-hidden text-sm leading-relaxed text-paper/80">
            <span className="block pt-4">{d.blurb}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}

export function Wonders() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [desktop, setDesktop] = useState(false);
  const [active, setActive] = useState(1);
  const dist = useMotionValue(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const measure = () => {
      setDesktop(mq.matches);
      const track = trackRef.current;
      if (!track) return;
      const d = mq.matches ? Math.max(track.scrollWidth - window.innerWidth, 0) : 0;
      setDistance(d);
      dist.set(d);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    mq.addEventListener("change", measure);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
    };
  }, [dist]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const rawX = useTransform([scrollYProgress, dist], ([p, d]: number[]) => -p * d);
  const x = useSpring(rawX, { stiffness: 140, damping: 30, mass: 0.35 });
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActive(Math.min(WONDERS.length, Math.max(1, Math.round(p * (WONDERS.length - 1)) + 1)));
  });

  return (
    <section
      id="wonders"
      ref={sectionRef}
      className="relative scroll-mt-0 bg-paper"
      style={desktop ? { height: `calc(100vh + ${distance}px)` } : undefined}
    >
      <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:overflow-hidden">
        <div className="container-x pt-24 lg:hidden">
          <p className="eyebrow flex items-center gap-3 text-stone">
            <span>(02)</span>
            <span className="h-px w-8 bg-ink/20" />
            <span>Wonders of the world</span>
          </p>
          <h2 className="display mt-6 text-[clamp(2.8rem,11vw,4.4rem)] leading-[0.92]">
            <SplitText text="Ten wonders." className="block" />
            <SplitText segments={[{ text: "One tap ", className: "italic text-brand" }, { text: "away." }]} className="block" delay={0.12} />
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-stone">
            Every icon here is a trip GoRoam can plan tonight. Tap one and we&apos;ll start your itinerary from there.
          </p>
        </div>

        <motion.div
          ref={trackRef}
          style={desktop ? { x } : undefined}
          className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-8 sm:gap-6 sm:px-8 lg:mt-0 lg:w-max lg:snap-none lg:items-center lg:overflow-visible lg:px-0 lg:pb-0 lg:pl-[max(3rem,calc((100vw_-_1440px)/2_+_3rem))] lg:pr-[10vw]"
        >
          <div className="hidden w-[min(34vw,520px)] shrink-0 pr-10 lg:block">
            <p className="eyebrow flex items-center gap-3 text-stone">
              <span>(02)</span>
              <span className="h-px w-8 bg-ink/20" />
              <span>Wonders of the world</span>
            </p>
            <h2 className="display mt-6 text-[clamp(3.4rem,5.6vw,6rem)] leading-[0.9]">
              <SplitText text="Ten wonders." className="block" />
              <SplitText segments={[{ text: "One tap ", className: "italic text-brand" }, { text: "away." }]} className="block" delay={0.12} />
            </h2>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-stone">
              Every icon here is a trip GoRoam can plan tonight. Pick one and we&apos;ll start your itinerary from there.
            </p>
            <div className="mt-10 flex items-end gap-4">
              <span className="display text-7xl leading-none tabular-nums">{pad(active)}</span>
              <span className="mb-2 font-mono text-sm text-stone">/ {pad(WONDERS.length)}</span>
            </div>
            <div className="mt-4 h-px w-56 bg-ink/15">
              <motion.div style={{ scaleX: bar }} className="h-px origin-left bg-ink" />
            </div>
          </div>

          {WONDERS.map((d, i) => (
            <WonderCard key={d.slug} d={d} i={i} />
          ))}

          <div className="flex h-[500px] w-[80vw] shrink-0 snap-start flex-col justify-between rounded-[28px] bg-ocean p-8 text-paper sm:w-[380px] lg:h-[min(72vh,640px)] lg:w-[min(30vw,430px)]">
            <p className="eyebrow text-paper/60">And everywhere else</p>
            <div>
              <p className="display text-[2.8rem] leading-[0.95]">
                Your map,
                <br />
                <span className="italic text-brand-2">your rules.</span>
              </p>
              <p className="mt-4 text-paper/70">From a weekend in Jaipur to a month across Patagonia — if it&apos;s on Earth, GoRoam can plan it.</p>
              <PillLink href="/dashboard" variant="paper" className="mt-8">
                Plan your own
              </PillLink>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
