"use client";

import { motion } from "framer-motion";
import { ArrowDownUp, Coins } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatMoney, homeCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

let ratesPromise: Promise<Record<string, number> | null> | null = null;
/** USD-based exchange rates, fetched once per page. */
export const loadRates = () => {
  if (!ratesPromise) {
    ratesPromise = fetch("/api/fx")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.rates ?? null)
      .catch(() => null);
    ratesPromise.then((r) => !r && (ratesPromise = null));
  }
  return ratesPromise;
};

/** Nice round amounts in a currency: 1, 5, 10… scaled to what a coffee or a meal costs there. */
function ladder(perUsd: number) {
  const base = Math.pow(10, Math.max(0, Math.floor(Math.log10(perUsd))));
  return [1, 5, 10, 50, 100, 500].map((x) => x * base);
}

/**
 * Pocket converter: the destination's money against the traveller's own, a
 * quick ladder of everyday amounts, and the trip budget in local terms.
 */
export function CurrencyCard({ local, budgetUsd, className }: { local: string; budgetUsd: number; className?: string }) {
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [home, setHome] = useState("USD");
  const [amount, setAmount] = useState("");
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    setHome(homeCurrency());
    loadRates().then(setRates);
  }, []);

  const ok = !!rates?.[local] && !!rates?.[home];
  const rate = ok ? rates![home] / rates![local] : 0; // 1 local = rate home
  const from = flip ? home : local;
  const to = flip ? local : home;
  const value = Number(amount.replace(/,/g, ""));
  const converted = ok && amount ? (flip ? value / rate : value * rate) : null;
  const steps = useMemo(() => (ok ? ladder(rates![local]) : []), [ok, rates, local]);

  if (!ok || local === home) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn("glass print-avoid rounded-[24px] p-5", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-sun-soft text-ink">
          <Coins className="size-5" />
        </span>
        <span className="text-right font-mono text-[11px] text-stone">
          1 {local} = {formatMoney(rate, home, rate < 1 ? 4 : 2)}
        </span>
      </div>
      <p className="eyebrow mt-4 text-[0.6rem] text-stone">Money converter</p>
      <div className="no-print mt-3 flex items-center gap-2">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-paper-2/70 px-3 py-2.5 ring-1 ring-transparent focus-within:ring-brand">
          <span className="font-mono text-xs text-stone">{from}</span>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, "").slice(0, 12))}
            placeholder="Amount"
            className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-stone-2"
            aria-label={`Amount in ${from}`}
          />
        </label>
        <button type="button" onClick={() => setFlip((f) => !f)} aria-label="Swap currencies" className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-paper transition-colors hover:bg-brand">
          <ArrowDownUp className="size-4" />
        </button>
      </div>
      <p className="mt-2 min-h-7 px-1 text-xl text-ink">{converted !== null && Number.isFinite(converted) ? formatMoney(converted, to) : <span className="text-sm text-stone">in {to}</span>}</p>
      <ul className="mt-3 grid grid-cols-3 gap-1.5 text-center">
        {steps.map((s) => (
          <li key={s} className="rounded-xl bg-paper-2/60 px-1.5 py-2">
            <span className="block font-mono text-[11px] text-ink">{formatMoney(s, local, 0)}</span>
            <span className="block text-[11px] text-stone">{formatMoney(s * rate, home)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-line pt-3 text-xs text-stone">
        Your budget is about <span className="text-ink">{formatMoney(budgetUsd * rates![local], local, 0)}</span> there.
      </p>
    </motion.div>
  );
}
