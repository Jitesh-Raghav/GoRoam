// The photo cards' shared look (trips, ready-made trips, trip types, your own trips): a
// rounded photo with the words beneath it. No box, frame, chips or arrows.

/** The whole card is one link; keyboard focus shows as a ring around the photo. */
export const CARD_LINK = "group block outline-none";
/** The photo's frame: rounded, quiet paper while the picture loads (or if there is none). */
export const CARD_PHOTO =
  "relative isolate overflow-hidden rounded-[1.25rem] bg-paper-2 ring-offset-2 ring-offset-paper transition-shadow group-focus-visible:ring-2 group-focus-visible:ring-brand";
/** The picture itself: fills the frame and eases in a touch on hover. */
export const CARD_IMG = "absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]";
/** The name under the photo. */
export const CARD_TITLE = "display text-[1.3rem] leading-[1.12] tracking-[-0.015em] text-ink";
/** The one-line facts under the name. */
export const CARD_META = "text-[0.9rem] leading-snug text-stone";
/** A featured card's one-line hook (its tagline), under the facts. */
export const CARD_HOOK = "line-clamp-2 text-[0.9rem] leading-relaxed text-ink/75";

/** The small label that sits on a photo (the pass cards on the credits page). */
export const PHOTO_CHIP = "inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink shadow-[0_6px_16px_-8px_rgb(14_31_59/0.55)] ring-1 ring-white/60";
