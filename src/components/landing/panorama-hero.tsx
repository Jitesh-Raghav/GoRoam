"use client";

import { AnimatePresence, motion, useAnimationControls, useScroll, useTransform } from "framer-motion";
import { CalendarDays, Heart, MapPin, Send, Sparkles, Users, Wallet } from "@/components/site/icons";
import { signIn, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { track } from "@/lib/analytics";
import { SplitText } from "@/components/motion/split-text";
import { PillButton } from "@/components/site/pill";
import { useTypewriter } from "@/components/site/trip-prompt";
import { useIntro } from "@/components/site/use-intro";
import { parseTripPrompt, plannerHref, type ParsedPrompt } from "@/lib/prompt-parse";
import { COMPANIONS, VIBES, labelFor } from "@/lib/trip";
import { cn } from "@/lib/utils";
import { PanoramaLandscape, PanoramaSky } from "./panorama";

const ease = [0.16, 1, 0.3, 1] as const;

const EXAMPLES = [
  "7 days in Japan this October, food markets, quiet temples and a hike or two, away from the crowds.",
  "A 5-day honeymoon in Bali with sunsets, a spa day and great seafood.",
  "Long weekend in Lisbon with friends, around $1,200, nightlife and pastéis de nata.",
  "10 days in Rajasthan with the kids: forts, palaces and vegetarian food.",
];

const SUGGESTIONS = [
  { label: "Japan in autumn", text: EXAMPLES[0] },
  { label: "Bali honeymoon", text: EXAMPLES[1] },
  { label: "Lisbon with friends", text: EXAMPLES[2] },
  { label: "Rajasthan with kids", text: EXAMPLES[3] },
];

/** What the composer understood so far, as small chips. */
function understood(p: ParsedPrompt) {
  const chips: { key: string; icon: typeof MapPin; text: string }[] = [];
  if (p.destination) chips.push({ key: "where", icon: MapPin, text: p.destination });
  if (p.days || p.month) chips.push({ key: "when", icon: CalendarDays, text: [p.days && `${p.days} ${p.days === 1 ? "day" : "days"}`, p.month].filter(Boolean).join(" · ") });
  if (p.companions) chips.push({ key: "who", icon: Users, text: labelFor(COMPANIONS, p.companions) });
  if (p.budget) chips.push({ key: "budget", icon: Wallet, text: `$${p.budget.toLocaleString("en-US")}` });
  if (p.interests.length) chips.push({ key: "vibes", icon: Heart, text: p.interests.slice(0, 3).map((i) => labelFor(VIBES, i)).join(", ") });
  return chips;
}

// The planning overlay, only loaded when a guest trip is being made.
const GeneratingOverlay = dynamic(() => import("@/components/dashboard/generating-overlay").then((m) => m.GeneratingOverlay), { ssr: false });

function TripComposer({ ready, delay }: { ready: boolean; delay: number }) {
  const router = useRouter();
  const { status } = useSession();
  const [guest, setGuest] = useState<{ destination: string; days: number } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const id = useId();
  const area = useRef<HTMLTextAreaElement>(null);
  const shake = useAnimationControls();
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const [parsed, setParsed] = useState<ParsedPrompt | null>(null);
  const typed = useTypewriter(ready && !text && !focused, EXAMPLES);

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

  const submit = () => {
    const value = text.trim();
    if (!value) {
      area.current?.focus();
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
    try {
      const res = await fetch("/api/guest-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: p.destination, days, budget: p.budget, startDate: p.startDate, companions: p.companions, interests: p.interests }),
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
        return void signIn("google", { callbackUrl: plannerHref(p) });
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

  const pick = (value: string) => {
    setText(value);
    requestAnimationFrame(() => {
      const el = area.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(value.length, value.length);
    });
  };

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
        className="group/composer relative isolate rounded-[28px] bg-white/45 p-2 text-left shadow-[0_40px_80px_-40px_rgba(11,90,90,0.55),0_8px_24px_-12px_rgba(10,30,44,0.18),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(255,255,255,0.35)] ring-1 ring-inset ring-white/70 backdrop-blur-2xl backdrop-saturate-150 transition-[background-color,box-shadow] duration-500 focus-within:bg-white/60"
      >
        {/* Liquid glass: a specular sheen across the top, a light edge, and a slow lagoon glow on focus. */}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[28px] bg-gradient-to-b from-white/70 via-white/20 to-transparent" />
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[28px] [background:radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.55),transparent_45%),radial-gradient(90%_70%_at_100%_100%,rgba(52,209,191,0.14),transparent_60%)]" />
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

        <div className="relative flex flex-col gap-3 border-t border-white/60 px-2 pb-1 pt-2.5 sm:flex-row sm:items-center sm:justify-between sm:pl-3">
          <div className="flex min-h-9 min-w-0 flex-1 flex-wrap items-center gap-1.5">
            <AnimatePresence initial={false} mode="popLayout">
              {chips.length ? (
                chips.map((c) => (
                  <motion.span
                    key={c.key}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ type: "spring", stiffness: 520, damping: 32 }}
                    className="inline-flex max-w-[15rem] items-center gap-1.5 rounded-full bg-white/60 px-2.5 py-1 text-xs text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-inset ring-white/80 backdrop-blur"
                  >
                    <c.icon className="size-3.5 shrink-0 text-brand" />
                    <span className="truncate">{c.text}</span>
                  </motion.span>
                ))
              ) : (
                <motion.span
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hidden items-center gap-1.5 text-xs text-ink/60 sm:inline-flex"
                >
                  <Sparkles className="size-3.5 text-brand" />
                  Mention where, how long, who&apos;s coming and what you love
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <PillButton type="submit" variant="ink" className="w-full justify-between shadow-[0_12px_24px_-12px_rgba(10,30,44,0.7),inset_0_1px_0_rgba(255,255,255,0.18)] sm:w-auto" icon={<Send className="size-4 -rotate-12" />}>
            Plan my trip
          </PillButton>
        </div>
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : undefined}
        transition={{ duration: 1, delay: delay + 0.85 }}
        className="mt-4 flex flex-wrap items-center justify-center gap-2"
      >
        <span className="eyebrow mr-1 text-ink/55">Try</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => pick(s.text)}
            className="rounded-full bg-white/40 px-3.5 py-1.5 text-sm text-ink/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] ring-1 ring-inset ring-white/60 backdrop-blur-md transition-colors duration-300 hover:bg-ink hover:text-paper"
          >
            {s.label}
          </button>
        ))}
      </motion.div>
    </motion.div>
  );
}

