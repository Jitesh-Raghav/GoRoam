"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BedDouble, Users } from "@/components/site/icons";
import { plannerHref } from "@/lib/prompt-parse";
import { cn } from "@/lib/utils";

/** The few fields of a trip the calculator needs, so the whole trip list isn't shipped to the browser. */
export interface BudgetTrip {
  slug: string;
  name: string;
  destination: string;
  india: boolean;
  /** Per person a day, in the trip's own currency: backpacker, mid-range. */
  low: number;
  mid: number;
}

const USD_TO_INR = 88;
const fmt = (n: number, inr: boolean) => (inr ? `₹${Math.round(n).toLocaleString("en-IN")}` : `$${Math.round(n).toLocaleString("en-US")}`);

function Slider({ label, value, min, max, step = 1, onChange, show }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; show: string }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-sm">
        <span className="text-stone">{label}</span>
        <span className="display text-xl text-ink">{show}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full accent-[#1A5FD6]" />
    </label>
  );
}

/** How far the group's money goes: per head per day, the kind of stay it buys, and a trip that fits. */
export function CrewBudget({ trips }: { trips: BudgetTrip[] }) {
  const [people, setPeople] = useState(5);
  const [days, setDays] = useState(4);
  const [abroad, setAbroad] = useState(false);
  const [each, setEach] = useState(15000);

  const inr = !abroad;
  const max = abroad ? 3000 : 80000;
  const step = abroad ? 50 : 500;
  const value = Math.min(each, max);
  const perDay = value / days;
  const total = value * people;
  // A rough split: about 40% of the money goes on beds.
  const bedNight = (perDay * 0.4 * people);
  const stay =
    perDay < (inr ? 2500 : 60)
      ? { kind: "Hostel dorms or a shared homestay", note: "Social, cheap and easy to book for a crowd." }
      : perDay < (inr ? 6000 : 140)
        ? { kind: people >= 5 ? "A villa or big apartment, split" : "Budget hotel rooms, two to a room", note: people >= 5 ? "A villa is often cheaper per head than rooms, with a kitchen and pool." : "Twin rooms keep it simple." }
        : { kind: "A private villa with a pool", note: "Room for everyone, a pool for the afternoons and dinners in." };

  const pick = useMemo(() => {
    const pool = trips.filter((t) => t.india !== abroad);
    // The trip whose budget-to-mid range best fits what each person has a day.
    const scored = pool
      .map((t) => ({ t, gap: Math.abs((t.low + t.mid) / 2 - perDay) }))
      .sort((a, b) => a.gap - b.gap);
    return scored.slice(0, 3).map((x) => x.t);
  }, [trips, abroad, perDay]);

  const lead = pick[0];
  const href = lead
    ? plannerHref({
        destination: lead.destination,
        days,
        interests: [],
        diet: [],
        notes: `A ${days}-day trip with ${people} friends, around ${fmt(value, inr)} each`,
      })
    : "/dashboard";

  return (
    <div className="grid gap-5 overflow-hidden rounded-panel bg-white p-5 ring-1 ring-line sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
      <div className="space-y-6">
        <div role="tablist" aria-label="Where" className="inline-flex rounded-full bg-paper-2 p-1 text-sm">
          {[
            ["India", false],
            ["Abroad", true],
          ].map(([l, v]) => (
            <button
              key={String(l)}
              type="button"
              role="tab"
              aria-selected={abroad === v}
              onClick={() => {
                setAbroad(v as boolean);
                setEach(v ? 1200 : 15000);
              }}
              className={cn("rounded-full px-4 py-1.5 transition-colors", abroad === v ? "bg-ink text-paper" : "text-ink")}
            >
              {l as string}
            </button>
          ))}
        </div>
        <Slider label="Friends going" value={people} min={2} max={15} onChange={setPeople} show={`${people}`} />
        <Slider label="Days" value={days} min={2} max={10} onChange={setDays} show={`${days}`} />
        <Slider label="Budget each (excluding flights or trains)" value={value} min={abroad ? 200 : 3000} max={max} step={step} onChange={setEach} show={fmt(value, inr)} />
      </div>

      <div className="flex flex-col rounded-[24px] bg-ink p-5 text-paper sm:p-6">
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs text-paper/60">Each person, a day</dt>
            <dd className="display mt-1 text-3xl">{fmt(perDay, inr)}</dd>
          </div>
          <div>
            <dt className="text-xs text-paper/60">The whole group</dt>
            <dd className="display mt-1 text-3xl">{fmt(total, inr)}</dd>
          </div>
          <div className="col-span-2 rounded-2xl bg-white/[0.07] p-4">
            <dt className="flex items-center gap-2 text-xs text-paper/60">
              <BedDouble className="size-4 text-sun-2" /> Where you can stay
            </dt>
            <dd className="mt-1">{stay.kind}</dd>
            <dd className="mt-0.5 text-sm text-paper/70">
              {stay.note} About {fmt(bedNight, inr)} a night for all {people} of you.
            </dd>
          </div>
        </dl>
        {pick.length > 0 && (
          <div className="mt-4">
            <p className="flex items-center gap-2 text-xs text-paper/60">
              <Users className="size-4 text-sun-2" /> Trips that fit this budget
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {pick.map((t) => (
                <li key={t.slug}>
                  <Link href={`/trips/${t.slug}`} className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-sm ring-1 ring-white/15 hover:bg-white hover:text-ink">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Link href={href} className="group mt-6 inline-flex items-center justify-center gap-2 self-start rounded-full bg-sun-2 px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-white">
          Plan {lead ? `${lead.name} ` : ""}for {people} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <p className="mt-3 text-xs text-paper/50">Rough guide; prices vary by season. {abroad ? `$1 ≈ ₹${USD_TO_INR}.` : ""}</p>
      </div>
    </div>
  );
}
