import { cn } from "@/lib/utils";

/**
 * Quiet construction lines for the landing page: two hairline rails in the
 * gutters and a plain rule between some sections. Purely decorative (no layout
 * change, hidden from screen readers, never in the way of a click); the rails
 * show from tablet width up.
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
        <span className="absolute inset-y-0 w-px bg-ink/[0.06]" style={{ left: RAIL }} />
        <span className="absolute inset-y-0 w-px bg-ink/[0.06]" style={{ right: RAIL }} />
      </div>
    </div>
  );
}

/** A hairline between two sections that fades out at both ends. Zero height, so nothing moves. */
export function SectionRule({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none relative z-[6] h-0", className)}>
      <span className="landing-rule absolute inset-x-0 top-0" />
    </div>
  );
}
