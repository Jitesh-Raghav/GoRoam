"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, RotateCcw, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CHAT_LIMIT } from "@/lib/plans";
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
        setMessages([...history, { role: "assistant", content: answer }]);
      }
      const final: Msg[] = [...history, { role: "assistant", content: answer.trim() || "Sorry — I didn't catch that. Try asking another way?" }];
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
          <motion.button
            key="launcher"
            type="button"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ duration: 0.5, ease, delay: 0.6 }}
            className="group fixed bottom-5 right-5 z-50 inline-flex items-center gap-2.5 rounded-full bg-ink py-2 pl-2 pr-5 text-sm text-paper shadow-[0_24px_50px_-18px_rgba(10,30,44,0.75)] ring-1 ring-white/10 transition-colors hover:bg-brand sm:bottom-7 sm:right-7"
            aria-label="Ask GoRoam about this trip"
          >
            <span className="relative grid size-9 place-items-center rounded-full bg-gradient-to-br from-brand-2 to-brand">
              <span className="absolute inset-0 animate-ping rounded-full bg-brand-2/40 [animation-duration:2.6s]" />
              <Sparkles className="relative size-4 text-white" />
            </span>
            Ask GoRoam
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
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
            className="fixed inset-x-0 bottom-0 z-50 flex h-[min(86svh,680px)] flex-col overflow-hidden rounded-t-[28px] bg-paper shadow-[0_40px_100px_-30px_rgba(10,30,44,0.6)] ring-1 ring-line sm:inset-x-auto sm:bottom-7 sm:right-7 sm:h-[min(78vh,640px)] sm:w-[410px] sm:rounded-[28px]"
          >
            <header className="relative overflow-hidden bg-ocean px-5 pb-5 pt-4 text-paper">
              <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-brand/40 blur-3xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-2 to-brand">
                    <Sparkles className="size-5 text-white" />
                  </span>
                  <div>
                    <p className="display text-2xl leading-none">Ask GoRoam</p>
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
                    I know every day of this plan. Ask about what to wear, getting around, swaps for a rainy day, where to eat — anything.
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
                        className="block w-full rounded-2xl bg-white px-4 py-3 text-left text-sm text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-paper"
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
                        m.role === "user" ? "rounded-br-md bg-ink text-paper" : "rounded-bl-md bg-white text-ink ring-1 ring-line"
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

            <form onSubmit={submit} className="border-t border-line bg-white/70 p-3">
              <div className="flex items-end gap-2 rounded-[22px] bg-white p-1.5 pl-4 ring-1 ring-line focus-within:ring-brand">
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
                  placeholder={left > 0 ? "Ask anything about this trip…" : "You've used every question for this trip"}
                  className="max-h-28 min-h-[2.5rem] flex-1 resize-none bg-transparent py-2 text-sm text-ink outline-none placeholder:text-stone-2"
                  aria-label="Your question"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim() || left <= 0}
                  aria-label="Send"
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-white transition-colors hover:bg-ink disabled:bg-paper-3 disabled:text-stone"
                >
                  <ArrowUp className="size-4" />
                </button>
              </div>
              <p className="mt-2 px-2 text-[11px] text-stone">
                {left} of {CHAT_LIMIT} questions left on this trip · double-check live details
              </p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
