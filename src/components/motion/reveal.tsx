"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** Fraction of the element that must be visible before revealing. */
  amount?: number;
  duration?: number;
}

/** Fade + rise into place once the element scrolls into view. */
export function Reveal({ children, className, delay = 0, y = 28, amount = 0.25, duration = 1 }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Clip-path wipe that uncovers its child from bottom to top. */
export function MaskReveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0% 0% 0%)" }}
      whileInView={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
