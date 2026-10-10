"use client";

import { useEffect, useState } from "react";

/** The time now, refreshed every `every` ms. Null until mounted, so server and client markup match. */
export function useNow(every = 30_000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = window.setTimeout(tick, 0);
    const t = window.setInterval(tick, every);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(t);
    };
  }, [every]);
  return now;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(tz: string, hour12: boolean) {
  const key = `${tz}|${hour12}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(hour12 ? "en-US" : "en-GB", { hour: hour12 ? "numeric" : "2-digit", minute: "2-digit", hour12, timeZone: tz });
    formatters.set(key, f);
  }
  return f;
}

/** The time in `tz`: "21:04", or "9:04 PM" with `hour12`. */
export function clockIn(tz: string, now: Date, hour12 = false) {
  try {
    return formatter(tz, hour12).format(now);
  } catch {
    return "";
  }
}

/** Whether it's roughly daytime (6 AM to 7 PM) in `tz`. */
export function isDaytimeIn(tz: string, now: Date) {
  const hour = Number(clockIn(tz, now).split(":")[0]);
  return hour >= 6 && hour < 19;
}
