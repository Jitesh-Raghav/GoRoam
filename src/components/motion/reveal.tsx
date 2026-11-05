import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** How far it rises, in px. */
  y?: number;
  /** Kept for older callers; reveals now follow the scroll, so there is nothing to delay. */
  delay?: number;
  amount?: number;
  duration?: number;
  fade?: boolean;
}

/**
 * Rises and fades in as it scrolls into view, driven by CSS alone (`.reveal`, a scroll
 * timeline): it runs on the compositor, needs no JavaScript, and nothing waits for the page
 * to hydrate. Browsers without scroll timelines, and anyone who prefers reduced motion,
 * simply see it in place.
 */
export function Reveal({ children, className, y = 16 }: RevealProps) {
  return (
    <div className={cn("reveal", className)} style={{ "--reveal-y": `${y}px` } as CSSProperties}>
      {children}
    </div>
  );
}
