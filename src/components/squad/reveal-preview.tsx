import { GuideCover } from "@/components/seo/guide-media";
import { CalendarDays, Lock } from "@/components/site/icons";
import { CREW } from "@/components/plan/crew";
import { cn } from "@/lib/utils";

const ROLES = ["🍜 The Foodie", "🌙 The Night Owl", "🏔️ The Mountain Goat", "😴 The Hammock Philosopher", "🙌 The Yes Person"];

/** A sample reveal, so people see what they get before starting one. */
export function RevealPreview({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("relative mx-auto w-full max-w-[24rem] rotate-[1.5deg]", className)}>
      <div className="overflow-hidden rounded-[28px] bg-white text-ink shadow-[0_40px_80px_-30px_rgba(10,20,50,0.7)]">
        <GuideCover destination="Gokarna, India" landscape="coast" width={700} credit={false} className="h-48">
          <div className="absolute inset-x-0 bottom-0 p-5 text-paper">
            <p className="text-xs uppercase tracking-[0.18em] text-paper/80">Your squad&apos;s match</p>
            <p className="display mt-1 text-4xl leading-none">Gokarna</p>
          </div>
          <span className="absolute right-4 top-4 rounded-full bg-sun-2 px-3 py-1 text-sm font-semibold text-ink">92% match</span>
        </GuideCover>
        <div className="space-y-3 p-5">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-3 py-1.5">
              <CalendarDays className="size-3.5 text-brand" /> Fri 12 Dec · 5 of 5 free
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366]/12 px-3 py-1.5 text-[#1F7A3B]">
              <Lock className="size-3.5" /> Fits everyone&apos;s budget
            </span>
          </div>
          <ul className="space-y-1.5">
            {CREW.map((c, i) => (
              <li key={c.name} className="flex items-center gap-2.5 text-sm">
                <span className={cn("grid size-7 place-items-center rounded-full text-[11px] font-semibold", c.tone)}>{c.name[0]}</span>
                <span className="w-14 text-stone">{c.name}</span>
                <span>{ROLES[i]}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-ink px-4 py-3 text-sm text-paper">Squad sync: <span className="font-semibold text-sun-2">81%</span> · you swipe alike</p>
        </div>
      </div>
    </div>
  );
}
