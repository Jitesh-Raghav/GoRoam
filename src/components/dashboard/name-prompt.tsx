"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2, RefreshCw } from "@/components/site/icons";
import { UserAvatar } from "@/components/site/user-avatar";
import { AVATAR_STYLES, cleanSeed, randomSeed, type AvatarChoice } from "@/lib/avatars";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;
// A friendly spread of styles for the first pick; the full picker lives in Settings.
const STYLES = ["notionists", "adventurer", "lorelei", "micah", "avataaars", "personas", "bigSmile", "funEmoji"] as const;

/**
 * People who sign in with an email link arrive without a name. Before anything
 * else, ask what to call them and let them pick a face; both are saved to their
 * profile (and their welcome email goes out once we know their name).
 */
export function NamePrompt() {
  const { data: session, status, update } = useSession();
  const user = session?.user;
  const [saved, setSaved] = useState(false);
  const open = status === "authenticated" && !!user && !user.name?.trim() && !saved;

  const base = cleanSeed(user?.email?.split("@")[0] ?? "traveller") || "traveller";
  const [round, setRound] = useState("");
  const options = useMemo<AvatarChoice[]>(() => STYLES.map((style, i) => ({ style, seed: `${base}${round}${i}` })), [base, round]);
  const [picked, setPicked] = useState<AvatarChoice | null>(null);
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  // Suggest a name from the address ("priya.sharma@…" → "Priya"), but let them change it.
  useEffect(() => {
    if (!open || name) return;
    const local = user?.email?.split("@")[0]?.split(/[._+-]/)[0]?.replace(/\d+/g, "") ?? "";
    if (local.length >= 2) setName(local[0].toUpperCase() + local.slice(1).toLowerCase());
    window.setTimeout(() => input.current?.select(), 350);
  }, [open, name, user?.email]);

  // Keep the page behind still while the step is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = name.replace(/\s+/g, " ").trim();
    if (!value) {
      setError("Tell us what to call you.");
      input.current?.focus();
      return;
    }
    setState("saving");
    setError(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value, ...(picked ?? options[0]) }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.success) throw new Error(body.error);
      setSaved(true);
      // next-auth v4 answers the first refresh with the old session; the second picks up the new name.
      await update();
      await update();
    } catch (err) {
      setState("error");
      setError(err instanceof Error && err.message ? err.message : "Couldn't save that. Try again.");
    }
  };

  const selected = picked ?? options[0];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="name-prompt"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-ink/55 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="name-prompt-title"
        >
          <motion.form
            onSubmit={save}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.5, ease }}
            className="grid w-full max-w-3xl overflow-hidden rounded-[32px] bg-paper shadow-[0_40px_100px_-30px_rgba(10,30,44,0.7)] ring-1 ring-white/60 md:grid-cols-[1fr_1.1fr]"
          >
            {/* The face they'll travel as, big, with the choices around it. */}
            <div className="relative flex flex-col items-center justify-center gap-6 bg-[linear-gradient(160deg,#0a1e2c_0%,#133246_55%,#0b5d5a_100%)] p-8 text-paper">
              <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-brand-2/25 blur-3xl" />
              <motion.div key={`${selected.style}:${selected.seed}`} initial={{ scale: 0.85, rotate: -6 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
                <UserAvatar choice={selected} className="size-32 ring-4 ring-white/80 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)]" />
              </motion.div>
              <p className="text-center text-lg">
                {name.trim() ? (
                  <>
                    Hi, <span className="font-medium text-brand-2">{name.trim().split(" ")[0]}</span> 👋
                  </>
                ) : (
                  "Hi there 👋"
                )}
              </p>
              <div className="grid grid-cols-4 gap-3">
                {options.map((o) => {
                  const on = o.style === selected.style && o.seed === selected.seed;
                  return (
                    <button
                      key={`${o.style}:${o.seed}`}
                      type="button"
                      onClick={() => setPicked(o)}
                      aria-label={`Choose the ${AVATAR_STYLES.find((s) => s.id === o.style)?.label} avatar`}
                      aria-pressed={on}
                      className={cn("relative size-14 rounded-full transition-transform duration-300 hover:-translate-y-0.5", on ? "ring-[3px] ring-brand-2" : "ring-1 ring-white/25 hover:ring-white/60")}
                    >
                      <UserAvatar choice={o} className="size-full" />
                      {on && (
                        <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-brand-2 text-ink">
                          <Check className="size-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <button type="button" onClick={() => { setRound(randomSeed()); setPicked(null); }} className="inline-flex items-center gap-1.5 text-sm text-paper/70 hover:text-paper">
                <RefreshCw className="size-3.5" /> Shuffle faces
              </button>
            </div>

            <div className="flex flex-col justify-center p-7 sm:p-10">
              <p className="eyebrow text-brand">Welcome to GoRoam</p>
              <h2 id="name-prompt-title" className="display mt-3 text-[clamp(2rem,4vw,2.6rem)] text-ink">
                What should we <span className="accent">call you?</span>
              </h2>
              <p className="mt-3 text-stone">We&apos;ll use it on your trips, your boarding pass and when friends see your shared plans.</p>
              <label htmlFor="name-prompt-input" className="eyebrow mt-7 text-[0.6rem] text-stone">
                Your name
              </label>
              <input
                ref={input}
                id="name-prompt-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                autoComplete="name"
                placeholder="e.g. Priya"
                aria-invalid={!!error}
                className="mt-2 h-14 w-full rounded-2xl bg-white px-5 text-lg text-ink ring-1 ring-line outline-none placeholder:text-stone-2 focus:ring-2 focus:ring-brand/50"
              />
              {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={state === "saving"}
                className="mt-6 flex h-14 items-center justify-center gap-2 rounded-full bg-ink text-paper transition-colors hover:bg-brand disabled:opacity-70"
              >
                {state === "saving" ? <Loader2 className="size-5 animate-spin" /> : null}
                {state === "saving" ? "Saving…" : "Let's go"}
              </button>
              <p className="mt-3 text-center text-xs text-stone">You can change your name and avatar any time in Settings.</p>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
