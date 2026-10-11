import { cityOf, isoDay, mapsSearchUrl } from "./booking";
import { dayStops, type ItineraryData } from "./trip";

/*
 * One morning of the trip as a message: for the WhatsApp template (sent by
 * the daily job) and as plain text for a "Send to WhatsApp" share link.
 */

// Template parameters may not contain new lines, tabs or runs of spaces.
const param = (s: string, max = 900) => s.replace(/[\n\t]+/g, " · ").replace(/ {4,}/g, " ").trim().slice(0, max) || "-";

export interface DayMessage {
  /** The template's seven values, in order. */
  params: string[];
  /** The same message as plain text, for a wa.me share link. */
  text: string;
}

/** "Day 3 in Hampi": the stops with times, the weather, a map of the day and the trip link. */
export function dayMessage(data: ItineraryData, opts: { index: number; destination: string; startDate: string; link: string; weather?: string }): DayMessage {
  const day = data.itinerary?.[opts.index];
  const city = cityOf(day?.city ?? data.summary?.destination ?? opts.destination);
  const stops = dayStops(day);
  const lines = stops.map(({ activity: a }) => `${a.time?.split(/\s*[-–]\s*/)[0] || "Later"} ${a.place.name}`);
  const names = stops.map((s) => s.activity.place.name);
  const map = names.length
    ? `https://www.google.com/maps/dir/${names.map((n) => encodeURIComponent(`${n}, ${city}`)).join("/")}`
    : mapsSearchUrl(city, city);
  const transfer = day?.transfer ? `Travel day: ${cityOf(day.transfer.from)} to ${cityOf(day.transfer.to)} by ${day.transfer.mode}${day.transfer.depart ? `, leaving ${day.transfer.depart}` : ""}. ` : "";
  const params = [
    String(opts.index + 1),
    city,
    day?.theme || "Your plan for today",
    transfer + (lines.join(" · ") || "A free day"),
    opts.weather || "Check the forecast before heading out",
    map,
    opts.link,
  ].map((p) => param(p));
  const date = new Date(`${isoDay(opts.startDate, opts.index)}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" });
  const text = [
    `*Day ${opts.index + 1} in ${city}* · ${date}`,
    day?.theme ? `_${day.theme}_` : "",
    transfer.trim(),
    ...stops.map(({ activity: a }) => `• ${a.time?.split(/\s*[-–]\s*/)[0] || ""} ${a.place.name}`.replace("•  ", "• ")),
    opts.weather ? `Weather: ${opts.weather}` : "",
    `Map: ${map}`,
    `Full plan: ${opts.link}`,
  ]
    .filter(Boolean)
    .join("\n");
  return { params, text };
}

