"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, ThumbsDown, ThumbsUp } from "@/components/site/icons";
import { createContext, useContext, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { reactionKey, type StopReaction } from "@/lib/trip";
import { cn } from "@/lib/utils";

/**
 * Group feedback on a trip. On a shared link, friends vote on each stop and can
 * leave a note; the owner sees the tally on their own copy of the plan.
 */

type Mode = "shared" | "owner" | "off";
interface Ctx {
  mode: Mode;
  get: (day: number, slot: string) => StopReaction | undefined;
  react: (day: number, slot: string, vote: "up" | "down", name?: string, text?: string) => Promise<string | null>;
  voted: (day: number, slot: string) => "up" | "down" | undefined;
}

const ReactionsContext = createContext<Ctx>({ mode: "off", get: () => undefined, react: async () => null, voted: () => undefined });
export const useReactions = () => useContext(ReactionsContext);

const store = (id: string) => `goroam:votes:${id}`;

export function ReactionsProvider({ tripId, token, mode, initial, children }: { tripId: string; token?: string | null; mode: Mode; initial?: Record<string, StopReaction>; children: ReactNode }) {
  const [all, setAll] = useState<Record<string, StopReaction>>(initial ?? {});
  const [mine, setMine] = useState<Record<string, "up" | "down">>({});
  useEffect(() => setAll(initial ?? {}), [initial]);
  useEffect(() => {
    try {
      setMine(JSON.parse(window.localStorage.getItem(store(tripId)) ?? "{}"));
    } catch {}
  }, [tripId]);

  const react: Ctx["react"] = async (day, slot, vote, name, text) => {
    if (mode !== "shared" || !token) return "Voting needs a share link.";
    const key = reactionKey(day, slot);
    try {
      const res = await fetch(`/api/shared/${tripId}/react?t=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, slot, vote, name, text }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.success) return body.error || "Couldn't save your vote.";
      setAll((a) => ({ ...a, [key]: body.reaction }));
      setMine((m) => {
        const next = { ...m, [key]: vote };
        try {
          window.localStorage.setItem(store(tripId), JSON.stringify(next));
        } catch {}
        return next;
      });
      return null;
    } catch {
      return "Couldn't save your vote.";
    }
  };

  return (
    <ReactionsContext.Provider value={{ mode, get: (d, s) => all[reactionKey(d, s)], react, voted: (d, s) => mine[reactionKey(d, s)] }}>
      {children}
    </ReactionsContext.Provider>
  );
}

/** The vote row on a stop card: buttons for friends, a tally (and notes) for the owner. */
export function StopReactions({ day, slot }: { day: number; slot: string }) {
  const { mode, get, react, voted } = useReactions();
  const r = get(day, slot);
  const mine = voted(day, slot);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"up" | "down">("up");

  useEffect(() => {
    try {
      setName(window.localStorage.getItem("goroam:voter") ?? "");
    } catch {}
  }, []);

  if (mode === "off" || (mode === "owner" && !r)) return null;

  const send = async (vote: "up" | "down", withNote = false) => {
    setBusy(true);
    setError(null);
    try {
      window.localStorage.setItem("goroam:voter", name.trim());
    } catch {}
    const err = await react(day, slot, vote, name.trim() || undefined, withNote ? text.trim() || undefined : undefined);
    setBusy(false);
    if (err) setError(err);
    else {
      setOpen(false);
      setText("");
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    send(pending, true);
  };

  return (
    <div className="no-print mt-4 rounded-2xl bg-paper-2/60 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="eyebrow mr-1 text-[0.55rem] text-stone">{mode === "shared" ? "Your crew's vote" : "Your crew says"}</span>
        {(["up", "down"] as const).map((v) => {
          const Icon = v === "up" ? ThumbsUp : ThumbsDown;
          const count = v === "up" ? r?.up ?? 0 : r?.down ?? 0;
          const on = mine === v;
          return mode === "shared" ? (
            <button
              key={v}
              type="button"
              disabled={busy || !!mine}
              onClick={() => send(v)}
              aria-label={v === "up" ? "Keep this stop" : "Not for me"}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors disabled:cursor-default",
                on ? (v === "up" ? "bg-brand text-white" : "bg-ink text-paper") : "bg-white text-ink ring-1 ring-line hover:ring-ink/30"
              )}
            >
              <Icon className="size-3.5" /> {count}
            </button>
          ) : (
            <span key={v} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs", v === "up" ? "bg-brand-soft text-brand" : "bg-white text-ink ring-1 ring-line")}>
              <Icon className="size-3.5" /> {count}
            </span>
          );
        })}
        {mode === "shared" && !mine && (
          <button type="button" onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-stone transition-colors hover:text-ink">
            <MessageCircle className="size-3.5" /> Add a note
          </button>
        )}
        {mode === "shared" && mine && <span className="text-xs text-stone">Thanks, voted.</span>}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.form key="note" onSubmit={submit} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-3 grid gap-2 sm:grid-cols-[8rem_minmax(0,1fr)_auto]">
              <input value={name} onChange={(e) => setName(e.target.value.slice(0, 30))} placeholder="Your name" className="rounded-xl bg-white px-3 py-2 text-sm outline-none ring-1 ring-line focus:ring-brand" aria-label="Your name" />
              <input value={text} onChange={(e) => setText(e.target.value.slice(0, 200))} placeholder="e.g. Can we do this in the evening instead?" className="rounded-xl bg-white px-3 py-2 text-sm outline-none ring-1 ring-line focus:ring-brand" aria-label="Your note" />
              <div className="flex gap-1.5">
                {(["up", "down"] as const).map((v) => (
                  <button key={v} type="submit" onClick={() => setPending(v)} disabled={busy} className="grid size-9 place-items-center rounded-xl bg-ink text-paper transition-colors hover:bg-brand" aria-label={v === "up" ? "Send with a thumbs up" : "Send with a thumbs down"}>
                    {v === "up" ? <ThumbsUp className="size-4" /> : <ThumbsDown className="size-4" />}
                  </button>
                ))}
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

      {!!r?.notes.length && (
        <ul className="mt-3 space-y-1.5">
          {r.notes.slice(-3).map((n, i) => (
            <li key={i} className="flex gap-2 text-xs leading-relaxed text-ink">
              {n.vote === "up" ? <ThumbsUp className="mt-0.5 size-3 shrink-0 text-brand" /> : <ThumbsDown className="mt-0.5 size-3 shrink-0 text-stone" />}
              <span>
                <span className="font-medium">{n.name}:</span> {n.text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
