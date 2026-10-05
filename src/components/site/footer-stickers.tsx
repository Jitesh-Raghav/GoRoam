/* Travel stickers that float around the footer's giant wordmark. Pure SVG, on-brand colours. */

const PAPER = "#F4F8F9";
const INK = "#0A1E2C";
const BRAND = "#0B8278";
const BRAND2 = "#34D1BF";
const SUN = "#F4A340";
const SUN2 = "#FFC876";
const CORAL = "#FF8A6B";

type P = { className?: string };

export function StampSticker({ className }: P) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="50" cy="50" r="44" fill={INK} fillOpacity="0.35" stroke={SUN2} strokeWidth="3.5" />
      <circle cx="50" cy="50" r="35" fill="none" stroke={SUN2} strokeWidth="1.6" strokeDasharray="3 4" />
      <path d="M22 44h56M22 58h56" stroke={SUN2} strokeWidth="1.6" />
      <text x="50" y="54.5" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10.5" fontWeight="700" letterSpacing="1.5" fill={SUN2}>
        ARRIVED
      </text>
      <text x="50" y="35" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="7" letterSpacing="1.2" fill={SUN2}>
        GOROAM
      </text>
      <text x="50" y="71" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="7" letterSpacing="1.2" fill={SUN2}>
        ★ 2026 ★
      </text>
    </svg>
  );
}

export function TagSticker({ className }: P) {
  return (
    <svg viewBox="0 0 120 110" className={className} aria-hidden>
      <path d="M60 2 C 52 14, 70 20, 62 34" fill="none" stroke={PAPER} strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
      <g transform="rotate(8 60 70)">
        <path d="M24 40 h72 a8 8 0 0 1 8 8 v40 a8 8 0 0 1 -8 8 h-72 l-16 -16 v-24 z" fill={SUN} stroke={PAPER} strokeWidth="3" />
        <circle cx="22" cy="68" r="4.5" fill={INK} stroke={PAPER} strokeWidth="2" />
        <text x="65" y="65" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="11.5" fontWeight="700" letterSpacing="0.6" fill={INK}>
          GO · ROAM
        </text>
        <path d="M40 74 h50" stroke={INK} strokeOpacity="0.35" strokeWidth="2" strokeDasharray="4 3" />
        <text x="65" y="86" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="6" letterSpacing="1" fill={INK} fillOpacity="0.65">
          PRIORITY
        </text>
      </g>
    </svg>
  );
}

export function BalloonSticker({ className }: P) {
  return (
    <svg viewBox="0 0 100 130" className={className} aria-hidden>
      <path d="M50 6 C 18 6, 8 34, 18 56 C 26 72, 40 82, 42 92 h16 C 60 82, 74 72, 82 56 C 92 34, 82 6, 50 6 Z" fill={BRAND2} stroke={PAPER} strokeWidth="3" />
      <path d="M50 6 C 36 18, 34 62, 42 92 h16 C 66 62, 64 18, 50 6 Z" fill={PAPER} />
      <path d="M50 6 C 46 30, 46 62, 48 92 h4 C 54 62, 54 30, 50 6 Z" fill={CORAL} />
      <path d="M18 56 C 40 62, 60 62, 82 56" fill="none" stroke={BRAND} strokeWidth="2" />
      <path d="M43 92 L 42 104 M57 92 L 58 104" stroke={PAPER} strokeOpacity="0.8" strokeWidth="1.6" />
      <rect x="39" y="103" width="22" height="14" rx="3" fill={SUN} stroke={PAPER} strokeWidth="2.5" />
      <path d="M39 109 h22" stroke={INK} strokeOpacity="0.3" strokeWidth="1.4" />
    </svg>
  );
}

export function CompassSticker({ className }: P) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="50" cy="50" r="42" fill={PAPER} stroke={SUN2} strokeWidth="4" />
      <circle cx="50" cy="50" r="33" fill="none" stroke={INK} strokeOpacity="0.15" strokeWidth="1.5" />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d="M50 19 v5" stroke={INK} strokeOpacity="0.35" strokeWidth="1.6" transform={`rotate(${i * 30} 50 50)`} />
      ))}
      <g className="sticker-needle">
        <path d="M50 22 L 57 50 L 50 50 Z" fill={CORAL} />
        <path d="M50 22 L 43 50 L 50 50 Z" fill="#E56A4B" />
        <path d="M50 78 L 57 50 L 50 50 Z" fill={INK} fillOpacity="0.7" />
        <path d="M50 78 L 43 50 L 50 50 Z" fill={INK} />
      </g>
      <circle cx="50" cy="50" r="4" fill={SUN} stroke={PAPER} strokeWidth="1.5" />
      <text x="50" y="16" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="9" fontWeight="700" fill={BRAND}>
        N
      </text>
    </svg>
  );
}

