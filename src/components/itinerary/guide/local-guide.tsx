"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Banknote,
  Check,
  Clock3,
  Gift,
  HandHeart,
  Languages,
  Leaf,
  Lightbulb,
  MapPin,
  ShieldCheck,
  TramFront,
  UtensilsCrossed,
  Volume2,
  Wifi,
  X,
  PlaneLanding,
  HeartPulse,
  Droplets,
  Syringe,
  Pill,
  Info,
  Phone,
  Siren,
  TriangleAlert,
  Stamp,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { TipCategory, TripGuide } from "@/lib/trip";
import { cn } from "@/lib/utils";
import { PlacePhoto, asStop } from "../place-photo";
import { SectionTitle } from "./section-title";

const ease = [0.16, 1, 0.3, 1] as const;

type TabId = "phrases" | "culture" | "food" | "souvenirs" | "tips" | "safety";
const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "phrases", label: "Phrases", icon: Languages },
  { id: "food", label: "Must-try food", icon: UtensilsCrossed },
  { id: "culture", label: "Culture", icon: HandHeart },
  { id: "souvenirs", label: "Souvenirs", icon: Gift },
  { id: "safety", label: "Arrive & stay safe", icon: PlaneLanding },
  { id: "tips", label: "Tips & tricks", icon: Lightbulb },
];

const TIP: Record<TipCategory, { label: string; icon: LucideIcon }> = {
  money: { label: "Money", icon: Banknote },
  transport: { label: "Getting around", icon: TramFront },
  safety: { label: "Safety", icon: ShieldCheck },
  timing: { label: "Timing", icon: Clock3 },
  connectivity: { label: "Staying connected", icon: Wifi },
  etiquette: { label: "Etiquette", icon: HandHeart },
};

/** Reads a phrase aloud in the local language, when the browser has a voice for it. */
function useSpeech(lang?: string) {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speaking, setSpeaking] = useState<number | null>(null);
  useEffect(() => {
    if (!lang || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const base = lang.toLowerCase().split("-")[0];
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      setVoice(voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ?? voices.find((v) => v.lang.toLowerCase().startsWith(base)) ?? null);
    };
    pick();
    window.speechSynthesis.addEventListener("voiceschanged", pick);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", pick);
  }, [lang]);
  const say = (text: string, i: number) => {
    if (!voice) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = 0.85;
    u.onend = () => setSpeaking(null);
    u.onerror = () => setSpeaking(null);
    setSpeaking(i);
    window.speechSynthesis.speak(u);
  };
  return { canSpeak: !!voice, say, speaking };
}

