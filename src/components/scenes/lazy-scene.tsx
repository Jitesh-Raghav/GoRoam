"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Scene } from "./scene";

/**
 * Mounts a scene only once it approaches the viewport, then keeps it.
 * Until then a soft tint stands in, so layouts never jump.
 */
export function LazyScene({
  margin = "600px",
  tint,
  className,
  ...props
}: ComponentProps<typeof Scene> & { margin?: string; tint?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: `${margin} ${margin}` }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  return (
    <div ref={ref} className={cn("absolute inset-0", className)} style={!show && tint ? { background: tint } : undefined}>
      {show && <Scene {...props} />}
    </div>
  );
}
