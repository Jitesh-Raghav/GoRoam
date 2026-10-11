"use client";

import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { CalendarDays, Compass, Heart, Mic, Route, MapPin, Send, Sparkles, Users, Wallet, Zap, Plus, Check } from "@/components/site/icons";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { track } from "@/lib/analytics";
import { PillButton } from "@/components/site/pill";
import { useTypewriter } from "@/components/site/trip-prompt";
import { formatMoney } from "@/lib/currency";
import { useMoney } from "@/lib/money";
import { parseTripPrompt, plannerHref, type ParsedPrompt } from "@/lib/prompt-parse";
import { COMPANIONS, VIBES, labelFor } from "@/lib/trip";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const EXAMPLES = [
  "7 days in Japan this October, food markets, quiet temples and a hike or two, away from the crowds.",
  "A 5-day honeymoon in Bali with sunsets, a spa day and great seafood.",
  "Long weekend in Lisbon with friends, around $1,200, nightlife and pastéis de nata.",
  "10 days in Rajasthan with the kids: forts, palaces and vegetarian food.",
];

/** What the composer understood so far, as small chips. */
function understood(p: ParsedPrompt) {
  const chips: { key: string; icon: typeof MapPin; text: string }[] = [];
  if (p.destination) chips.push({ key: "where", icon: MapPin, text: p.legs && p.legs.length > 1 ? p.legs.map((l) => l.city).join(" → ") : p.destination });
  if (p.days || p.month) chips.push({ key: "when", icon: CalendarDays, text: [p.days && `${p.days} ${p.days === 1 ? "day" : "days"}`, p.month].filter(Boolean).join(" · ") });
  if (p.companions) chips.push({ key: "who", icon: Users, text: labelFor(COMPANIONS, p.companions) });
  if (p.budget) chips.push({ key: "budget", icon: Wallet, text: formatMoney(p.budget, p.budgetCurrency ?? "USD", 0) });
  if (p.interests.length) chips.push({ key: "vibes", icon: Heart, text: p.interests.slice(0, 3).map((i) => labelFor(VIBES, i)).join(", ") });
  return chips;
}

// The planning overlay, only loaded when a guest trip is being made.
const GeneratingOverlay = dynamic(() => import("@/components/dashboard/generating-overlay").then((m) => m.GeneratingOverlay), { ssr: false });

/* ---------------------------------------------------------------------------------------------- */
/* Voice: the browser's own speech recognition, where there is one (Chrome, Edge, Safari).        */
/* ---------------------------------------------------------------------------------------------- */

interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}
type RecognitionCtor = new () => Recognition;
const speechApi = () =>
  typeof window === "undefined" ? undefined : ((window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: RecognitionCtor }).webkitSpeechRecognition);

function useDictation(onText: (text: string, final: boolean) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const rec = useRef<Recognition | null>(null);
  const cb = useRef(onText);
  cb.current = onText;

  useEffect(() => setSupported(!!speechApi()), []);
  useEffect(() => () => rec.current?.stop(), []);

  const toggle = () => {
    if (listening) return rec.current?.stop();
    const Api = speechApi();
    if (!Api) return;
    const r = new Api();
    r.lang = navigator.language || "en-IN";
    r.interimResults = true;
    r.continuous = false;
    r.onresult = (e) => {
      let text = "";
      let final = false;
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
        if (e.results[i].isFinal) final = true;
      }
      cb.current(text, final);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    rec.current = r;
    try {
      r.start();
      setListening(true);
      track("hero_voice_started");
    } catch {
      setListening(false);
    }
  };
  return { supported, listening, toggle };
}

/* ---------------------------------------------------------------------------------------------- */
/* Quick pickers: When, Who, Budget. Each writes a phrase into the prompt, replacing its last one. */
/* ---------------------------------------------------------------------------------------------- */

type PickKey = "when" | "who" | "budget";

