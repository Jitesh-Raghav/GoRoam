"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Mail } from "lucide-react";
import { useState } from "react";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; to: string } | { kind: "error"; message: string };

/** "Email me": sends the itinerary (and a calendar file) to the signed-in traveller. */
export function EmailButton({ tripId, className }: { tripId: string; className?: string }) {
  const [state, setState] = useState<State>({ kind: "idle" });

  const send = async () => {
    if (state.kind === "sending") return;
    setState({ kind: "sending" });
    try {
      const res = await fetch(`/api/itinerary/${tripId}/email`, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.success) throw new Error(body.error || "Couldn't send the email just now.");
      setState({ kind: "sent", to: body.data.to });
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Couldn't send the email just now." });
    }
    window.setTimeout(() => setState((s) => (s.kind === "sending" ? s : { kind: "idle" })), 4500);
  };

  const Icon = state.kind === "sending" ? Loader2 : state.kind === "sent" ? Check : Mail;
  return (
    <span className="relative">
      <button type="button" onClick={send} className={className} aria-live="polite" disabled={state.kind === "sending"}>
        <Icon className={state.kind === "sending" ? "size-4 animate-spin" : "size-4"} />
        <span className="hidden sm:inline">{state.kind === "sending" ? "Sending…" : state.kind === "sent" ? "Sent" : "Email me"}</span>
      </button>
      <AnimatePresence>
        {(state.kind === "sent" || state.kind === "error") && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            role="status"
            className="absolute right-0 top-[calc(100%+8px)] z-20 w-max max-w-[260px] rounded-2xl bg-paper px-3.5 py-2.5 text-xs leading-snug text-ink shadow-xl ring-1 ring-line"
          >
            {state.kind === "sent" ? (
              <>
                On its way to <span className="font-medium">{state.to}</span> — with a calendar file attached.
              </>
            ) : (
              state.message
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
