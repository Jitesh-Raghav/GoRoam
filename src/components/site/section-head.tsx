import type { ReactNode } from "react";
import { ArrowRight } from "@/components/site/icons";
import { QuietLink } from "@/components/site/quiet-link";
import { cn } from "@/lib/utils";

/**
 * How a content section opens: an optional small label, the title, an optional line of
 * intro, and an optional "See all" link on the right. One level of labelling, no numbers
 * or rules; the sticky chapter nav already says where you are.
 */
export function SectionHead({
  id,
  kicker,
  title,
  intro,
  action,
  as: Tag = "h2",
  size = "md",
  className,
}: {
  id?: string;
  kicker?: string;
  title: ReactNode;
  intro?: ReactNode;
  action?: { href: string; label: string };
  as?: "h2" | "h3";
  size?: "md" | "sm";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8", className)}>
      <div className="min-w-0 max-w-2xl">
        {kicker && <p className="eyebrow mb-3 text-brand">{kicker}</p>}
        <Tag id={id} className={cn("display text-ink", size === "md" ? "text-[clamp(1.75rem,3.1vw,2.4rem)] leading-[1.06] tracking-[-0.02em]" : "text-[clamp(1.35rem,2.2vw,1.7rem)] leading-[1.1] tracking-[-0.015em]")}>
          {title}
        </Tag>
        {intro && <div className="mt-3 max-w-2xl leading-relaxed text-stone">{intro}</div>}
      </div>
      {action && (
        <QuietLink href={action.href} className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-ink transition-colors hover:text-brand">
          {action.label}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </QuietLink>
      )}
    </div>
  );
}