export function PanoramaHero() {
  const ref = useRef<HTMLElement>(null);
  const intro = useIntro();
  const delay = intro.delay;

  // Gentle depth on scroll: sky drifts slowest, the landscape a little, the copy lifts away.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const skyY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const landY = useTransform(scrollYProgress, [0, 1], ["0%", "9%"]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  return (
    <section
      ref={ref}
      id="top"
      aria-label="Plan your next trip"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden lg:h-[100svh] lg:min-h-[46.25rem] bg-[linear-gradient(180deg,#F4F8F9_0%,#E6F2F3_38%,#D2EAE8_64%,#F3E3C9_100%)]"
    >
      <motion.div style={{ y: skyY }} className="absolute inset-0 -z-20">
        <PanoramaSky className="size-full" />
      </motion.div>

      {/* Copy and composer. */}
      <motion.div style={{ y: copyY, opacity: copyOpacity }} className="container-x relative z-10 pb-[36svh] pt-28 text-center sm:pt-32 lg:pb-0 lg:pt-[clamp(6.5rem,13vh,8.5rem)]">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={intro.ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1, ease, delay: delay + 0.1 }}
          className="mb-6 inline-flex items-center gap-2.5 rounded-full bg-white/70 py-1.5 pl-2 pr-4 text-sm text-ink/80 ring-1 ring-ink/[0.06] backdrop-blur-sm"
        >
          <span className="relative grid size-5 place-items-center">
            <span className="animate-ping-soft absolute inset-0 rounded-full bg-brand/40" />
            <span className="relative size-2 rounded-full bg-brand" />
          </span>
          AI trip planner · your first itinerary is free
        </motion.div>

        <h1 className="display mx-auto max-w-[13ch] text-[clamp(2.8rem,7.6vw,5.2rem)] leading-[1.02] text-ink [@media(min-width:1024px)_and_(max-height:860px)]:text-[4.4rem]">
          <span className="block">
            <SplitText text="Where will you" trigger="mount" ready={intro.ready} delay={delay + 0.15} />
          </span>
          <span className="block">
            <SplitText segments={[{ text: "wander", className: "accent" }, { text: " next?" }]} trigger="mount" ready={intro.ready} delay={delay + 0.28} />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={intro.ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1.1, ease, delay: delay + 0.42 }}
          className="mx-auto mt-4 max-w-[36rem] text-base leading-relaxed text-ink/70 sm:text-lg"
        >
          Describe the trip you&apos;re dreaming of. GoRoam turns it into a day-by-day plan: real places, honest budgets and stays ready to book.
        </motion.p>

        <div className="mt-7">
          <TripComposer ready={intro.ready} delay={delay} />
        </div>

      </motion.div>

      {/* The panorama. Wider than the screen on phones, where it slowly pans across. */}
      <motion.div
        style={{ y: landY }}
        initial={{ opacity: 0 }}
        animate={intro.ready ? { opacity: 1 } : undefined}
        transition={{ duration: 0.6, delay: delay + 0.1 }}
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[max(42svh,calc(100vw*0.3167))] overflow-hidden"
      >
        <div className={cn("pano-track relative h-full w-[max(100%,calc(42svh*3.158))] lg:w-full")}>
          <PanoramaLandscape intro={intro.ready} className="absolute inset-0" />
          <div aria-hidden className="pano-grain absolute inset-0" />
        </div>
      </motion.div>
    </section>
  );
}
