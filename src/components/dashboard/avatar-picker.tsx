"use client";

import { Check, Loader2, Shuffle } from "@/components/site/icons";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { UserAvatar } from "@/components/site/user-avatar";
import { AVATAR_STYLES, avatarFor, cleanSeed, randomSeed, type AvatarChoice, type AvatarStyleId } from "@/lib/avatars";
import { cn } from "@/lib/utils";

const VARIATIONS = 11;

/** Pick a DiceBear avatar: a style, then one of a dozen faces in it (shuffle for more). */
export function AvatarPicker() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const current = avatarFor(user?.image, user?.email ?? user?.name);
  const base = cleanSeed(user?.email ?? user?.name ?? "traveller") || "traveller";

  const [style, setStyle] = useState<AvatarStyleId | null>(null);
  const [picked, setPicked] = useState<AvatarChoice | null>(null);
  const [round, setRound] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const activeStyle = style ?? current.style;
  const choice = picked ?? current;
  const seeds = useMemo(() => {
    const extra = Array.from({ length: VARIATIONS }, (_, i) => (round ? `${round}${i}` : `${base}-${i + 1}`));
    // Keep the saved face in the grid when browsing its own style.
    const all = activeStyle === current.style && !round ? [current.seed, base, ...extra] : [base, ...extra];
    return [...new Set(all)].slice(0, VARIATIONS + 1);
  }, [activeStyle, base, current.seed, current.style, round]);

  const dirty = choice.style !== current.style || choice.seed !== current.seed;

  const save = async () => {
    setStatus("saving");
    try {
      const res = await fetch("/api/user/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(choice),
      });
      if (!res.ok) throw new Error();
      await update();
      setPicked(null);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="rounded-2xl bg-white/80 p-5 ring-1 ring-line sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <UserAvatar choice={choice} className="size-20 shrink-0 shadow-[0_16px_36px_-18px_rgba(10,30,44,0.55)] ring-4 ring-white" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-ink">{user?.name || "Traveller"}</p>
          <p className="mt-1 text-sm text-stone">Choose an avatar for your GoRoam profile. Your Google photo is never shown.</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={!dirty || status === "saving"}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm text-paper transition-colors hover:bg-brand disabled:bg-paper-2 disabled:text-stone"
        >
          {status === "saving" ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          {status === "saving" ? "Saving…" : status === "saved" && !dirty ? "Saved" : "Save avatar"}
        </button>
      </div>
      {status === "error" && <p className="mt-3 text-sm text-destructive">Couldn&apos;t save that avatar. Please try again.</p>}

      <div role="tablist" aria-label="Avatar style" className="no-scrollbar -mx-1 mt-6 flex gap-2 overflow-x-auto px-1 pb-1">
        {AVATAR_STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={activeStyle === s.id}
            onClick={() => {
              setStyle(s.id);
              setRound(null);
            }}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm transition-colors",
              activeStyle === s.id ? "bg-ink text-paper" : "bg-paper-2 text-ink hover:bg-brand-soft"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2.5 sm:grid-cols-6">
        {seeds.map((seed) => {
          const on = choice.style === activeStyle && choice.seed === seed;
          return (
            <button
              key={seed}
              type="button"
              aria-label="Use this avatar"
              aria-pressed={on}
              onClick={() => {
                setPicked({ style: activeStyle, seed });
                setStatus("idle");
              }}
              className={cn(
                "relative aspect-square rounded-full transition-transform duration-300 ease-out-expo hover:scale-105",
                on ? "ring-[3px] ring-brand ring-offset-2 ring-offset-white" : "ring-1 ring-line"
              )}
            >
              <UserAvatar choice={{ style: activeStyle, seed }} className="size-full" />
              {on && (
                <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-brand text-white">
                  <Check className="size-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setRound(randomSeed())}
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-paper-2 px-4 text-sm text-ink transition-colors hover:bg-ink hover:text-paper"
      >
        <Shuffle className="size-4" /> Show me more
      </button>
    </div>
  );
}
