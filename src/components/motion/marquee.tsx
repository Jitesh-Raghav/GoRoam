import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Seamless infinite ticker; content is duplicated so the loop never gaps. */
export function Marquee({
  children,
  duration = 40,
  reverse = false,
  className,
  trackClassName,
}: {
  children: ReactNode;
  duration?: number;
  reverse?: boolean;
  className?: string;
  trackClassName?: string;
}) {
  return (
    <div className={cn("marquee-host relative flex overflow-hidden", className)}>
      <div
        className={cn("flex w-max shrink-0", reverse ? "animate-marquee-reverse" : "animate-marquee", trackClassName)}
        style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
