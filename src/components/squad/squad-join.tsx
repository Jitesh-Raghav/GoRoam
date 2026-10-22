"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Lock, MapPin } from "@/components/site/icons";
import { track } from "@/lib/analytics";
import { matchPlaces } from "@/lib/cities";
import { VIBES, fridayLabel, type DeckCard, type Vibe } from "@/lib/squad-match";
import { cn } from "@/lib/utils";
import { SwipeDeck } from "./swipe-deck";

type Step = "intro" | "swipe" | "vibes" | "budget" | "home" | "dates";
const STEPS: Step[] = ["intro", "swipe", "vibes", "budget", "home", "dates"];
const ease = [0.16, 1, 0.3, 1] as const;
export const tokenKey = (code: string) => `goroam:squad:${code}`;
const NAME_KEY = "goroam:squad-name";

const store = {
  get(k: string) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};

function Next({ disabled, onClick, children = "Next" }: { disabled?: boolean; onClick: () => void; children?: React.ReactNode }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-base text-paper transition-colors hover:bg-brand disabled:opacity-40 sm:w-auto">
      {children} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

/** One friend's 60 seconds: name, swipe the deck, vibes, a secret budget, home city and free weekends. */
export function SquadJoin({ code, deck, weekends }: { code: string; deck: DeckCard[]; weekends: string[] }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [joined, setJoined] = useState(false);
  const [name, setName] = useState("");
  const [likes, setLikes] = useState<string[]>([]);
  const [passes, setPasses] = useState<string[]>([]);
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [usd, setUsd] = useState(false);
  const [budget, setBudget] = useState(20000);
  const [home, setHome] = useState("");
  const [dates, setDates] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setJoined(!!store.get(tokenKey(code)));
    setName(store.get(NAME_KEY) ?? "");
    // Visitors outside India most likely think in dollars.
    if (!/Calcutta|Kolkata/.test(Intl.DateTimeFormat().resolvedOptions().timeZone)) {
      setUsd(true);
      setBudget(1200);
    }
  }, [code]);

  const suggestions = useMemo(() => (home.length >= 2 ? matchPlaces(home, 4).filter((p) => p.main.toLowerCase() !== home.toLowerCase().split(",")[0]) : []), [home]);
  const at = STEPS.indexOf(step);
  const back = () => setStep(STEPS[Math.max(0, at - 1)]);
  const fmt = (n: number) => (usd ? `$${n.toLocaleString("en-US")}` : `₹${n.toLocaleString("en-IN")}`);

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/squad/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: store.get(tokenKey(code)), name, homeCity: home, budget, currency: usd ? "USD" : "INR", dates, likes, passes, vibes }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      store.set(tokenKey(code), data.token);
      store.set(NAME_KEY, name);
      track("squad_joined", { likes: likes.length, vibes: vibes.length, dates: dates.length });
      router.push(`/squad/${code}/result`);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Something went wrong. Try again.");
      setSaving(false);
    }
  };

  if (joined && step === "intro") {
    return (
      <div className="rounded-panel bg-white p-6 text-center ring-1 ring-line sm:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#25D366]/15 text-[#1F7A3B]">
          <Check className="size-7" />
        </span>
        <h2 className="display mt-4 text-3xl text-ink">You&apos;re in.</h2>
        <p className="mx-auto mt-2 max-w-sm text-stone">The match updates every time a friend joins. Nudge the slow ones in the group chat.</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={`/squad/${code}/result`} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-paper hover:bg-brand">
            See our match <ArrowRight className="size-4" />
          </Link>
          <button type="button" onClick={() => setJoined(false)} className="rounded-full px-5 py-3 text-sm text-stone ring-1 ring-line hover:text-ink">
            Change my answers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-panel bg-white p-5 ring-1 ring-line sm:p-8">
      <div className="flex items-center justify-between gap-3">
        {at > 0 ? (
          <button type="button" onClick={back} className="inline-flex items-center gap-1.5 text-sm text-stone hover:text-ink">
            <ArrowLeft className="size-4" /> Back
          </button>
        ) : (
          <span />
        )}
        <span className="font-mono text-xs text-stone">
          {at + 1} / {STEPS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease }} className="mt-4">
          {step === "intro" && (
            <div className="mx-auto max-w-md">
              <h2 className="display text-3xl text-ink sm:text-4xl">What do your friends call you?</h2>
              <p className="mt-2 text-stone">Then 60 seconds of swiping. Nobody sees your budget, ever.</p>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 30))}
                onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep("swipe")}
                placeholder="Your name"
                className="mt-6 w-full rounded-2xl bg-paper-2/60 px-5 py-4 text-lg text-ink outline-none ring-1 ring-line focus:ring-brand"
              />
              <div className="mt-6">
                <Next disabled={!name.trim()} onClick={() => setStep("swipe")}>
                  Start swiping
                </Next>
              </div>
            </div>
          )}

          {step === "swipe" && (
            <div>
              <h2 className="display text-center text-2xl text-ink sm:text-3xl">Would you go?</h2>
              <div className="mt-5">
                <SwipeDeck
                  cards={deck}
                  onDone={(l, p) => {
                    setLikes(l);
                    setPasses(p);
                    setStep("vibes");
                  }}
                />
              </div>
            </div>
          )}

          {step === "vibes" && (
            <div className="mx-auto max-w-lg">
              <h2 className="display text-3xl text-ink sm:text-4xl">What makes a trip for you?</h2>
              <p className="mt-2 text-stone">Pick up to three. This decides your role in the squad.</p>
              <ul className="mt-6 grid grid-cols-2 gap-3">
                {VIBES.map((v) => {
                  const on = vibes.includes(v.id);
                  return (
                    <li key={v.id}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => setVibes((vs) => (on ? vs.filter((x) => x !== v.id) : vs.length < 3 ? [...vs, v.id] : vs))}
                        className={cn("flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left ring-1 transition-all", on ? "bg-ink text-paper ring-ink" : "bg-paper-2/50 text-ink ring-line hover:ring-ink/30")}
                      >
                        <span className="text-2xl">{v.emoji}</span>
                        <span>{v.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-6">
                <Next disabled={!vibes.length} onClick={() => setStep("budget")} />
              </div>
            </div>
          )}

          {step === "budget" && (
            <div className="mx-auto max-w-lg">
              <p className="inline-flex items-center gap-2 rounded-full bg-sun-soft px-3 py-1 text-xs text-ink">
                <Lock className="size-3.5" /> Secret. Only GoRoam sees this.
              </p>
              <h2 className="display mt-4 text-3xl text-ink sm:text-4xl">The most you&apos;d spend on this trip?</h2>
              <p className="mt-2 text-stone">Stay, food and fun for the whole trip, not counting getting there. We plan within the lowest budget in the group and never say whose it was.</p>
              <div className="mt-6 rounded-[24px] bg-ink p-6 text-paper">
                <div className="flex items-center justify-between">
                  <span className="display text-5xl tabular-nums">{fmt(budget)}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUsd(!usd);
                      setBudget(usd ? 20000 : 1200);
                    }}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs ring-1 ring-white/20"
                  >
                    {usd ? "$ USD" : "₹ INR"}
                  </button>
                </div>
                <input
                  type="range"
                  min={usd ? 200 : 3000}
                  max={usd ? 8000 : 200000}
                  step={usd ? 50 : 1000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  aria-label="Your max budget"
                  className="mt-5 w-full accent-[#FFD23F]"
                />
                <p className="mt-2 text-xs text-paper/60">Per person, all in except flights or trains.</p>
              </div>
              <div className="mt-6">
                <Next onClick={() => setStep("home")} />
              </div>
            </div>
          )}

          {step === "home" && (
            <div className="mx-auto max-w-md">
              <h2 className="display text-3xl text-ink sm:text-4xl">Where are you coming from?</h2>
              <p className="mt-2 text-stone">So we can show everyone their own cheapest way there.</p>
              <div className="relative mt-6">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-brand" />
                <input
                  autoFocus
                  value={home}
                  onChange={(e) => setHome(e.target.value.slice(0, 80))}
                  onKeyDown={(e) => e.key === "Enter" && home.trim() && setStep("dates")}
                  placeholder="Delhi, Bengaluru, London…"
                  className="w-full rounded-2xl bg-paper-2/60 py-4 pl-12 pr-5 text-lg text-ink outline-none ring-1 ring-line focus:ring-brand"
                />
              </div>
              {suggestions.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {suggestions.map((p) => (
                    <li key={p.main}>
                      <button type="button" onClick={() => setHome(`${p.main}, ${p.secondary}`)} className="rounded-full bg-paper-2 px-3 py-1.5 text-sm text-ink hover:bg-brand-soft">
                        {p.main}, <span className="text-stone">{p.secondary}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6">
                <Next disabled={home.trim().length < 2} onClick={() => setStep("dates")} />
              </div>
            </div>
          )}

          {step === "dates" && (
            <div className="mx-auto max-w-lg">
              <h2 className="display text-3xl text-ink sm:text-4xl">Which weekends could you go?</h2>
              <p className="mt-2 text-stone">Tap every one that works. Trips start on a Friday.</p>
              <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {weekends.map((d) => {
                  const on = dates.includes(d);
                  return (
                    <li key={d}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => setDates((ds) => (on ? ds.filter((x) => x !== d) : [...ds, d]))}
                        className={cn("w-full rounded-2xl px-3 py-3 text-sm ring-1 transition-colors", on ? "bg-ink text-paper ring-ink" : "bg-paper-2/50 text-ink ring-line hover:ring-ink/30")}
                      >
                        {fridayLabel(d)}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {error && <p className="mt-4 rounded-xl bg-[#FF5A5F]/10 px-4 py-3 text-sm text-[#B42318]">{error}</p>}
              <div className="mt-6">
                <Next disabled={!dates.length || saving} onClick={submit}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : null} Reveal our match
                </Next>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
