import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { SplitText, type Segment } from "@/components/motion/split-text";

export function SectionHeading({
  index,
  label,
  title,
  description,
  align = "left",
  tone = "ink",
  size = "lg",
  className,
  children,
}: {
  index: string;
  label: string;
  title: Segment[][];
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "ink" | "paper";
  size?: "lg" | "md";
  className?: string;
  children?: ReactNode;
}) {
  const center = align === "center";
  return (
    <div className={cn(center && "mx-auto text-center", className)}>
      <Reveal y={12}>
        <p className={cn("eyebrow flex items-center gap-3", center && "justify-center", tone === "paper" ? "text-paper/60" : "text-stone")}>
          <span>({index})</span>
          <span className={cn("h-px w-8", tone === "paper" ? "bg-paper/30" : "bg-ink/20")} />
          <span>{label}</span>
        </p>
      </Reveal>
      <h2
        className={cn(
          "display mt-6 leading-[0.92]",
          size === "lg" ? "text-[clamp(2.38rem,5.1vw,4.76rem)]" : "text-[clamp(2.21rem,3.91vw,3.74rem)]",
          tone === "paper" ? "text-paper" : "text-ink"
        )}
      >
        {title.map((line, i) => (
          <span key={i} className="block">
            <SplitText segments={line} delay={0.08 + i * 0.12} />
          </span>
        ))}
      </h2>
      {description && (
        <Reveal delay={0.2}>
          <div
            className={cn(
              "mt-6 max-w-xl text-lg leading-relaxed",
              center && "mx-auto",
              tone === "paper" ? "text-paper/65" : "text-stone"
            )}
          >
            {description}
          </div>
        </Reveal>
      )}
      {children}
    </div>
  );
}
