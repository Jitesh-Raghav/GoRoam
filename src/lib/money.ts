"use client";

import { useSyncExternalStore } from "react";
import { formatMoney, homeCurrency } from "./currency";
import { fixedPrice, type Plan } from "./plans";

/**
 * Prices in the visitor's own money. Trip data is stored in USD; this keeps
 * one small store for the whole page with:
 *   - where the visitor is (their country's currency, from /api/region),
 *   - the currency they've picked for trip prices (remembered per device),
 *   - today's USD rates (from /api/fx).
 * Any client component can read it with `useMoney()`; there's no provider.
 * The server render and first paint show USD, then local prices settle in.
 */
interface State {
  /** The visitor's country (ISO, lower case), when known. */
  country: string | null;
  /** The currency of the visitor's country, or of their browser's locale until that's known. */
  region: string;
  /** A currency picked on the trip page, overriding `region` for trip prices. */
  pick: string | null;
  /** USD → currency rates. */
  rates: Record<string, number> | null;
  /** False on the server and during hydration. */
  live: boolean;
}

const SERVER: State = { country: null, region: "USD", pick: null, rates: null, live: false };
const PICK_KEY = "goroam:currency";
const REGION_KEY = "goroam:region";
const RATES_KEY = "goroam:fx";
const RATES_TTL = 12 * 3600 * 1000;

let state: State = SERVER;
let started = false;
const listeners = new Set<() => void>();

const read = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};
const write = (key: string, value: unknown) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or full storage: prices still work, they just aren't remembered.
  }
};

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

let ratesPromise: Promise<Record<string, number> | null> | null = null;
/** USD-based exchange rates, fetched once per page. */
export const loadRates = () => {
  if (!ratesPromise) {
    ratesPromise = fetch("/api/fx")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => (d?.rates as Record<string, number> | undefined) ?? null)
      .catch(() => null);
    ratesPromise.then((r) => {
      if (!r) ratesPromise = null;
      else {
        write(RATES_KEY, { at: Date.now(), rates: r });
        set({ rates: r });
      }
    });
  }
  return ratesPromise;
};

/** Reads what this device remembers, then refreshes the region and rates in the background. */
function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  const region = read<{ country: string | null; currency: string }>(REGION_KEY);
  const fx = read<{ at: number; rates: Record<string, number> }>(RATES_KEY);
  set({
    live: true,
    country: region?.country ?? null,
    region: region?.currency ?? homeCurrency(),
    pick: read<string>(PICK_KEY),
    rates: fx?.rates ?? null,
  });
  if (!fx || Date.now() - fx.at > RATES_TTL) void loadRates();
  fetch("/api/region")
    .then((r) => (r.ok ? r.json() : null))
    .then((d: { country: string | null; currency: string | null } | null) => {
      // No country header (local dev, some proxies): keep the browser's guess.
      if (!d?.currency) return;
      write(REGION_KEY, { country: d.country, currency: d.currency });
      set({ country: d.country, region: d.currency });
    })
    .catch(() => {});
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  start();
  return () => listeners.delete(l);
};

/** Keep 3 significant figures above 100, so a converted ₹4,163 reads as ₹4,160 rather than false precision. */
export function tidy(n: number) {
  const a = Math.abs(n);
  if (a < 100) return Math.round(n);
  const step = Math.pow(10, Math.floor(Math.log10(a)) - 2);
  return Math.round(n / step) * step;
}

/** "$1,234", the USD form trip prices have always used. */
const dollars = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export interface Money {
  /** The currency trip prices are shown in. */
  currency: string;
  /** The visitor's own currency. */
  region: string;
  country: string | null;
  rates: Record<string, number> | null;
  /** Whether the visitor has picked a currency themselves. */
  picked: boolean;
  /** False on the server and during hydration, when everything is still USD. */
  live: boolean;
  /** A USD amount in the shown currency: "₹4,160". Falls back to "$50" until rates arrive. */
  fmt: (usd: number | undefined, currency?: string) => string;
  /** A USD amount in another currency, unrounded; null without a rate. */
  convert: (usd: number, currency?: string) => number | null;
  /** An amount in some currency, in USD; null without a rate. */
  toUsd: (amount: number, currency: string) => number | null;
  /** Remember a currency for trip prices on this device (null goes back to the visitor's own). */
  setCurrency: (currency: string | null) => void;
}

