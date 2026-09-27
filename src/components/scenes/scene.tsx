"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { VIEW_H, VIEW_W } from "./primitives";
import { SCENES, type SceneId } from "./scenes";

interface SceneProps {
  id: SceneId;
  className?: string;
  /** Layers drift with the pointer. */
  interactive?: boolean;
  /** Play the layered "pop-up" rise on mount. */
  intro?: boolean;
  /** Freeze looping animations. */
  paused?: boolean;
  /** SVG preserveAspectRatio. */
  align?: string;
  /** Accessible label; omit for decorative scenes. */
  title?: string;
}

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

export function Scene({
  id,
  className,
  interactive = false,
  intro = false,
  paused = false,
  align = "xMidYMax slice",
  title,
}: SceneProps) {
  const uid = "s" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!interactive || !el || !visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const mx = clamp(((e.clientX - r.left) / r.width) * 2 - 1);
      const my = clamp(((e.clientY - r.top) / r.height) * 2 - 1);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--mx", mx.toFixed(3));
        el.style.setProperty("--my", my.toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [interactive, visible]);

  const def = SCENES[id] ?? SCENES.peaks;
  const content = useMemo(() => def.render(uid), [def, uid]);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio={align}
      className={cn("scene", intro && "scene-intro", className)}
      data-paused={paused || !visible ? "true" : undefined}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {content}
    </svg>
  );
}
