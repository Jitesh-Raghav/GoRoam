import type { ActivitySlot } from "./trip";

/*
 * Ordering a day's stops: the shortest visiting order ("Optimise my day")
 * and fresh times for a day whose order changed.
 */

const located = (a: ActivitySlot) => {
  const { lat, lng } = a.place;
  return Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0) ? ([lat!, lng!] as const) : null;
};

/** Great-circle distance in km. */
export function km(a: readonly [number, number], b: readonly [number, number]) {
  const r = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(r(b[0] - a[0]) / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(r(b[1] - a[1]) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Total length of a route through the stops, in order (unlocated stops are skipped). */
export function routeKm(stops: ActivitySlot[]) {
  const pts = stops.map(located).filter((p): p is readonly [number, number] => !!p);
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += km(pts[i - 1], pts[i]);
  return total;
}

/**
 * The shortest order through a day's stops that starts where it starts today
 * (the first stop is usually near the stay, or timed for opening).
 * Nearest neighbour, then 2-opt until nothing improves. Stops without
 * coordinates keep their position relative to the end.
 */
export function optimiseOrder(stops: ActivitySlot[]): { stops: ActivitySlot[]; beforeKm: number; afterKm: number; changed: boolean } {
  const beforeKm = routeKm(stops);
  const withPos = stops.map((s, i) => ({ s, i, p: located(s) }));
  const placed = withPos.filter((x) => x.p);
  const loose = withPos.filter((x) => !x.p);
  if (placed.length < 3) return { stops, beforeKm, afterKm: beforeKm, changed: false };

  const dist = (a: number, b: number) => km(placed[a].p!, placed[b].p!);
  // Nearest neighbour from the first stop.
  const order = [0];
  const left = new Set(placed.map((_, i) => i).slice(1));
  while (left.size) {
    const last = order[order.length - 1];
    let best = -1;
    for (const j of left) if (best < 0 || dist(last, j) < dist(last, best)) best = j;
    order.push(best);
    left.delete(best);
  }
  // 2-opt (open path, first stop fixed).
  const length = (o: number[]) => o.slice(1).reduce((n, j, k) => n + dist(o[k], j), 0);
  let improved = true;
  let guard = 0;
  while (improved && guard++ < 50) {
    improved = false;
    for (let i = 1; i < order.length - 1; i++) {
      for (let j = i + 1; j < order.length; j++) {
        const next = [...order.slice(0, i), ...order.slice(i, j + 1).reverse(), ...order.slice(j + 1)];
        if (length(next) < length(order) - 1e-6) {
          order.splice(0, order.length, ...next);
          improved = true;
        }
      }
    }
  }
  const result = [...order.map((k) => placed[k].s), ...loose.map((x) => x.s)];
  const afterKm = routeKm(result);
  const changed = result.some((s, i) => s !== stops[i]) && afterKm < beforeKm - 0.05;
  return changed ? { stops: retime(result, stops), beforeKm, afterKm, changed } : { stops, beforeKm, afterKm: beforeKm, changed: false };
}

/** "2–3 hours" → 2.5, "90 minutes" → 1.5, "1 hour" → 1. */
export function hoursOf(duration?: string) {
  if (!duration) return 2;
  const t = duration.toLowerCase();
  const nums = (t.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
  if (!nums.length) return 2;
  const n = nums.length > 1 ? (nums[0] + nums[1]) / 2 : nums[0];
  return /min/.test(t) && !/h(ou)?r/.test(t) ? n / 60 : n;
}

/** First clock time in "9:00 AM - 12:00 PM" (or "13:30"), in minutes after midnight. */
export function startMinutes(time?: string): number | null {
  const m = time?.match(/(\d{1,2})(?::(\d{2}))?\s*([ap])?\.?m?/i);
  if (!m) return null;
  let h = Number(m[1]) % 24;
  const ap = m[3]?.toLowerCase();
  if (ap === "p" && h < 12) h += 12;
  if (ap === "a" && h === 12) h = 0;
  return h * 60 + Number(m[2] ?? 0);
}

const clock = (mins: number) => {
  const m = Math.round(mins / 15) * 15;
  const h = Math.floor(m / 60) % 24;
  return `${h % 12 || 12}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

/**
 * Fresh times for a reordered day: starts when the day started before (or
 * 9:00), then each stop for its duration plus ~30 minutes to get to the next.
 * Evening meals don't start before 6 PM.
 */
export function retime(stops: ActivitySlot[], original: ActivitySlot[] = stops): ActivitySlot[] {
  let t = Math.min(...original.map((s) => startMinutes(s.time) ?? Infinity));
  if (!Number.isFinite(t)) t = 9 * 60;
  return stops.map((s, i) => {
    // An evening stop (dinner, a night walk) stays in the evening when it ends the day.
    const own = startMinutes(s.time);
    if (i === stops.length - 1 && stops.length > 1 && t < 18 * 60 && ((own !== null && own >= 17 * 60) || s.category === "food" || s.category === "nightlife")) t = Math.max(t, Math.min(own ?? 18 * 60, 20 * 60));
    const start = t;
    const end = start + hoursOf(s.duration) * 60;
    t = end + 30;
    return { ...s, time: `${clock(start)} - ${clock(end)}` };
  });
}
