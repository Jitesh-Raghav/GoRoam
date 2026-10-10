"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2, Lock, Sparkles } from "@/components/site/icons";
import { track } from "@/lib/analytics";

/**
 * The guest preview's sign-in bar. After Google sign-in returns here with
 * ?claim=1, it claims the trip into the account and opens the full itinerary.
 */
export function GuestUnlock({ id, destination, days }: { id: string; destination: string; days: number }) {
  const { status } = useSession();
  const params = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<"idle" | "claiming" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);
  const returnTo = `/try/${id}?claim=1`;

  useEffect(() => {
    if (status !== "authenticated" || started.current) return;
    // Signed in (back from Google with ?claim=1, or already signed in): claim it.
    started.current = true;
    setState("claiming");
    fetch(`/api/guest-itinerary/${id}/claim`, { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.itineraryId) {
          if (d.success) track("guest_trip_claimed", { destination, days });
          router.replace(`/dashboard/itinerary/${d.itineraryId}`);
        } else {
          setState("error");
          setError(d.error ?? "We couldn't unlock this trip.");
        }
      })
      .catch(() => {
        setState("error");
        setError("We couldn't unlock this trip. Try again.");
      });
  }, [status, id, params, router, destination, days]);

  const unlock = () => {
    track("guest_unlock_clicked", { destination, where: "bar" });
    void signIn("google", { callbackUrl: returnTo });
  };

  return (
    <div className="no-print fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-2xl rounded-[22px] bg-ink/95 p-2 pl-4 text-paper shadow-[0_24px_60px_-20px_rgba(10,30,44,0.8)] ring-1 ring-paper/10 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-paper/10 text-brand-2">
          {state === "claiming" ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
        </span>
        <p className="min-w-0 flex-1 text-sm leading-snug">
          {state === "claiming" ? (
            "Unlocking your full trip…"
          ) : state === "error" ? (
            <span className="text-sun-2">{error}</span>
          ) : (
            <>
              {days > 1 ? <><span className="font-medium">Days 2-{days} are ready.</span> <span className="text-paper/65">Sign in free to unlock them.</span></> : <span className="font-medium">Sign in free to save and share your trip.</span>}
            </>
          )}
        </p>
        {state === "error" ? (
          <a href="/dashboard" className="shrink-0 rounded-full bg-brand px-4 py-2.5 text-sm font-medium text-white">
            Open planner
          </a>
        ) : (
          <div className="flex shrink-0 items-center gap-1.5">
            <a
              href={`/auth?callbackUrl=${encodeURIComponent(returnTo)}`}
              onClick={() => track("guest_unlock_clicked", { destination, where: "bar-email" })}
              className="rounded-full px-3 py-2.5 text-sm text-paper/80 ring-1 ring-inset ring-paper/20 hover:bg-paper/10"
            >
              Email
            </a>
            <button type="button" onClick={unlock} disabled={state === "claiming"} className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-60">
              <Sparkles className="size-4" /> <span className="hidden sm:inline">Continue with</span> Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
