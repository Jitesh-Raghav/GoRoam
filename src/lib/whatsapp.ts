// Server-only: WhatsApp Cloud API (Meta) for the trip's morning messages.
import { createHash, randomInt, timingSafeEqual } from "crypto";
import type { DayMessage } from "./day-message";

/**
 * Environment (Meta Business → WhatsApp → API setup):
 *   WHATSAPP_TOKEN          a permanent system-user access token
 *   WHATSAPP_PHONE_ID       the sending number's Phone number ID
 *   WHATSAPP_VERIFY_TOKEN   any string; the same one goes in the webhook settings
 *   WHATSAPP_APP_SECRET     the app secret, to check webhook signatures (optional but recommended)
 *   WHATSAPP_TEMPLATE_LANG  template language code, default "en"
 *
 * Two message templates, approved in WhatsApp Manager:
 *   goroam_code        (Authentication) the standard "{{1}} is your verification code." with a copy-code button
 *   goroam_daily_plan  (Utility) body:
 *     Good morning! Day {{1}} in {{2}}: {{3}}
 *     Today: {{4}}
 *     Weather: {{5}}
 *     Map: {{6}}
 *     Full plan: {{7}}
 *     Reply STOP to stop these messages.
 */
const GRAPH = "https://graph.facebook.com/v21.0";

export const whatsappConfigured = () => !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID);

/** "+91 98765 43210" → "919876543210"; null unless it looks like a full international number. */
export function normalizePhone(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const digits = input.replace(/[^\d]/g, "").replace(/^00/, "");
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
}

/** "919876543210" → "+91 ••••• 43210", for showing a number back without spelling it out. */
export const maskPhone = (p: string) => `+${p.slice(0, p.length - 10 || 1)} ••••• ${p.slice(-5)}`;

export const newCode = () => String(randomInt(100000, 1000000));
export const hashCode = (code: string, phone: string) => createHash("sha256").update(`${process.env.NEXTAUTH_SECRET ?? "goroam"}:${phone}:${code}`).digest("hex");
export function codeMatches(code: string, phone: string, hash: string | null) {
  if (!hash || !/^\d{6}$/.test(code)) return false;
  const a = Buffer.from(hashCode(code, phone), "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

async function send(body: Record<string, unknown>) {
  const res = await fetch(`${GRAPH}/${process.env.WHATSAPP_PHONE_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", ...body }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`WhatsApp ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

const lang = () => ({ code: process.env.WHATSAPP_TEMPLATE_LANG || "en" });

export function sendCode(phone: string, code: string) {
  return send({
    to: phone,
    type: "template",
    template: {
      name: "goroam_code",
      language: lang(),
      components: [
        { type: "body", parameters: [{ type: "text", text: code }] },
        { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: code }] },
      ],
    },
  });
}

export function sendDayPlan(phone: string, message: DayMessage) {
  return send({
    to: phone,
    type: "template",
    template: { name: "goroam_daily_plan", language: lang(), components: [{ type: "body", parameters: message.params.map((text) => ({ type: "text", text })) }] },
  });
}
