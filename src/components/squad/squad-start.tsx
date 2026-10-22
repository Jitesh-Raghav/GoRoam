"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Loader2 } from "@/components/site/icons";
import { track } from "@/lib/analytics";

const IDEAS = ["Goa in December", "Long weekend escape", "College gang reunion", "Birthday trip 🎂"];

/** Name the trip, get the link. No sign-up. */
export function SquadStart({ source = "squad" }: { source?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const start = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/squad", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      track("squad_created", { source });
      router.push(`/squad/${data.code}?new=1`);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Something went wrong. Try again.");
      setBusy(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start();
        }}
        className="flex flex-col gap-2 rounded-[26px] bg-white p-2 shadow-[0_30px_60px_-30px_rgba(10,20,50,0.6)] ring-1 ring-line sm:flex-row"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 60))}
          placeholder="Name your trip, e.g. December gang trip"
          aria-label="Trip name"
          className="min-w-0 flex-1 rounded-[20px] bg-transparent px-4 py-3.5 text-base text-ink outline-none placeholder:text-stone"
        />
        <button type="submit" disabled={busy} className="group inline-flex items-center justify-center gap-2 rounded-[20px] bg-ink px-6 py-3.5 text-paper transition-colors hover:bg-brand disabled:opacity-60">
          {busy ? <Loader2 className="size-4 animate-spin" /> : null} Start a Squad Match <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </form>
      <ul className="mt-3 flex flex-wrap gap-2 text-sm">
        {IDEAS.map((x) => (
          <li key={x}>
            <button type="button" onClick={() => setName(x)} className="rounded-full bg-white/10 px-3 py-1 text-current opacity-85 ring-1 ring-current/20 hover:opacity-100">
              {x}
            </button>
          </li>
        ))}
      </ul>
      {error && <p className="mt-3 text-sm text-[#FFB4B4]">{error}</p>}
    </div>
  );
}
