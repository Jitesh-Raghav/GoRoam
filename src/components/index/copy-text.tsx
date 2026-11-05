"use client";

import { useState } from "react";
import { Check, Copy } from "@/components/site/icons";
import { cn } from "@/lib/utils";

/** Copies a line of text (a finding, a citation, a link snippet) with one tap. */
export function CopyText({ text, label = "Copy", className }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch {}
      }}
      aria-label={done ? "Copied" : `${label}: ${text.slice(0, 60)}`}
      className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-stone ring-1 ring-line transition-colors hover:bg-ink hover:text-paper hover:ring-ink", className)}
    >
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {done ? "Copied" : label}
    </button>
  );
}
