"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { BedDouble, Check, Plane, Star, Ticket, TrainFront } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Marquee } from "@/components/motion/marquee";
import { Reveal } from "@/components/motion/reveal";
import { LazyScene } from "@/components/scenes/lazy-scene";
import { PillLink } from "@/components/site/pill";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

const PARTNERS = ["Google Flights", "Skyscanner", "Kayak", "Booking.com", "Expedia", "Airbnb", "Hostelworld", "GetYourGuide", "Viator", "Klook", "Rome2Rio"];

const TABS = [
  { id: "flights", label: "Flights", icon: Plane },
  { id: "stays", label: "Stays", icon: BedDouble },
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "transport", label: "Transport", icon: TrainFront },
] as const;

const POINTS = ["Your route, dates and party filled in for you", "Compare the best partners side by side", "Book direct with them — never a markup"];

const ease = [0.16, 1, 0.3, 1] as const;

function FlightCard({ on }: { on: boolean }) {
  return (
    <div className="rounded-[24px] bg-white p-5 text-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-between text-xs text-stone">
        <span className="eyebrow text-[0.58rem]">Flight · Sat, Oct 3</span>
        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] text-brand">1 stop</span>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div>
          <p className="display text-4xl leading-none">BOM</p>
          <p className="mt-1 font-mono text-[11px] text-stone">02:15</p>
        </div>
        <div className="relative flex-1">
          <svg viewBox="0 0 200 40" className="h-10 w-full overflow-visible" aria-hidden>
            <path id="bk-arc" d="M4 34Q100 -10 196 34" fill="none" stroke="var(--ink)" strokeOpacity={0.25} strokeDasharray="3 5" />
            {on && (
              <g>
                <circle r={9} fill="var(--brand)">
                  <animateMotion dur="3.2s" repeatCount="indefinite" path="M4 34Q100 -10 196 34" rotate="auto" />
                </circle>
                <path d="M-4 0H4M1-3L4 0L1 3" stroke="#fff" strokeWidth={1.6} fill="none">
                  <animateMotion dur="3.2s" repeatCount="indefinite" path="M4 34Q100 -10 196 34" rotate="auto" />
                </path>
              </g>
            )}
          </svg>
          <p className="text-center font-mono text-[10px] text-stone">11h 40m</p>
        </div>
        <div className="text-right">
          <p className="display text-4xl leading-none text-brand">BER</p>
          <p className="mt-1 font-mono text-[11px] text-stone">10:25</p>
        </div>
      </div>
    </div>
  );
}

function StayCard() {
  return (
    <div className="flex gap-4 rounded-[24px] bg-white p-3 text-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
      <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-2xl">
        <LazyScene id="berlin" tint="#4B4F8C" />
      </div>
      <div className="min-w-0 py-1 pr-2">
        <p className="eyebrow text-[0.58rem] text-stone">Stay · 3 nights</p>
        <p className="display mt-1 truncate text-2xl leading-none">Boutique in Mitte</p>
        <p className="mt-2 flex items-center gap-1 text-xs text-stone">
          <Star className="size-3.5 fill-brand text-brand" /> 9.1 · Free cancellation
        </p>
      </div>
    </div>
  );
}

function TicketCard() {
  return (
    <div className="relative flex items-center gap-4 overflow-hidden rounded-[24px] bg-brand p-5 text-white shadow-[0_30px_60px_-30px_rgba(217,85,1,0.8)]">
      <span className="absolute -left-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-[#22201b]" />
      <span className="absolute -right-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-[#22201b]" />
      <Ticket className="size-6 shrink-0" />
      <div className="min-w-0">
        <p className="eyebrow text-[0.58rem] text-white/70">Skip the line · Oct 5</p>
        <p className="display truncate text-2xl leading-none">Museum Island pass</p>
      </div>
    </div>
  );
}

function TransportCard() {
  return (
    <div className="flex items-center gap-4 rounded-[24px] bg-paper p-5 text-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-ink text-paper">
        <TrainFront className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="eyebrow text-[0.58rem] text-stone">Berlin → Dresden</p>
        <p className="display text-2xl leading-none">Train · 1h 52m</p>
      </div>
    </div>
  );
}

export function BookingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const [active, setActive] = useState(0);

  // Cycle through what you can book while the mock is on screen.
  useEffect(() => {
    if (!inView) return;
    const t = window.setInterval(() => setActive((a) => (a + 1) % TABS.length), 2600);
    return () => window.clearInterval(t);
  }, [inView]);

  const cards = [<FlightCard key="f" on={inView} />, <StayCard key="s" />, <TicketCard key="t" />, <TransportCard key="r" />];

  return (
    <section id="book" className="relative scroll-mt-10 overflow-hidden bg-ink py-24 text-paper lg:py-36">
      <div className="pointer-events-none absolute -left-40 top-20 size-[36rem] rounded-full bg-brand/15 blur-[120px]" />
      <div className="container-x relative grid items-center gap-16 lg:grid-cols-2">
        <div>
          <SectionHeading
            index="06"
            label="Book it all"
            tone="paper"
            size="md"
            title={[[{ text: "Plan it here." }], [{ text: "Book it ", className: "italic text-brand-2" }, { text: "in two taps.", className: "italic text-brand-2" }]]}
            description="Every itinerary comes with flights, stays, tickets and transfers ready to book — prefilled with your dates and group, from the partners travellers already trust."
          />
          <ul className="mt-8 space-y-3">
            {POINTS.map((p, i) => (
              <Reveal key={p} delay={0.1 + i * 0.06}>
                <li className="flex items-center gap-3 text-paper/85">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand text-white">
                    <Check className="size-3.5" />
                  </span>
                  {p}
                </li>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-wrap gap-3">
              <PillLink href="/dashboard" variant="brand" size="lg">
                Plan & book a trip
              </PillLink>
              <PillLink href="/dashboard/book" variant="glass" size="lg">
                Just book travel
              </PillLink>
            </div>
          </Reveal>
        </div>

        <div ref={ref} className="relative">
          <div className="relative mx-auto max-w-md rounded-[32px] bg-paper/[0.06] p-4 ring-1 ring-inset ring-paper/10 sm:p-6">
            <div className="grid grid-cols-4 gap-1 rounded-2xl bg-paper/[0.06] p-1">
              {TABS.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn("relative flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] transition-colors", active === i ? "text-ink" : "text-paper/60 hover:text-paper")}
                >
                  {active === i && <motion.span layoutId="landing-book-tab" className="absolute inset-0 rounded-xl bg-paper" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <t.icon className="relative size-4" />
                  <span className="relative">{t.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-5 space-y-3">
              {cards.map((card, i) => (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show ${TABS[i].label.toLowerCase()}`}
                  animate={{ opacity: active === i ? 1 : 0.42, scale: active === i ? 1 : 0.96, x: active === i ? 0 : 6 }}
                  transition={{ duration: 0.7, ease }}
                  className="block w-full text-left"
                >
                  {card}
                </motion.button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-5 text-center font-mono text-[11px] text-paper/50"
              >
                {["Google Flights · Skyscanner · Kayak", "Booking.com · Expedia · Airbnb", "GetYourGuide · Viator · Klook", "Rome2Rio · Kayak Cars"][active]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="relative mt-20 border-y border-paper/10 py-6 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <Marquee duration={36}>
          {PARTNERS.map((p) => (
            <span key={p} className="display mx-8 text-3xl text-paper/40 sm:text-4xl">
              {p}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
