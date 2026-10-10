"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BedDouble, Car, Check, Copy, FileText, Loader2, MapPin, Plane, Plus, ShieldCheck, Ticket, TrainFront, Trash2, X, type LucideIcon } from "@/components/site/icons";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { BOOKING_KINDS, type BookingKind, type TripBooking } from "@/lib/trip";
import { cn } from "@/lib/utils";
import { SectionTitle } from "./guide/section-title";

const ease = [0.16, 1, 0.3, 1] as const;

const KIND: Record<BookingKind, { label: string; icon: LucideIcon; ref: string; title: string }> = {
  flight: { label: "Flight", icon: Plane, ref: "PNR / booking ref", title: "AI 314 · Mumbai → Osaka" },
  stay: { label: "Stay", icon: BedDouble, ref: "Confirmation no.", title: "Hotel The Celestine Kyoto" },
  train: { label: "Train / bus", icon: TrainFront, ref: "Ticket no.", title: "Shinkansen Nozomi 21" },
  car: { label: "Car / transfer", icon: Car, ref: "Booking ref", title: "MK Skygate shuttle" },
  activity: { label: "Tour / ticket", icon: Ticket, ref: "Booking ref", title: "Tea ceremony in Gion" },
  insurance: { label: "Insurance", icon: ShieldCheck, ref: "Policy no.", title: "Travel insurance" },
  other: { label: "Other", icon: FileText, ref: "Reference", title: "Visa approval" },
};

const uid = () => Math.random().toString(36).slice(2, 10);

const pretty = (v?: string) => {
  if (!v) return null;
  const [d, t] = v.split("T");
  const date = new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
  return t ? `${date} · ${t}` : date;
};

/** Sorts by when it happens; undated things (insurance, visas) go last. */
const order = (a: TripBooking, b: TripBooking) => (a.start ?? "9999").localeCompare(b.start ?? "9999");

function CopyRef({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setDone(true);
          window.setTimeout(() => setDone(false), 1400);
        });
      }}
      className="group/copy inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-2.5 py-1 font-mono text-xs text-ink transition-colors hover:bg-ink hover:text-paper"
      aria-label={`Copy ${value}`}
    >
      {value}
      {done ? <Check className="size-3.5 text-brand" /> : <Copy className="size-3.5 opacity-50 group-hover/copy:opacity-100" />}
    </button>
  );
}

/**
 * Bookings & documents: the confirmations people otherwise dig out of email at a
 * check-in desk. Flights, stays, trains, tours, insurance, one tidy timeline that's
 * saved with the trip, works offline, and goes into the calendar export.
 */
