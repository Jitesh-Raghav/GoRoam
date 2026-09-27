"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·°";

/** Departure-board style text: scrambles, then settles left to right whenever `text` changes. */
export function ScrambleText({ text, className, duration = 700 }: { text: string; className?: string; duration?: number }) {
  const [out, setOut] = useState(text);
  const prev = useRef(text);

  useEffect(() => {
    if (prev.current === text) return;
    prev.current = text;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOut(text);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const settled = Math.floor(t * text.length);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (i < settled || ch === " ") s += ch;
        else s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setOut(s);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, duration]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{out}</span>
    </span>
  );
}
