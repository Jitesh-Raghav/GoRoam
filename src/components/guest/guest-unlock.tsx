"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Lock } from "@/components/site/icons";
import { cn } from "@/lib/utils";
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
  // The bar waits until the hero (with its own unlock button) has scrolled away.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const on = () => setShown(window.scrollY > Math.min(560, window.innerHeight * 0.6));
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
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

  const visible = shown || state !== "idle";
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="no-print fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-2xl rounded-[24px] bg-ink/95 p-2.5 pl-4 text-paper shadow-[0_24px_60px_-20px_rgba(14,31,59,0.8)] ring-1 ring-paper/10 backdrop-blur-xl sm:pl-5"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              {state === "claiming" ? (
                <p className="flex items-center gap-2 text-sm">
                  <Loader2 className="size-4 animate-spin text-brand-2" /> Unlocking your full trip…
                </p>
              ) : state === "error" ? (
                <p className="text-sm text-sun-2">{error}</p>
              ) : (
                <>
                  {/* One segment a day: Day 1 open, the rest waiting. */}
                  <div aria-hidden className="flex max-w-[11rem] gap-1">
                    {Array.from({ length: Math.min(days, 14) }, (_, i) => (
                      <span key={i} className={cn("h-1 flex-1 rounded-full", i === 0 ? "bg-brand-2" : "bg-paper/20")} />
                    ))}
                  </div>
                  <p className="mt-2 truncate text-sm leading-snug">
                    {days > 1 ? (
                      <>
                        <span className="font-medium">Days 2–{days} are ready.</span> <span className="hidden text-paper/60 min-[430px]:inline">1 of {days} unlocked</span>
                      </>
                    ) : (
                      <span className="font-medium">Sign in free to save and share it.</span>
                    )}
                  </p>
                </>
              )}
            </div>
            {state === "error" ? (
              <a href="/dashboard" className="shrink-0 rounded-full bg-brand px-4 py-2.5 text-sm font-medium text-white">
                Open planner
              </a>
            ) : (
              <div className="flex shrink-0 items-center gap-1.5">
                <a
                  href={`/auth?callbackUrl=${encodeURIComponent(returnTo)}`}
                  onClick={() => track("guest_unlock_clicked", { destination, where: "bar-email" })}
                  className="hidden rounded-full px-3.5 py-2.5 text-sm text-paper/80 ring-1 ring-inset ring-paper/20 hover:bg-paper/10 min-[400px]:inline-flex"
                >
                  Email
                </a>
                <button
                  type="button"
                  onClick={unlock}
                  disabled={state === "claiming"}
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-[0_10px_24px_-12px_rgba(26,95,214,0.9)] hover:bg-brand/90 disabled:opacity-60"
                >
                  <Lock className="size-4" /> Unlock <span className="hidden sm:inline">with Google</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