function Picker({ icon: Icon, label, value, open, onOpen, children }: { icon: typeof MapPin; label: string; value?: string; open: boolean; onOpen: (v: boolean) => void; children: ReactNode }) {
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => onOpen(!open)}
        aria-expanded={open}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] ring-1 ring-inset transition-colors",
          value ? "bg-brand-soft text-brand ring-brand/25" : "bg-white/45 text-ink/80 ring-white/60 hover:bg-white/80 hover:text-ink"
        )}
      >
        <Icon className="size-3.5" />
        <span className="max-w-[9rem] truncate">{value ?? label}</span>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <button type="button" aria-hidden tabIndex={-1} className="fixed inset-0 z-30 cursor-default" onClick={() => onOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.97 }}
              transition={{ duration: 0.16 }}
              role="menu"
              className="absolute left-0 top-[calc(100%+0.4rem)] z-40 w-72 max-w-[calc(100vw-2.5rem)] rounded-2xl bg-white p-2 text-left shadow-[0_28px_60px_-24px_rgba(14,31,59,0.6)] ring-1 ring-line"
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Option({ children, on, onClick }: { children: ReactNode; on?: boolean; onClick: () => void }) {
  return (
    <button type="button" role="menuitem" onClick={onClick} className={cn("flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm transition-colors", on ? "bg-brand-soft text-brand" : "text-ink hover:bg-paper-2")}>
      {children}
      {on && <Check className="size-3.5" />}
    </button>
  );
}

/* ---------------------------------------------------------------------------------------------- */

export interface QuickAction {
  label: string;
  icon: typeof MapPin;
  /** Text to start from; "…" marks where the cursor goes. */
  text?: string;
  href?: string;
}

const QUICK: QuickAction[] = [
  { label: "Create a new trip", icon: Plus, text: "A trip to …" },
  { label: "Inspire me where to go", icon: Compass, href: "/dashboard?inspire=1" },
  { label: "Plan a road trip", icon: Route, text: "A 5-day road trip from … through the hills, with scenic stops and good food on the way." },
  { label: "Plan a last-minute escape", icon: Zap, text: "A weekend getaway this Friday from … with nature and good food, on a small budget." },
  { label: "Multi-city trip", icon: MapPin, text: "8 days across Delhi, Jaipur and Udaipur: forts, bazaars and a lake sunset." },
];

/**
 * Describe a trip in one sentence: the home page's (and the "Plan a trip for…"
 * pages') prompt box. Quick pickers write the when, who and budget into the
 * text, the mic dictates it, and quick actions underneath start common trips.
 * Signed out, the first trip is planned right here; signed in, it opens the
 * planner pre-filled.
 */
