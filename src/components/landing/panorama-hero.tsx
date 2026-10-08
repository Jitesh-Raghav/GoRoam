"use client";

import { AnimatePresence, motion, useAnimationControls, useScroll, useTransform } from "framer-motion";
import { CalendarDays, Heart, MapPin, Send, Sparkles, Users, Wallet } from "@/components/site/icons";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
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

function TripComposer({ ready, delay }: { ready: boolean; delay: number }) {
  const router = useRouter();
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
    // A bare place name ("Lisbon") is a destination even if we've never heard of it.
    if (!p.destination && value.split(/\s+/).length <= 4 && !/\d/.test(value)) p.destination = value;
    router.push(plannerHref(p));
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
      <motion.form
        animate={shake}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="group/composer relative rounded-[30px] text-left bg-white/95 p-2 shadow-[0_44px_90px_-44px_rgba(10,30,44,0.6),0_2px_0_rgba(255,255,255,0.9)_inset] ring-1 ring-ink/[0.06] transition-shadow duration-500 focus-within:ring-2 focus-within:ring-brand/40"
      >
        {/* A soft lagoon glow that wakes up on focus. */}
        <span aria-hidden className="pointer-events-none absolute -inset-px -z-10 rounded-[31px] bg-[conic-gradient(from_200deg,rgba(52,209,191,0.55),rgba(244,163,64,0.45),rgba(52,209,191,0.55))] opacity-0 blur-xl transition-opacity duration-700 group-focus-within/composer:opacity-60" />
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
            className="block min-h-[4.75rem] w-full resize-none bg-transparent px-4 pb-2 pt-3.5 text-[1.02rem] leading-relaxed text-ink outline-none placeholder:text-stone-2 sm:px-5 sm:text-[1.08rem]"
          />
          {!text && !focused && (
            <span aria-hidden className="pointer-events-none absolute inset-0 px-4 pt-3.5 text-[1.02rem] leading-relaxed text-stone sm:px-5 sm:text-[1.08rem]">
              {typed}
              <span className="ml-0.5 inline-block h-[1.1em] w-px translate-y-[0.2em] animate-pulse bg-ink/70" />
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 px-2 pb-1 pt-1 sm:flex-row sm:items-end sm:justify-between sm:pl-3">
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
                    className="inline-flex max-w-[15rem] items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-xs text-ink"
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
                  className="hidden items-center gap-1.5 text-xs text-stone sm:inline-flex"
                >
                  <Sparkles className="size-3.5 text-brand" />
                  Mention where, how long, who&apos;s coming and what you love
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <PillButton type="submit" variant="brand" className="w-full justify-between sm:w-auto" icon={<Send className="size-4 -rotate-12" />}>
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
            className="rounded-full bg-white/70 px-3.5 py-1.5 text-sm text-ink/80 ring-1 ring-ink/[0.06] backdrop-blur-sm transition-colors duration-300 hover:bg-ink hover:text-paper"
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

        <h1 className="display mx-auto max-w-[14ch] text-[clamp(2.6rem,7.4vw,4.8rem)] leading-[0.98] text-ink [@media(min-width:1024px)_and_(max-height:860px)]:text-[4.2rem]">
          <span className="block">
            <SplitText text="Where will you" trigger="mount" ready={intro.ready} delay={delay + 0.15} />
          </span>
          <span className="block">
            <SplitText segments={[{ text: "go next?", className: "accent-gradient" }]} trigger="mount" ready={intro.ready} delay={delay + 0.28} />
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
