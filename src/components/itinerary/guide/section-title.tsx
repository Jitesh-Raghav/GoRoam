import type { ReactNode } from "react";

export function SectionTitle({ eyebrow, title, children }: { eyebrow: ReactNode; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow text-stone">{eyebrow}</p>
        <h2 className="display mt-3 text-[clamp(2.4rem,5vw,3.8rem)] leading-[0.95] text-ink">{title}</h2>
      </div>
      {children}
    </div>
  );
}
