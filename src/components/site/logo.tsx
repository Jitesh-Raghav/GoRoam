import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, tone = "ink", href = "/" }: { className?: string; tone?: "ink" | "paper"; href?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)} aria-label="GoRoam home">
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-full bg-white/70 ring-1 ring-black/5 transition-transform duration-500 ease-out-expo group-hover:rotate-[-18deg]">
        <Image src="/logo.png" alt="" width={36} height={36} className="size-8" priority />
      </span>
      <span className={cn("display text-[1.7rem] leading-none", tone === "paper" ? "text-paper" : "text-ink")}>GoRoam</span>
    </Link>
  );
}
