"use client";

import { useEffect, useRef, useState } from "react";
import { FLUID_FRAG, ShaderCanvas } from "@/components/site/shader-canvas";
import { cn } from "@/lib/utils";

export type MeshTone = "azure" | "night" | "coral";

/** Base (blends into the card), then the colours the liquid flows through. */
const COLORS: Record<MeshTone, string[]> = {
  azure: ["#dbeafe", "#7cc4ff", "#1f6feb", "#ffd23f"],
  night: ["#16305a", "#1f6feb", "#7cc4ff", "#ffd23f"],
  coral: ["#ffe1dc", "#ff6b5b", "#ffd23f", "#7cc4ff"],
};
const CSS_TONE: Record<MeshTone, string> = { azure: "mesh-lagoon", night: "mesh-sunset", coral: "mesh-sand" };

/**
 * Liquid colour along a card's right side. At rest it's a still frame; on
 * hovering or focusing the card (`mesh-host`) the colours start to flow like
 * ink in water, and settle again on leave. Rendered by a small WebGL shader
 * once the card is near the screen; a CSS mesh stands in without WebGL or
 * under reduced motion. Put it first inside a card with `relative isolate overflow-hidden`.
 */
export function Mesh({ tone, className, seed = 0 }: { tone: MeshTone; className?: string; seed?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [near, setNear] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const host = el?.closest<HTMLElement>(".mesh-host");
    if (!el || !host) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "300px" });
    io.observe(el);
    const on = () => setActive(true);
    const off = () => setActive(false);
    const blur = (e: FocusEvent) => !host.contains(e.relatedTarget as Node) && off();
    host.addEventListener("pointerenter", on);
    host.addEventListener("pointerleave", off);
    host.addEventListener("focusin", on);
    host.addEventListener("focusout", blur);
    return () => {
      io.disconnect();
      host.removeEventListener("pointerenter", on);
      host.removeEventListener("pointerleave", off);
      host.removeEventListener("focusin", on);
      host.removeEventListener("focusout", blur);
    };
  }, []);

  return (
    <span ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]", className)}>
      <span className={cn("mesh", CSS_TONE[tone])}>
        <i />
        <i />
        <i />
      </span>
      {near && <ShaderCanvas frag={FLUID_FRAG} colors={COLORS[tone]} active={active} speed={0.34} inertia={0.8} seed={seed} scale={0.5} className="absolute inset-0 size-full" />}
    </span>
  );
}
