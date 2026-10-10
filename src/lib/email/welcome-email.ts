import { SITE_URL } from "../seo";

/**
 * The welcome email for a new traveller: table layout and inline styles only,
 * so it renders the same in Gmail, Outlook and Apple Mail.
 */

const C = { ink: "#0a1e2c", ink2: "#133246", paper: "#f4f8f9", brand: "#0b8278", lagoon: "#34d1bf", soft: "#d6f3ef", stone: "#54707f", sun: "#ffc876", line: "#e3ecef" };
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const FEATURES = [
  { icon: "✦", title: "One sentence in, a whole trip out", body: "Type it like you'd text a friend: \"4 days in Goa with friends, beaches and seafood\". GoRoam plans every morning, afternoon and evening with real places, timings and costs." },
  { icon: "↗", title: "Share it with your crew", body: "Send one link. Friends vote on each stop, and the trip wallet splits the bills so nobody has to chase anyone." },
  { icon: "☂", title: "Built for the road", body: "Live weather, a currency converter, a local guide with phrases and dishes to try, plus an offline PDF and calendar." },
];

const PICKS = [
  { title: "3 days in Goa", note: "Beaches, Portuguese lanes, sunset shacks", slug: "goa-3-days" },
  { title: "5 days in Kerala", note: "Backwaters, tea hills and spice markets", slug: "kerala-5-days" },
  { title: "5 days in Japan", note: "Tokyo neon to Kyoto temples", slug: "japan-5-days" },
];

const button = (href: string, label: string) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="border-radius:999px;background:${C.brand};">
      <a href="${href}" style="display:inline-block;padding:14px 26px;font-family:${SANS};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">${label} &rarr;</a>
    </td>
  </tr></table>`;

export function welcomeEmail(name?: string | null) {
  const first = (name ?? "").trim().split(/\s+/)[0];
  const hello = first ? `Welcome aboard, ${esc(first)}` : "Welcome aboard";
  const plan = `${SITE_URL}/dashboard?utm_source=welcome_email&utm_medium=email`;
  const gallery = `${SITE_URL}/itineraries?utm_source=welcome_email&utm_medium=email`;
  const subject = first ? `${first}, your first trip is on us ✈️` : "Your first trip is on us ✈️";

  const features = FEATURES.map(
    (f) => `
    <tr><td style="padding:0 0 18px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
        <td width="44" valign="top">
          <div style="width:36px;height:36px;border-radius:12px;background:${C.soft};color:${C.brand};font-family:${SANS};font-size:17px;line-height:36px;text-align:center;">${f.icon}</div>
        </td>
        <td valign="top" style="font-family:${SANS};">
          <div style="font-size:15px;font-weight:600;color:${C.ink};">${f.title}</div>
          <div style="margin-top:4px;font-size:14px;line-height:1.55;color:${C.stone};">${esc(f.body)}</div>
        </td>
      </tr></table>
    </td></tr>`
  ).join("");

  const picks = PICKS.map(
    (p) => `
    <tr><td style="padding:0 0 10px;">
      <a href="${SITE_URL}/itineraries/${p.slug}?utm_source=welcome_email&utm_medium=email" style="display:block;text-decoration:none;border:1px solid ${C.line};border-radius:16px;padding:14px 16px;">
        <span style="display:block;font-family:${SANS};font-size:15px;font-weight:600;color:${C.ink};">${p.title}</span>
        <span style="display:block;margin-top:2px;font-family:${SANS};font-size:13px;color:${C.stone};">${p.note}</span>
      </a>
    </td></tr>`
  ).join("");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${C.paper};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Plan a whole trip from one sentence. Your first itinerary is free.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.paper};">
    <tr><td align="center" style="padding:28px 14px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

        <tr><td style="padding:0 6px 18px;font-family:${SANS};font-size:20px;font-weight:600;letter-spacing:-0.02em;color:${C.ink};">
          <span style="color:${C.brand};">Go</span>Roam
        </td></tr>

        <tr><td style="border-radius:28px;background:${C.ink};background-image:linear-gradient(135deg,${C.ink} 0%,${C.ink2} 55%,#0b5d5a 100%);padding:40px 32px;">
          <div style="font-family:${SANS};font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:${C.lagoon};">Your boarding pass is ready</div>
          <h1 style="margin:12px 0 0;font-family:${SANS};font-size:34px;line-height:1.08;font-weight:500;letter-spacing:-0.03em;color:#ffffff;">${hello}. <span style="color:${C.lagoon};">Where to first?</span></h1>
          <p style="margin:16px 0 26px;font-family:${SANS};font-size:16px;line-height:1.6;color:rgba(244,248,249,0.78);">
            Your first itinerary is on us. Tell GoRoam where you're dreaming of going, and you'll get a day-by-day plan with real places, timings and an honest budget in under a minute.
          </p>
          ${button(plan, "Plan my first trip")}
        </td></tr>

        <tr><td style="padding:30px 8px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${features}</table>
        </td></tr>

        <tr><td style="border-radius:24px;background:#ffffff;border:1px solid ${C.line};padding:24px 22px 14px;">
          <div style="font-family:${SANS};font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:${C.stone};">Need ideas? Start from these</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">${picks}</table>
          <div style="padding:4px 0 10px;font-family:${SANS};font-size:14px;"><a href="${gallery}" style="color:${C.brand};font-weight:600;text-decoration:none;">Browse the trip gallery &rarr;</a></div>
        </td></tr>

        <tr><td style="padding:26px 8px 0;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.ink};">
          I built GoRoam because planning a trip shouldn't take longer than the trip. If anything feels off, or you have an idea, just reply to this email. It comes straight to me.<br><br>
          Happy roaming,<br><strong>Jitesh</strong>, maker of GoRoam
        </td></tr>

        <tr><td style="padding:30px 8px 0;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.stone};border-top:1px solid ${C.line};">
          <div style="padding-top:16px;">You're getting this because you just created a GoRoam account. It's a one-time welcome note, not a newsletter.</div>
          <div>GoRoam · Operated by Jitesh Raghav · Gurgaon, India · <a href="mailto:jitesh@goroam.world" style="color:${C.stone};">jitesh@goroam.world</a></div>
          <div><a href="${SITE_URL}/privacy" style="color:${C.stone};">Privacy</a> · <a href="${SITE_URL}/terms" style="color:${C.stone};">Terms</a></div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    `${hello}. Where to first?`,
    "",
    "Your first itinerary is on us. Tell GoRoam where you're dreaming of going and get a day-by-day plan with real places, timings and an honest budget in under a minute.",
    "",
    `Plan my first trip: ${plan}`,
    "",
    ...FEATURES.flatMap((f) => [`* ${f.title}: ${f.body}`]),
    "",
    "Need ideas?",
    ...PICKS.map((p) => `- ${p.title} (${p.note}): ${SITE_URL}/itineraries/${p.slug}`),
    "",
    "If anything feels off, just reply. It comes straight to me.",
    "Happy roaming,",
    "Jitesh, maker of GoRoam",
    "",
    "GoRoam · Operated by Jitesh Raghav · Gurgaon, India · jitesh@goroam.world",
  ].join("\n");

  return { subject, html, text };
}