function Phrases({ guide }: { guide: TripGuide }) {
  const { canSpeak, say, speaking } = useSpeech(guide.languageCode);
  return (
    <div>
      {guide.language && (
        <p className="mb-4 text-sm text-stone">
          Five phrases in <span className="text-ink">{guide.language}</span> that open doors{canSpeak ? ". Tap the speaker to hear them." : "."}
        </p>
      )}
      <ol className="divide-y divide-line overflow-hidden rounded-[24px] bg-white ring-1 ring-line">
        {guide.phrases.map((p, i) => (
          <li key={i} className="print-avoid grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 sm:grid-cols-[2.5rem_minmax(0,0.8fr)_minmax(0,1.2fr)_auto] sm:gap-5 sm:px-6">
            <span className="font-mono text-xs text-brand">{String(i + 1).padStart(2, "0")}</span>
            <span className="min-w-0 text-ink sm:text-[1.05rem]">
              {p.english}
              <span className="mt-0.5 block truncate text-sm text-stone sm:hidden">
                {p.local}
                {p.romanized && ` · ${p.romanized}`}
              </span>
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="display block truncate text-[1.7rem] leading-tight text-ink" lang={guide.languageCode}>
                {p.local}
              </span>
              <span className="block truncate text-sm text-stone">
                {p.romanized}
                {p.romanized && p.pronunciation && " · "}
                {p.pronunciation && <span className="italic">“{p.pronunciation}”</span>}
              </span>
            </span>
            {canSpeak ? (
              <button
                type="button"
                onClick={() => say(p.local, i)}
                aria-label={`Hear “${p.english}” in ${guide.language ?? "the local language"}`}
                className={cn(
                  "no-print grid size-10 place-items-center rounded-full transition-colors",
                  speaking === i ? "bg-brand text-white" : "bg-brand-soft text-brand hover:bg-brand hover:text-white"
                )}
              >
                <Volume2 className={cn("size-4", speaking === i && "animate-pulse")} />
              </button>
            ) : (
              <span />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Culture({ guide }: { guide: TripGuide }) {
  const col = (title: string, items: string[], good: boolean) => (
    <div className={cn("rounded-[24px] p-6", good ? "bg-brand-soft/70" : "bg-white ring-1 ring-line")}>
      <p className="eyebrow flex items-center gap-2 text-stone">
        <span className={cn("grid size-6 place-items-center rounded-full", good ? "bg-brand text-white" : "bg-ink text-paper")}>
          {good ? <Check className="size-3.5" /> : <X className="size-3.5" />}
        </span>
        {title}
      </p>
      <ul className="mt-4 space-y-3">
        {items.map((t, i) => (
          <li key={i} className="flex gap-3 leading-relaxed text-ink">
            <span className={cn("mt-2.5 size-1.5 shrink-0 rounded-full", good ? "bg-brand" : "bg-ink/40")} />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {col("Do", guide.etiquette.dos, true)}
      {col("Don't", guide.etiquette.donts, false)}
    </div>
  );
}

function Food({ guide, destination }: { guide: TripGuide; destination: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {guide.food.map((d, i) => (
        <article key={i} className={cn("print-avoid group flex flex-col overflow-hidden rounded-[24px] bg-white ring-1 ring-line", i === 0 && "sm:col-span-2 lg:col-span-1 lg:row-span-2")}>
          <div className={cn("relative overflow-hidden", i === 0 ? "h-48 lg:h-auto lg:min-h-64 lg:flex-1" : "h-40")}>
            <PlacePhoto activity={asStop(d.localName ? `${d.name} ${d.localName}` : d.name)} destination={destination} icon={UtensilsCrossed} credit={false} imgClassName="group-hover:scale-[1.05]" />
            {d.veg && (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-brand shadow-sm">
                <Leaf className="size-3" /> Veg
              </span>
            )}
          </div>
          <div className="p-5">
            <h4 className="display text-[1.55rem] leading-[1.02] text-ink">{d.name}</h4>
            {d.localName && d.localName !== d.name && <p className="mt-1 text-sm text-stone">{d.localName}</p>}
            <p className="mt-3 text-sm leading-relaxed text-stone">{d.what}</p>
            {d.whereToTry && (
              <p className="mt-4 flex items-start gap-2 rounded-2xl bg-paper-2/70 px-3 py-2.5 text-xs text-ink">
                <MapPin className="mt-px size-3.5 shrink-0 text-brand" />
                <span>
                  <span className="text-stone">Try it at </span>
                  {d.whereToTry}
                </span>
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function Souvenirs({ guide }: { guide: TripGuide }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {guide.souvenirs.map((s, i) => (
        <li key={i} className="print-avoid flex flex-col rounded-[24px] bg-white p-6 ring-1 ring-line">
          <div className="flex items-start justify-between gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-sun-soft text-ink">
              <Gift className="size-5" />
            </span>
            {s.priceRange && <span className="rounded-full bg-paper-2 px-2.5 py-1 font-mono text-xs text-ink">{s.priceRange}</span>}
          </div>
          <h4 className="display mt-4 text-[1.5rem] leading-[1.05] text-ink">{s.name}</h4>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-stone">{s.why}</p>
          {s.where && (
            <p className="mt-4 flex items-start gap-2 border-t border-line pt-3 text-xs text-ink">
              <MapPin className="mt-px size-3.5 shrink-0 text-brand" /> {s.where}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

const EMERGENCY: { key: keyof NonNullable<TripGuide["emergency"]>; label: string }[] = [
  { key: "general", label: "Emergency" },
  { key: "police", label: "Police" },
  { key: "ambulance", label: "Ambulance" },
  { key: "fire", label: "Fire" },
  { key: "tourist", label: "Tourist helpline" },
];

/** Landing, staying safe and getting in: the practical stuff people google at the airport. */
function Safety({ guide }: { guide: TripGuide }) {
  const numbers = EMERGENCY.filter((e) => guide.emergency?.[e.key]);
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
      <div className="space-y-3 lg:col-span-7">
        {!!guide.arrival?.length && (
          <div className="rounded-[24px] bg-white p-6 ring-1 ring-line">
            <p className="eyebrow flex items-center gap-2 text-stone">
              <PlaneLanding className="size-4 text-brand" /> From the airport
            </p>
            <ol className="mt-4 divide-y divide-line">
              {guide.arrival.map((a, i) => (
                <li key={i} className="print-avoid grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 py-3.5 first:pt-0 last:pb-0">
                  <span className="text-ink">{a.mode}</span>
                  <span className="text-right font-mono text-xs text-ink">
                    {[a.time, a.cost].filter(Boolean).join(" · ")}
                  </span>
                  {a.tip && <span className="col-span-2 text-sm leading-relaxed text-stone">{a.tip}</span>}
                </li>
              ))}
            </ol>
          </div>
        )}
        {!!guide.scams?.length && (
          <div className="rounded-[24px] bg-white p-6 ring-1 ring-line">
            <p className="eyebrow flex items-center gap-2 text-stone">
              <TriangleAlert className="size-4 text-sun" /> Watch out for
            </p>
            <ul className="mt-4 space-y-4">
              {guide.scams.map((x, i) => (
                <li key={i} className="print-avoid">
                  <p className="text-ink">{x.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone">{x.avoid}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="space-y-3 lg:col-span-5">
        {numbers.length > 0 && (
          <div className="relative overflow-hidden rounded-[24px] bg-ocean p-6 text-paper">
            <div className="pointer-events-none absolute -right-12 -top-16 size-44 rounded-full bg-destructive/25 blur-3xl" />
            <p className="eyebrow relative flex items-center gap-2 text-paper/60">
              <Siren className="size-4 text-sun-2" /> Emergency numbers
            </p>
            <ul className="relative mt-4 grid grid-cols-2 gap-2">
              {numbers.map((n) => (
                <li key={n.key}>
                  <a href={`tel:${guide.emergency![n.key]!.replace(/[^\d+]/g, "")}`} className="flex flex-col rounded-2xl bg-paper/[0.07] px-4 py-3 transition-colors hover:bg-paper hover:text-ink">
                    <span className="eyebrow text-[0.55rem] opacity-60">{n.label}</span>
                    <span className="display mt-1 flex items-center gap-2 text-2xl leading-none">
                      <Phone className="size-4 opacity-70" />
                      {guide.emergency![n.key]}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="relative mt-3 text-[11px] text-paper/50">Save these before you fly. Tap to call.</p>
          </div>
        )}
        {guide.health && (
          <div className="rounded-[24px] bg-white p-6 ring-1 ring-line">
            <p className="eyebrow flex items-center gap-2 text-stone">
              <HeartPulse className="size-4 text-brand" /> Health & water
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              {(
                [
                  ["Tap water", guide.health.tapWater, Droplets],
                  ["Vaccinations", guide.health.vaccines, Syringe],
                  ["Pharmacy", guide.health.pharmacy, Pill],
                  ["Good to know", guide.health.note, Info],
                ] as const
              )
                .filter(([, v]) => v)
                .map(([label, value, Icon]) => (
                  <div key={label} className="flex gap-3">
                    <Icon className="mt-0.5 size-4 shrink-0 text-brand" />
                    <div>
                      <dt className="eyebrow text-[0.55rem] text-stone">{label}</dt>
                      <dd className="mt-1 leading-relaxed text-ink">{value}</dd>
                    </div>
                  </div>
                ))}
            </dl>
          </div>
        )}
        {guide.entry && (
          <div className="rounded-[24px] bg-sun-soft/60 p-6 ring-1 ring-sun/25">
            <p className="eyebrow flex items-center gap-2 text-ink/60">
              <Stamp className="size-4 text-ink" /> Entry & visas{guide.entry.from ? ` · from ${guide.entry.from}` : ""}
            </p>
            <p className="mt-3 leading-relaxed text-ink">{guide.entry.summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Tips({ guide }: { guide: TripGuide }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {guide.tips.map((t, i) => {
        const c = TIP[t.category];
        return (
          <li key={i} className="print-avoid rounded-[24px] bg-white p-6 ring-1 ring-line">
            <p className="eyebrow flex items-center gap-2 text-[0.6rem] text-stone">
              <span className="grid size-8 place-items-center rounded-xl bg-brand-soft text-brand">
                <c.icon className="size-4" />
              </span>
              {c.label}
            </p>
            <p className="mt-4 leading-relaxed text-ink">{t.tip}</p>
          </li>
        );
      })}
    </ul>
  );
}

/** Phrases, food, culture, souvenirs and tips behind one tab bar, so the page stays calm. */
export function LocalGuide({ guide, destination }: { guide: TripGuide; destination: string }) {
  const tabs = TABS.filter((t) =>
    t.id === "phrases"
      ? guide.phrases.length
      : t.id === "food"
        ? guide.food.length
        : t.id === "culture"
          ? guide.etiquette.dos.length + guide.etiquette.donts.length
          : t.id === "souvenirs"
            ? guide.souvenirs.length
            : t.id === "safety"
              ? (guide.arrival?.length ?? 0) + (guide.scams?.length ?? 0) + (guide.emergency ? 1 : 0) + (guide.entry ? 1 : 0) + (guide.health ? 1 : 0)
              : guide.tips.length
  );
  const [tab, setTab] = useState<TabId>(tabs[0]?.id ?? "phrases");
  if (!tabs.length) return null;

  const body = (id: TabId) =>
    id === "phrases" ? <Phrases guide={guide} /> : id === "food" ? <Food guide={guide} destination={destination} /> : id === "culture" ? <Culture guide={guide} /> : id === "souvenirs" ? <Souvenirs guide={guide} /> : id === "safety" ? <Safety guide={guide} /> : <Tips guide={guide} />;

  return (
    <section className="mt-20">
      <SectionTitle
        eyebrow="Your local guide"
        title={
          <>
            Arrive like a <span className="italic text-brand">local.</span>
          </>
        }
      />
      <div role="tablist" aria-label="Local guide" className="no-print no-scrollbar -mx-4 mt-8 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {tabs.map((t) => {
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t.id)}
              className={cn("relative inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm transition-colors", on ? "text-paper" : "bg-white text-ink ring-1 ring-line hover:ring-ink/30")}
            >
              {on && <motion.span layoutId="guide-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <t.icon className={cn("relative size-4", on ? "text-sun-2" : "text-brand")} />
              <span className="relative">{t.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-5 print:hidden">
        <AnimatePresence mode="wait">
          <motion.div key={tab} role="tabpanel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease }}>
            {body(tab)}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* On paper every tab is printed, one after another. */}
      <div className="hidden space-y-8 print:block">
        {tabs.map((t) => (
          <div key={t.id}>
            <p className="eyebrow mb-3 text-stone">{t.label}</p>
            {body(t.id)}
          </div>
        ))}
      </div>
    </section>
  );
}
