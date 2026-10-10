"use client";

import { ArrowRight, MapPin } from "@/components/site/icons";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

const DREAMS = [
  "Kyoto in cherry-blossom season",
  "A slow week on Santorini",
  "Rome with the kids, 5 days",
  "Machu Picchu on a budget",
  "Paris for our anniversary",
  "Goa, just the two of us",
];

/** Types each line out, pauses, deletes it and moves on — for animated placeholders. Pass a stable array. */
export function useTypewriter(active: boolean, lines: readonly string[] = DREAMS) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!active) return;
    const DREAMS = lines;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(DREAMS[0]);
      return;
    }
    let dream = 0;
    let i = 0;
    let deleting = false;
    let t: number;
    const tick = () => {
      const target = DREAMS[dream];
      if (!deleting) {
        i++;
        setText(target.slice(0, i));
        if (i === target.length) {
          deleting = true;
          t = window.setTimeout(tick, 1900);
          return;
        }
        t = window.setTimeout(tick, 42 + Math.random() * 40);
      } else {
        i--;
        setText(target.slice(0, i));
        if (i === 0) {
          deleting = false;
          dream = (dream + 1) % DREAMS.length;
          t = window.setTimeout(tick, 380);
          return;
        }
        t = window.setTimeout(tick, 22);
      }
    };
    t = window.setTimeout(tick, 600);
    return () => window.clearTimeout(t);
  }, [active, lines]);
  return text;
}

export function tripHref(destination: string) {
  const d = destination.trim();
  return d ? `/dashboard?destination=${encodeURIComponent(d)}` : "/dashboard";
}

export function TripPrompt({
  tone = "light",
  className,
  quickPicks = [],
}: {
  tone?: "light" | "glass";
  className?: string;
  quickPicks?: { label: string; value: string }[];
}) {
  const router = useRouter();
  const id = useId();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const typed = useTypewriter(!value && !focused);

  const submit = (dest: string) => router.push(tripHref(dest));

  return (
    <div className={className}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className={cn(
          "group relative flex h-16 items-center gap-3 rounded-full pl-5 pr-2 text-left transition-shadow duration-500",
          tone === "light"
            ? "bg-white shadow-[0_24px_60px_-28px_rgba(10,30,44,0.45)] ring-1 ring-ink/[0.07] focus-within:ring-2 focus-within:ring-brand/40"
            : "bg-white/12 ring-1 ring-white/25 backdrop-blur-xl focus-within:ring-white/60"
        )}
      >
        <MapPin className={cn("size-5 shrink-0", tone === "light" ? "text-brand" : "text-white/80")} aria-hidden />
        <label htmlFor={id} className="sr-only">
          Where do you want to go?
        </label>
        <div className="relative min-w-0 flex-1">
          <input
            id={id}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete="off"
            placeholder={focused ? "City, country or a dream…" : ""}
            className={cn(
              "h-10 w-full bg-transparent text-base outline-none placeholder:text-stone-2 sm:text-[1.05rem]",
              tone === "light" ? "text-ink" : "text-white placeholder:text-white/50"
            )}
          />
          {!value && !focused && (
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 truncate text-base leading-10 sm:text-[1.05rem]",
                tone === "light" ? "text-stone" : "text-white/70"
              )}
            >
              {typed}
              <span className={cn("ml-0.5 inline-block h-5 w-px animate-pulse align-middle", tone === "light" ? "bg-ink" : "bg-white")} />
            </span>
          )}
        </div>
        <button
          type="submit"
          className={cn(
            "group/go relative inline-flex h-12 shrink-0 items-center gap-2 overflow-hidden rounded-full px-5 text-sm font-medium transition-colors duration-500 sm:px-6",
            tone === "light" ? "bg-ink text-paper hover:bg-brand" : "bg-paper text-ink hover:bg-brand hover:text-white"
          )}
        >
          <span className="hidden sm:inline">Plan my trip</span>
          <span className="sm:hidden">Plan</span>
          <ArrowRight className="size-4 transition-transform duration-500 ease-out-expo group-hover/go:translate-x-1" />
        </button>
      </form>
      {quickPicks.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={cn("eyebrow mr-1", tone === "light" ? "text-stone" : "text-white/60")}>Try</span>
          {quickPicks.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => submit(q.value)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm transition-colors duration-300",
                tone === "light" ? "bg-ink/[0.05] text-ink/80 hover:bg-ink hover:text-paper" : "bg-white/10 text-white/85 hover:bg-white hover:text-ink"
              )}
            >
              {q.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
