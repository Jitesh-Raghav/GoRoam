"use client";

import { useEffect, useState } from "react";

/** How long the first-visit curtain covers the page (see `.intro-curtain`). */
export const INTRO_SECONDS = 1.85;

/**
 * Lets entrance animations wait for the intro curtain on the first visit of a
 * session, and start immediately on every later visit.
 */
export function useIntro() {
  const [state, setState] = useState({ ready: false, delay: 0 });
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const curtain = document.querySelector(".intro-curtain");
    const playing = !!curtain && root.dataset.intro !== "done" && !reduced;
    setState({ ready: true, delay: playing ? INTRO_SECONDS : 0 });
    if (!playing) return;
    const t = window.setTimeout(() => {
      root.dataset.intro = "done";
    }, INTRO_SECONDS * 1000 + 600);
    return () => window.clearTimeout(t);
  }, []);
  return state;
}
