import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import type { Segment } from "@/components/motion/split-text";

/**
 * Every landing section opens the same way: a small label, a headline with one
 * accent word, and an optional line of description. The block rises in once,
 * as a whole, so headings read calmly instead of word by word.
 */
export function SectionHeading({
  label,
  title,
  description,
  align = "left",
  tone = "ink",
  size = "lg",
  className,
  children,
}: {
  label: string;
  /** One array per line; a segment with className "accent" is the highlighted word. */
  title: Segment[][];
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "ink" | "paper";
  size?: "lg" | "md";
  className?: string;
  children?: ReactNode;
}) {
  const center = align === "center";
  const paper = tone === "paper";
  return (
    <Reveal y={16} duration={0.9} className={cn(center && "mx-auto text-center", className)}>
      <p className={cn("eyebrow", paper ? "text-brand-2" : "text-brand")}>{label}</p>
      <h2
        className={cn(
          "display mt-5",
          size === "lg" ? "text-[clamp(2.25rem,4.2vw,3.5rem)] leading-[1.02]" : "text-[clamp(2rem,3.4vw,2.875rem)] leading-[1.04]",
          paper ? "text-paper" : "text-ink"
        )}
      >
        {title.map((line, i) => (
          <span key={i} className="block">
            {line.map((seg, k) => (
              <span key={k} className={seg.className}>
                {seg.text}
              </span>
            ))}
          </span>
        ))}
      </h2>
      {description && (
        <div className={cn("mt-5 max-w-xl text-[1.0625rem] leading-relaxed sm:text-lg", center && "mx-auto", paper ? "text-paper/70" : "text-stone")}>
          {description}
        </div>
      )}
      {children}
    </Reveal>
  );
}
