"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mail, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { PLANS, freeTrips } from "@/lib/plans";
import { SectionHeading } from "./section-heading";

export const FAQS = [
  {
    q: "How does GoRoam build my itinerary?",
    a: "Tell us where you're starting and going, your dates, who's coming, your budget, pace, where you like to stay and what you love. Our AI drafts a day-by-day plan: a morning, afternoon and evening for every day, each with a real place, timing, a local tip, an estimated cost and directions, plus where to stay, what to pack and the local essentials.",
  },
  {
    q: "What is a credit?",
    a: `One credit creates one complete itinerary. Every new account starts with ${freeTrips()}, and packs of ${PLANS.map((p) => p.credits).join(", ").replace(/, (\d+)$/, " or $1")} credits start at $${PLANS[0].price}.`,
  },
  {
    q: "Do credits expire?",
    a: "Never. Buy them once and use them whenever you're ready to plan your next adventure.",
  },
  {
    q: "Can I take my itinerary offline?",
    a: "Yes. Every itinerary has a print-ready layout: hit Download and save it as a PDF, or print it for the road.",
  },
  {
    q: "Can I book flights and hotels through GoRoam?",
    a: "Yes. Every itinerary comes with booking already filled in: your route, dates and group size go straight to Google Flights, Skyscanner, Booking.com, Airbnb, GetYourGuide and more, so you can compare and book with trusted partners in a couple of taps.",
  },
  {
    q: "Can I share a trip with the people I'm travelling with?",
    a: "Share any itinerary with a private link, and your companions see the full plan without needing an account. You can also add every stop to your calendar in one tap.",
  },
  {
    q: "Which destinations can I plan?",
    a: "Anywhere on Earth. Plan a national weekend getaway or an international journey of up to 30 days, for up to 20 travellers.",
  },
  {
    q: "Can I get a refund?",
    a: "We offer a 30-day money-back guarantee if you're not satisfied with our service. Contact support and we'll sort it out.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative scroll-mt-10 py-24 lg:py-36">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading
            index="09"
            label="Questions"
            size="md"
            title={[[{ text: "Good to know" }], [{ text: "before you go.", className: "italic text-brand" }]]}
          />
          <Reveal delay={0.2}>
            <div className="mt-10 max-w-sm rounded-[28px] bg-white/80 p-6 ring-1 ring-line">
              <p className="display text-2xl leading-tight">Still curious?</p>
              <p className="mt-2 text-sm leading-relaxed text-stone">Drop us a line. We love helping people plan the trip they keep daydreaming about.</p>
              <a
                href="mailto:hello@goroam.com"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-paper transition-colors hover:bg-brand"
              >
                <Mail className="size-4" /> hello@goroam.com
              </a>
            </div>
          </Reveal>
        </div>
        <div className="lg:col-span-7">
          <ul className="border-t border-line">
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              return (
                <li key={f.q} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left sm:py-7"
                  >
                    <span className="flex items-baseline gap-5">
                      <span className="font-mono text-xs text-stone-2">0{i + 1}</span>
                      <span className="display text-[1.65rem] leading-tight text-ink transition-colors group-hover:text-brand sm:text-[2rem]">{f.q}</span>
                    </span>
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-out-expo",
                        isOpen ? "rotate-45 border-ink bg-ink text-paper" : "border-line text-ink group-hover:border-ink"
                      )}
                    >
                      <Plus className="size-4" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-7 pl-9 text-lg leading-relaxed text-stone">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
