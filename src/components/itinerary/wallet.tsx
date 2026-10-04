"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BedDouble, Bus, Check, Loader2, Plus, ShoppingBag, Sparkles, Ticket, Trash2, UserPlus, UtensilsCrossed, Wallet as WalletIcon, X, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { formatMoney, homeCurrency } from "@/lib/currency";
import { EXPENSE_CATEGORIES, type ExpenseCategory, type Wallet, type WalletExpense } from "@/lib/trip";
import { cn } from "@/lib/utils";
import { loadRates } from "./currency-card";
import { SectionTitle } from "./guide/section-title";

const ease = [0.16, 1, 0.3, 1] as const;

const CAT: Record<ExpenseCategory, { label: string; icon: LucideIcon }> = {
  food: { label: "Food", icon: UtensilsCrossed },
  stay: { label: "Stay", icon: BedDouble },
  transport: { label: "Transport", icon: Bus },
  activities: { label: "Activities", icon: Ticket },
  shopping: { label: "Shopping", icon: ShoppingBag },
  other: { label: "Other", icon: Sparkles },
};

const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);

/** Who owes whom, in as few transfers as possible (largest debtor pays largest creditor). */
export function settle(wallet: Wallet) {
  const balance = new Map(wallet.people.map((p) => [p.id, 0]));
  for (const e of wallet.expenses) {
    const share = e.amount / e.split.length;
    balance.set(e.paidBy, (balance.get(e.paidBy) ?? 0) + e.amount);
    for (const s of e.split) balance.set(s, (balance.get(s) ?? 0) - share);
  }
  const debtors = [...balance].filter(([, v]) => v < -0.005).map(([id, v]) => ({ id, v: -v })).sort((a, b) => b.v - a.v);
  const creditors = [...balance].filter(([, v]) => v > 0.005).map(([id, v]) => ({ id, v })).sort((a, b) => b.v - a.v);
  const transfers: { from: string; to: string; amount: number }[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].v, creditors[j].v);
    transfers.push({ from: debtors[i].id, to: creditors[j].id, amount: Math.round(pay * 100) / 100 });
    debtors[i].v -= pay;
    creditors[j].v -= pay;
    if (debtors[i].v < 0.005) i++;
    if (creditors[j].v < 0.005) j++;
  }
  return { balance, transfers };
}

function starter(people: number, currency: string): Wallet {
  const n = Math.max(1, Math.min(people, 8));
  return { currency, people: Array.from({ length: n }, (_, i) => ({ id: uid(), name: i === 0 ? "You" : `Traveller ${i + 1}` })), expenses: [] };
}

/**
 * The trip wallet: log what everyone spends, see it against the budget, and
 * settle up at the end with the fewest transfers. Saved onto the trip.
 */
