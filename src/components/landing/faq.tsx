"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mail, Plus } from "@/components/site/icons";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "./section-heading";
import { FAQS } from "@/lib/faq-data";


export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative scroll-mt-10 py-20 lg:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <SectionHeading
            label="Questions"
            size="md"
            title={[[{ text: "Questions," }], [{ text: "answered.", className: "accent" }]]}
          />
          <Reveal delay={0.2}>
            <div className="mt-10 max-w-sm rounded-card bg-white p-6 shadow-card ring-1 ring-line">
              <p className="display text-[1.2rem] leading-tight text-ink">Something we didn&apos;t cover?</p>
              <p className="mt-2 text-sm leading-relaxed text-stone">Questions about a trip, your account or a payment: write to us and a real person replies.</p>
              <a
                href="mailto:jitesh@goroam.world"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand transition-colors hover:text-ink"
              >
                <Mail className="size-4" /> jitesh@goroam.world
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
                    className="group flex w-full items-center justify-between gap-6 py-5 text-left sm:py-6"
                  >
                    <span className="display text-[1.15rem] leading-snug text-ink transition-colors group-hover:text-brand sm:text-[1.35rem]">{f.q}</span>
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-out-expo",
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
                        <p className="max-w-2xl pb-6 pr-12 text-[1.0625rem] leading-relaxed text-stone">{f.a}</p>
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
