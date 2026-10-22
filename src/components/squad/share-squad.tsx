"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Share2, WhatsApp } from "@/components/site/icons";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/** The squad link, three ways: WhatsApp, the phone's share sheet, or copied. */
export function ShareSquad({ code, name, tone = "light", className }: { code: string; name: string; tone?: "light" | "dark"; className?: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(`https://www.goroam.world/squad/${code}`);
  // The page's own host after hydration, so previews and local runs link back to where they are.
  useEffect(() => setUrl(`${window.location.origin}/squad/${code}`), [code]);
  const text = `Where should we go for "${name}"? Swipe on a few trips and set your budget in secret (takes 60 seconds). GoRoam finds the trip that fits all of us 👉`;
  const dark = tone === "dark";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      track("squad_shared", { via: "copy" });
    } catch {}
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("squad_shared", { via: "whatsapp" })}
        className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-[#0B3D1F] transition-transform hover:-translate-y-0.5"
      >
        <WhatsApp className="size-4" /> Send to the group
      </a>
      <button
        type="button"
        onClick={() => {
          if (typeof navigator.share === "function") {
            navigator.share({ title: name, text, url }).then(() => track("squad_shared", { via: "native" })).catch(() => {});
          } else copy();
        }}
        className={cn("inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm ring-1", dark ? "text-paper ring-white/25 hover:bg-white/10" : "text-ink ring-line hover:bg-paper-2")}
      >
        <Share2 className="size-4" /> Share
      </button>
      <button type="button" onClick={copy} className={cn("inline-flex items-center gap-2 rounded-full px-4 py-3 font-mono text-sm ring-1", dark ? "text-paper ring-white/25 hover:bg-white/10" : "text-ink ring-line hover:bg-paper-2")}>
        {copied ? <Check className="size-4 text-[#25D366]" /> : <Copy className="size-4" />} {copied ? "Copied" : `goroam.world/squad/${code}`}
      </button>
    </div>
  );
}
