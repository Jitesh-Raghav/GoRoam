import Link from "next/link";
import { ArrowUpRight } from "@/components/site/icons";
import type { UseCase } from "@/lib/use-cases";
import { FALLBACK_ICON, USE_CASE_ICON } from "@/lib/use-case-icons";
import { TripArt } from "./trip-art";

/** A card for one kind of trip: a living illustration on top, the name and a line underneath. */
export function TripTypeCard({ u }: { u: UseCase }) {
  const Icon = USE_CASE_ICON[u.slug] ?? FALLBACK_ICON;
  return (
    <Link
      href={`/plan/${u.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[24px] bg-white ring-1 ring-line transition-[box-shadow,transform] duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(14,31,59,0.55)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-700 ease-out-expo group-hover:scale-[1.06]">
          <TripArt slug={u.slug} />
        </div>
        <span className="absolute left-3 top-3 grid size-9 place-items-center rounded-xl bg-white/80 text-brand shadow-[0_6px_16px_-8px_rgba(14,31,59,0.6)] ring-1 ring-white/70 backdrop-blur-md">
          <Icon className="size-[18px]" />
        </span>
        <span className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white/80 text-ink opacity-0 ring-1 ring-white/70 backdrop-blur-md transition-all duration-500 group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <span className="text-[0.98rem] leading-snug text-ink sm:text-lg">{u.h1.replace(/^./, (c) => c.toUpperCase())}</span>
        <span className="mt-1.5 hidden text-sm leading-relaxed text-stone sm:block">{u.lede}</span>
        <span className="mt-auto hidden items-center gap-1 pt-3 text-sm text-brand sm:inline-flex">
          Start planning <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
