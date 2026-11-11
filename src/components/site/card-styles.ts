// The photo cards' shared look (trips, adventures, ready-made trips, guides, trip types, your
// own trips): a rounded photo with the words beneath it. On the photo, at most a small tag
// (what it is) and a price pill; the photo floats up a touch on hover.

/** The whole card is one link; keyboard focus shows as a ring around the photo. */
export const CARD_LINK = "group block outline-none";
/** The photo's frame: rounded, quiet paper while the picture loads (or if there is none). Lifts on hover. */
export const CARD_PHOTO =
  "relative isolate overflow-hidden rounded-[1.5rem] bg-paper-2 ring-offset-2 ring-offset-paper transition-[transform,box-shadow] duration-500 ease-out-expo group-hover:-translate-y-1 group-hover:shadow-[0_24px_44px_-24px_rgb(14_31_59/0.55)] group-focus-visible:ring-2 group-focus-visible:ring-brand motion-reduce:transition-none motion-reduce:group-hover:translate-y-0";
/** The picture itself: fills the frame and eases in a touch on hover. */
export const CARD_IMG = "absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04] motion-reduce:transition-none";
/** The photo's shape: 4:3 in grids; tall (4:5) in the homepage's swipe rows. */
export const cardAspect = (tall?: boolean) => (tall ? "aspect-[4/5]" : "aspect-[4/3]");
/** The name under the photo. */
export const CARD_TITLE = "display text-[1.3rem] leading-[1.12] tracking-[-0.015em] text-ink";
/** The one-line facts under the name. */
export const CARD_META = "text-[0.9rem] leading-snug text-stone";
/** A featured card's one-line hook (its tagline), under the facts. */
export const CARD_HOOK = "line-clamp-2 text-[0.9rem] leading-relaxed text-ink/75";

/** The small label that sits on a photo (the pass cards on the credits page). */
export const PHOTO_CHIP = "inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink shadow-[0_6px_16px_-8px_rgb(14_31_59/0.55)] ring-1 ring-white/60";
/** What it is, top left on the photo: "Hitchhiking", "5 days", "Rajasthan". No blur, so scrolling stays smooth. */
export const PHOTO_TAG = `absolute left-3 top-3 z-[1] ${PHOTO_CHIP}`;
/** A second chip, top right: in season, how hard. */
export const PHOTO_BADGE = `absolute right-3 top-3 z-[1] ${PHOTO_CHIP}`;
/** The price, bottom left on the photo. */
export const PHOTO_PRICE =
  "absolute bottom-3 left-3 z-[1] inline-flex items-baseline gap-1 rounded-full bg-ink/85 px-3 py-1.5 text-[12px] text-paper/75 shadow-[0_8px_20px_-10px_rgb(14_31_59/0.7)] ring-1 ring-white/10";
/** The figure inside the price pill. */
export const PHOTO_PRICE_VALUE = "text-[13px] font-medium tabular-nums text-paper";
