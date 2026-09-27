"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ScrollToken = string | { node: ReactNode; key: string };

interface ScrollWordsProps {
  tokens: ScrollToken[];
  className?: string;
  /** Drive the reveal from an external progress (0..1); otherwise from this element's scroll. */
  progress?: MotionValue<number>;
  /** Progress window within which the words light up. */
  range?: [number, number];
  dim?: number;
}

function Word({ children, progress, start, end, dim }: { children: ReactNode; progress: MotionValue<number>; start: number; end: number; dim: number }) {
  const opacity = useTransform(progress, [start, end], [dim, 1]);
  const blur = useTransform(progress, [start, end], [4, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  return (
    <motion.span style={{ opacity, filter }} className="inline">
      {children}
    </motion.span>
  );
}

/** A paragraph whose words light up one by one as you scroll. */
export function ScrollWords({ tokens, className, progress, range = [0, 1], dim = 0.14 }: ScrollWordsProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.45"] });
  const p = progress ?? scrollYProgress;
  const flat: ScrollToken[] = [];
  tokens.forEach((t) => {
    if (typeof t === "string") t.split(/\s+/).filter(Boolean).forEach((w) => flat.push(w));
    else flat.push(t);
  });
  const [a, b] = range;
  // Each word fades over 1.6 steps; size the steps so the last one lands exactly on `b`.
  const step = (b - a) / (flat.length + 0.6);
  return (
    <p ref={ref} className={cn(className)}>
      {flat.map((t, i) => (
        <Word key={typeof t === "string" ? `${t}-${i}` : t.key} progress={p} start={a + i * step} end={a + (i + 1.6) * step} dim={dim}>
          {typeof t === "string" ? t : t.node}{" "}
        </Word>
      ))}
    </p>
  );
}
