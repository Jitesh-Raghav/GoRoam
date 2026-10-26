import { cn } from "@/lib/utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Each month as best, shoulder (next to a best month) or off. */
export function seasonOf(months: number[]) {
  return MONTHS.map((_, i) => {
    const m = i + 1;
    if (months.includes(m)) return "best" as const;
    const prev = m === 1 ? 12 : m - 1;
    const next = m === 12 ? 1 : m + 1;
    return months.includes(prev) || months.includes(next) ? ("shoulder" as const) : ("off" as const);
  });
}

const LABEL = { best: "Best", shoulder: "Shoulder", off: "Off season" } as const;

/** The year at a glance: when to go, when it's still fine, and when to skip, with this month marked. */
export function SeasonBar({ months, weather }: { months: number[]; weather?: string }) {
  const season = seasonOf(months);
  const now = new Date().getMonth();
  return (
    <div className="rounded-card bg-white p-5 ring-1 ring-line sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">When to go</p>
        <ul className="flex flex-wrap gap-3 text-xs text-stone">
          {(["best", "shoulder", "off"] as const).map((k) => (
            <li key={k} className="inline-flex items-center gap-1.5">
              <span className={cn("size-2.5 rounded-full", k === "best" ? "bg-brand" : k === "shoulder" ? "bg-brand-2/70" : "bg-paper-3")} />
              {LABEL[k]}
            </li>
          ))}
        </ul>
      </div>
      <ol aria-label="Months of the year" className="mt-4 grid grid-cols-6 gap-1.5 sm:grid-cols-12">
        {MONTHS.map((m, i) => (
          <li key={m} className="relative">
            <span
              className={cn(
                "flex h-11 flex-col items-center justify-center rounded-xl font-mono text-[11px] transition-colors",
                season[i] === "best" ? "bg-brand text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]" : season[i] === "shoulder" ? "bg-brand-2/25 text-ink" : "bg-paper-2/70 text-stone-2",
                i === now && "ring-2 ring-sun-2 ring-offset-2 ring-offset-white"
              )}
            >
              {m}
              <span className="sr-only">: {LABEL[season[i]]}{i === now ? " (this month)" : ""}</span>
            </span>
            {i === now && <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-sun-2 px-1.5 text-[9px] font-medium uppercase tracking-wider text-ink">Now</span>}
          </li>
        ))}
      </ol>
      {weather && <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-stone">{weather}</p>}
    </div>
  );
}
