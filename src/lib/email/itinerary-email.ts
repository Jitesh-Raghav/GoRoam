import { cityOf, isoDay, mapsSearchUrl } from "../booking";
import { countryCodeFor } from "../flags";
import { money, titleCase, type ItineraryDetails } from "../trip";

/**
 * The itinerary as an email: table layout and inline styles only, so it looks
 * the same in Gmail, Outlook and Apple Mail.
 */

const C = { ink: "#0a1c27", paper: "#f7f6f2", brand: "#0b776d", soft: "#dcefea", stone: "#56656e", sun: "#c9893a", line: "#e6e3dc" };
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const day = (iso: string, opts: Intl.DateTimeFormatOptions) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });

const SLOTS = [
  ["morning", "Morning"],
  ["afternoon", "Afternoon"],
  ["evening", "Evening"],
] as const;

export function itineraryEmail(it: ItineraryDetails, link: string, name?: string | null) {
  const data = it.itineraryData;
  const title = titleCase(data.summary?.destination || it.destination);
  const city = cityOf(title);
  const flag = countryCodeFor(data.summary?.destination || it.destination, data.summary?.countryCode);
  const start = isoDay(it.startDate, 0);
  const end = isoDay(it.startDate, it.numberOfDays - 1);
  const dates = `${day(start, { month: "short", day: "numeric" })} – ${day(end, { month: "short", day: "numeric", year: "numeric" })}`;
  const guide = data.guide;

  const block = (inner: string, style = "") =>
    `<tr><td style="padding:0 32px;${style}">${inner}</td></tr>`;
  const heading = (eyebrow: string, text: string) =>
    `<p style="margin:36px 0 6px;font:600 11px/1 ${SANS};letter-spacing:.18em;text-transform:uppercase;color:${C.stone}">${esc(eyebrow)}</p>
     <h2 style="margin:0 0 16px;font:400 30px/1.05 ${SERIF};color:${C.ink}">${text}</h2>`;

  const days = (data.itinerary ?? [])
    .map((d, i) => {
      const stops = SLOTS.filter(([k]) => d[k]?.place?.name)
        .map(([k, label]) => {
          const s = d[k];
          return `<tr>
            <td valign="top" style="width:86px;padding:10px 0;font:600 10px/1.4 ${SANS};letter-spacing:.14em;text-transform:uppercase;color:${C.brand}">${label}<br><span style="font-weight:400;letter-spacing:0;text-transform:none;color:${C.stone}">${esc(s.time?.split(/\s*[-–]\s*/)[0] ?? "")}</span></td>
            <td valign="top" style="padding:10px 0;border-bottom:1px solid ${C.line}">
              <a href="${esc(mapsSearchUrl(s.place.name, title))}" style="font:400 18px/1.2 ${SERIF};color:${C.ink};text-decoration:none">${esc(s.place.name)}</a>
              ${s.place.area ? `<span style="font:12px ${SANS};color:${C.stone}"> · ${esc(s.place.area)}</span>` : ""}
              ${s.tip ? `<p style="margin:6px 0 0;font:13px/1.5 ${SANS};color:${C.stone}">💡 ${esc(s.tip)}</p>` : ""}
            </td>
            <td valign="top" align="right" style="width:60px;padding:10px 0;border-bottom:1px solid ${C.line};font:12px ${SANS};color:${C.ink}">${s.estimatedCost ? money(s.estimatedCost) : "Free"}</td>
          </tr>`;
        })
        .join("");
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;background:#fff;border:1px solid ${C.line};border-radius:18px">
        <tr><td style="padding:18px 20px 6px">
          <p style="margin:0;font:600 10px/1 ${SANS};letter-spacing:.18em;text-transform:uppercase;color:${C.stone}">Day ${String(i + 1).padStart(2, "0")} · ${day(isoDay(it.startDate, i), { weekday: "short", month: "short", day: "numeric" })}</p>
          <p style="margin:8px 0 4px;font:400 24px/1.1 ${SERIF};color:${C.ink}">${esc(d.theme || `Day ${i + 1}`)}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${stops}</table>
          ${d.dayTip ? `<p style="margin:12px 0 10px;padding:10px 12px;border-radius:12px;background:${C.soft};font:13px/1.5 ${SANS};color:${C.ink}"><b>Today's trick:</b> ${esc(d.dayTip)}</p>` : `<div style="height:10px"></div>`}
        </td></tr>
      </table>`;
    })
    .join("");

  const stays = (data.stays ?? [])
    .map(
      (s) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid ${C.line}">
          <span style="font:400 18px/1.2 ${SERIF};color:${C.ink}">${esc(s.name)}</span>
          <span style="font:12px ${SANS};color:${C.stone}"> · ${esc(s.area)}</span>
          <p style="margin:4px 0 0;font:13px/1.5 ${SANS};color:${C.stone}">${esc(s.why)}</p>
        </td><td align="right" valign="top" style="padding:10px 0;border-bottom:1px solid ${C.line};font:12px ${SANS};color:${C.ink};white-space:nowrap">${s.pricePerNight ? `${money(s.pricePerNight)}/night` : ""}</td></tr>`
    )
    .join("");

  const phrases = (guide?.phrases ?? [])
    .map(
      (p) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid ${C.line};font:14px ${SANS};color:${C.stone}">${esc(p.english)}</td>
         <td align="right" style="padding:8px 0;border-bottom:1px solid ${C.line};font:16px ${SERIF};color:${C.ink}">${esc(p.local)}${p.romanized ? `<br><span style="font:12px ${SANS};color:${C.stone}">${esc(p.romanized)}</span>` : ""}</td></tr>`
    )
    .join("");

  const food = (guide?.food ?? [])
    .map((f) => `<li style="margin:0 0 8px;font:14px/1.5 ${SANS};color:${C.ink}"><b>${esc(f.name)}</b>${f.whereToTry ? ` <span style="color:${C.stone}">· try it at ${esc(f.whereToTry)}</span>` : ""}</li>`)
    .join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} · GoRoam</title></head>
<body style="margin:0;padding:0;background:${C.paper}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px">
  <tr><td style="padding:0 0 18px;font:400 22px ${SERIF};color:${C.ink}">GoRoam</td></tr>
  <tr><td style="border-radius:28px;background:${C.ink};background-image:linear-gradient(135deg,${C.brand} 0%,#0b4f5c 50%,${C.ink} 100%);padding:40px 32px;color:${C.paper}">
    <p style="margin:0;font:600 11px/1 ${SANS};letter-spacing:.18em;text-transform:uppercase;color:#bfe9e3">${it.numberOfDays} ${it.numberOfDays === 1 ? "day" : "days"} · ${esc(dates)}</p>
    <h1 style="margin:14px 0 0;font:400 52px/0.95 ${SERIF};color:#fff">${flag ? `<img src="https://flagcdn.com/w80/${flag}.png" width="40" alt="" style="vertical-align:middle;border-radius:4px;margin-right:10px">` : ""}${esc(title)}</h1>
    ${data.summary?.overview ? `<p style="margin:16px 0 0;font:15px/1.6 ${SANS};color:#d8e6ea">${esc(data.summary.overview)}</p>` : ""}
    <p style="margin:26px 0 0"><a href="${esc(link)}" style="display:inline-block;padding:13px 22px;border-radius:999px;background:${C.sun};font:600 14px ${SANS};color:${C.ink};text-decoration:none">Open the full itinerary →</a></p>
  </td></tr>
  ${block(`<p style="margin:24px 0 0;font:15px/1.6 ${SANS};color:${C.stone}">Hi${name ? ` ${esc(name.split(" ")[0])}` : ""}, here's your ${esc(city)} plan, ready for offline. The calendar file attached adds every stop to your calendar.</p>`)}
  ${block(heading("The plan", "Day by day") + days)}
    ${stays ? block(heading("Where to stay", "Pick your base") + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${stays}</table>`) : ""}
    ${phrases ? block(heading(guide?.language ? `Speak ${guide.language}` : "Phrases", "Five phrases") + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${phrases}</table>`) : ""}
    ${food ? block(heading("Eat", "Must-try food") + `<ul style="margin:0;padding-left:18px">${food}</ul>`) : ""}
  ${block(`<p style="margin:40px 0 0;padding-top:20px;border-top:1px solid ${C.line};font:12px/1.6 ${SANS};color:${C.stone}">Sent by GoRoam because you asked for it from your itinerary. Prices are estimates; check opening hours before you go.</p>`)}
</table>
</td></tr></table>
</body></html>`;

  const text = [
    `${title} · ${dates}`,
    "",
    ...(data.itinerary ?? []).flatMap((d, i) => [
      `Day ${i + 1}: ${d.theme ?? ""}`,
      ...SLOTS.filter(([k]) => d[k]?.place?.name).map(([k, label]) => `  ${label}: ${d[k].place.name}`),
      "",
    ]),
    `Open the full itinerary: ${link}`,
  ].join("\n");

  return { subject: `Your ${city} itinerary · ${dates}`, html, text };
}
