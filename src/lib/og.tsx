// Server-only: renders the link-preview cards (Open Graph / Twitter) with next/og.
/* eslint-disable @next/next/no-img-element -- Satori draws plain <img>, not next/image */
import { readFile } from "fs/promises";
import path from "path";
import { ImageResponse } from "next/og";
import { getMonument, type MonumentId } from "@/components/scenes/monuments";
import type { ItineraryDetails } from "./trip";

export const OG_SIZE = { width: 1200, height: 630 };

const INK = "#0a1e2c";
const PAPER = "#f4f8f9";
const LAGOON = "#34d1bf";
const SUN = "#ffc876";

/* ------------------------------- Fonts ---------------------------------- */

/** A Google Font as TTF (Satori can't read woff2), subset to the text it draws. */
async function googleFont(family: string, axis: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}:${axis}&text=${encodeURIComponent(text)}`, {
      signal: AbortSignal.timeout(4000),
    }).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    return res.ok ? res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

type Font = { name: string; data: ArrayBuffer; weight: 400 | 500 | 600; style: "normal" | "italic" };

async function loadFonts(text: string): Promise<Font[]> {
  const [sans, sansMedium, serif] = await Promise.all([
    googleFont("Inter+Tight", "wght@600", text),
    googleFont("Inter+Tight", "wght@500", text),
    googleFont("Instrument+Serif", "ital@1", text),
  ]);
  const fonts: Font[] = [];
  if (sans) fonts.push({ name: "Inter Tight", data: sans, weight: 600, style: "normal" });
  if (sansMedium) fonts.push({ name: "Inter Tight", data: sansMedium, weight: 500, style: "normal" });
  if (serif) fonts.push({ name: "Instrument Serif", data: serif, weight: 400, style: "italic" });
  return fonts;
}

/* ------------------------------- Artwork -------------------------------- */

const SKYLINE: { id: MonumentId; s: number }[] = [
  { id: "pyramids", s: 0.34 },
  { id: "colosseum", s: 0.5 },
  { id: "eiffel", s: 0.3 },
  { id: "bigben", s: 0.28 },
  { id: "taj", s: 0.3 },
  { id: "burj", s: 0.33 },
  { id: "pagoda", s: 0.32 },
  { id: "opera", s: 0.36 },
  { id: "liberty", s: 0.29 },
  { id: "goldengate", s: 0.27 },
];

/** The footer's hairline skyline, as an SVG data URI. */
const skyline = (() => {
  const base = 200;
  let x = 10;
  const groups = SKYLINE.map(({ id, s }) => {
    const m = getMonument(id);
    const cx = x + (m.width * s) / 2;
    x += m.width * s + 30;
    const paths = m.layers
      .filter((l) => !l.noLine && !l.detail)
      .map((l) => `<path d="${l.d}" fill="none" stroke="${PAPER}" stroke-opacity="0.32" stroke-width="${(1.4 / s).toFixed(2)}" stroke-linejoin="round"/>`)
      .join("");
    return `<g transform="translate(${cx.toFixed(1)} ${(base - m.ground * s).toFixed(1)}) scale(${s})">${paths}</g>`;
  });
  const w = Math.round(x - 20);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 210" width="${w}" height="210">${groups.join("")}<path d="M0 ${base}H${w}" stroke="${PAPER}" stroke-opacity="0.32" stroke-width="1.4"/></svg>`;
  return { src: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`, width: w };
})();

let mark: Promise<string> | null = null;
const logoMark = () =>
  (mark ??= readFile(path.join(process.cwd(), "public/icon.svg"))
    .then((b) => `data:image/svg+xml;base64,${b.toString("base64")}`)
    .catch(() => ""));

/* -------------------------------- Card ---------------------------------- */

export interface OgStop {
  time: string;
  title: string;
  cost?: string;
}

export interface OgCard {
  /** Headline before the accent word, the accent (serif italic), and after it. */
  title: [string, string, string];
  subtitle: string;
  /** The tilted itinerary card on the right. */
  panel: { eyebrow: string; heading: string; stops: OgStop[]; footer: string };
}

export async function renderOgCard(card: OgCard) {
  const text = [
    "GoRoam goroam.world",
    ...card.title,
    card.subtitle,
    card.panel.eyebrow,
    card.panel.heading,
    card.panel.footer,
    ...card.panel.stops.flatMap((s) => [s.time, s.title, s.cost ?? ""]),
  ].join(" ");
  const [fonts, logo] = await Promise.all([loadFonts(text), logoMark()]);
  const sans = "Inter Tight";
  const serif = fonts.some((f) => f.name === "Instrument Serif") ? "Instrument Serif" : sans;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          fontFamily: sans,
          color: PAPER,
          background: `linear-gradient(135deg, ${INK} 0%, #0f2c3d 46%, #0b5d5a 100%)`,
          overflow: "hidden",
        }}
      >
        {/* Glows and a faint grid */}
        <div style={{ position: "absolute", left: -160, top: -220, width: 620, height: 620, borderRadius: 9999, background: "radial-gradient(circle, rgba(52,209,191,0.32), rgba(52,209,191,0) 70%)" }} />
        <div style={{ position: "absolute", right: -140, bottom: -260, width: 640, height: 640, borderRadius: 9999, background: "radial-gradient(circle, rgba(255,200,118,0.26), rgba(255,200,118,0) 70%)" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "linear-gradient(rgba(244,248,249,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(244,248,249,0.05) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Skyline */}
        <img src={skyline.src} width={1200} height={Math.round((210 * 1200) / skyline.width)} style={{ position: "absolute", left: 0, bottom: -6 }} alt="" />

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", padding: "64px 0 0 72px", width: 660 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {logo ? <img src={logo} width={52} height={52} style={{ borderRadius: 14 }} alt="" /> : null}
            <div style={{ display: "flex", fontSize: 34, fontWeight: 600, letterSpacing: "-0.04em" }}>
              <span style={{ color: LAGOON }}>Go</span>
              <span>Roam</span>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", marginTop: 54, fontSize: 82, fontWeight: 600, letterSpacing: "-0.045em", lineHeight: 1 }}>
            {card.title[0] ? <span style={{ marginRight: 20 }}>{card.title[0]}</span> : null}
            <span style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 400, fontSize: 92, letterSpacing: "-0.01em", color: SUN, marginRight: card.title[2] ? 20 : 0 }}>
              {card.title[1]}
            </span>
            {card.title[2] ? <span>{card.title[2]}</span> : null}
          </div>

          <div style={{ display: "flex", marginTop: 26, fontSize: 27, fontWeight: 500, color: "rgba(244,248,249,0.72)", letterSpacing: "-0.01em", lineHeight: 1.35, maxWidth: 560 }}>
            {card.subtitle}
          </div>

          <div style={{ display: "flex", marginTop: 30, alignItems: "center", gap: 10, fontSize: 20, fontWeight: 500, color: LAGOON }}>
            <div style={{ width: 28, height: 2, background: LAGOON }} />
            goroam.world
          </div>
        </div>

        {/* The itinerary card */}
        <div
          style={{
            position: "absolute",
            right: 70,
            top: 74,
            width: 410,
            display: "flex",
            flexDirection: "column",
            padding: "26px 28px",
            borderRadius: 30,
            background: PAPER,
            color: INK,
            transform: "rotate(3deg)",
            boxShadow: "0 40px 80px -20px rgba(0,0,0,0.55)",
          }}
        >
          <div style={{ display: "flex", fontSize: 15, fontWeight: 600, letterSpacing: "0.14em", color: "#0b8278", textTransform: "uppercase" }}>{card.panel.eyebrow}</div>
          <div style={{ display: "flex", marginTop: 8, fontSize: 36, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.05 }}>{card.panel.heading}</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 20 }}>
            {card.panel.stops.slice(0, 3).map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderTop: i ? "1px solid rgba(10,30,44,0.1)" : "none" }}>
                <div style={{ display: "flex", width: 12, height: 12, borderRadius: 9999, background: i === 0 ? "#0b8278" : i === 1 ? SUN : LAGOON }} />
                <div style={{ display: "flex", width: 62, fontSize: 16, fontWeight: 500, color: "rgba(10,30,44,0.55)" }}>{s.time}</div>
                <div style={{ display: "flex", flex: 1, fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em" }}>{s.title}</div>
                {s.cost ? <div style={{ display: "flex", fontSize: 16, fontWeight: 500, color: "rgba(10,30,44,0.55)" }}>{s.cost}</div> : null}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 14,
              alignSelf: "flex-start",
              padding: "8px 14px",
              borderRadius: 9999,
              background: "#d6f3ef",
              color: "#0b8278",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            {card.panel.footer}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined }
  );
}