function money(s: State): Money {
  const currency = s.pick ?? s.region;
  const rate = (c: string) => (c === "USD" ? 1 : (s.rates?.[c] ?? null));
  const convert = (usd: number, c = currency) => {
    const r = rate(c);
    return r === null ? null : usd * r;
  };
  return {
    currency: rate(currency) === null ? "USD" : currency,
    region: s.region,
    country: s.country,
    rates: s.rates,
    picked: !!s.pick,
    live: s.live,
    convert,
    toUsd: (amount, c) => {
      const r = rate(c);
      return r ? amount / r : null;
    },
    fmt: (usd, c = currency) => {
      const v = convert(usd ?? 0, c);
      return v === null || c === "USD" ? dollars(usd ?? 0) : formatMoney(tidy(v), c, 0);
    },
    setCurrency: (c) => {
      write(PICK_KEY, c);
      set({ pick: c });
    },
  };
}

let cachedFor: State | null = null;
let cached: Money = money(SERVER);
const serverMoney = cached;

/** Prices in the visitor's currency. See the note at the top of this file. */
export function useMoney(): Money {
  const s = useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER
  );
  if (s === SERVER) return serverMoney;
  if (s !== cachedFor) {
    cachedFor = s;
    cached = money(s);
  }
  return cached;
}

export interface PackPrice {
  /** "$9.99", "₹799" or "₹830" (a conversion, see `approx`). */
  price: string;
  /** The price is a conversion at today's rate, to show with "≈". */
  approx: boolean;
  /** "$1.00", "₹80" or "₹83" a trip (callers already say "≈"). */
  each: string;
  /** Set when the price shown is a conversion: what the card is actually charged, "$9.99". */
  billed: string | null;
  /** The currency checkout should charge in. */
  currency: string;
}

/** "£0.75" with its pence below `whole`, otherwise rounded ("₹80", "₹2,200"). */
const perUnit = (n: number, c: string, whole = 10) => {
  if (n >= whole) return formatMoney(tidy(n), c, 0);
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: c, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  } catch {
    return formatMoney(n, c, 2);
  }
};

const exact = (n: number, c: string) => (c === "USD" ? `$${n.toFixed(2)}` : formatMoney(n, c, Number.isInteger(n) ? 0 : 2));

/**
 * A pass's price (`each` is per day) for a visitor in `local` currency: their fixed local
 * price when we charge in it, otherwise the USD price with a "≈" conversion
 * beside it, so what's shown never differs from what's charged. `country` is
 * set only when the server told us where the visitor is, which is what
 * checkout goes by too.
 */
export function packPrice(plan: Plan, local: string, country: string | null, rates: Record<string, number> | null): PackPrice {
  const fixed = local === "USD" || country ? fixedPrice(plan.id, local) : null;
  if (fixed !== null) {
    return { approx: false, price: exact(fixed, local), each: local === "USD" ? exact(fixed / plan.days, "USD") : perUnit(fixed / plan.days, local), billed: null, currency: local };
  }
  const usd = exact(plan.price, "USD");
  const rate = rates?.[local];
  if (!rate || local === "USD") return { approx: false, price: usd, each: exact(plan.price / plan.days, "USD"), billed: null, currency: "USD" };
  const converted = plan.price * rate;
  return {
    approx: true,
    // Small amounts keep their cents (≈ €8.57); larger ones round (≈ ₹881).
    price: perUnit(converted, local, 100),
    each: perUnit(converted / plan.days, local),
    billed: usd,
    currency: "USD",
  };
}

/** `packPrice` for this visitor. */
export function usePackPrice() {
  const m = useMoney();
  return (plan: Plan) => packPrice(plan, m.region, m.country, m.rates);
}
