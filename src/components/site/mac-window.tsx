import { Lock } from "@/components/site/icons";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A macOS-style app window: traffic lights, a centred address pill and a
 * frosted title bar, around whatever it holds (the product film).
 */
export function MacWindow({ url = "goroam.app", children, className }: { url?: string; children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "isolate overflow-hidden rounded-[14px] bg-[#0b1830] [clip-path:inset(0_round_14px)] md:[clip-path:inset(0_round_18px)] shadow-[0_80px_160px_-60px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)] md:rounded-[18px]",
        className
      )}
    >
      <div className="relative flex h-9 items-center rounded-t-[inherit] border-b border-white/[0.07] bg-[linear-gradient(180deg,#1d2b47,#152239)] px-3.5 md:h-11 md:px-4">
        <div aria-hidden className="flex gap-1.5 md:gap-2">
          <span className="size-2.5 rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.25)] md:size-3" />
          <span className="size-2.5 rounded-full bg-[#febc2e] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.25)] md:size-3" />
          <span className="size-2.5 rounded-full bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.25)] md:size-3" />
        </div>
        <div className="absolute left-1/2 top-1/2 flex h-6 w-[min(46%,22rem)] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1.5 rounded-md bg-white/[0.07] text-[11px] text-white/60 ring-1 ring-inset ring-white/[0.06] md:h-7 md:text-xs">
          <Lock className="size-3 text-white/45" />
          {url}
        </div>
        <div aria-hidden className="ml-auto hidden items-center gap-3 text-white/30 sm:flex">
          <span className="h-3 w-3 rounded-[3px] border border-current" />
          <span className="flex h-3 w-3.5 flex-col justify-between">
            <span className="h-px bg-current" />
            <span className="h-px bg-current" />
            <span className="h-px bg-current" />
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