export function TripWallet({
  tripId,
  initial,
  people,
  budgetUsd,
  localCurrency,
  onSaved,
}: {
  tripId: string;
  initial?: Wallet;
  people: number;
  budgetUsd: number;
  localCurrency?: string | null;
  onSaved?: (w: Wallet) => void;
}) {
  const [wallet, setWallet] = useState<Wallet>(() => initial ?? starter(people, "USD"));
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const timer = useRef<number | undefined>(undefined);

  // A fresh wallet starts in the traveller's own currency.
  useEffect(() => {
    if (!initial) setWallet((w) => (w.expenses.length ? w : { ...w, currency: homeCurrency() }));
    loadRates().then(setRates);
  }, [initial]);

  // Save a moment after the last change.
  useEffect(() => {
    if (!touched) return;
    window.clearTimeout(timer.current);
    setStatus("saving");
    timer.current = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/itinerary/${tripId}/wallet`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ wallet }) });
        const body = await res.json().catch(() => ({}));
        if (!res.ok || !body.success) throw new Error();
        setStatus("saved");
        onSaved?.(body.wallet);
      } catch {
        setStatus("error");
      }
    }, 700);
    return () => window.clearTimeout(timer.current);
    // onSaved is a fresh closure each render; saving depends only on the wallet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, touched, tripId]);

  const change = (fn: (w: Wallet) => Wallet) => {
    setTouched(true);
    setWallet(fn);
  };

  const name = (id: string) => wallet.people.find((p) => p.id === id)?.name ?? "Someone";
  const total = wallet.expenses.reduce((s, e) => s + e.amount, 0);
  const budget = rates?.[wallet.currency] ? budgetUsd * rates[wallet.currency] : wallet.currency === "USD" ? budgetUsd : null;
  const { balance, transfers } = useMemo(() => settle(wallet), [wallet]);
  const byCat = useMemo(() => {
    const m = new Map<ExpenseCategory, number>();
    for (const e of wallet.expenses) m.set(e.category, (m.get(e.category) ?? 0) + e.amount);
    return [...m].sort((a, b) => b[1] - a[1]);
  }, [wallet.expenses]);
  const currencies = [...new Set([wallet.currency, homeCurrency(), localCurrency, "USD", "EUR"].filter((c): c is string => !!c))];

  /* ------------------------------- add expense ------------------------------ */
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState<string>(wallet.people[0]?.id ?? "");
  const [split, setSplit] = useState<string[] | null>(null); // null = everyone
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [error, setError] = useState<string | null>(null);
  const sharing = split ?? wallet.people.map((p) => p.id);

  useEffect(() => {
    if (!wallet.people.some((p) => p.id === paidBy)) setPaidBy(wallet.people[0]?.id ?? "");
  }, [wallet.people, paidBy]);

  const add = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount.replace(/,/g, ""));
    if (!title.trim()) return setError("What was it for?");
    if (!(value > 0)) return setError("Add an amount.");
    if (!sharing.length) return setError("Pick who shares it.");
    setError(null);
    const expense: WalletExpense = { id: uid(), title: title.trim().slice(0, 80), amount: Math.round(value * 100) / 100, paidBy, split: sharing, category, date: today() };
    change((w) => ({ ...w, expenses: [expense, ...w.expenses] }));
    setTitle("");
    setAmount("");
  };

  /* --------------------------------- people --------------------------------- */
  const [newPerson, setNewPerson] = useState("");
  const addPerson = (e: FormEvent) => {
    e.preventDefault();
    const n = newPerson.trim().slice(0, 40);
    if (!n || wallet.people.length >= 16) return;
    change((w) => ({ ...w, people: [...w.people, { id: uid(), name: n }] }));
    setNewPerson("");
  };
  const inUse = (id: string) => wallet.expenses.some((x) => x.paidBy === id || x.split.includes(id));
  const rename = (id: string, n: string) => change((w) => ({ ...w, people: w.people.map((p) => (p.id === id ? { ...p, name: n.slice(0, 40) } : p)) }));

  const money = (n: number) => formatMoney(n, wallet.currency);

  return (
    <section className="no-print mt-20" id="wallet">
      <SectionTitle
        eyebrow="Trip wallet"
        title={
          <>
            Split it <span className="italic text-brand">fairly.</span>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className={cn("inline-flex items-center gap-1.5 text-xs", status === "error" ? "text-destructive" : "text-stone")} aria-live="polite">
            {status === "saving" && <Loader2 className="size-3.5 animate-spin" />}
            {status === "saved" && <Check className="size-3.5 text-brand" />}
            {status === "saving" ? "Saving" : status === "saved" ? "Saved to this trip" : status === "error" ? "Couldn't save, will retry on your next change" : "Log spending as you go"}
          </span>
          <select
            value={wallet.currency}
            onChange={(e) => change((w) => ({ ...w, currency: e.target.value }))}
            disabled={wallet.expenses.length > 0}
            title={wallet.expenses.length ? "The currency is fixed once you've logged spending" : "Wallet currency"}
            className="rounded-full bg-white px-3 py-2 font-mono text-xs text-ink ring-1 ring-line disabled:opacity-60"
            aria-label="Wallet currency"
          >
            {currencies.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </SectionTitle>

      <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Log + list */}
        <div className="min-w-0 space-y-3 lg:col-span-7">
          <form onSubmit={add} className="rounded-[26px] bg-white p-5 ring-1 ring-line sm:p-6">
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_9rem]">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What was it? e.g. Dinner at Pontocho" className="rounded-2xl bg-paper-2/70 px-4 py-3 text-ink outline-none ring-1 ring-transparent placeholder:text-stone-2 focus:ring-brand" aria-label="Expense" />
              <label className="flex items-center gap-2 rounded-2xl bg-paper-2/70 px-4 py-3 ring-1 ring-transparent focus-within:ring-brand">
                <span className="font-mono text-xs text-stone">{wallet.currency}</span>
                <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, "").slice(0, 12))} inputMode="decimal" placeholder="0" className="w-full min-w-0 bg-transparent text-ink outline-none placeholder:text-stone-2" aria-label="Amount" />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Category">
              {EXPENSE_CATEGORIES.map((c) => {
                const on = c === category;
                const C = CAT[c];
                return (
                  <button key={c} type="button" role="radio" aria-checked={on} onClick={() => setCategory(c)} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors", on ? "bg-ink text-paper" : "bg-paper-2 text-ink hover:bg-paper-3")}>
                    <C.icon className={cn("size-3.5", on ? "text-sun-2" : "text-brand")} /> {C.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="eyebrow text-[0.55rem] text-stone">Paid by</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {wallet.people.map((p) => (
                    <button key={p.id} type="button" onClick={() => setPaidBy(p.id)} className={cn("rounded-full px-3 py-1.5 text-xs transition-colors", paidBy === p.id ? "bg-brand text-white" : "bg-paper-2 text-ink hover:bg-paper-3")}>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="eyebrow text-[0.55rem] text-stone">Split between</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {wallet.people.map((p) => {
                    const on = sharing.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setSplit(on ? sharing.filter((x) => x !== p.id) : [...sharing, p.id])}
                        className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs ring-1 transition-colors", on ? "bg-brand-soft text-ink ring-brand/30" : "bg-transparent text-stone ring-line hover:text-ink")}
                      >
                        {on && <Check className="size-3 text-brand" />} {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-xs text-destructive">{error}</p>
              <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-paper transition-colors hover:bg-brand">
                <Plus className="size-4" /> Add expense
              </button>
            </div>
          </form>

          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {wallet.expenses.map((e) => {
                const C = CAT[e.category];
                return (
                  <motion.li key={e.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.35, ease }} className="group flex items-center gap-4 rounded-[20px] bg-white/85 px-4 py-3 ring-1 ring-line">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                      <C.icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-ink">{e.title}</span>
                      <span className="block truncate text-xs text-stone">
                        {name(e.paidBy)} paid · {e.split.length === wallet.people.length ? "split by everyone" : `split ${e.split.map(name).join(", ")}`}
                      </span>
                    </span>
                    <span className="font-mono text-sm text-ink">{money(e.amount)}</span>
                    <button type="button" onClick={() => change((w) => ({ ...w, expenses: w.expenses.filter((x) => x.id !== e.id) }))} aria-label={`Delete ${e.title}`} className="grid size-8 place-items-center rounded-full text-stone opacity-60 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100">
                      <Trash2 className="size-4" />
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
            {!wallet.expenses.length && <li className="rounded-[20px] border border-dashed border-line px-5 py-8 text-center text-sm text-stone">Nothing logged yet. Add the first coffee, ticket or taxi above.</li>}
          </ul>
        </div>

        {/* Summary */}
        <div className="min-w-0 space-y-3 lg:col-span-5">
          <div className="relative overflow-hidden rounded-[26px] bg-ocean p-6 text-paper">
            <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-brand/30 blur-3xl" />
            <p className="eyebrow relative flex items-center gap-2 text-paper/55">
              <WalletIcon className="size-3.5 text-sun-2" /> Spent so far
            </p>
            <p className="display relative mt-3 text-5xl leading-none">{money(total)}</p>
            {budget !== null && (
              <>
                <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-paper/10">
                  <motion.span initial={{ width: 0 }} animate={{ width: `${Math.min((total / Math.max(budget, 1)) * 100, 100)}%` }} transition={{ duration: 0.8, ease }} className={cn("absolute inset-y-0 left-0 rounded-full", total > budget ? "bg-destructive" : "bg-brand-2")} />
                </div>
                <p className="relative mt-2 text-xs text-paper/60">
                  {total > budget ? `${money(total - budget)} over` : `${money(budget - total)} left`} of {money(budget)} planned
                </p>
              </>
            )}
            {byCat.length > 0 && (
              <ul className="relative mt-5 flex flex-wrap gap-1.5">
                {byCat.map(([c, v]) => {
                  const C = CAT[c];
                  return (
                    <li key={c} className="inline-flex items-center gap-1.5 rounded-full bg-paper/10 px-2.5 py-1 text-[11px] text-paper/80">
                      <C.icon className="size-3 text-sun-2" /> {C.label} {money(v)}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="rounded-[26px] bg-white p-6 ring-1 ring-line">
            <p className="eyebrow text-stone">Settle up</p>
            {transfers.length ? (
              <ul className="mt-4 space-y-2">
                {transfers.map((t, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-2xl bg-paper-2/70 px-4 py-3 text-sm">
                    <span className="min-w-0 truncate text-ink">{name(t.from)}</span>
                    <ArrowRight className="size-4 shrink-0 text-brand" />
                    <span className="min-w-0 flex-1 truncate text-ink">{name(t.to)}</span>
                    <span className="font-mono text-ink">{money(t.amount)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-stone">{wallet.expenses.length ? "Everyone's square." : "Who owes whom shows up here, in as few transfers as possible."}</p>
            )}

            <p className="eyebrow mt-6 text-[0.55rem] text-stone">Travellers</p>
            <ul className="mt-2 space-y-1.5">
              {wallet.people.map((p) => {
                const b = balance.get(p.id) ?? 0;
                return (
                  <li key={p.id} className="flex items-center gap-2">
                    <input value={p.name} onChange={(e) => rename(p.id, e.target.value)} onBlur={(e) => !e.target.value.trim() && rename(p.id, "Traveller")} className="min-w-0 flex-1 rounded-xl bg-transparent px-2 py-1.5 text-sm text-ink outline-none ring-1 ring-transparent hover:ring-line focus:ring-brand" aria-label="Traveller name" />
                    <span className={cn("font-mono text-xs", b > 0.005 ? "text-brand" : b < -0.005 ? "text-destructive" : "text-stone")}>{b > 0.005 ? `gets ${money(b)}` : b < -0.005 ? `owes ${money(-b)}` : "square"}</span>
                    <button
                      type="button"
                      disabled={inUse(p.id) || wallet.people.length <= 1}
                      onClick={() => change((w) => ({ ...w, people: w.people.filter((x) => x.id !== p.id) }))}
                      aria-label={`Remove ${p.name}`}
                      title={inUse(p.id) ? "In an expense already" : "Remove"}
                      className="grid size-7 place-items-center rounded-full text-stone transition hover:bg-paper-2 hover:text-ink disabled:opacity-30"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
            <form onSubmit={addPerson} className="mt-2 flex items-center gap-2">
              <input value={newPerson} onChange={(e) => setNewPerson(e.target.value)} placeholder="Add someone" className="min-w-0 flex-1 rounded-xl bg-paper-2/70 px-3 py-2 text-sm text-ink outline-none ring-1 ring-transparent placeholder:text-stone-2 focus:ring-brand" aria-label="New traveller" />
              <button type="submit" aria-label="Add traveller" className="grid size-9 place-items-center rounded-full bg-ink text-paper transition-colors hover:bg-brand">
                <UserPlus className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
