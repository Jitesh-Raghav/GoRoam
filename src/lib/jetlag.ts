/**
 * A simple, evidence-based jet-lag plan: shift sleep towards the destination for a
 * few days before flying (about an hour a day), then use light at the right time
 * on arrival. The body clock adapts roughly 1 hour a day flying east and 1.5 hours
 * flying west, so the plan says how long the rest will take.
 */

export interface JetLagPlan {
  /** Destination minus home, in hours, folded to the shorter way round the clock. */
  diff: number;
  direction: "east" | "west";
  /** The three nights before departure. */
  before: { label: string; bed: string; wake: string; shift: number }[];
  /** Days to fully adjust after arriving, given the pre-shift. */
  adjustDays: number;
  seekLight: string;
  avoidLight: string;
}

/** Minutes between two zones' wall clocks at a moment (DST-aware). */
function offsetMinutes(at: Date, tz?: string) {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(at);
  const v = (t: string) => Number(p.find((x) => x.type === t)?.value);
  return Date.UTC(v("year"), v("month") - 1, v("day"), v("hour"), v("minute")) / 60000;
}

const clock = (mins: number) => {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const suffix = h < 12 ? "am" : "pm";
  return `${h % 12 || 12}${mm ? `:${String(mm).padStart(2, "0")}` : ""} ${suffix}`;
};

export function jetLagPlan(homeTz: string | undefined, destTz: string, departure: string): JetLagPlan | null {
  try {
    const at = new Date(`${departure.slice(0, 10)}T12:00:00Z`);
    let diff = (offsetMinutes(at, destTz) - offsetMinutes(at, homeTz)) / 60;
    if (diff > 12) diff -= 24;
    if (diff < -12) diff += 24;
    if (Math.abs(diff) < 3) return null;
    const east = diff > 0;
    const bed = 23 * 60;
    const wake = 7 * 60;
    const step = Math.min(1, Math.abs(diff) / 3); // an hour a night, less for small gaps
    const before = [3, 2, 1].map((n, i) => {
      const shift = Math.min(step * (i + 1), Math.abs(diff)) * (east ? -60 : 60);
      return { label: n === 1 ? "Night before" : `${n} nights before`, bed: clock(bed + shift), wake: clock(wake + shift), shift: Math.round(shift / 60) };
    });
    const left = Math.max(Math.abs(diff) - step * 3, 0);
    return {
      diff: Math.round(diff * 2) / 2,
      direction: east ? "east" : "west",
      before,
      adjustDays: Math.max(1, Math.ceil(left / (east ? 1 : 1.5))),
      seekLight: east ? "Get bright daylight in the morning, outside if you can." : "Get daylight in the late afternoon and early evening.",
      avoidLight: east ? "Dim the lights and screens in the evening; skip caffeine after 2 pm." : "Keep early mornings dim (sunglasses help); a short nap before 3 pm is fine.",
    };
  } catch {
    return null;
  }
}
