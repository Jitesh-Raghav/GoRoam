"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, HandCoins, Plus, Trash2 } from "@/components/site/icons";
import { cn } from "@/lib/utils";

interface Person {
  name: string;
  paid: number;
}

const KEY = "goroam:crew-split";
const START: Person[] = [
  { name: "Riya", paid: 18000 },
  { name: "Arjun", paid: 2400 },
  { name: "Sana", paid: 6500 },
  { name: "Kabir", paid: 0 },
];

/** The fewest payments that square everyone up: biggest debtor pays biggest creditor, repeat. */
export function settle(people: Person[]) {
  const total = people.reduce((n, p) => n + p.paid, 0);
  const share = people.length ? total / people.length : 0;
  const owe = people.map((p) => ({ name: p.name, bal: p.paid - share }));
  const debtors = owe.filter((p) => p.bal < -0.5).sort((a, b) => a.bal - b.bal);
  const creditors = owe.filter((p) => p.bal > 0.5).sort((a, b) => b.bal - a.bal);
  const moves: { from: string; to: string; amount: number }[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(-debtors[i].bal, creditors[j].bal);
    moves.push({ from: debtors[i].name, to: creditors[j].name, amount });
    debtors[i].bal += amount;
    creditors[j].bal -= amount;
    if (debtors[i].bal > -0.5) i++;
    if (creditors[j].bal < 0.5) j++;
  }
  return { total, share, moves };
}

/** Who owes whom after a trip: enter what each friend paid, get the fewest transfers to settle. */
export function CrewSplit() {
  const [people, setPeople] = useState<Person[]>(START);
  const [usd, setUsd] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setPeople(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(people));
    } catch {}
  }, [people]);

  const fmt = (n: number) => (usd ? `$${Math.round(n).toLocaleString("en-US")}` : `₹${Math.round(n).toLocaleString("en-IN")}`);
  const { total, share, moves } = useMemo(() => settle(people.filter((p) => p.name.trim())), [people]);
  const update = (i: number, patch: Partial<Person>) => setPeople((ps) => ps.map((p, k) => (k === i ? { ...p, ...patch } : p)));

  return (
    <div className="grid gap-5 overflow-hidden rounded-panel bg-white p-5 ring-1 ring-line sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-stone">Who paid what</p>
          <button type="button" onClick={() => setUsd((u) => !u)} className="rounded-full bg-paper-2 px-3 py-1 text-xs text-ink">
            {usd ? "$ USD" : "₹ INR"}
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {people.map((p, i) => (
            <li key={i} className="flex items-center gap-2">
              <input
                value={p.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="Name"
                aria-label="Name"
                className="min-w-0 flex-1 rounded-xl bg-paper-2/60 px-3 py-2.5 text-sm text-ink outline-none ring-1 ring-line focus:ring-brand"
              />
              <span className="relative w-32 shrink-0">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone">{usd ? "$" : "₹"}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={p.paid || ""}
                  onChange={(e) => update(i, { paid: Math.max(0, Number(e.target.value) || 0) })}
                  placeholder="0"
                  aria-label={`${p.name || "This person"} paid`}
                  className="w-full rounded-xl bg-paper-2/60 py-2.5 pl-7 pr-3 text-right text-sm text-ink outline-none ring-1 ring-line focus:ring-brand"
                />
              </span>
              <button
                type="button"
                onClick={() => setPeople((ps) => ps.filter((_, k) => k !== i))}
                disabled={people.length <= 2}
                aria-label="Remove"
                className="grid size-9 shrink-0 place-items-center rounded-full text-stone hover:bg-paper-2 hover:text-ink disabled:opacity-30"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        {people.length < 12 && (
          <button type="button" onClick={() => setPeople((ps) => [...ps, { name: "", paid: 0 }])} className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-brand hover:bg-brand-soft">
            <Plus className="size-4" /> Add a friend
          </button>
        )}
      </div>

      <div className="flex flex-col rounded-[24px] bg-[linear-gradient(160deg,#0E1F3B,#1A3570)] p-5 text-paper sm:p-6">
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs text-paper/60">Trip total</dt>
            <dd className="display mt-1 text-3xl">{fmt(total)}</dd>
          </div>
          <div>
            <dt className="text-xs text-paper/60">Fair share each</dt>
            <dd className="display mt-1 text-3xl">{fmt(share)}</dd>
          </div>
        </dl>
        <p className="mt-5 flex items-center gap-2 text-xs text-paper/60">
          <HandCoins className="size-4 text-sun-2" /> Settle up in {moves.length} {moves.length === 1 ? "payment" : "payments"}
        </p>
        <ul className="mt-2 space-y-2">
          {moves.length === 0 && <li className="text-sm text-paper/70">Everyone&apos;s square. Nice.</li>}
          {moves.map((m) => (
            <li key={`${m.from}-${m.to}`} className={cn("flex items-center justify-between gap-3 rounded-2xl bg-white/[0.08] px-4 py-3 text-sm")}>
              <span>
                <span className="font-medium">{m.from}</span> <span className="text-paper/60">pays</span> <span className="font-medium">{m.to}</span>
              </span>
              <span className="font-mono">{fmt(m.amount)}</span>
            </li>
          ))}
        </ul>
        <Link href="/dashboard" className="group mt-auto inline-flex items-center gap-2 self-start pt-6 text-sm text-sun-2 hover:text-paper">
          Plan a trip and track this in its wallet <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
