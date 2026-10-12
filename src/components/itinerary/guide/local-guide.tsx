"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
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
  Hand,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "@/components/site/icons";
import { useCallback, useEffect, useRef, useState } from "react";
import type { TipCategory, TripGuide } from "@/lib/trip";
import { cn } from "@/lib/utils";
import { PlacePhoto, asDish, asThing } from "../place-photo";
import { Band } from "../band";
import { SectionTitle } from "./section-title";
import { LanguageLines } from "../hairlines";

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
export function useSpeech(lang?: string) {
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

const L = { fill: "none", stroke: "currentColor", strokeWidth: 1, vectorEffect: "non-scaling-stroke" as const, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const TINTS = ["#1A5FD6", "#F5B400", "#FF6B5B", "#2BB58A"];

function Phrases({ guide }: { guide: TripGuide }) {
  const { canSpeak, say, speaking } = useSpeech(guide.languageCode);
  return (
    <div>
      {guide.language && (
        <p className="mb-5 flex items-center gap-3 text-sm text-stone">
          <svg aria-hidden viewBox="0 0 24 24" className="size-6 text-brand">
            <circle {...L} cx="12" cy="12" r="9" />
            <path {...L} d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
          </svg>
          <span>
            Phrases in <span className="text-ink">{guide.language}</span> that open doors{canSpeak ? ". Tap the speaker to hear them." : "."}
          </span>
        </p>
      )}
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {guide.phrases.map((p, i) => {
          const hero = i === 0;
          const tint = TINTS[i % TINTS.length];
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
              className={cn("print-avoid relative isolate flex min-h-[11rem] flex-col overflow-hidden rounded-[26px] p-5 sm:p-6", hero ? "bg-ink text-paper sm:col-span-2" : "bg-white ring-1 ring-line")}
            >
              {hero ? (
                <LanguageLines speaking={speaking === 0} className="-z-10 opacity-90" />
              ) : (
                <>
                  <span aria-hidden className="absolute -right-10 -top-10 -z-10 size-36 rounded-full opacity-[0.14] blur-2xl" style={{ background: tint }} />
                  <svg aria-hidden viewBox="0 0 120 90" className="pointer-events-none absolute -right-2 bottom-2 -z-10 w-32 print:hidden" style={{ color: tint, opacity: 0.25 }}>
                    <path {...L} d="M20 10h80a12 12 0 0 1 12 12v32a12 12 0 0 1-12 12H58l-14 14 2-14H20A12 12 0 0 1 8 54V22a12 12 0 0 1 12-12z" />
                    <path {...L} d="M28 30h56M28 42h36" strokeDasharray="1 5" />
                  </svg>
                </>
              )}
              <span aria-hidden className={cn("display pointer-events-none absolute right-5 top-1 -z-10 select-none text-[6rem] leading-none", hero ? "text-paper/[0.07]" : "text-ink/[0.05]")}>“</span>
              <p className={cn("eyebrow flex items-center gap-2 text-[0.6rem]", hero ? "text-paper/60" : "text-stone")}>
                <span className="font-mono" style={{ color: hero ? undefined : tint }}>{String(i + 1).padStart(2, "0")}</span> {p.english}
              </p>
              <p className={cn("display mt-auto pt-6 leading-tight", hero ? "text-[clamp(2rem,4vw,3rem)]" : "text-[1.7rem]")} lang={guide.languageCode}>
                {p.local}
              </p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className={cn("min-w-0 text-sm", hero ? "text-paper/75" : "text-stone")}>
                  {p.romanized && <span className={hero ? "text-brand-2" : "text-brand"}>{p.romanized}</span>}
                  {p.pronunciation && <span className="block italic">“{p.pronunciation}”</span>}
                </p>
                {canSpeak && (
                  <button
                    type="button"
                    onClick={() => say(p.local, i)}
                    aria-label={`Hear “${p.english}” in ${guide.language ?? "the local language"}`}
                    className={cn(
                      "no-print relative grid size-11 shrink-0 place-items-center rounded-full transition-colors",
                      speaking === i ? "bg-brand text-white" : hero ? "bg-paper/10 text-paper hover:bg-paper/20" : "bg-brand-soft text-brand hover:bg-brand hover:text-white"
                    )}
                  >
                    {speaking === i && <span className="absolute inset-0 animate-ping rounded-full bg-brand/40" />}
                    <Volume2 className="relative size-5" />
                  </button>
                )}
              </div>
            </motion.li>
          );
        })}
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
            {/* A photo of the dish itself, captioned with where to eat it in town. */}
            <PlacePhoto activity={asDish(d.name)} destination={destination} icon={UtensilsCrossed} imgClassName="group-hover:scale-[1.05]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink/55 to-transparent" />
            {d.whereToTry && (
              <span className="absolute bottom-2.5 left-3 inline-flex max-w-[58%] items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink shadow-sm backdrop-blur">
                <MapPin className="size-3 shrink-0 text-brand" />
                <span className="truncate">{d.whereToTry.split(",")[0]}</span>
              </span>
            )}
            {d.veg && (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-brand shadow-sm">
                <Leaf className="size-3" /> Veg
              </span>
            )}
          </div>
          <div className="p-5">
            <h4 className="display text-[1.32rem] leading-[1.02] text-ink">{d.name}</h4>
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

function Souvenirs({ guide, destination }: { guide: TripGuide; destination: string }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {guide.souvenirs.map((s, i) => (
        <li key={i} className="print-avoid group flex flex-col overflow-hidden rounded-[24px] bg-white ring-1 ring-line">
          <div className="relative h-40 overflow-hidden print:hidden">
            {/* A photo of the thing itself; the gift tile stands in when none turns up. */}
            <PlacePhoto activity={asThing(s.name)} destination={destination} icon={Gift} credit={false} imgClassName="group-hover:scale-[1.05]" />
            {s.priceRange && <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 font-mono text-xs text-ink shadow-sm">{s.priceRange}</span>}
          </div>
          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <h4 className="display text-[1.27rem] leading-[1.05] text-ink">{s.name}</h4>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-stone">{s.why}</p>
            {s.where && (
              <p className="mt-4 flex items-start gap-2 border-t border-line pt-3 text-xs text-ink">
                <MapPin className="mt-px size-3.5 shrink-0 text-brand" /> {s.where}
              </p>
            )}
          </div>
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
                    <span className="display mt-1 flex items-center gap-2 text-xl leading-none">
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

/** A small hairline drawing for each kind of tip. */
function TipArt({ category }: { category: TipCategory }) {
  const art: Record<TipCategory, React.ReactNode> = {
    money: (
      <>
        <ellipse {...L} cx="60" cy="52" rx="22" ry="7" />
        <path {...L} d="M38 52v-8c0 4 10 7 22 7s22-3 22-7v8M38 44v-8c0 4 10 7 22 7s22-3 22-7v8M38 36c0-4 10-7 22-7s22 3 22 7-10 7-22 7-22-3-22-7z" />
        <path {...L} d="M100 20h40M100 30h28M100 40h34" strokeDasharray="1 4" />
      </>
    ),
    transport: (
      <>
        <path {...L} d="M10 56C40 56 40 20 70 20s40 36 80 36" strokeDasharray="2 5" />
        <circle {...L} cx="10" cy="56" r="4" />
        <path {...L} d="M150 56c0-6 5-10 5-14a5 5 0 0 0-10 0c0 4 5 8 5 14z" />
        <rect {...L} x="58" y="10" width="26" height="18" rx="5" />
        <path {...L} d="M62 28l-3 5M80 28l3 5M58 19h26" />
      </>
    ),
    safety: (
      <>
        <path {...L} d="M80 8l26 9v16c0 15-11 24-26 29-15-5-26-14-26-29V17z" />
        <path {...L} d="M68 34l8 8 16-16" />
        <circle {...L} cx="80" cy="35" r="40" strokeDasharray="1 6" />
      </>
    ),
    timing: (
      <>
        <circle {...L} cx="80" cy="34" r="24" />
        <path {...L} d="M80 18v16l11 7" />
        <path {...L} d="M80 6v4M80 58v4M52 34h4M104 34h4" />
        <path {...L} d="M20 50h24M116 50h24" strokeDasharray="1 4" />
      </>
    ),
    connectivity: (
      <>
        <path {...L} d="M50 30a42 42 0 0 1 60 0M60 40a28 28 0 0 1 40 0M70 50a14 14 0 0 1 20 0" />
        <circle {...L} cx="80" cy="58" r="2.5" />
        <path {...L} d="M10 58h40M110 58h40" strokeDasharray="1 4" />
      </>
    ),
    etiquette: (
      <>
        <path {...L} d="M64 60V40c0-6 4-10 10-10h12c6 0 10 4 10 10v20" />
        <path {...L} d="M80 22a8 8 0 1 0 0-.1" />
        <path {...L} d="M40 60h80" />
        <path {...L} d="M100 30c8-4 14-2 18 4M60 30c-8-4-14-2-18 4" strokeDasharray="1 4" />
      </>
    ),
  };
  return (
    <svg aria-hidden viewBox="0 0 160 66" preserveAspectRatio="xMaxYMid meet" className="pointer-events-none absolute inset-y-2 right-3 h-[calc(100%-1rem)] w-auto print:hidden">
      {art[category] ?? (
        <>
          <circle {...L} cx="80" cy="33" r="24" />
          <path {...L} d="M80 9l6 24-6 24-6-24z" />
        </>
      )}
    </svg>
  );
}

const TIP_TONE = [
  { band: "from-brand-soft to-white", art: "text-brand/45", chip: "bg-white text-brand" },
  { band: "from-sun-soft to-white", art: "text-sun/70", chip: "bg-white text-ink" },
  { band: "from-coral-soft to-white", art: "text-coral/55", chip: "bg-white text-coral" },
  { band: "from-emerald-50 to-white", art: "text-emerald-500/50", chip: "bg-white text-emerald-700" },
];

function Tips({ guide }: { guide: TripGuide }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {guide.tips.map((t, i) => {
        const c = TIP[t.category] ?? TIP.money;
        const hero = i === 0;
        const tone = TIP_TONE[i % TIP_TONE.length];
        return (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
            className={cn("print-avoid group relative overflow-hidden rounded-[26px] transition-transform duration-500 hover:-translate-y-1", hero ? cn("bg-ink text-paper", (guide.tips.length + 1) % 3 === 0 && "lg:col-span-2") : "bg-white ring-1 ring-line")}
          >
            <div className={cn("relative h-[4.5rem]", hero ? "bg-gradient-to-r from-brand/40 to-transparent text-brand-2/60" : cn("bg-gradient-to-b", tone.band, tone.art))}>
              <TipArt category={t.category} />
              <span className={cn("absolute left-5 top-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs shadow-sm", hero ? "bg-paper/10 text-paper ring-1 ring-paper/20" : tone.chip)}>
                <c.icon className="size-4" /> {c.label}
              </span>
            </div>
            <span aria-hidden className={cn("display pointer-events-none absolute bottom-0 right-4 select-none text-[5rem] leading-none", hero ? "text-paper/[0.06]" : "text-ink/[0.04]")}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className={cn("relative px-6 pb-6 pt-3 leading-relaxed", hero ? "text-[1.1rem] text-paper/90" : "text-ink")}>{t.tip}</p>
          </motion.li>
        );
      })}
    </ul>
  );
}

/** How many items each tab holds (0 hides the tab). */
function countFor(id: TabId, guide: TripGuide) {
  if (id === "phrases") return guide.phrases.length;
  if (id === "food") return guide.food.length;
  if (id === "culture") return guide.etiquette.dos.length + guide.etiquette.donts.length;
  if (id === "souvenirs") return guide.souvenirs.length;
  if (id === "safety") return (guide.arrival?.length ?? 0) + (guide.scams?.length ?? 0) + (guide.emergency ? 1 : 0) + (guide.entry ? 1 : 0) + (guide.health ? 1 : 0);
  return guide.tips.length;
}

/** Phrases, food, culture, souvenirs and tips behind one tab bar, so the page stays calm. */
export function LocalGuide({ guide, destination }: { guide: TripGuide; destination: string }) {
  const tabs = TABS.map((t) => ({ ...t, count: countFor(t.id, guide) })).filter((t) => t.count > 0);
  const [tab, setTab] = useState<TabId>(tabs[0]?.id ?? "phrases");
  const [touched, setTouched] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const seen = useInView(bar, { once: true, amount: 0.8 });
  const reduce = useReducedMotion();
  const [edges, setEdges] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const el = bar.current;
    if (!el) return;
    setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, tabs.length]);

  if (!tabs.length) return null;

  const pick = (id: TabId) => {
    setTab(id);
    setTouched(true);
    // Centre the tab by scrolling the bar alone. scrollIntoView would also scroll every
    // ancestor that can scroll, including the band, and push the whole section off-screen.
    const el = bar.current;
    const chip = el?.querySelector<HTMLElement>(`[data-tab="${id}"]`);
    if (el && chip) el.scrollTo({ left: chip.offsetLeft - el.clientWidth / 2 + chip.offsetWidth / 2, behavior: "smooth" });
  };
  const nudge = (dir: number) => bar.current?.scrollBy({ left: dir * bar.current.clientWidth * 0.6, behavior: "smooth" });

  const body = (id: TabId) =>
    id === "phrases" ? <Phrases guide={guide} /> : id === "food" ? <Food guide={guide} destination={destination} /> : id === "culture" ? <Culture guide={guide} /> : id === "souvenirs" ? <Souvenirs guide={guide} destination={destination} /> : id === "safety" ? <Safety guide={guide} /> : <Tips guide={guide} />;
  const current = tabs.find((t) => t.id === tab) ?? tabs[0];

  return (
    <Band tone="panel">
      <SectionTitle
        eyebrow="Your local guide"
        title={
          <>
            Arrive like a <span className="accent">local.</span>
          </>
        }
      >
        <p className="no-print inline-flex items-center gap-2 self-start rounded-full bg-ink/80 px-3.5 py-2 text-xs text-paper shadow-lg ring-1 ring-inset ring-paper/15 backdrop-blur sm:self-auto">
          <motion.span
            aria-hidden
            animate={touched || reduce ? undefined : { x: [0, 4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex"
          >
            <Hand className="size-3.5 -rotate-12 text-sun-2" />
          </motion.span>
          {tabs.length} topics · tap to explore
        </p>
      </SectionTitle>

      <div className="no-print relative mt-8">
        <div className="rounded-[24px] bg-paper-2/80 p-1.5 ring-1 ring-inset ring-line">
          <div ref={bar} role="tablist" aria-label="Local guide" onScroll={measure} className="no-scrollbar relative flex gap-1 overflow-x-auto scroll-px-10">
            {/* A one-time sweep of light across the bar when it scrolls into view. */}
            {seen && !reduce && (
              <motion.span
                aria-hidden
                initial={{ x: "-120%" }}
                animate={{ x: "420%" }}
                transition={{ duration: 1.6, ease: "easeInOut", delay: 0.2 }}
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/4 bg-gradient-to-r from-transparent via-white/80 to-transparent"
              />
            )}
            {tabs.map((t, i) => {
              const on = tab === t.id;
              return (
                <motion.button
                  key={t.id}
                  data-tab={t.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => pick(t.id)}
                  animate={seen && !reduce && !touched ? { y: [0, -5, 0] } : undefined}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.09, ease: "easeOut" }}
                  className={cn(
                    "relative flex shrink-0 items-center gap-2.5 rounded-[20px] py-2 pl-2 pr-3 text-sm transition-colors sm:flex-1 sm:justify-center sm:pr-3.5",
                    on ? "text-paper" : "text-ink hover:bg-white/70"
                  )}
                >
                  {on && <motion.span layoutId="guide-tab" className="absolute inset-0 rounded-[20px] bg-ink shadow-[0_14px_30px_-14px_rgba(14,31,59,0.8)]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <span className={cn("relative grid size-8 shrink-0 place-items-center rounded-xl transition-colors", on ? "bg-paper/10 text-sun-2" : "bg-brand-soft text-brand")}>
                    <t.icon className="size-4" />
                  </span>
                  <span className="relative whitespace-nowrap font-medium">{t.label}</span>
                  <span className={cn("relative grid h-5 min-w-5 place-items-center rounded-full px-1.5 font-mono text-[10px]", on ? "bg-sun-2 text-ink" : "bg-ink/[0.07] text-ink/70")}>{t.count}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
        {/* Edge fades and arrows when the bar scrolls sideways (phones). */}
        {edges.left && (
          <>
            <span aria-hidden className="pointer-events-none absolute inset-y-1.5 left-1.5 w-12 rounded-l-[20px] bg-gradient-to-r from-paper-2 to-transparent" />
            <button type="button" onClick={() => nudge(-1)} aria-label="Earlier topics" className="absolute left-0 top-1/2 grid size-8 -translate-x-1/3 -translate-y-1/2 place-items-center rounded-full bg-ink text-paper shadow-lg">
              <ChevronLeft className="size-4" />
            </button>
          </>
        )}
        {edges.right && (
          <>
            <span aria-hidden className="pointer-events-none absolute inset-y-1.5 right-1.5 w-12 rounded-r-[20px] bg-gradient-to-l from-paper-2 to-transparent" />
            <button type="button" onClick={() => nudge(1)} aria-label="More topics" className="absolute right-0 top-1/2 grid size-8 -translate-y-1/2 translate-x-1/3 place-items-center rounded-full bg-ink text-paper shadow-lg">
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
      </div>

      <div className="mt-6 print:hidden">
        <p className="eyebrow mb-4 flex items-center gap-2 px-1 text-[0.6rem] text-stone">
          <current.icon className="size-3.5 text-brand" /> {current.label} · {current.count} {current.count === 1 ? "pick" : "picks"}
        </p>
        <AnimatePresence mode="wait">
          <motion.div key={tab} role="tabpanel" aria-label={current.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease }}>
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
    </Band>
  );
}
