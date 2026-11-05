// The photo cards' shared look (trips, ready-made trips, trip types), so all three stay one family.

/** The small frosted label that sits on a card's photo. */
export const PHOTO_CHIP = "inline-flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium text-ink shadow-[0_6px_16px_-8px_rgb(14_31_59/0.55)] ring-1 ring-white/60 backdrop-blur-md";
/** The arrow that slides in at a photo's corner when its card is hovered. */
export const PHOTO_ARROW = "grid size-9 place-items-center rounded-full bg-white/90 text-ink shadow-[0_6px_16px_-8px_rgb(14_31_59/0.55)] ring-1 ring-white/60 backdrop-blur-md transition-[opacity,transform] duration-500 ease-out-expo sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100";
/** A photo card's white frame: the photo sits inset in it, like a print on card. */
export const CARD_FRAME =
  "group flex h-full flex-col rounded-[1.75rem] bg-white p-2 shadow-card ring-1 ring-line transition-[transform,box-shadow] duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-float focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";
