import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Hairline construction lines for the landing page: two rails in the gutters,
 * textured rules between sections, and corner brackets on a few blocks. Purely
 * decorative (no layout change, hidden from screen readers, never in the way of
 * a click); the rails show from tablet width up.
 */

const EDGE = "clamp(1rem,4vw,3rem)"; // container-x's padding, i.e. where content starts
/** The rails sit out in the gutter, a clear step away from the content edge. */
const RAIL = `max(6px, calc(${EDGE} - 1.25rem))`;

/**
 * Two vertical rails down the gutters of everything inside a `relative isolate`
 * parent. They sit behind the sections, so any illustration, card or dark band
 * simply covers them; they only show over the bare page.
 */
export function GuideRails() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden md:block">
      <div className="container-x relative h-full">
        <span className="absolute inset-y-0 w-px bg-ink/[0.08]" style={{ left: RAIL }} />
        <span className="absolute inset-y-0 w-px bg-ink/[0.08]" style={{ right: RAIL }} />
      </div>
    </div>
  );
}

function Cross({ side }: { side: "left" | "right" }) {
  return (
    <span className="absolute top-0 size-[11px] -translate-y-1/2" style={side === "left" ? { left: `calc(${RAIL} - 5px)` } : { right: `calc(${RAIL} - 5px)` }}>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-ink/35" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-ink/35" />
    </span>
  );
}

/**
 * A textured rule between two sections, drawn like a map's scale bar: a hairline
 * with fine and major ticks hanging from it and a dotted base, fading out at both
 * ends, with crosshairs where it meets the rails. Zero height, so nothing moves.
 */
export function SectionRule({ label, className }: { label?: ReactNode; className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none relative z-[6] h-0", className)}>
      <span className="landing-rule absolute inset-x-0 top-0" />
      <div className="container-x relative hidden md:block">
        <Cross side="left" />
        <Cross side="right" />
        {label && (
          <span className="eyebrow absolute top-3.5 hidden text-[0.55rem] text-ink/35 lg:block" style={{ right: `calc(${RAIL} + 14px)` }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

/** Four small corner brackets just outside a block (the block must be `relative`). */
export function Brackets({ className, tone = "ink" }: { className?: string; tone?: "ink" | "paper" }) {
  const c = tone === "paper" ? "border-paper/30" : "border-ink/25";
  const arm = "absolute size-3.5";
  return (
    <span aria-hidden className={cn("pointer-events-none absolute -inset-3 hidden md:block", className)}>
      <span className={cn(arm, c, "left-0 top-0 border-l border-t")} />
      <span className={cn(arm, c, "right-0 top-0 border-r border-t")} />
      <span className={cn(arm, c, "bottom-0 left-0 border-b border-l")} />
      <span className={cn(arm, c, "bottom-0 right-0 border-b border-r")} />
    </span>
  );
}
