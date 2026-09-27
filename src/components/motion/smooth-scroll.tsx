"use client";

import Lenis from "lenis";
import { useEffect } from "react";

let instance: Lenis | null = null;

/** The active Lenis instance, if smooth scrolling is running on this page. */
export const getLenis = () => instance;

/** Buttery inertial scrolling for the marketing pages. */
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.09,
      anchors: { offset: -24 },
      stopInertiaOnNavigate: true,
    });
    instance = lenis;
    return () => {
      lenis.destroy();
      instance = null;
    };
  }, []);
  return null;
}
