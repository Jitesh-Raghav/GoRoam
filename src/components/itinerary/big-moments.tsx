"use client";

import { motion } from "framer-motion";
import { ArrowRight, Moon, Sparkles, Sun, Sunrise } from "@/components/site/icons";
import type { ActivitySlot, DayItinerary } from "@/lib/trip";
import { cn } from "@/lib/utils";
import { PlacePhoto } from "./place-photo";

const ease = [0.16, 1, 0.3, 1] as const;
const SLOTS = [
  { key: "morning", label: "Morning", icon: Sunrise },
  { key: "afternoon", label: "Afternoon", icon: Sun },
  { key: "evening", label: "Evening", icon: Moon },
] as const;
type SlotKey = (typeof SLOTS)[number]["key"];

/** Words that say nothing about which place a highlight means. */
const NOISE = new Set(["the", "and", "for", "with", "from", "into", "over", "your", "our", "their", "its", "that", "this", "one", "all", "view", "views", "walk", "tour", "time", "day", "days", "night", "evening", "morning", "afternoon", "first", "last", "best", "around", "through", "along", "before", "after", "crowds"]);

const words = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]s\b/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !NOISE.has(w));

interface Stop {
  activity: ActivitySlot;
  day: number;
  slot: SlotKey;
}

export interface Moment extends Partial<Stop> {
  text: string;
}

/**
 * Each highlight paired with the stop it's about, by the words they share
 * ("The Golden Pavilion's reflection" → "Kinkaku-ji (Golden Pavilion)"), so it
 * can show that stop's photo and open its day. Unused stops are preferred, so
 * two highlights rarely share a photo; with no match, stops are spread in order.
 */
export function pairMoments(highlights: string[], days: DayItinerary[]): Moment[] {
  const stops: Stop[] = days.flatMap((d, day) => SLOTS.flatMap((s) => (d[s.key]?.place?.name ? [{ activity: d[s.key], day, slot: s.key }] : [])));
  const used = new Set<number>();
  return highlights.map((text, i) => {
    const want = new Set(words(text));
    let best = -1;
    let bestScore = 0;
    stops.forEach((s, k) => {
      const have = new Set(words(`${s.activity.place.name} ${s.activity.place.area ?? ""}`));
      let score = 0;
      have.forEach((w) => want.has(w) && (score += w.length));
      if (score && used.has(k)) score -= 0.5;
      if (score > bestScore) {
        bestScore = score;
        best = k;
      }
    });
    if (best < 0 && stops.length) best = Math.min(Math.floor((i * stops.length) / Math.max(highlights.length, 1)), stops.length - 1);
    if (best < 0) return { text };
    used.add(best);
    return { text, ...stops[best] };
  });
}

/**
 * Where a tile sits, by how many there are. Small screens: two across, the lead
 * (and an odd last tile) full width. Large: four across and two rows, the lead
 * filling a 2×2 block and the rest the cells beside it.
 */
function placement(i: number, n: number) {
  const lead = i === 0 && n > 2;
  const rest = n - (n > 2 ? 1 : 0);
  const sm = lead || (rest % 2 === 1 && i === n - 1) ? "sm:col-span-2" : "sm:col-span-1";
  let lg = "lg:col-span-1 lg:row-span-1";
  if (n === 1) lg = "lg:col-span-4 lg:row-span-2";
  else if (n === 2 || i === 0) lg = "lg:col-span-2 lg:row-span-2";
  else if (n === 3 || (n === 4 && i === 1)) lg = "lg:col-span-2 lg:row-span-1";
  return `${sm} ${lg}`;
}

/**
 * The trip at a glance: its big moments as a photo mosaic. Each tile shows the
 * stop it's about and opens that day in the plan.
 */
export function BigMoments({ moments, destination, onOpen }: { moments: Moment[]; destination: string; onOpen: (day: number) => void }) {
  if (!moments.length) return null;
  const tiles = moments.slice(0, 5);
  const rest = moments.slice(5);
  const n = tiles.length;
  return (
    <section aria-labelledby="big-moments" className="print-avoid mt-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow flex items-center gap-2 text-stone">
            <Sparkles className="duo-sun size-3.5 text-sun" /> Don&apos;t miss
          </p>
          <h2 id="big-moments" className="display mt-3 text-[clamp(1.9rem,3.6vw,2.6rem)] leading-[1.02] text-ink">
            The <span className="accent">big moments.</span>
          </h2>
        </div>
        <p className="no-print text-sm text-stone">
          {moments.length} {moments.length === 1 ? "highlight" : "highlights"} · tap one to see its day
        </p>
      </div>

      <ol
        className={cn(
          "no-print no-scrollbar -mx-3 mt-7 flex snap-x gap-3 overflow-x-auto px-5 scroll-px-5 pb-1 min-[400px]:-mx-4 min-[400px]:px-6 min-[400px]:scroll-px-6",
          "sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 lg:auto-rows-[14.5rem]"
        )}
      >
        {tiles.map((m, i) => {
          const slot = SLOTS.find((s) => s.key === m.slot);
          const lead = i === 0 && n > 2;
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease, delay: i * 0.06 }}
              className={cn("w-[78%] shrink-0 snap-start sm:w-auto", placement(i, n))}
            >
              <button
                type="button"
                onClick={() => m.day !== undefined && onOpen(m.day)}
                disabled={m.day === undefined}
                className={cn(
                  "group relative block h-64 w-full overflow-hidden rounded-card bg-ink text-left text-paper outline-none ring-offset-2 ring-offset-paper focus-visible:ring-2 focus-visible:ring-brand sm:h-60 lg:h-full",
                  lead && "sm:h-80"
                )}
              >
                <PlacePhoto activity={m.activity} destination={destination} icon={Sparkles} credit={false} imgClassName="group-hover:scale-[1.05]" />
                <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-ink/5" />
                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-2.5 py-1 font-mono text-[11px] text-ink shadow-sm">{String(i + 1).padStart(2, "0")}</span>
                <span className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  {slot && m.day !== undefined && (
                    <span className="eyebrow flex items-center gap-1.5 text-[0.6rem] text-sun-2">
                      <slot.icon className="duo-sun size-3.5" /> Day {m.day + 1} · {slot.label}
                    </span>
                  )}
                  <span className={cn("display mt-1.5 line-clamp-3 block leading-[1.08]", lead ? "text-[clamp(1.5rem,2.6vw,2.2rem)]" : "text-[1.25rem]")}>{m.text}</span>
                  {m.day !== undefined && (
                    <span className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-paper/70 transition-colors group-hover:text-paper">
                      See it in the plan <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-0.5" />
                    </span>
                  )}
                </span>
              </button>
            </motion.li>
          );
        })}
      </ol>

      {rest.length > 0 && (
        <ul className="no-print mt-4 flex flex-wrap gap-2">
          {rest.map((m, i) => (
            <li key={i} className="rounded-full bg-white px-3.5 py-1.5 text-sm text-ink ring-1 ring-line">
              {m.text}
            </li>
          ))}
        </ul>
      )}

      {/* On paper: a plain numbered list. */}
      <ol className="mt-4 hidden list-decimal space-y-1.5 pl-5 text-ink print:block">
        {moments.map((m, i) => (
          <li key={i}>{m.text}</li>
        ))}
      </ol>
    </section>
  );
}
