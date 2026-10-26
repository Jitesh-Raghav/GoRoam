"use client";

import { useEffect, useState } from "react";

/** The time there now and how far ahead or behind the reader is; blank until the browser knows its own time. */
export function LocalTime({ zone, place }: { zone: string; place: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  if (!now) return <span className="block h-5" />;

  const time = now.toLocaleTimeString("en-US", { timeZone: zone, hour: "numeric", minute: "2-digit" });
  // Minutes between there and here, from the wall-clock times in both zones.
  const wall = (tz?: string) => {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" }).formatToParts(now).map((x) => [x.type, x.value]));
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) / 60000;
  };
  const diff = wall(zone) - wall();
  const h = Math.floor(Math.abs(diff) / 60);
  const m = Math.abs(diff) % 60;
  const gap = `${h ? `${h} h` : ""}${h && m ? " " : ""}${m ? `${m} min` : ""}`;
  return (
    <span className="block text-sm text-stone">
      <span className="tabular-nums text-ink">{time}</span> in {place} now
      {diff === 0 ? " · same as you" : ` · ${gap} ${diff > 0 ? "ahead of" : "behind"} you`}
    </span>
  );
}
