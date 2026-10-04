import { cityOf, isoDay } from "./booking";
import type { ActivitySlot, ItineraryDetails } from "./trip";

const SLOT_DEFAULTS = {
  morning: [9, 0, 12, 0],
  afternoon: [13, 0, 17, 0],
  evening: [18, 30, 21, 0],
} as const;

/** "9:00 AM - 12:00 PM" → [[9,0],[12,0]]; null when it can't be read. */
function parseRange(time?: string): [[number, number], [number, number]] | null {
  if (!time) return null;
  const parts = time.split(/\s*[-–—]\s*|\s+to\s+/i);
  const read = (s?: string, fallbackMeridiem?: string): [number, number] | null => {
    const m = s?.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
    if (!m) return null;
    let h = Number(m[1]);
    const min = Number(m[2] ?? 0);
    const mer = (m[3] ?? fallbackMeridiem)?.toLowerCase();
    if (mer === "pm" && h < 12) h += 12;
    if (mer === "am" && h === 12) h = 0;
    return h < 24 && min < 60 ? [h, min] : null;
  };
  const endMer = parts[1]?.match(/(am|pm)/i)?.[1];
  const start = read(parts[0], endMer);
  const end = read(parts[1]);
  return start && end ? [start, end] : null;
}

/** RFC 5545 line folding: continuation lines start with a space. */
const fold = (line: string) => {
  const out: string[] = [];
  for (let i = 0; i < line.length; i += 73) out.push((i ? " " : "") + line.slice(i, i + 73));
  return out.join("\r\n");
};

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
const stamp = (date: string, [h, m]: [number, number]) => `${date.replace(/-/g, "")}T${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}00`;

/** An .ics calendar with every stop of the trip, in the destination's local time. */
export function buildIcs(it: ItineraryDetails) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//GoRoam//Itinerary//EN", "CALSCALE:GREGORIAN", `X-WR-CALNAME:${esc(`GoRoam · ${it.destination}`)}`];
  const now = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  (it.itineraryData?.itinerary ?? []).forEach((day, i) => {
    const date = isoDay(it.startDate, i);
    (["morning", "afternoon", "evening"] as const).forEach((key) => {
      const slot: ActivitySlot | undefined = day[key];
      if (!slot?.place?.name) return;
      const range = parseRange(slot.time);
      const d = SLOT_DEFAULTS[key];
      const [start, end] = range ?? [
        [d[0], d[1]],
        [d[2], d[3]],
      ];
      const endSafe: [number, number] = end[0] * 60 + end[1] > start[0] * 60 + start[1] ? end : [Math.min(start[0] + 2, 23), start[1]];
      const description = [slot.place.description, slot.tip ? `Tip: ${slot.tip}` : "", `Planned with GoRoam · Day ${i + 1}: ${day.theme ?? ""}`]
        .filter(Boolean)
        .join("\n\n");
      lines.push(
        "BEGIN:VEVENT",
        `UID:${it.id}-${i + 1}-${key}@goroam`,
        `DTSTAMP:${now}`,
        `DTSTART:${stamp(date, start)}`,
        `DTEND:${stamp(date, endSafe)}`,
        `SUMMARY:${esc(slot.place.name)}`,
        `LOCATION:${esc(`${slot.place.name}, ${cityOf(it.destination)}`)}`,
        `DESCRIPTION:${esc(description)}`,
        "END:VEVENT"
      );
    });
  });
  // The traveller's own bookings: flights, check-ins, tickets.
  for (const b of it.itineraryData?.bookings ?? []) {
    if (!b.start) continue;
    const [d, t] = b.start.split("T");
    const startHm: [number, number] = t ? [Number(t.slice(0, 2)), Number(t.slice(3, 5))] : [9, 0];
    const [ed, et] = (b.end ?? b.start).split("T");
    let endHm: [number, number] = et ? [Number(et.slice(0, 2)), Number(et.slice(3, 5))] : [Math.min(startHm[0] + 1, 23), startHm[1]];
    if (ed === d && endHm[0] * 60 + endHm[1] <= startHm[0] * 60 + startHm[1]) endHm = [Math.min(startHm[0] + 1, 23), startHm[1]];
    lines.push(
      "BEGIN:VEVENT",
      `UID:${it.id}-booking-${b.id}@goroam`,
      `DTSTAMP:${now}`,
      `DTSTART:${stamp(d, startHm)}`,
      `DTEND:${stamp(ed, endHm)}`,
      `SUMMARY:${esc(b.title)}`,
      ...(b.location ? [`LOCATION:${esc(b.location)}`] : []),
      `DESCRIPTION:${esc([b.ref ? `Confirmation: ${b.ref}` : "", b.notes ?? "", "Saved in GoRoam"].filter(Boolean).join("\n"))}`,
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n");
}

export function downloadIcs(it: ItineraryDetails) {
  const blob = new Blob([buildIcs(it)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cityOf(it.destination).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "trip"}-goroam.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
