import type { ReactNode } from "react";
import { ArrowRight } from "@/components/site/icons";

export interface PlanStep {
  /** The decision, as an instruction: "Pick your dates". */
  title: string;
  /** The answer for this trip, with its numbers. */
  fact: string;
  /** The reason or the fine print, from the trip's own data. */
  detail?: string;
  /** The chapter on the page that covers it, and what the link says. */
  href: string;
  cta: string;
}

/**
 * "How to plan a trip to {place}": the page's answers as six decisions in
 * order, each linking down to the chapter that has the detail.
 */
export function PlanSteps({ name, steps, children }: { name: string; steps: PlanStep[]; children?: ReactNode }) {
  return (
    <div>
      <p className="eyebrow text-brand">In six steps</p>
      <h2 id="plan-h" className="display mt-3 text-[clamp(1.6rem,3vw,2.1rem)] leading-[1.08] tracking-[-0.02em] text-ink">
        How to plan a trip to {name}
      </h2>
      <ol className="mt-7 grid border-t border-ink md:grid-cols-2 md:gap-x-10">
        {steps.map((s, i) => (
          <li key={s.title} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-2 border-b border-line py-5">
            <span className="pt-1 font-mono text-xs text-stone">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="text-[0.8rem] text-stone">{s.title}</h3>
              <p className="mt-1.5 leading-relaxed text-ink">{s.fact}</p>
              {s.detail && <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{s.detail}</p>}
              <a href={s.href} className="group mt-2.5 inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-colors hover:text-brand">
                {s.cta} <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-0.5" />
              </a>
            </div>
          </li>
        ))}
      </ol>
      {children && <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3">{children}</div>}
    </div>
  );
}
