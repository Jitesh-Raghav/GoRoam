"use client";

import { useEffect, useState } from "react";

/** Clock hands that show the current time in London (10:10 until mounted). */
export function LondonClock({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  const [time, setTime] = useState({ h: 10, m: 10 });

  useEffect(() => {
    const read = () => {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      }).formatToParts(new Date());
      const h = Number(parts.find((p) => p.type === "hour")?.value ?? 10);
      const m = Number(parts.find((p) => p.type === "minute")?.value ?? 10);
      setTime({ h, m });
    };
    read();
    const t = window.setInterval(read, 30_000);
    return () => window.clearInterval(t);
  }, []);

  const minuteAngle = time.m * 6;
  const hourAngle = (time.h % 12) * 30 + time.m * 0.5;
  return (
    <g stroke={color} strokeLinecap="round">
      <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.55} strokeWidth={r * 0.12} transform={`rotate(${hourAngle} ${cx} ${cy})`} />
      <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.82} strokeWidth={r * 0.07} transform={`rotate(${minuteAngle} ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={r * 0.08} fill={color} stroke="none" />
    </g>
  );
}
