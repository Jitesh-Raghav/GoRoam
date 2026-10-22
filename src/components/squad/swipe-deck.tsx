"use client";

import { AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { useState } from "react";
import { GuideCover } from "@/components/seo/guide-media";
import { Heart, MapPin, RotateCcw, X } from "@/components/site/icons";
import type { DeckCard } from "@/lib/squad-match";

const money = (c: DeckCard) => (c.currency === "USD" ? `$${c.perDay.toLocaleString("en-US")}` : `₹${c.perDay.toLocaleString("en-IN")}`);

function Card({ card, onSwipe }: { card: DeckCard; onSwipe: (like: boolean) => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-14, 14]);
  const yes = useTransform(x, [30, 120], [0, 1]);
  const no = useTransform(x, [-120, -30], [1, 0]);

  const end = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 110 || info.velocity.x > 600) onSwipe(true);
    else if (info.offset.x < -110 || info.velocity.x < -600) onSwipe(false);
  };

  return (
    <motion.div
      style={{ x, rotate }}
      drag="x"
      dragSnapToOrigin
      onDragEnd={end}
      variants={{
        enter: { scale: 0.94, y: 14, opacity: 0 },
        show: { scale: 1, y: 0, opacity: 1 },
        // Out the way it was swiped: `custom` is +1 for in, -1 for nope.
        gone: (dir: number) => ({ x: dir * 520, opacity: 0, rotate: dir * 18, transition: { duration: 0.32 } }),
      }}
      initial="enter"
      animate="show"
      exit="gone"
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="absolute inset-0 cursor-grab touch-pan-y overflow-hidden rounded-[28px] bg-white shadow-[0_30px_70px_-30px_rgba(14,31,59,0.55)] ring-1 ring-line active:cursor-grabbing"
    >
      <GuideCover destination={card.destination} landscape={card.landscape} width={700} credit={false} className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 bottom-0 p-5 text-paper sm:p-6">
          <p className="flex items-center gap-1.5 text-sm text-paper/85">
            <MapPin className="size-4" /> {card.region === card.country ? card.country : `${card.region}, ${card.country}`}
          </p>
          <p className="display mt-1 text-[2.4rem] leading-none">{card.name}</p>
          <p className="mt-2 line-clamp-2 text-sm leading-snug text-paper/85">{card.tagline}</p>
          <p className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs ring-1 ring-white/25 backdrop-blur">
            {card.days} days · from {money(card)}/day each
          </p>
        </div>
      </GuideCover>
      <motion.span style={{ opacity: yes }} className="absolute left-5 top-5 -rotate-12 rounded-xl border-4 border-[#25D366] px-3 py-1 text-2xl font-bold tracking-wider text-[#25D366]">
        IN
      </motion.span>
      <motion.span style={{ opacity: no }} className="absolute right-5 top-5 rotate-12 rounded-xl border-4 border-[#FF5A5F] px-3 py-1 text-2xl font-bold tracking-wider text-[#FF5A5F]">
        NOPE
      </motion.span>
    </motion.div>
  );
}

/** Tinder for trips: drag right if you'd go, left if not, or use the buttons. */
export function SwipeDeck({ cards, onDone }: { cards: DeckCard[]; onDone: (likes: string[], passes: string[]) => void }) {
  const [i, setI] = useState(0);
  const [likes, setLikes] = useState<string[]>([]);
  const [passes, setPasses] = useState<string[]>([]);
  const [dir, setDir] = useState(1);

  const swipe = (like: boolean) => {
    const card = cards[i];
    if (!card) return;
    const l = like ? [...likes, card.slug] : likes;
    const p = like ? passes : [...passes, card.slug];
    setLikes(l);
    setPasses(p);
    setDir(like ? 1 : -1);
    if (i + 1 >= cards.length) setTimeout(() => onDone(l, p), 280);
    setI(i + 1);
  };
  const undo = () => {
    if (!i) return;
    const prev = cards[i - 1].slug;
    setLikes((l) => l.filter((s) => s !== prev));
    setPasses((p) => p.filter((s) => s !== prev));
    setI(i - 1);
  };

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-3 flex items-center gap-1">
        {cards.map((c, k) => (
          <span key={c.slug} className={`h-1 flex-1 rounded-full ${k < i ? (likes.includes(c.slug) ? "bg-[#25D366]" : "bg-[#FF5A5F]/70") : k === i ? "bg-ink" : "bg-line"}`} />
        ))}
      </div>
      <div className="relative aspect-[3/4] w-full">
        {cards[i + 1] && (
          <div className="absolute inset-0 translate-y-3 scale-[0.95] overflow-hidden rounded-[28px] opacity-60 ring-1 ring-line">
            <GuideCover destination={cards[i + 1].destination} landscape={cards[i + 1].landscape} width={500} credit={false} className="absolute inset-0" />
          </div>
        )}
        <AnimatePresence custom={dir}>{cards[i] && <Card key={cards[i].slug} card={cards[i]} onSwipe={swipe} />}</AnimatePresence>
      </div>
      <div className="mt-5 flex items-center justify-center gap-4">
        <button type="button" onClick={() => swipe(false)} aria-label="Not for me" className="grid size-16 place-items-center rounded-full bg-white text-[#FF5A5F] shadow-card ring-1 ring-line transition-transform hover:scale-105 active:scale-95">
          <X className="size-7" />
        </button>
        <button type="button" onClick={undo} disabled={!i} aria-label="Undo" className="grid size-11 place-items-center rounded-full bg-white text-stone ring-1 ring-line disabled:opacity-30">
          <RotateCcw className="size-4" />
        </button>
        <button type="button" onClick={() => swipe(true)} aria-label="I'd go" className="grid size-16 place-items-center rounded-full bg-white text-[#25D366] shadow-card ring-1 ring-line transition-transform hover:scale-105 active:scale-95">
          <Heart className="size-7" />
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-stone">
        {Math.min(i + 1, cards.length)} of {cards.length} · swipe right if you&apos;d go
      </p>
    </div>
  );
}