export function Bookings({ tripId, initial, defaultDate, onSaved }: { tripId: string; initial?: TripBooking[]; defaultDate: string; onSaved?: (b: TripBooking[]) => void }) {
  const [items, setItems] = useState<TripBooking[]>(initial ?? []);
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<BookingKind>("flight");
  const [form, setForm] = useState({ title: "", ref: "", start: "", end: "", location: "", notes: "" });
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!touched) return;
    window.clearTimeout(timer.current);
    setStatus("saving");
    timer.current = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/itinerary/${tripId}/bookings`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookings: items }) });
        const body = await res.json().catch(() => ({}));
        if (!res.ok || !body.success) throw new Error();
        setStatus("saved");
        onSaved?.(body.bookings);
      } catch {
        setStatus("error");
      }
    }, 500);
    return () => window.clearTimeout(timer.current);
    // onSaved is a fresh closure each render; saving depends only on the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, touched, tripId]);

  const update = (next: TripBooking[]) => {
    setTouched(true);
    setItems(next);
  };

  const add = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return setError(`Give it a name, like “${KIND[kind].title}”.`);
    if (form.end && form.start && form.end < form.start) return setError("The end is before the start.");
    setError(null);
    update(
      [...items, { id: uid(), kind, title: form.title.trim(), ref: form.ref.trim() || undefined, start: form.start || undefined, end: form.end || undefined, location: form.location.trim() || undefined, notes: form.notes.trim() || undefined }].sort(order)
    );
    setForm({ title: "", ref: "", start: "", end: "", location: "", notes: "" });
    setAdding(false);
  };

  const field = "w-full rounded-2xl bg-paper-2/70 px-4 py-3 text-sm text-ink outline-none ring-1 ring-transparent placeholder:text-stone-2 focus:ring-brand";
  const sorted = [...items].sort(order);

  return (
    <section className="mt-24 scroll-mt-6" id="bookings">
      <SectionTitle
        eyebrow="Bookings & documents"
        title={
          <>
            Everything, <span className="accent">in one place.</span>
          </>
        }
      >
        <div className="no-print flex items-center gap-3">
          <span className={cn("inline-flex items-center gap-1.5 text-xs", status === "error" ? "text-destructive" : "text-stone")} aria-live="polite">
            {status === "saving" && <Loader2 className="size-3.5 animate-spin" />}
            {status === "saved" && <Check className="size-3.5 text-brand" />}
            {status === "saving" ? "Saving" : status === "saved" ? "Saved, and in your calendar export" : status === "error" ? "Couldn't save, try again" : "Flights, stays, tickets, policies"}
          </span>
          <button type="button" onClick={() => setAdding((a) => !a)} className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm text-paper transition-colors hover:bg-brand">
            {adding ? <X className="size-4" /> : <Plus className="size-4" />} {adding ? "Close" : "Add a booking"}
          </button>
        </div>
      </SectionTitle>

      <AnimatePresence initial={false}>
        {adding && (
          <motion.form
            key="form"
            onSubmit={add}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease }}
            className="no-print overflow-hidden"
          >
            <div className="glass mt-8 rounded-[26px] p-5 sm:p-6">
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="What did you book?">
                {BOOKING_KINDS.map((k) => {
                  const K = KIND[k];
                  const on = k === kind;
                  return (
                    <button key={k} type="button" role="radio" aria-checked={on} onClick={() => setKind(k)} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors", on ? "bg-ink text-paper" : "bg-paper-2 text-ink hover:bg-paper-3")}>
                      <K.icon className={cn("size-3.5", on ? "text-sun-2" : "text-brand")} /> {K.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={`e.g. ${KIND[kind].title}`} className={field} aria-label="What is it" />
                <input value={form.ref} onChange={(e) => setForm({ ...form, ref: e.target.value })} placeholder={KIND[kind].ref} className={cn(field, "font-mono")} aria-label="Reference" />
                <label className="flex items-center gap-2 rounded-2xl bg-paper-2/70 px-4 py-1.5 text-xs text-stone ring-1 ring-transparent focus-within:ring-brand">
                  {kind === "stay" ? "Check-in" : kind === "insurance" ? "From" : "Starts"}
                  <input type={kind === "stay" || kind === "insurance" ? "date" : "datetime-local"} min={defaultDate} value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-ink outline-none" />
                </label>
                <label className="flex items-center gap-2 rounded-2xl bg-paper-2/70 px-4 py-1.5 text-xs text-stone ring-1 ring-transparent focus-within:ring-brand">
                  {kind === "stay" ? "Check-out" : kind === "insurance" ? "Until" : "Ends"}
                  <input type={kind === "stay" || kind === "insurance" ? "date" : "datetime-local"} min={form.start || defaultDate} value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-ink outline-none" />
                </label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder={kind === "flight" ? "Terminal / gate" : "Address or meeting point"} className={cn(field, "sm:col-span-2")} aria-label="Location" />
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Notes: seat, baggage, phone number, check-in instructions…" className={cn(field, "resize-none sm:col-span-2")} aria-label="Notes" />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-destructive">{error}</p>
                <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm text-white transition-colors hover:bg-ink">
                  <Plus className="size-4" /> Save booking
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {sorted.length ? (
        <ol className="relative mt-8 space-y-3 before:absolute before:bottom-6 before:left-[1.45rem] before:top-6 before:w-px before:border-l before:border-dashed before:border-brand/35">
          <AnimatePresence initial={false}>
            {sorted.map((b) => {
              const K = KIND[b.kind];
              return (
                <motion.li key={b.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.4, ease }} className="print-avoid group relative flex gap-4">
                  <span className="relative z-[1] mt-4 grid size-12 shrink-0 place-items-center rounded-2xl bg-ink text-paper shadow-[0_10px_24px_-12px_rgba(10,30,44,0.7)]">
                    <K.icon className="size-5" />
                  </span>
                  <div className="glass min-w-0 flex-1 rounded-[22px] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="eyebrow text-[0.55rem] text-brand">
                          {K.label}
                          {b.start && ` · ${pretty(b.start)}`}
                          {b.end && (
                            <>
                              {" "}
                              <ArrowRight className="inline size-3 -translate-y-px" /> {pretty(b.end)}
                            </>
                          )}
                        </p>
                        <h4 className="display mt-1.5 text-[1.27rem] leading-[1.05] text-ink">{b.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {b.ref && <CopyRef value={b.ref} />}
                        <button type="button" onClick={() => update(items.filter((x) => x.id !== b.id))} aria-label={`Delete ${b.title}`} className="no-print grid size-8 place-items-center rounded-full text-stone opacity-50 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                    {b.location && (
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.location)}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm text-stone transition-colors hover:text-brand">
                        <MapPin className="size-3.5 text-brand" /> {b.location}
                      </a>
                    )}
                    {b.notes && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone">{b.notes}</p>}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      ) : (
        !adding && (
          <button type="button" onClick={() => setAdding(true)} className="no-print mt-8 flex w-full flex-col items-center gap-2 rounded-[26px] border border-dashed border-line px-6 py-10 text-center transition-colors hover:border-brand hover:bg-white">
            <span className="flex gap-1.5 text-brand">
              <Plane className="size-5" />
              <BedDouble className="size-5" />
              <Ticket className="size-5" />
            </span>
            <span className="text-ink">Booked something? Keep it here.</span>
            <span className="max-w-md text-sm text-stone">Confirmation numbers, check-in times and addresses, ready at the airport desk, even without signal. Dated bookings also go into your calendar export.</span>
          </button>
        )
      )}
    </section>
  );
}