export function TripComposer({ ready = true, delay = 0, seed, tone = "hero", actions = true }: { ready?: boolean; delay?: number; seed?: string; tone?: "hero" | "light"; actions?: boolean }) {
  const router = useRouter();
  const { status } = useSession();
  const [guest, setGuest] = useState<{ destination: string; days: number } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const id = useId();
  const area = useRef<HTMLTextAreaElement>(null);
  const shake = useAnimationControls();
  const [text, setText] = useState(seed ?? "");
  const [focused, setFocused] = useState(false);
  const [parsed, setParsed] = useState<ParsedPrompt | null>(null);
  const [menu, setMenu] = useState<PickKey | null>(null);
  const [picked, setPicked] = useState<Partial<Record<PickKey, { label: string; phrase: string }>>>({});
  const typed = useTypewriter(ready && !text && !focused, EXAMPLES);
  const { toUsd, fmt } = useMoney();
  // Dictation appends to whatever was there when the mic started.
  const before = useRef("");
  const voice = useDictation((spoken, final) => {
    const base = before.current.trim();
    setText(base ? `${base} ${spoken}` : spoken.replace(/^./, (c) => c.toUpperCase()));
    if (final) before.current = "";
  });
  const dark = tone === "hero";

  // Read the description as it's typed, a beat after the last keystroke.
  useEffect(() => {
    const t = window.setTimeout(() => setParsed(text.trim() ? parseTripPrompt(text) : null), 220);
    return () => window.clearTimeout(t);
  }, [text]);

  // Grow with the text, up to five lines.
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, [text]);

  const chips = useMemo(() => (parsed ? understood(parsed) : []), [parsed]);

  const focusAt = (value: string) => {
    requestAnimationFrame(() => {
      const el = area.current;
      if (!el) return;
      el.focus();
      const gap = value.indexOf("…");
      if (gap >= 0) el.setSelectionRange(gap, gap + 1);
      else el.setSelectionRange(value.length, value.length);
    });
  };

  /** Put a picker's phrase into the prompt, replacing the one it wrote before. */
  const pick = (key: PickKey, label: string, phrase: string) => {
    setMenu(null);
    const prev = picked[key]?.phrase;
    let next = text.trim();
    // Its last phrase may have been capitalised as the opening words, so match without case.
    const at = prev ? next.toLowerCase().indexOf(prev.toLowerCase()) : -1;
    if (prev && at >= 0) next = next.slice(0, at) + (at === 0 ? phrase.replace(/^./, (c) => c.toUpperCase()) : phrase) + next.slice(at + prev.length);
    else if (!next) next = phrase.replace(/^./, (c) => c.toUpperCase());
    else next = `${next.replace(/[.\s]+$/, "")}, ${phrase}`;
    setPicked((p) => ({ ...p, [key]: { label, phrase } }));
    setText(next);
    focusAt(next);
    track("hero_picker_used", { key });
  };

  const submit = () => {
    const value = text.trim();
    if (!value || /…/.test(value)) {
      focusAt(value);
      shake.start({ x: [0, -8, 7, -5, 3, 0], transition: { duration: 0.45 } });
      return;
    }
    const p = parseTripPrompt(value);
    track("hero_prompt_submitted", { length: value.length });
    // A bare place name ("Lisbon") is a destination even if we've never heard of it.
    if (!p.destination && value.split(/\s+/).length <= 4 && !/\d/.test(value)) p.destination = value;
    if (status === "authenticated" || !p.destination) return router.push(plannerHref(p));
    void planAsGuest(p);
  };

  // Signed out: plan the first trip right here, no account needed. Days 2+ unlock on sign-in.
  const planAsGuest = async (p: ParsedPrompt) => {
    const days = Math.min(p.days ?? 3, 7);
    setNotice(null);
    setGuest({ destination: p.destination!, days });
    // Guest trips are planned in USD; a budget in another currency is converted at today's rate.
    const budget = p.budget && (!p.budgetCurrency || p.budgetCurrency === "USD" ? p.budget : toUsd(p.budget, p.budgetCurrency));
    try {
      const res = await fetch("/api/guest-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: p.destination, days, budget: budget ? Math.round(budget) : undefined, startDate: p.startDate, companions: p.companions, interests: p.interests }),
      });
      const body = await res.json().catch(() => ({}));
      if (body.id) {
        if (!body.existing) track("guest_trip_generated", { destination: p.destination, days });
        router.push(`/try/${body.id}`);
        return;
      }
      setGuest(null);
      if (body.signedIn) return router.push(plannerHref(p));
      if (body.limited) {
        track("guest_trip_limited", { destination: p.destination });
        return void router.push(`/auth?callbackUrl=${encodeURIComponent(plannerHref(p))}`);
      }
      setNotice(body.error ?? "We couldn't plan that just now. Try again in a moment.");
    } catch {
      setGuest(null);
      setNotice("We couldn't reach GoRoam. Check your connection and try again.");
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const quick = (a: QuickAction) => {
    track("hero_quick_action", { action: a.label });
    if (a.href) {
      if (status === "authenticated") return router.push(a.href);
      return router.push(`/auth?callbackUrl=${encodeURIComponent(a.href)}`);
    }
    if (a.text) {
      setText(a.text);
      setPicked({});
      focusAt(a.text);
    }
  };

  // The next six months, for "When".
  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => new Date(now.getFullYear(), now.getMonth() + i + 1, 1).toLocaleString("en", { month: "long" }));
  }, []);
  const WHEN = [
    { label: "This weekend", phrase: "this weekend" },
    { label: "Long weekend", phrase: "a long weekend" },
    { label: "Next month", phrase: "next month" },
    ...months.map((m) => ({ label: m, phrase: `in ${m}` })),
  ];
  const WHO = [
    { label: "Solo", phrase: "travelling solo" },
    { label: "Couple", phrase: "as a couple" },
    { label: "Family with kids", phrase: "with family and kids" },
    { label: "Friends", phrase: "with friends" },
  ];
  const BUDGET = [300, 1000, 2500].map((usd, i) => {
    const amount = fmt(usd);
    return { label: [`Under ${amount}`, `Around ${amount}`, `${amount}+`][i], phrase: [`under ${amount}`, `around ${amount}`, `around ${amount}, comfortable`][i] };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      animate={ready ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 1.2, ease, delay: delay + 0.55 }}
      className="mx-auto w-full max-w-[46rem]"
    >
      {/* Portalled: the composer sits in a transformed container, which would trap a fixed overlay. */}
      {guest && createPortal(<GeneratingOverlay destination={guest.destination} days={guest.days} />, document.body)}
      {notice && (
        <p role="alert" className="mb-3 rounded-2xl bg-white/80 px-4 py-2.5 text-sm text-ink ring-1 ring-sun/40 backdrop-blur">
          {notice}
        </p>
      )}
      <motion.form
        animate={shake}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className={cn(
          "group/composer relative isolate z-20 rounded-[28px] p-2 text-left ring-1 ring-inset transition-[background-color,box-shadow] duration-500",
          dark
            ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(255,255,255,0.46))] shadow-[0_40px_90px_-36px_rgba(8,18,46,0.7),0_8px_24px_-12px_rgba(14,31,59,0.18),inset_0_1.5px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(255,255,255,0.35)] ring-white/55 backdrop-blur-2xl backdrop-saturate-[1.8] focus-within:bg-white/75"
            : "bg-white shadow-[0_30px_70px_-34px_rgba(14,31,59,0.45)] ring-line-strong focus-within:ring-brand/40"
        )}
      >
        {/* Liquid glass: a specular sheen across the top, a light edge, and a soft glow on focus. */}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[28px] bg-gradient-to-b from-white/75 via-white/25 to-transparent" />
        <span aria-hidden className="composer-glow pointer-events-none absolute -inset-[2px] -z-10 rounded-[30px] opacity-0 blur-md transition-opacity duration-700 group-focus-within/composer:opacity-100" />
        <label htmlFor={id} className="sr-only">
          Describe the trip you want to plan
        </label>
        <div className="relative">
          <textarea
            id={id}
            ref={area}
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={onKeyDown}
            enterKeyHint="go"
            maxLength={400}
            placeholder={focused ? "Where, how long, who's coming and what you love…" : ""}
            className="relative block min-h-[4.75rem] w-full resize-none bg-transparent px-4 pb-2 pt-3.5 text-[1.0625rem] leading-relaxed text-ink outline-none placeholder:text-ink/40 sm:px-5"
          />
          {!text && !focused && (
            <span aria-hidden className="pointer-events-none absolute inset-0 px-4 pt-3.5 text-[1.0625rem] leading-relaxed text-ink/55 sm:px-5">
              {typed}
              <span className="ml-0.5 inline-block h-[1.1em] w-px translate-y-[0.2em] animate-pulse bg-ink/70" />
            </span>
          )}
        </div>

        {/* What GoRoam understood, as you type. */}
        <AnimatePresence initial={false}>
          {chips.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="relative overflow-hidden px-3 sm:px-4">
              <div className="flex flex-wrap items-center gap-1.5 pb-2">
                <Sparkles className="size-3.5 text-brand" aria-hidden />
                {chips.map((c) => (
                  <motion.span
                    key={c.key}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex max-w-[15rem] items-center gap-1.5 rounded-full bg-paper-2/80 px-2.5 py-1 text-xs text-ink ring-1 ring-inset ring-ink/[0.06]"
                  >
                    <c.icon className="size-3.5 shrink-0 text-brand" />
                    <span className="truncate">{c.text}</span>
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex flex-col gap-2.5 border-t border-ink/[0.07] px-1.5 pb-0.5 pt-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-2">
          <div className="no-scrollbar -mx-1 flex min-w-0 items-center gap-1.5 overflow-x-auto px-1 sm:overflow-visible">
            <Picker icon={CalendarDays} label="When" value={picked.when?.label} open={menu === "when"} onOpen={(v) => setMenu(v ? "when" : null)}>
              <div className="grid grid-cols-2 gap-1">
                {WHEN.map((o) => (
                  <Option key={o.label} on={picked.when?.label === o.label} onClick={() => pick("when", o.label, o.phrase)}>
                    {o.label}
                  </Option>
                ))}
              </div>
            </Picker>
            <Picker icon={Users} label="Who" value={picked.who?.label} open={menu === "who"} onOpen={(v) => setMenu(v ? "who" : null)}>
              {WHO.map((o) => (
                <Option key={o.label} on={picked.who?.label === o.label} onClick={() => pick("who", o.label, o.phrase)}>
                  {o.label}
                </Option>
              ))}
            </Picker>
            <Picker icon={Wallet} label="Budget" value={picked.budget?.label} open={menu === "budget"} onOpen={(v) => setMenu(v ? "budget" : null)}>
              {BUDGET.map((o) => (
                <Option key={o.label} on={picked.budget?.label === o.label} onClick={() => pick("budget", o.label, o.phrase)}>
                  {o.label}
                </Option>
              ))}
              <p className="px-3 pb-1 pt-2 text-[11px] text-stone">For the whole trip, stays included.</p>
            </Picker>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            {voice.supported && (
              <button
                type="button"
                onClick={() => {
                  before.current = text;
                  voice.toggle();
                }}
                aria-pressed={voice.listening}
                aria-label={voice.listening ? "Stop dictating" : "Describe your trip by voice"}
                title={voice.listening ? "Listening… tap to stop" : "Speak your trip"}
                className={cn(
                  "relative grid size-11 shrink-0 place-items-center rounded-full transition-colors",
                  voice.listening ? "bg-coral text-white" : "bg-white/45 text-ink ring-1 ring-inset ring-white/60 hover:bg-white/80"
                )}
              >
                {voice.listening && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-coral/40" />}
                <Mic className="relative size-[18px]" />
              </button>
            )}
            <PillButton type="submit" variant="ink" className="min-w-0 flex-1 justify-between shadow-[0_12px_24px_-12px_rgba(14,31,59,0.7),inset_0_1px_0_rgba(255,255,255,0.18)] sm:flex-none" icon={<Send className="size-4 -rotate-12" />}>
              Plan my trip
            </PillButton>
          </div>
        </div>
      </motion.form>

      {actions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : undefined}
          transition={{ duration: 1, delay: delay + 0.85 }}
          className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
        >
          {QUICK.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => quick(a)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm backdrop-blur-md transition-colors duration-300",
                dark
                  ? "bg-white/[0.12] text-paper/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] ring-1 ring-inset ring-white/25 hover:bg-white hover:text-ink"
                  : "bg-white text-ink/80 ring-1 ring-inset ring-line-strong hover:bg-ink hover:text-paper"
              )}
            >
              <a.icon className="size-3.5" />
              {a.label}
            </button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
