"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, RotateCcw, Sparkles, X } from "@/components/site/icons";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CHAT_LIMIT } from "@/lib/plans";
import { undashText } from "@/lib/text";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const ease = [0.16, 1, 0.3, 1] as const;
const storeKey = (id: string) => `goroam:concierge:${id}`;

function load(id: string): Msg[] {
  try {
    const raw = window.localStorage.getItem(storeKey(id));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string").slice(-40) : [];
  } catch {
    return [];
  }
}

function save(id: string, messages: Msg[]) {
  try {
    window.localStorage.setItem(storeKey(id), JSON.stringify(messages.slice(-40)));
  } catch {
    // Private mode or full storage: the chat still works, it just won't be remembered.
  }
}

/** A floating "Ask GoRoam" chat that knows the whole trip. */
export function Concierge({ tripId, city, asked = 0 }: { tripId: string; city: string; asked?: number }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState(Math.max(CHAT_LIMIT - asked, 0));
  const [error, setError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => setMessages(load(tripId)), [tripId]);
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);
  useEffect(() => {
    if (open) window.setTimeout(() => field.current?.focus(), 250);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const suggestions = [
    `What should I wear in ${city} that week?`,
    "Give me a rainy-day backup for day 2",
    "How do I get from the airport to my hotel?",
    "Where's good for dinner near my stay?",
  ];

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy || left <= 0) return;
    setError(null);
    setInput("");
    const history: Msg[] = [...messages, { role: "user", content: q }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setBusy(true);
    try {
      const res = await fetch(`/api/itinerary/${tripId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        if (typeof body.left === "number") setLeft(body.left);
        throw new Error(body.error || "Couldn't reach the concierge just now.");
      }
      const remaining = Number(res.headers.get("X-Questions-Left"));
      if (Number.isFinite(remaining)) setLeft(remaining);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: undashText(answer) }]);
      }
      const final: Msg[] = [...history, { role: "assistant", content: undashText(answer.trim()) || "Sorry, I didn't catch that. Try asking another way?" }];
      setMessages(final);
      save(tripId, final);
    } catch (e) {
      setMessages(history.slice(0, -1));
      setInput(q);
      setError(e instanceof Error ? e.message : "Couldn't reach the concierge just now.");
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const clear = () => {
    setMessages([]);
    save(tripId, []);
  };

  return (
    <div className="no-print">
      <AnimatePresence>
        {!open && (
          <motion.div
            key="launcher"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ duration: 0.5, ease, delay: 0.6 }}
            className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-50 sm:bottom-7 sm:right-7"
          >
            {/* A soft halo that breathes, so the launcher is easy to spot on any section. */}
            <span aria-hidden className="animate-breathe pointer-events-none absolute -inset-2 -z-10 rounded-full bg-[linear-gradient(120deg,var(--brand-2),var(--sun-2),var(--brand))] opacity-60 blur-xl" />
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="glass group inline-flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 text-sm text-ink transition-transform duration-500 ease-out-expo hover:-translate-y-0.5 sm:pr-5"
              aria-label="Ask GoRoam about this trip"
            >
              <span className="relative grid size-10 place-items-center rounded-full bg-[linear-gradient(135deg,var(--brand-2),var(--brand))] shadow-[0_8px_20px_-8px_rgba(11,130,120,0.9)]">
                <span className="absolute inset-0 animate-ping rounded-full bg-brand-2/40 [animation-duration:2.6s]" />
                <Sparkles className="relative size-4 text-white transition-transform duration-700 group-hover:rotate-[20deg] group-hover:scale-110" />
              </span>
              <span className="flex flex-col items-start leading-tight">
                <span className="font-medium">Ask GoRoam</span>
                <span className="hidden text-[11px] text-stone min-[400px]:block">Your {city} concierge</span>
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.button
            key="scrim"
            type="button"
            aria-label="Close concierge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 cursor-default bg-ink/25 backdrop-blur-[2px] sm:hidden"
          />
        )}
        {open && (
          <motion.section
            key="panel"
            role="dialog"
            aria-label="Trip concierge"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.45, ease }}
            style={{ transformOrigin: "bottom right" }}
            className="glass fixed inset-x-0 bottom-0 z-50 flex h-[min(92dvh,720px)] flex-col overflow-hidden rounded-t-[30px] shadow-[0_40px_100px_-30px_rgba(10,30,44,0.6)] sm:inset-x-auto sm:bottom-7 sm:right-7 sm:h-[min(78vh,640px)] sm:w-[410px] sm:rounded-[30px]"
          >
            {/* Colour inside the glass so it reads as frosted even over a plain page. */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
              <div className="absolute -left-20 top-1/3 size-64 rounded-full bg-brand-2/25 blur-3xl" />
              <div className="absolute -bottom-16 -right-10 size-56 rounded-full bg-sun-2/30 blur-3xl" />
            </div>
            <span aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-ink/15 sm:hidden" />
            <header className="relative m-2 mb-0 overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,rgba(10,30,44,0.94),rgba(11,130,120,0.86))] px-4 pb-4 pt-3.5 text-paper shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
              <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-brand-2/40 blur-3xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-2xl bg-paper/10 ring-1 ring-inset ring-paper/20 backdrop-blur">
                    <Sparkles className="size-5 text-white" />
                  </span>
                  <div>
                    <p className="display text-xl leading-none">Ask GoRoam</p>
                    <p className="mt-1 text-xs text-paper/60">Your concierge for {city}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {messages.length > 0 && (
                    <button type="button" onClick={clear} aria-label="Start over" className="grid size-9 place-items-center rounded-full text-paper/70 transition-colors hover:bg-paper/10 hover:text-paper">
                      <RotateCcw className="size-4" />
                    </button>
                  )}
                  <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid size-9 place-items-center rounded-full text-paper/70 transition-colors hover:bg-paper/10 hover:text-paper">
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            </header>

            <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-5">
              {messages.length === 0 ? (
                <div>
                  <p className="px-1 text-sm leading-relaxed text-stone">
                    I know every day of this plan. Ask about what to wear, getting around, swaps for a rainy day, where to eat, anything.
                  </p>
                  <div className="mt-4 space-y-2">
                    {suggestions.map((s, i) => (
                      <motion.button
                        key={s}
                        type="button"
                        onClick={() => ask(s)}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, ease, delay: 0.15 + i * 0.06 }}
                        className="block w-full rounded-2xl bg-white/60 px-4 py-3 text-left text-sm text-ink shadow-[0_6px_18px_-12px_rgba(10,30,44,0.4)] ring-1 ring-inset ring-white backdrop-blur-md transition-colors hover:bg-ink hover:text-paper"
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[88%] whitespace-pre-wrap break-words rounded-[20px] px-4 py-2.5 text-sm leading-relaxed",
                        m.role === "user"
                          ? "rounded-br-md bg-ink/90 text-paper shadow-[0_10px_24px_-14px_rgba(10,30,44,0.8)] backdrop-blur"
                          : "rounded-bl-md bg-white/70 text-ink shadow-[0_8px_22px_-14px_rgba(10,30,44,0.45)] ring-1 ring-inset ring-white backdrop-blur-md"
                      )}
                    >
                      {m.content || (
                        <span className="inline-flex gap-1 py-1" aria-label="Thinking">
                          {[0, 1, 2].map((d) => (
                            <span key={d} className="size-1.5 animate-bounce rounded-full bg-brand" style={{ animationDelay: `${d * 0.15}s` }} />
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
              {error && <p className="rounded-2xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{error}</p>}
            </div>

            <form onSubmit={submit} className="border-t border-white/70 bg-white/30 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3">
              <div className="flex items-end gap-2 rounded-[22px] bg-white/75 p-1.5 pl-4 shadow-[0_10px_30px_-18px_rgba(10,30,44,0.5)] ring-1 ring-inset ring-white backdrop-blur-md transition-shadow focus-within:ring-2 focus-within:ring-brand/60">
                <textarea
                  ref={field}
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, 800))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      ask(input);
                    }
                  }}
                  rows={1}
                  disabled={left <= 0}
                  placeholder={left > 0 ? "Ask anything about this trip…" : "You've used every AI request for this trip"}
                  className="max-h-28 min-h-[2.5rem] flex-1 resize-none bg-transparent py-2 text-base text-ink sm:text-sm outline-none placeholder:text-stone-2"
                  aria-label="Your question"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim() || left <= 0}
                  aria-label="Send"
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--brand-2),var(--brand))] text-white shadow-[0_8px_18px_-8px_rgba(11,130,120,0.9)] transition-[filter,transform] hover:scale-105 disabled:bg-none disabled:bg-paper-3 disabled:text-stone disabled:shadow-none"
                >
                  <ArrowUp className="size-4" />
                </button>
              </div>
              <p className="mt-2 px-2 text-[11px] text-stone">
                {left} of {CHAT_LIMIT} AI requests left (questions and swaps) · double-check live details
              </p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
