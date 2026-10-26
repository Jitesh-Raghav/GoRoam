"use client";

import { useEffect, useState } from "react";
import { Check, Link2, Share2, WhatsApp } from "@/components/site/icons";
import { track } from "@/lib/analytics";

/** Send the trip to the group: WhatsApp, the phone's share sheet, or the link copied. */
export function ShareTrip({ path, title }: { path: string; title: string }) {
  const [url, setUrl] = useState(`https://www.goroam.world${path}`);
  const [copied, setCopied] = useState(false);
  const [native, setNative] = useState(false);
  // The page's own host after hydration, so previews and local runs share where they are.
  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
    setNative(typeof navigator.share === "function");
  }, [path]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      track("share_link_created", { via: "copy", page: "trip-idea" });
    } catch {}
  };
  const chip = "inline-flex size-9 items-center justify-center rounded-full bg-white text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-paper";

  return (
    <div className="flex items-center gap-1.5">
      <span className="mr-1 text-xs text-stone">Share</span>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} 👉 ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        onClick={() => track("whatsapp_shared", { page: "trip-idea" })}
        className={chip}
      >
        <WhatsApp className="size-4" />
      </a>
      {native && (
        <button type="button" aria-label="Share" onClick={() => navigator.share({ title, url }).catch(() => {})} className={chip}>
          <Share2 className="size-4" />
        </button>
      )}
      <button type="button" aria-label={copied ? "Link copied" : "Copy link"} onClick={copy} className={chip}>
        {copied ? <Check className="size-4 text-emerald-600" /> : <Link2 className="size-4" />}
      </button>
    </div>
  );
}
