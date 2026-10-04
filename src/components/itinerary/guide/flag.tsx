/* eslint-disable @next/next/no-img-element -- tiny SVG flags from flagcdn, no optimisation needed. */
import { countryName } from "@/lib/flags";
import { cn } from "@/lib/utils";

/** A country flag, sized to the surrounding text (1em tall by default). */
export function Flag({ code, className }: { code?: string | null; className?: string }) {
  if (!code) return null;
  const name = countryName(code);
  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt=""
      title={name}
      aria-hidden
      loading="lazy"
      decoding="async"
      className={cn("inline-block h-[0.62em] w-auto shrink-0 rounded-[0.12em] object-cover shadow-[0_2px_10px_-2px_rgba(0,0,0,0.35)] ring-1 ring-black/10", className)}
    />
  );
}
