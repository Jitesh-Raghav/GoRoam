"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Check, Clock3, Loader2, Trash2, WhatsApp } from "@/components/site/icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { dayMessage } from "@/lib/day-message";
import { useMoney } from "@/lib/money";
import type { ItineraryDetails } from "@/lib/trip";
import { cn } from "@/lib/utils";

/** Dialling codes for the countries most visitors come from, to start the number field. */
const DIAL: Record<string, string> = { in: "91", us: "1", ca: "1", gb: "44", ae: "971", sg: "65", au: "61", nz: "64", de: "49", fr: "33", es: "34", it: "39", nl: "31", jp: "81", my: "60", id: "62", th: "66", lk: "94", np: "977", bd: "880", pk: "92", sa: "966", qa: "974", za: "27", ie: "353", ch: "41" };

interface Sub {
  id: string;
  phone: string;
  name: string | null;
  verified: boolean;
  stopped: boolean;
}

/** wa.me with a day's plan as text: works for anyone, no setup needed. */
export function whatsappShareHref(it: ItineraryDetails, index: number, link: string) {
  const { text } = dayMessage(it.itineraryData, { index, destination: it.destination, startDate: it.startDate, link });
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Trip tools: the day's plan on WhatsApp every morning of the trip, for the
 * traveller and their group. Each number confirms with a code; anyone can
 * reply STOP. Without the WhatsApp API switched on (or on Starter), it falls
 * back to sending today's plan by hand.
 */
export function WhatsAppCard({ it, timezone, dayIndex }: { it: ItineraryDetails; timezone?: string | null; dayIndex: number }) {
  const { country } = useMoney();
  const [state, setState] = useState<{ configured: boolean; allowed: boolean; hour: number; link: string; subs: Sub[] } | null>(null);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [pending, setPending] = useState<Sub | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/itinerary/${it.id}/whatsapp`)
      .then((r) => r.json())
      .then((b) => b.success && setState({ configured: b.configured, allowed: b.allowed, hour: b.hour, link: b.link, subs: b.subs }))
      .catch(() => {});
  }, [it.id]);

  // The daily job needs the trip's own time zone to know when morning is.
  useEffect(() => {
    if (!timezone) return;
    fetch(`/api/itinerary/${it.id}/whatsapp`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ timezone }) }).catch(() => {});
  }, [it.id, timezone]);

  useEffect(() => {
    if (!phone && country && DIAL[country]) setPhone(`+${DIAL[country]} `);
  }, [country, phone]);

  const call = async (method: string, body?: unknown, query = "") => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/itinerary/${it.id}/whatsapp${query}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || "Something went wrong.");
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const add = async () => {
    const data = await call("POST", { phone, name });
    if (data) {
      setPending(data.sub);
      setCode("");
    }
  };
  const verify = async () => {
    if (!pending) return;
    const data = await call("PUT", { id: pending.id, code });
    if (data) {
      setState((s) => (s ? { ...s, subs: [...s.subs.filter((x) => x.id !== data.sub.id), data.sub] } : s));
      setPending(null);
      setPhone("");
      setName("");
      track("whatsapp_subscribed");
    }
  };
  const remove = async (id: string) => {
    if (await call("DELETE", undefined, `?id=${id}`)) setState((s) => (s ? { ...s, subs: s.subs.filter((x) => x.id !== id) } : s));
  };
  const setHour = async (hour: number) => {
    setState((s) => (s ? { ...s, hour } : s));
    await call("PATCH", { hour });
  };

  const auto = state?.configured && state.allowed;
  const verified = state?.subs.filter((s) => s.verified && !s.stopped) ?? [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="print:hidden overflow-hidden rounded-[28px] bg-white ring-1 ring-line"
    >
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div>
          <span className="grid size-12 place-items-center rounded-2xl bg-[#25d366] text-white shadow-[0_14px_30px_-14px_rgba(37,211,102,0.9)]">
            <WhatsApp className="size-6" />
          </span>
          <h3 className="display mt-4 text-[1.9rem] leading-[1.02] text-ink">
            Every morning, <span className="accent">on WhatsApp.</span>
          </h3>
          <p className="mt-3 max-w-md leading-relaxed text-stone">
            &ldquo;Day 3 in Hampi&rdquo;: the day&apos;s stops and times, the weather, a map of the route and the full plan, sent to you and your group before breakfast on every day of the trip.
          </p>
          <a
            href={whatsappShareHref(it, dayIndex, state?.link ?? (typeof window !== "undefined" ? `${window.location.origin}/trip/${it.id}` : ""))}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("whatsapp_shared", { day: dayIndex + 1 })}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm text-paper transition-colors hover:bg-[#1da851]"
          >
            <WhatsApp className="size-4" /> Send day {dayIndex + 1} to WhatsApp now
          </a>
        </div>

        <div className="rounded-[22px] bg-paper-2/60 p-5">
          {!state ? (
            <div className="skeleton h-40 rounded-2xl" />
          ) : !state.allowed ? (
            <div>
              <p className="eyebrow text-[0.6rem] text-stone">Automatic morning messages</p>
              <p className="mt-2 text-ink">Included with the Explorer and Adventurer packs, for everyone on the trip.</p>
              <Link href="/dashboard/credits?plan=explorer" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-ink">
                See Explorer <ArrowUpRight className="size-4" />
              </Link>
              <p className="mt-3 text-xs text-stone">Until then, send each day by hand with the button.</p>
            </div>
          ) : !state.configured ? (
            <p className="text-sm text-stone">Automatic messages are being switched on. Send each day by hand with the button for now.</p>
          ) : (
            <div>
              <p className="eyebrow text-[0.6rem] text-stone">Who gets it</p>
              <ul className="mt-3 space-y-2">
                {state.subs.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 ring-1 ring-line">
                    <span className={cn("grid size-7 place-items-center rounded-full", s.verified && !s.stopped ? "bg-[#25d366]/15 text-[#1da851]" : "bg-paper-2 text-stone")}>
                      {s.verified && !s.stopped ? <Check className="size-3.5" /> : <Clock3 className="size-3.5" />}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-ink">
                      {s.name ? `${s.name} · ` : ""}
                      <span className="font-mono text-xs text-stone">{s.phone}</span>
                    </span>
                    <span className="text-[11px] text-stone">{s.stopped ? "replied STOP" : s.verified ? "on" : "unconfirmed"}</span>
                    <button type="button" onClick={() => remove(s.id)} aria-label="Remove number" className="grid size-7 place-items-center rounded-full text-stone hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                ))}
                {!state.subs.length && <li className="text-sm text-stone">Add your number, then your group&apos;s.</li>}
              </ul>

              {pending ? (
                <div className="mt-4 rounded-2xl bg-white p-3 ring-1 ring-brand/40">
                  <p className="text-sm text-ink">We sent a 6-digit code to {pending.phone} on WhatsApp.</p>
                  <div className="mt-2 flex gap-2">
                    <input
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="123456"
                      aria-label="Code"
                      className="min-w-0 flex-1 rounded-xl bg-paper-2 px-3 py-2 font-mono tracking-[0.3em] text-ink outline-none focus:ring-2 focus:ring-brand/40"
                    />
                    <button type="button" onClick={verify} disabled={busy || code.length !== 6} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 text-sm text-paper hover:bg-brand disabled:opacity-40">
                      {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Confirm
                    </button>
                  </div>
                </div>
              ) : (
                auto && (
                  <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_9.5rem_auto]">
                    <input value={phone} onChange={(e) => setPhone(e.target.value.slice(0, 20))} inputMode="tel" autoComplete="tel" placeholder="+91 98765 43210" aria-label="WhatsApp number with country code" className="min-w-0 rounded-xl bg-white px-3 py-2.5 text-sm text-ink ring-1 ring-line outline-none focus:ring-2 focus:ring-brand/40" />
                    <input value={name} onChange={(e) => setName(e.target.value.slice(0, 40))} placeholder="Name (optional)" aria-label="Name" className="min-w-0 rounded-xl bg-white px-3 py-2.5 text-sm text-ink ring-1 ring-line outline-none focus:ring-2 focus:ring-brand/40" />
                    <button type="button" onClick={add} disabled={busy || phone.replace(/\D/g, "").length < 8} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#25d366] px-4 py-2.5 text-sm text-white transition-colors hover:bg-[#1da851] disabled:opacity-40">
                      {busy ? <Loader2 className="size-4 animate-spin" /> : <WhatsApp className="size-4" />} Send code
                    </button>
                  </div>
                )
              )}

              <label className="mt-4 flex items-center gap-2 text-sm text-stone">
                <Clock3 className="size-4 text-brand" /> Send at
                <select value={state.hour} onChange={(e) => setHour(Number(e.target.value))} className="cursor-pointer rounded-full bg-white px-3 py-1 text-ink ring-1 ring-line">
                  {[5, 6, 7, 8, 9, 10].map((h) => (
                    <option key={h} value={h}>
                      {h}:00 AM
                    </option>
                  ))}
                </select>
                local time
              </label>
              {verified.length > 0 && <p className="mt-2 text-xs text-stone">{verified.length} {verified.length === 1 ? "number gets" : "numbers get"} each morning of the trip. Reply STOP to any message to stop.</p>}
            </div>
          )}
          {error && <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        </div>
      </div>
    </motion.section>
  );
}
