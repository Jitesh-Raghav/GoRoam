import { useId } from "react";

const PLANE =
  "M38 0C38 -3 35 -5 30 -5L10 -5L-8 -32L-18 -32L-6 -5L-24 -5L-31 -15L-38 -15L-34 0L-38 15L-31 15L-24 5L-6 5L-18 32L-8 32L10 5L30 5C35 5 38 3 38 0Z";

/** The GoRoam mark: a teal globe circled by a gold flight orbit, a plane riding it. Same drawing as /icon.svg. */
export function LogoMark({ className }: { className?: string }) {
  const u = useId().replace(/:/g, "");
  const id = (name: string) => `${u}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden>
      <defs>
        <linearGradient id={id("tile")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#123447" />
          <stop offset="1" stopColor="#06131B" />
        </linearGradient>
        <radialGradient id={id("halo")} cx="0.5" cy="0.52" r="0.5">
          <stop offset="0" stopColor="#34D1BF" stopOpacity="0.32" />
          <stop offset="1" stopColor="#34D1BF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id("globe")} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#5BE3D1" />
          <stop offset="0.45" stopColor="#11A08F" />
          <stop offset="1" stopColor="#05484A" />
        </radialGradient>
        <linearGradient id={id("gold")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#C8741F" />
          <stop offset="0.45" stopColor="#FFD98A" />
          <stop offset="0.7" stopColor="#F4A340" />
          <stop offset="1" stopColor="#FFE7B0" />
        </linearGradient>
        <linearGradient id={id("gloss")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.1" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <clipPath id={id("ball")}>
          <circle cx="256" cy="262" r="124" />
        </clipPath>
        <clipPath id={id("front")}>
          <rect x="0" y="262" width="512" height="300" />
        </clipPath>
      </defs>
      <rect width="512" height="512" rx="116" fill={url("tile")} />
      <circle cx="256" cy="262" r="230" fill={url("halo")} />
      <g transform="rotate(-24 256 262)">
        <ellipse cx="256" cy="262" rx="206" ry="66" fill="none" stroke={url("gold")} strokeWidth="18" strokeOpacity="0.55" />
      </g>
      <circle cx="256" cy="262" r="124" fill={url("globe")} />
      <g clipPath={url("ball")} fill="none" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="5">
        <ellipse cx="256" cy="262" rx="54" ry="124" />
        <ellipse cx="256" cy="262" rx="100" ry="124" />
        <path d="M120 262H392M130 205H382M130 319H382" />
      </g>
      <circle cx="256" cy="262" r="124" fill="none" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="3" />
      <g transform="rotate(-24 256 262)" clipPath={url("front")}>
        <ellipse cx="256" cy="262" rx="206" ry="66" fill="none" stroke={url("gold")} strokeWidth="18" />
      </g>
      <g transform="rotate(-24 256 262) translate(256 262) translate(158 42) rotate(-17) scale(1.25)">
        <path d={PLANE} fill="#0B1F2C" transform="translate(3 5)" opacity="0.45" />
        <path d={PLANE} fill="#FFFFFF" />
      </g>
      <rect width="512" height="512" rx="116" fill={url("gloss")} />
      <rect x="6" y="6" width="500" height="500" rx="110" fill="none" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="2" />
    </svg>
  );
}