export function PostcardSticker({ className }: P) {
  return (
    <svg viewBox="0 0 130 92" className={className} aria-hidden>
      <rect x="3" y="3" width="124" height="86" rx="8" fill={PAPER} />
      <rect x="10" y="10" width="62" height="72" rx="5" fill={BRAND} />
      <circle cx="58" cy="47" r="7" fill={SUN2} />
      <path d="M10 64 C 24 52, 36 60, 46 54 C 56 48, 64 56, 72 52 V77 a5 5 0 0 1 -5 5 H15 a5 5 0 0 1 -5 -5 Z" fill={BRAND2} />
      <path d="M10 70 C 26 64, 40 72, 72 64 V77 a5 5 0 0 1 -5 5 H15 a5 5 0 0 1 -5 -5 Z" fill={INK} fillOpacity="0.5" />
      <text x="16" y="24" fontFamily="Georgia, serif" fontStyle="italic" fontSize="10" fill={PAPER}>
        Wish you
      </text>
      <text x="16" y="36" fontFamily="Georgia, serif" fontStyle="italic" fontSize="10" fill={PAPER}>
        were here
      </text>
      <rect x="98" y="12" width="20" height="24" rx="2" fill={SUN} stroke={CORAL} strokeWidth="1.5" strokeDasharray="2 2" />
      <path d="M82 50 h36 M82 60 h36 M82 70 h28" stroke={INK} strokeOpacity="0.25" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M78 12 v68" stroke={INK} strokeOpacity="0.12" strokeWidth="1.2" />
    </svg>
  );
}

export function PalmSticker({ className }: P) {
  return (
    <svg viewBox="0 0 100 120" className={className} aria-hidden>
      <ellipse cx="50" cy="110" rx="34" ry="7" fill={SUN2} fillOpacity="0.85" />
      <path d="M52 108 C 50 86, 54 62, 48 38" fill="none" stroke="#C98A4B" strokeWidth="7" strokeLinecap="round" />
      <path d="M52 108 C 50 86, 54 62, 48 38" fill="none" stroke="#A86E37" strokeWidth="7" strokeLinecap="round" strokeDasharray="2 6" />
      <g fill={BRAND2} stroke={PAPER} strokeWidth="2.2" strokeLinejoin="round">
        <path d="M48 38 C 32 24, 14 28, 6 40 C 20 34, 34 36, 48 38 Z" />
        <path d="M48 38 C 60 22, 80 22, 92 34 C 78 30, 62 32, 48 38 Z" />
        <path d="M48 38 C 40 16, 46 4, 56 0 C 52 12, 52 26, 48 38 Z" />
        <path d="M48 38 C 30 40, 20 54, 22 66 C 30 54, 38 46, 48 38 Z" />
        <path d="M48 38 C 66 40, 78 52, 78 64 C 70 54, 60 46, 48 38 Z" />
      </g>
      <circle cx="46" cy="42" r="4" fill="#7A4E26" />
      <circle cx="52" cy="43" r="4" fill="#8B5A2B" />
    </svg>
  );
}

export function CameraSticker({ className }: P) {
  return (
    <svg viewBox="0 0 110 90" className={className} aria-hidden>
      <rect x="6" y="20" width="98" height="64" rx="12" fill={CORAL} stroke={PAPER} strokeWidth="3" />
      <rect x="34" y="10" width="34" height="14" rx="4" fill={CORAL} stroke={PAPER} strokeWidth="3" />
      <rect x="6" y="38" width="98" height="10" fill={INK} fillOpacity="0.18" />
      <circle cx="55" cy="52" r="22" fill={PAPER} />
      <circle cx="55" cy="52" r="16" fill={INK} />
      <circle cx="55" cy="52" r="9" fill={BRAND} />
      <circle cx="50" cy="47" r="3.5" fill={PAPER} fillOpacity="0.85" />
      <rect x="82" y="28" width="12" height="7" rx="2" fill={SUN2} />
    </svg>
  );
}

export function PinSticker({ className }: P) {
  return (
    <svg viewBox="0 0 60 80" className={className} aria-hidden>
      <path d="M30 78 C 30 78, 6 48, 6 30 a24 24 0 0 1 48 0 C 54 48, 30 78, 30 78 Z" fill={SUN} stroke={PAPER} strokeWidth="3.5" />
      <circle cx="30" cy="30" r="10" fill={PAPER} />
      <circle cx="30" cy="30" r="5" fill={INK} />
    </svg>
  );
}
