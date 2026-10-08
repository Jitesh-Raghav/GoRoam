import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogoMark } from "./logo-mark";

export function Logo({ className, tone = "ink", href = "/" }: { className?: string; tone?: "ink" | "paper"; href?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)} aria-label="GoRoam home">
      <LogoMark className="size-9 shrink-0 rounded-[11px] shadow-[0_8px_20px_-10px_rgba(10,30,44,0.6)] transition-transform duration-500 ease-out-expo group-hover:rotate-[-8deg]" />
      <span className={cn("display text-[1.44rem] font-semibold leading-none", tone === "paper" ? "text-paper" : "text-ink")}>
        <span className={tone === "paper" ? "text-brand-2" : "text-brand"}>Go</span>Roam
      </span>
    </Link>
  );
}
