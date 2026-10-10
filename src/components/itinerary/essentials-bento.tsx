"use client";

import { motion } from "framer-motion";
import { Banknote, CloudSun, Droplets, HandCoins, Languages, Phone, Plug, Siren, TramFront, Umbrella, Volume2, Wifi } from "@/components/site/icons";
import { useEffect, useState, type ReactNode } from "react";
import type { DayWeather } from "@/app/api/weather/route";
import { formatMoney } from "@/lib/currency";
import { loadRates, useMoney } from "@/lib/money";
import type { Essentials, TripGuide } from "@/lib/trip";
import { cn } from "@/lib/utils";
import { useSpeech } from "./guide/local-guide";
import { temp, weatherInfo } from "./weather";

const ease = [0.16, 1, 0.3, 1] as const;

function Tile({ icon: Icon, label, children, className, tone = "glass", delay = 0 }: { icon: typeof Plug; label: string; children: ReactNode; className?: string; tone?: "glass" | "sun" | "ink"; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease, delay }}
      className={cn(
        "print-avoid relative flex min-w-0 flex-col overflow-hidden rounded-[24px] p-5",
        tone === "sun" && "bg-[linear-gradient(135deg,var(--sun-soft),#fff_72%)] shadow-card ring-1 ring-sun/20",
        tone === "ink" && "bg-ink text-paper",
        tone === "glass" && "glass",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", tone === "ink" ? "bg-paper/10 text-brand-2" : tone === "sun" ? "duo-sun bg-sun/15 text-ink" : "bg-brand-soft text-brand")}>
          <Icon className="size-[1.1rem]" />
        </span>
        <p className={cn("eyebrow text-[0.6rem]", tone === "ink" ? "text-paper/60" : "text-stone")}>{label}</p>
      </div>
      {children}
    </motion.div>
  );
}

/* --------------------------------- Weather -------------------------------- */

const prefersF = () => typeof navigator !== "undefined" && /-(US|LR|MM)$/i.test(navigator.language);

