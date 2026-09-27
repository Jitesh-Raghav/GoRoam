"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { Fragment, useRef } from "react";
import { cn } from "@/lib/utils";
import { EASE_OUT_EXPO } from "./reveal";

export interface Segment {
  text: string;
  className?: string;
}

interface SplitTextProps {
  /** Plain text, or styled segments that flow together. */
  text?: string;
  segments?: Segment[];
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  /** Animate on mount, or when scrolled into view. */
  trigger?: "mount" | "inView";
  /** Delay the reveal until this is true (e.g. after an intro). */
  ready?: boolean;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}

/**
 * Word-by-word masked reveal: each word slides up from behind its own
 * overflow mask, the signature motion for headlines across the site.
 */
export function SplitText({
  text,
  segments,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.06,
  duration = 1.1,
  trigger = "inView",
  ready = true,
  as: Tag = "span",
}: SplitTextProps) {
  const reduce = useReducedMotion();
  const parts: Segment[] = segments ?? [{ text: text ?? "" }];
  const words: { word: string; className?: string; space: boolean }[] = [];
  parts.forEach((seg) => {
    const tokens = seg.text.split(/(\s+)/).filter((t) => t.length > 0);
    tokens.forEach((tok) => {
      if (/^\s+$/.test(tok)) {
        if (words.length) words[words.length - 1].space = true;
        return;
      }
      words.push({ word: tok, className: seg.className, space: false });
    });
  });

  // Observe the unclipped wrapper: each word starts fully hidden behind its own mask,
  // which IntersectionObserver would report as never visible.
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const show = ready && (trigger === "mount" || inView);

  return (
    <Tag ref={ref as never} className={cn("inline", className)}>
      <span className="sr-only">{parts.map((p) => p.text).join("")}</span>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span aria-hidden className="relative -mb-[0.14em] inline-block overflow-hidden pb-[0.14em] pr-[0.04em] align-bottom">
            <motion.span
              className={cn("inline-block will-change-transform", wordClassName, w.className)}
              initial={reduce ? false : { y: "110%" }}
              animate={reduce ? undefined : { y: show ? "0%" : "110%" }}
              transition={{ duration, ease: EASE_OUT_EXPO, delay: delay + i * stagger }}
            >
              {w.word}
            </motion.span>
          </span>
          {w.space && <span aria-hidden> </span>}
        </Fragment>
      ))}
    </Tag>
  );
}
