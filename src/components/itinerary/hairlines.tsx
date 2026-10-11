import { cn } from "@/lib/utils";

/*
 * Fine line art for the navy cards that carry no photo. Pure hairlines in the
 * paper and azure tones, faded with a mask so they sit behind the words.
 */

const line = { fill: "none", stroke: "currentColor", strokeWidth: 1, vectorEffect: "non-scaling-stroke" as const, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** A flight path landing on a runway that runs into a skyline, over faint map contours. */
export function ArrivalLines({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 480 150"
      preserveAspectRatio="xMaxYMin meet"
      className={cn("pointer-events-none absolute right-0 top-0 h-[150px] w-[min(480px,100%)] print:hidden [mask-composite:intersect] [mask-image:linear-gradient(to_left,black_45%,transparent),linear-gradient(to_bottom,black_50%,transparent_90%)]", className)}
    >
      {/* map contours */}
      <g className="text-paper/[0.07]">
        <path {...line} d="M40 132c60-22 120-6 180-20s110-40 170-30 70 18 90 14" />
        <path {...line} d="M60 146c70-18 130-2 190-14s100-34 160-26 50 12 70 10" />
        <path {...line} d="M120 120c50-14 90 0 140-10s80-30 130-24" />
      </g>
      {/* the flight path, landing */}
      <path {...line} d="M150 18C230 10 300 30 352 72" strokeDasharray="2 6" className="text-brand-2/50" />
      <g className="arrival-plane text-brand-2/80">
        <path {...line} d="M0 0l9-2.5-1.5-5 3 0 4.5 4.5 6-.5c2 0 2 2 0 2l-6-.2-4.6 4.4-3 0 1.5-4.9-9 -2.5z" transform="translate(304 42) rotate(28) scale(0.8)" />
      </g>
      {/* runway in perspective */}
      <g className="text-paper/[0.18]">
        <path {...line} d="M330 132L372 82M450 132L404 82" />
        <path {...line} d="M372 82h32" />
        <path {...line} d="M389 128v-8M388.5 112v-7M388.2 98v-5M388 88v-3" />
      </g>
      {/* the skyline at the far end, one continuous line */}
      <path
        {...line}
        className="text-paper/20"
        d="M300 82h18v-14h10v14h8v-26h12v26h6l4-10 4 10h8v-6c0-9 14-9 14 0v6h20v-18h9v18h12v-34l5-8 5 8v34h10v-12h12v12h22"
      />
      <circle cx="368" cy="50" r="1.5" className="fill-sun-2/70" />
    </svg>
  );
}

/** Two speech bubbles, a ruled baseline and sound waves around the speaker. */
export function LanguageLines({ speaking, className }: { speaking?: boolean; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 260 200" preserveAspectRatio="xMaxYMax meet" className={cn("pointer-events-none absolute bottom-0 right-0 h-full max-h-[220px] w-[260px] print:hidden [mask-image:linear-gradient(to_left,black_55%,transparent)]", className)}>
      <g className="text-paper/[0.14]">
        <path {...line} d="M120 26h96a16 16 0 0 1 16 16v30a16 16 0 0 1-16 16h-58l-16 14 2-14h-24a16 16 0 0 1-16-16V42a16 16 0 0 1 16-16z" />
        <path {...line} d="M150 70h-60a14 14 0 0 0-14 14v22a14 14 0 0 0 14 14h10l-2 12 14-12h38a14 14 0 0 0 14-14v-8" />
        <path {...line} d="M136 50h60M136 60h38" strokeDasharray="1 5" />
        <path {...line} d="M0 168h260" strokeDasharray="1 7" />
      </g>
      {/* sound waves, centred on the speaker button */}
      <g className={cn("text-brand-2/40", speaking && "lang-waves")}>
        {[34, 50, 66].map((r) => (
          <path key={r} {...line} d={`M${218 - r * 0.7} ${158 - r * 0.7}A${r} ${r} 0 0 1 ${218 + r * 0.7} ${158 - r * 0.7}`} />
        ))}
      </g>
    </svg>
  );
}
