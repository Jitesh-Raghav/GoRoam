"use client";

import { signIn } from "next-auth/react";
import { ArrowRight, Check, Lock, Sparkles } from "@/components/site/icons";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/** A day of a guest preview that's ready but locked: its theme and cost are shown, its stops stay on the server. */
export interface LockedDay {
  day: number;
  theme?: string;
  totalDayCost?: number;
}

/** What signing in unlocks for this trip (the same promise as the hero and the outro). */
const UNLOCKS = ["Every day of the plan, stop by stop", "The live map of each day", "Your local guide: phrases, food & customs", "A PDF booklet and calendar", "A link to share with your crew"];

/** Starts Google sign-in, coming back to claim the trip. */
export function unlockWithGoogle(unlockUrl: string, destination: string, where: string) {
  track("guest_unlock_clicked", { destination, where });
  void signIn("google", { callbackUrl: unlockUrl });
}

/** A locked day in the plan's day tabs: the theme shows, the stops don't. Clicking it starts sign-in. */
export function LockedTab({ label, date, theme, cost, onClick }: { label: string; date: string; theme?: string; cost?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}, ${theme ?? ""}: sign in free to unlock`}
      className="group relative min-w-[9.5rem] flex-1 shrink-0 snap-start overflow-hidden rounded-[22px] bg-white text-left text-ink ring-1 ring-line transition-shadow duration-300 hover:shadow-[0_20px_40px_-30px_rgba(14,31,59,0.6)] sm:min-w-[11.5rem]"
    >
      <span className="relative block h-24 overflow-hidden bg-paper-2 sm:h-28">
        {/* Stand-in "stops": soft bars, so it reads as a day that's there but hidden. */}
        <span aria-hidden className="absolute inset-x-4 top-5 space-y-2 blur-[2px]">
          <span className="block h-2.5 w-4/5 rounded-full bg-paper-3" />
          <span className="block h-2.5 w-3/5 rounded-full bg-paper-3" />
          <span className="block h-2.5 w-2/3 rounded-full bg-paper-3" />
        </span>
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-10 place-items-center rounded-full bg-white text-ink shadow-[0_8px_20px_-10px_rgba(14,31,59,0.6)] ring-1 ring-line transition-transform duration-500 ease-out-expo group-hover:scale-110">
            <Lock className="size-4" />
          </span>
        </span>
        <span className="absolute bottom-2 left-3 font-mono text-[11px] text-ink/70">{label}</span>
        {cost && <span className="absolute bottom-2 right-3 font-mono text-[11px] text-ink/50">{cost}</span>}
      </span>
      <span className="relative block p-3.5 pt-3">
        <span className="block text-xs text-brand">{date}</span>
        <span className="mt-1.5 line-clamp-2 block text-[0.95rem] leading-snug">{theme || "Planned and waiting"}</span>
      </span>
    </button>
  );
}

/**
 * After Day 1 in a guest preview: the rest of the trip, ready and locked, with what
 * signing in unlocks and the way in. Themes are real; the stops stay hidden.
 */
export function UnlockCard({ days, total, labelFor, costFor, unlockUrl, destination }: { days: LockedDay[]; total: number; labelFor: (day: number) => string; costFor: (usd?: number) => string | undefined; unlockUrl: string; destination: string }) {
  const range = days.length === 1 ? `Day ${days[0].day}` : `Days ${days[0].day}–${days[days.length - 1].day}`;
  return (
    <section aria-labelledby="unlock-h" className="mt-12 overflow-hidden rounded-[30px] bg-ink text-paper sm:ml-[4.25rem]">
      <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="p-6 sm:p-8">
          <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-paper/55">
            <span className="size-1.5 rounded-full bg-brand-2" /> YOUR FULL TRIP · {total} DAYS
          </p>
          <h3 id="unlock-h" className="display mt-4 text-[clamp(1.9rem,3.6vw,2.6rem)] leading-[1.02] tracking-[-0.02em]">
            <span className="whitespace-nowrap">{range}</span> {days.length === 1 ? "is" : "are"} <span className="accent">ready.</span>
          </h3>
          <ol className="mt-6 divide-y divide-paper/10 border-y border-paper/10">
            {days.map((d) => (
              <li key={d.day} className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 py-3">
                <span className="font-mono text-[11px] text-paper/50">DAY {String(d.day).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="block truncate text-[0.95rem] text-paper">{d.theme || "Planned and waiting"}</span>
                  <span className="mt-0.5 block text-xs text-paper/45">{labelFor(d.day)}</span>
                </span>
                <span className="flex items-center gap-2 text-xs text-paper/55">
                  {costFor(d.totalDayCost) && <span className="hidden tabular-nums sm:inline">{costFor(d.totalDayCost)}</span>}
                  <Lock className="size-3.5 text-paper/40" />
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="border-t border-paper/10 bg-paper/[0.04] p-6 sm:p-8 lg:border-l lg:border-t-0">
          <p className="text-sm text-paper/60">Sign in free and you get</p>
          <ul className="mt-4 space-y-3">
            {UNLOCKS.map((u) => (
              <li key={u} className="flex gap-3 text-[0.95rem] leading-snug text-paper/90">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand text-white">
                  <Check className="size-3" />
                </span>
                {u}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => unlockWithGoogle(unlockUrl, destination, "locked-card")}
            className="group mt-7 inline-flex h-13 w-full items-center justify-center gap-2.5 rounded-full bg-brand px-6 py-3.5 text-[0.95rem] font-medium text-white shadow-[0_14px_30px_-14px_rgba(26,95,214,0.9)] transition-colors hover:bg-brand/90"
          >
            <Sparkles className="size-4" /> Continue with Google
            <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5" />
          </button>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-paper/50">
            <span>Free · about 10 seconds · no card</span>
            <a
              href={`/auth?callbackUrl=${encodeURIComponent(unlockUrl)}`}
              onClick={() => track("guest_unlock_clicked", { destination, where: "locked-card-email" })}
              className={cn("text-paper/75 underline decoration-paper/30 underline-offset-4 hover:text-paper")}
            >
              Use email instead
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
