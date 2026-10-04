"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Link2, Mail, MessageCircle, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

/** "Share" button plus a sheet with a signed, read-only link for travel companions. */
export function ShareButton({ tripId, title, className }: { tripId: string; title: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || url) return;
    let cancelled = false;
    setError(null);
    fetch(`/api/itinerary/${tripId}/share`, { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.success) {
          setUrl(d.data.url);
          track("share_link_created");
        }
        else setError(d.error || "Couldn't create a link.");
      })
      .catch(() => !cancelled && setError("Couldn't create a link."));
    return () => {
      cancelled = true;
    };
  }, [open, url, tripId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the field is selectable */
    }
  };

  const text = `Here's our ${title} trip plan`;
  const nativeShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <Share2 className="size-4" /> Share
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] grid place-items-end bg-ink/40 p-3 sm:place-items-center"
            onClick={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-title"
              initial={{ y: 30, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-[28px] bg-paper p-6 shadow-[0_40px_120px_-30px_rgba(10,30,44,0.6)] sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow text-stone">Share trip</p>
                  <h2 id="share-title" className="display mt-2 text-4xl leading-none text-ink">
                    Bring the crew.
                  </h2>
                </div>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid size-9 place-items-center rounded-full bg-paper-2 text-ink hover:bg-ink hover:text-paper">
                  <X className="size-4" />
                </button>
              </div>
              <p className="mt-3 text-sm text-stone">Anyone with this link can view the full plan, no account needed. They can&apos;t edit or delete it.</p>

              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-white p-1.5 pl-4 ring-1 ring-line">
                <Link2 className="size-4 shrink-0 text-brand" />
                <input
                  readOnly
                  value={url ?? (error ? "" : "Creating your link…")}
                  onFocus={(e) => e.currentTarget.select()}
                  aria-label="Share link"
                  className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none"
                />
                <button
                  type="button"
                  onClick={copy}
                  disabled={!url}
                  className={cn(
                    "inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm transition-colors disabled:opacity-50",
                    copied ? "bg-brand text-white" : "bg-ink text-paper hover:bg-brand"
                  )}
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

              <div className="mt-4 grid grid-cols-3 gap-2">
                <a
                  href={url ? `https://wa.me/?text=${encodeURIComponent(`${text}: ${url}`)}` : undefined}
                  target="_blank"
                  rel="noreferrer"
                  aria-disabled={!url}
                  className="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3 text-xs text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-paper aria-disabled:pointer-events-none aria-disabled:opacity-50"
                >
                  <MessageCircle className="size-4" /> WhatsApp
                </a>
                <a
                  href={url ? `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}:\n\n${url}`)}` : undefined}
                  aria-disabled={!url}
                  className="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3 text-xs text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-paper aria-disabled:pointer-events-none aria-disabled:opacity-50"
                >
                  <Mail className="size-4" /> Email
                </a>
                <button
                  type="button"
                  disabled={!url || !nativeShare}
                  onClick={() => url && navigator.share({ title: text, url }).catch(() => {})}
                  className="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3 text-xs text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-50"
                >
                  <Share2 className="size-4" /> More
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
