import type { ReactNode } from "react";
import type { LucideIcon } from "@/components/site/icons";
import { cn } from "@/lib/utils";

export interface Fact {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
}

// Per breakpoint: the first cell of each row sits flush left, and the last cell stretches
// to the end of its row, so the hairline grid never shows an empty gap. Spelled out in full
// so the class names exist at build time.
const PAD = { base: ["max-sm:pl-0", "max-sm:pl-4"], sm: ["sm:max-lg:pl-0", "sm:max-lg:pl-4"], lg: ["lg:pl-0", "lg:pl-4"] } as const;
const SPAN: Record<"base" | "sm" | "lg", Record<number, string>> = {
  base: { 2: "max-sm:col-span-2" },
  sm: { 2: "sm:max-lg:col-span-2", 3: "sm:max-lg:col-span-3" },
  lg: { 2: "lg:col-span-2", 3: "lg:col-span-3" },
};

/**
 * The facts people look for first, as one open hairline grid: no box, just rules between
 * the cells. Two across on phones, three on tablets, up to six on wide screens.
 */
export function FactStrip({ facts, className }: { facts: Fact[]; className?: string }) {
  const n = facts.length;
  const cols = { base: 2, sm: n >= 3 ? 3 : 2, lg: n >= 6 ? 6 : n >= 4 ? n : n >= 3 ? 3 : 2 };
  const cell = (i: number) =>
    (["base", "sm", "lg"] as const).map((bp) => {
      const c = cols[bp];
      const left = n % c;
      const span = i === n - 1 && left ? SPAN[bp][c - left + 1] : undefined;
      return cn(PAD[bp][i % c === 0 ? 0 : 1], span);
    });
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
        <div key={f.label} className={cn("min-w-0 bg-paper py-4 pr-4", cell(i))}>
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
