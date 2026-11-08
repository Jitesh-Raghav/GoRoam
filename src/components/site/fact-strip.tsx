import type { ReactNode } from "react";
import type { LucideIcon } from "@/components/site/icons";
import { cn } from "@/lib/utils";

export interface Fact {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
}

/**
 * The facts people look for first, as one open hairline grid: no box, just rules between
 * the cells. Two across on phones, up to six on wide screens.
 */
export function FactStrip({ facts, className }: { facts: Fact[]; className?: string }) {
  const n = facts.length;
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-px border-y border-line bg-line",
        n >= 3 && "sm:grid-cols-3",
        n === 4 && "lg:grid-cols-4",
        n === 5 && "lg:grid-cols-5",
        n >= 6 && "lg:grid-cols-6",
        className
      )}
    >
      {facts.map((f, i) => (
        <div key={f.label} className={cn("min-w-0 bg-paper py-4 pr-4", i % 2 === 1 ? "pl-4" : "max-sm:pl-0 sm:pl-4", "sm:[&:nth-child(3n+1)]:pl-0", n >= 4 && "lg:pl-4 lg:first:pl-0")}>
          <dt className="flex items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-stone">
            {f.icon && <f.icon className="size-3.5 text-brand" />}
            {f.label}
          </dt>
          <dd className="mt-1.5 text-[0.98rem] leading-snug text-ink">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}