/** Highs and lows across the trip as two lines, with rain as bars underneath. */
function Sparkline({ days, f }: { days: DayWeather[]; f: boolean }) {
  // Wide and short, so it reads as a strip in the big tile and still fits a phone.
  const W = 560;
  const H = 120;
  const hot = Math.max(...days.map((d) => d.max));
  const cold = Math.min(...days.map((d) => d.min));
  const span = Math.max(hot - cold, 1);
  const x = (i: number) => (days.length === 1 ? W / 2 : 14 + (i * (W - 28)) / (days.length - 1));
  const y = (t: number) => 18 + ((hot - t) / span) * (H - 52);
  const line = (k: "max" | "min") => days.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(d[k]).toFixed(1)}`).join(" ");
  const rainOf = (d: DayWeather) => (d.rain === null ? 0 : d.source === "forecast" ? d.rain / 100 : Math.min(d.rain / 15, 1));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full overflow-visible" role="img" aria-label={`Highs from ${temp(Math.min(...days.map((d) => d.max)), f)} to ${temp(hot, f)}, lows from ${temp(cold, f)}`}>
      <defs>
        <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--sun)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--sun)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {days.map((d, i) => {
        const r = rainOf(d);
        return r > 0.05 ? <rect key={d.date} x={x(i) - 5} y={H - 2 - r * 24} width={10} height={r * 24} rx={3} fill="var(--brand)" opacity={0.35 + r * 0.4} /> : null;
      })}
      <path d={`${line("max")} L${x(days.length - 1)} ${H - 30} L${x(0)} ${H - 30} Z`} fill="url(#spark-fill)" />
      <path d={line("min")} fill="none" stroke="var(--brand-2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 5" />
      <path d={line("max")} fill="none" stroke="var(--sun)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {days.map((d, i) => (
        <g key={d.date}>
          <circle cx={x(i)} cy={y(d.max)} r={3} fill="#fff" stroke="var(--sun)" strokeWidth={2} />
          {(i === 0 || i === days.length - 1 || d.max === hot) && (
            <text x={x(i)} y={y(d.max) - 8} textAnchor="middle" className="fill-ink font-mono text-[10px]">
              {temp(d.max, f)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

const daylightHours = (d?: DayWeather) => {
  if (!d?.sunrise || !d.sunset) return null;
  const m = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
  const mins = m(d.sunset) - m(d.sunrise);
  return mins > 0 ? `${Math.floor(mins / 60)}h ${mins % 60}m of daylight` : null;
};

function WeatherTile({ text, days, className }: { text?: string; days: DayWeather[]; className?: string }) {
  const [f, setF] = useState(false);
  useEffect(() => setF(prefersF()), []);
  const first = days[0];
  const wetDays = days.filter((d) => (d.source === "forecast" ? (d.rain ?? 0) >= 40 : (d.rain ?? 0) >= 2)).length;
  const info = first ? weatherInfo(first.code) : null;
  const light = daylightHours(first);
  return (
    <Tile icon={CloudSun} label="Weather" tone="sun" className={className}>
      {days.length > 0 && (
        <>
          <p className="display mt-4 text-[2.4rem] leading-none text-ink">
            {temp(Math.max(...days.map((d) => d.max)), f)}
            <span className="ml-1 text-xl text-stone">/ {temp(Math.min(...days.map((d) => d.min)), f)}</span>
          </p>
          <p className="mt-1.5 flex flex-wrap gap-x-3 text-xs text-stone">
            {info && <span>Starts {info.label.toLowerCase()}</span>}
            <span className="inline-flex items-center gap-1">
              <Umbrella className="size-3.5 text-brand" /> {wetDays ? `${wetDays} wet ${wetDays === 1 ? "day" : "days"}` : "Mostly dry"}
            </span>
            {light && <span>{light}</span>}
          </p>
          <Sparkline days={days} f={f} />
        </>
      )}
      {text && <p className={cn("leading-snug text-ink", days.length ? "mt-3 text-sm text-ink/80" : "mt-4 text-lg")}>{text}</p>}
    </Tile>
  );
}

/* ---------------------------------- Money --------------------------------- */

function MoneyTile({ text, local, className }: { text?: string; local?: string | null; className?: string }) {
  const { currency: home, rates } = useMoney();
  useEffect(() => {
    void loadRates();
  }, []);
  const ok = local && local !== home && rates?.[local] && (home === "USD" || rates?.[home]);
  let line: string | null = null;
  if (ok) {
    const perHome = rates![local!] / (home === "USD" ? 1 : rates![home]);
    const base = [1, 10, 100, 1000].find((b) => b * perHome >= 1) ?? 1;
    line = `${formatMoney(base, home, 0)} = ${formatMoney(base * perHome, local!, base * perHome < 10 ? 2 : 0)}`;
  }
  return (
    <Tile icon={Banknote} label="Money" className={className} delay={0.05}>
      {line && (
        <p className="mt-4 font-mono text-xl text-ink">
          {line}
          <span className="ml-2 align-middle text-[10px] uppercase tracking-wider text-brand">today</span>
        </p>
      )}
      {text && <p className={cn("leading-snug text-ink/80", line ? "mt-2 text-sm" : "mt-4 text-ink")}>{text}</p>}
    </Tile>
  );
}

/* ---------------------------------- Plugs --------------------------------- */

const PLUG_TYPES = "ABCDEFGHIJKLMN";

/** "Type C/F, 230V" → { types: ["C","F"], volts: "230V" }. */
export function parsePlugs(text?: string) {
  if (!text) return { types: [] as string[], volts: null as string | null };
  const types = new Set<string>();
  for (const m of text.matchAll(/types?\s+((?:[A-N](?:\s*(?:[/,&+]|and|or)\s*)?)+)\b/gi)) {
    for (const c of m[1].toUpperCase().match(/[A-N]/g) ?? []) types.add(c);
  }
  const volts = text.match(/(\d{3})\s?v\b/i)?.[1];
  return { types: [...types].filter((t) => PLUG_TYPES.includes(t)).slice(0, 4), volts: volts ? `${volts}V` : null };
}

/** A socket face for a plug type, drawn simply enough to recognise at a glance. */
function Socket({ type }: { type: string }) {
  const hole = (cx: number, cy: number, r = 3.6) => <circle cx={cx} cy={cy} r={r} />;
  const slot = (x: number, y: number, w: number, h: number, rot = 0) => <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={1.2} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined} />;
  const holes: Record<string, ReactNode> = {
    A: <>{slot(17, 24, 3.4, 11)}{slot(31, 24, 3.4, 11)}</>,
    B: <>{slot(17, 20, 3.4, 10)}{slot(31, 20, 3.4, 10)}{hole(24, 32, 3.4)}</>,
    C: <>{hole(17, 24)}{hole(31, 24)}</>,
    D: <>{hole(16, 30)}{hole(32, 30)}{hole(24, 16, 4.6)}</>,
    E: <>{hole(16, 26)}{hole(32, 26)}<circle cx={24} cy={14} r={2.6} className="fill-current" /></>,
    F: <>{hole(16, 24)}{hole(32, 24)}{slot(24, 9, 8, 2.2)}{slot(24, 39, 8, 2.2)}</>,
    G: <>{slot(24, 15, 3.6, 10)}{slot(15, 30, 9, 3.6)}{slot(33, 30, 9, 3.6)}</>,
    H: <>{slot(16, 20, 3, 9, -30)}{slot(32, 20, 3, 9, 30)}{hole(24, 32, 3)}</>,
    I: <>{slot(16, 20, 3, 10, 30)}{slot(32, 20, 3, 10, -30)}{slot(24, 33, 3, 9)}</>,
    J: <>{hole(16, 22)}{hole(32, 22)}{hole(24, 31)}</>,
    K: <>{hole(16, 22)}{hole(32, 22)}{slot(24, 33, 5, 5)}</>,
    L: <>{hole(13, 24, 3.2)}{hole(24, 24, 3.2)}{hole(35, 24, 3.2)}</>,
    M: <>{hole(15, 31, 4.2)}{hole(33, 31, 4.2)}{hole(24, 15, 5.2)}</>,
    N: <>{hole(16, 22)}{hole(32, 22)}{hole(24, 31, 3.2)}</>,
  };
  return (
    <svg viewBox="0 0 48 48" className="size-14 text-ink" aria-hidden>
      <rect x={2} y={2} width={44} height={44} rx={type === "J" ? 18 : 12} className="fill-white stroke-line" strokeWidth={1.5} />
      <circle cx={24} cy={24} r={17} className="fill-paper-2" />
      <g className="fill-ink/80">{holes[type]}</g>
    </svg>
  );
}

function PlugTile({ text, className }: { text?: string; className?: string }) {
  const { types, volts } = parsePlugs(text);
  return (
    <Tile icon={Plug} label="Plugs" className={className} delay={0.1}>
      {types.length > 0 && (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          {types.map((t) => (
            <figure key={t} className="flex flex-col items-center gap-1">
              <Socket type={t} />
              <figcaption className="font-mono text-[11px] text-stone">Type {t}</figcaption>
            </figure>
          ))}
          {volts && <span className="mb-5 rounded-full bg-paper-2 px-2.5 py-1 font-mono text-xs text-ink">{volts}</span>}
        </div>
      )}
      {text && <p className={cn("leading-snug text-ink/80", types.length ? "mt-3 text-sm" : "mt-4 text-ink")}>{text}</p>}
    </Tile>
  );
}

/* -------------------------------- Language -------------------------------- */

function LanguageTile({ text, phrase, guide, className }: { text?: string; phrase?: string; guide?: TripGuide | null; className?: string }) {
  const { canSpeak, say, speaking } = useSpeech(guide?.languageCode);
  const p = guide?.phrases?.[0];
  return (
    <Tile icon={Languages} label="Language" tone="ink" className={className} delay={0.05}>
      {text && <p className="mt-4 text-sm text-paper/75">{text}</p>}
      {p ? (
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div className="min-w-0">
            <p className="display text-[1.7rem] leading-tight text-paper">{p.local}</p>
            <p className="mt-1 text-sm text-paper/70">
              {p.romanized && <span className="text-brand-2">{p.romanized} · </span>}
              {p.english}
            </p>
          </div>
          {canSpeak && (
            <button
              type="button"
              onClick={() => say(p.local, 0)}
              aria-label={`Hear "${p.english}" spoken`}
              className={cn("no-print grid size-11 shrink-0 place-items-center rounded-full transition-colors", speaking === 0 ? "bg-brand text-white" : "bg-paper/10 text-paper hover:bg-paper/20")}
            >
              <Volume2 className="size-5" />
            </button>
          )}
        </div>
      ) : (
        phrase && <p className="mt-auto pt-5 text-lg leading-snug text-paper">{phrase}</p>
      )}
    </Tile>
  );
}

/* --------------------------------- Tipping -------------------------------- */

/** "10–15% in restaurants" → [10, 15]; "not expected" → [0, 0]. */
export function parseTip(text?: string): [number, number] | null {
  if (!text) return null;
  if (/\b(not (expected|customary|common|necessary)|no tipping|isn'?t expected|rude)\b/i.test(text)) return [0, 0];
  const m = text.match(/(\d{1,2})\s*(?:%\s*)?(?:[-–to]+\s*(\d{1,2}))?\s*%/);
  if (!m) return null;
  const a = Number(m[1]);
  const b = m[2] ? Number(m[2]) : a;
  return a <= 30 && b <= 30 ? [Math.min(a, b), Math.max(a, b)] : null;
}

function TippingTile({ text, className }: { text?: string; className?: string }) {
  const range = parseTip(text);
  const MAX = 25;
  return (
    <Tile icon={HandCoins} label="Tipping" className={className} delay={0.1}>
      {range && (
        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <span className="display text-[1.7rem] leading-none text-ink">{range[1] === 0 ? "Not expected" : range[0] === range[1] ? `${range[0]}%` : `${range[0]}–${range[1]}%`}</span>
          </div>
          <div className="relative mt-3 h-2 rounded-full bg-paper-2">
            {range[1] === 0 ? (
              <span className="absolute -top-1 left-0 size-4 rounded-full bg-brand ring-4 ring-white" />
            ) : (
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease, delay: 0.3 }}
                className="absolute inset-y-0 origin-left rounded-full bg-gradient-to-r from-brand-2 to-brand"
                style={{ left: `${(range[0] / MAX) * 100}%`, width: `${Math.max(((range[1] - range[0]) / MAX) * 100, 3)}%` }}
              />
            )}
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[10px] text-stone">
            <span>0%</span>
            <span>10%</span>
            <span>20%</span>
            <span>25%</span>
          </div>
        </div>
      )}
      {text && <p className={cn("leading-snug text-ink/80", range ? "mt-3 text-sm" : "mt-4 text-ink")}>{text}</p>}
    </Tile>
  );
}

/* ------------------------------ The small ones ----------------------------- */

function TextTile({ icon, label, text, extra, className, delay }: { icon: typeof Plug; label: string; text?: string; extra?: ReactNode; className?: string; delay?: number }) {
  if (!text && !extra) return null;
  return (
    <Tile icon={icon} label={label} className={className} delay={delay}>
      {text && <p className="mt-4 leading-snug text-ink">{text}</p>}
      {extra}
    </Tile>
  );
}

function emergencyOf(text?: string, guide?: TripGuide | null) {
  const e = guide?.emergency;
  const numbers = e
    ? ([
        ["Police", e.police],
        ["Ambulance", e.ambulance],
        ["Fire", e.fire],
        ["Tourist help", e.tourist],
        ["Emergency", e.general],
      ].filter(([, n]) => n) as [string, string][])
    : [];
  // Without the guide, pull the first number out of the essentials line.
  if (!numbers.length && text) {
    const n = text.match(/\b\d{2,4}\b/)?.[0];
    if (n) numbers.push(["Emergency", n]);
  }
  const seen = new Set<string>();
  return numbers.filter(([, n]) => (seen.has(n) ? false : (seen.add(n), true))).slice(0, 3);
}

/**
 * Good to know, as a bento: weather with a sparkline, today's exchange rate,
 * drawn plug sockets, a phrase you can hear, a tipping scale, and the small
 * facts people look up on arrival (water, data, emergency numbers).
 */
export function EssentialsBento({ essentials, weather, localCurrency, guide }: { essentials?: Essentials; weather: DayWeather[]; localCurrency?: string | null; guide?: TripGuide | null }) {
  const e = essentials ?? {};
  const water = e.water || guide?.health?.tapWater;
  const sim = e.sim || guide?.tips?.find((t) => t.category === "connectivity")?.tip;
  const sos = emergencyOf(e.emergency, guide);
  const small = [water, sim, sos.length || e.emergency].filter(Boolean).length;
  return (
    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
      {(e.weather || weather.length > 0) && <WeatherTile text={e.weather} days={weather} className="sm:col-span-2 lg:col-span-7 lg:row-span-2" />}
      {(e.currency || localCurrency) && <MoneyTile text={e.currency} local={localCurrency} className="lg:col-span-5" />}
      {(e.language || e.phrase || guide?.phrases?.length) && <LanguageTile text={e.language} phrase={e.phrase} guide={guide} className="lg:col-span-5" />}
      {e.plugs && <PlugTile text={e.plugs} className="lg:col-span-4" />}
      {e.tipping && <TippingTile text={e.tipping} className="lg:col-span-4" />}
      <TextTile icon={TramFront} label="Getting around" text={e.gettingAround} extra={e.apps && <p className="mt-3 rounded-2xl bg-paper-2/70 px-3 py-2 text-xs text-ink/80">Apps · {e.apps}</p>} className="sm:col-span-2 lg:col-span-4" delay={0.15} />
      {small > 0 && (
        <div className={cn("grid gap-3 sm:col-span-2 lg:col-span-12", small === 3 ? "md:grid-cols-3" : small === 2 ? "md:grid-cols-2" : "")}>
          <TextTile icon={Droplets} label="Tap water" text={water} />
          <TextTile icon={Wifi} label="Mobile data" text={sim} delay={0.05} />
          {(sos.length > 0 || e.emergency) && (
            <Tile icon={Siren} label="Emergency" className="bg-[linear-gradient(135deg,#fff1ee,#fff_70%)] !ring-1 ring-destructive/15" delay={0.1}>
              {sos.length ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {sos.map(([label, n]) => (
                    <li key={label}>
                      <a href={`tel:${n.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-paper">
                        <Phone className="size-3.5 text-destructive" />
                        <span className="text-xs text-stone">{label}</span>
                        <span className="font-mono">{n}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
              {e.emergency && !guide?.emergency && <p className="mt-3 text-sm leading-snug text-ink/80">{e.emergency}</p>}
            </Tile>
          )}
        </div>
      )}
    </div>
  );
}