/** The site-wide preview. */
export const siteCard = (): OgCard => ({
  title: ["Where will you", "wander", "next?"],
  subtitle: "Day-by-day AI trip plans with real places, honest budgets and a guide for the road.",
  panel: {
    eyebrow: "Day 1 · Kyoto",
    heading: "Temples & lantern alleys",
    stops: [
      { time: "08:30", title: "Fushimi Inari", cost: "Free" },
      { time: "12:30", title: "Nishiki Market", cost: "$18" },
      { time: "18:00", title: "Gion at dusk", cost: "$25" },
    ],
    footer: "5 days · $1,240 · 2 travellers",
  },
});

/** A shared trip's preview: its first day, on the same card. */
export function tripCard(trip: ItineraryDetails): OgCard {
  const city = trip.destination.split(",")[0].trim();
  const day = trip.itineraryData.itinerary?.[0];
  const money = (n: number) => (n > 0 ? `$${Math.round(n).toLocaleString("en-US")}` : "Free");
  const stops: OgStop[] = day
    ? (["morning", "afternoon", "evening"] as const)
        .map((slot) => day[slot])
        .filter((s) => s?.place?.name)
        .map((s) => ({ time: s.time.slice(0, 8), title: s.place.name.length > 22 ? `${s.place.name.slice(0, 21)}…` : s.place.name, cost: money(s.estimatedCost) }))
    : [];
  const days = trip.numberOfDays;
  const people = trip.numberOfPeople;
  return {
    title: [`${days} ${days === 1 ? "day" : "days"} in`, city.length > 14 ? `${city.slice(0, 13)}…` : city, ""],
    subtitle: trip.itineraryData.summary?.overview?.slice(0, 110) || "A day-by-day plan with real places and an honest budget, made with GoRoam.",
    panel: {
      eyebrow: `Day 1 · ${city}`,
      heading: day?.theme?.slice(0, 40) || "The first day",
      stops,
      footer: `${days} days · ${money(trip.budget)} · ${people} ${people === 1 ? "traveller" : "travellers"}`,
    },
  };
}
