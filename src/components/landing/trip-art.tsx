/**
 * Small living illustrations for the trip-type cards: one scene per kind of
 * trip, drawn in the site's blues with lemon and coral accents. Pure SVG with
 * CSS motion (paused under reduced motion), so they cost nothing to load.
 */
const VIEW = "0 0 320 200";

function Sky({ id, from, to }: { id: string; from: string; to: string }) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill={`url(#${id})`} />
    </>
  );
}

const Heart = ({ x, y, s, c, d }: { x: number; y: number; s: number; c: string; d: number }) => (
  <g className="art-rise" style={{ animationDelay: `${d}s` }}>
    <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 6C-6 -2 -14 2 -12 9C-10 15 0 20 0 20C0 20 10 15 12 9C14 2 6 -2 0 6Z" fill={c} />
  </g>
);

const Stars = ({ n = 14, seed = 1 }: { n?: number; seed?: number }) => (
  <g fill="#fff">
    {Array.from({ length: n }, (_, i) => {
      const x = (i * 97 + seed * 41) % 320;
      const y = (i * 53 + seed * 17) % 90;
      return <circle key={i} cx={x} cy={y} r={i % 3 ? 1 : 1.6} className="scene-twinkle" style={{ animationDelay: `${(i * 0.37) % 4}s` }} />;
    })}
  </g>
);

function Couples() {
  return (
    <svg viewBox={VIEW} className="size-full" aria-hidden>
      <Sky id="tc-couples" from="#FF9F8F" to="#FFD9A8" />
      <circle cx="160" cy="132" r="46" fill="#FFF1BF" className="scene-breathe" />
      <path d="M0 140C60 128 120 136 160 134C210 132 260 124 320 132V200H0Z" fill="#E0645C" opacity="0.55" />
      <path d="M0 158C80 150 240 150 320 158V200H0Z" fill="#1A5FD6" />
      <g stroke="#FFF6D2" strokeWidth="2" strokeLinecap="round" opacity="0.8">
        <path d="M120 170h30M175 178h40M95 186h24" className="scene-shimmer" />
      </g>
      {/* two people under a palm */}
      <path d="M262 160C258 120 250 96 236 78" stroke="#0E1F3B" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M236 78c-20-4-36 6-44 16 16-8 30-8 44-4M236 78c-6-18-22-26-38-24 14 6 26 14 38 24M236 78c14-14 34-14 46-4-16-2-32 0-46 4M236 78c18 0 32 12 34 26-10-12-22-20-34-26" fill="#0E1F3B" className="pano-sway" style={{ transformOrigin: "236px 78px" }} />
      <g fill="#0E1F3B">
        <circle cx="136" cy="128" r="5" />
        <path d="M131 134h10l2 24h-14z" />
        <circle cx="152" cy="126" r="5.5" />
        <path d="M146 133h12l3 25h-18z" />
      </g>
      <Heart x={144} y={96} s={0.9} c="#E0645C" d={0} />
      <Heart x={170} y={84} s={0.6} c="#FF6B5B" d={-1.4} />
      <Heart x={122} y={88} s={0.5} c="#FFFFFF" d={-2.6} />
    </svg>
  );
}

function Family() {
  return (
    <svg viewBox={VIEW} className="size-full" aria-hidden>
      <Sky id="tc-family" from="#7CC4FF" to="#E3EEFF" />
      <circle cx="262" cy="44" r="20" fill="#FFD23F" className="scene-breathe" />
      <path d="M0 150C80 140 200 140 320 150V200H0Z" fill="#FFE9A8" />
      <path d="M0 176C90 170 230 170 320 176V200H0Z" fill="#3D8BFF" opacity="0.5" />
      {/* beach umbrella */}
      <path d="M92 150V98" stroke="#0E1F3B" strokeWidth="3" />
      <path d="M52 100C60 74 124 74 132 100Z" fill="#FF6B5B" />
      <path d="M72 100C76 80 108 80 112 100Z" fill="#FFF6D2" />
      {/* balloons */}
      {[
        { x: 200, c: "#FF6B5B", d: 0 },
        { x: 222, c: "#FFD23F", d: -1.2 },
        { x: 244, c: "#1A5FD6", d: -2.1 },
      ].map((b) => (
        <g key={b.x} className="art-float" style={{ animationDelay: `${b.d}s` }}>
          <path d={`M${b.x} 92Q${b.x - 6} 120 ${b.x + 2} 146`} stroke="#0E1F3B" strokeWidth="1.2" fill="none" />
          <ellipse cx={b.x} cy={78} rx="12" ry="15" fill={b.c} />
          <ellipse cx={b.x - 4} cy={72} rx="3" ry="5" fill="#fff" opacity="0.6" />
        </g>
      ))}
      {/* parents and a child */}
      <g fill="#0E1F3B">
        <circle cx="170" cy="118" r="6" />
        <path d="M164 126h12l2 26h-16z" />
        <circle cx="258" cy="116" r="6" />
        <path d="M252 124h12l2 28h-16z" />
        <circle cx="212" cy="130" r="5" className="art-hop" />
        <path d="M207 137h10l1 15h-12z" className="art-hop" />
      </g>
      {/* sandcastle */}
      <path d="M118 156v-14h6v-6h6v6h6v14z" fill="#E0B24A" />
    </svg>
  );
}

function Friends() {
  return (
    <svg viewBox={VIEW} className="size-full" aria-hidden>
      <Sky id="tc-friends" from="#16224A" to="#3A56AC" />
      <Stars n={18} seed={2} />
      <path d="M0 120L60 70L110 112L170 58L240 116L300 80L320 96V200H0Z" fill="#22397A" />
      <path d="M0 150C80 140 240 140 320 150V200H0Z" fill="#0E1A3A" />
      {/* tents */}
      <path d="M52 152L84 104L116 152Z" fill="#FFD23F" />
      <path d="M84 104L90 152H78Z" fill="#B88A00" />
      <path d="M210 152L238 112L266 152Z" fill="#FF6B5B" />
      <path d="M238 112L243 152H233Z" fill="#B54034" />
      {/* campfire */}
      <path d="M146 158l32-6M146 152l32 6" stroke="#6B3A1F" strokeWidth="5" strokeLinecap="round" />
      <path d="M162 152c-10-10-4-22 0-30 4 8 14 16 4 30z" fill="#FF6B5B" className="pano-flicker" />
      <path d="M162 152c-5-6-2-12 0-17 2 5 7 10 2 17z" fill="#FFD23F" className="pano-flicker" style={{ animationDelay: "-0.4s" }} />
      <circle cx="162" cy="140" r="34" fill="#FFB347" opacity="0.18" className="scene-breathe" />
      {/* friends round the fire */}
      <g fill="#050B1F">
        {[128, 140, 186, 198].map((x, i) => (
          <g key={x}>
            <circle cx={x} cy={136 - (i % 2) * 4} r="5" />
            <path d={`M${x - 6} ${143 - (i % 2) * 4}h12l2 16h-16z`} />
          </g>
        ))}
      </g>
      {[0, 1, 2].map((k) => (
        <circle key={k} cx={162} cy={118} r="1.6" fill="#FFD23F" className="art-spark" style={{ animationDelay: `${-k * 0.6}s` }} />
      ))}
    </svg>
  );
}

function Solo() {
  return (
    <svg viewBox={VIEW} className="size-full" aria-hidden>
      <Sky id="tc-solo" from="#22397A" to="#9DB4F0" />
      <Stars n={12} seed={5} />
      <circle cx="80" cy="56" r="18" fill="#F4F7FF" className="scene-breathe" />
      <path d="M0 130L70 84L130 118L200 62L270 110L320 88V200H0Z" fill="#4766C4" />
      <path d="M0 160C60 150 120 120 190 118C250 116 290 136 320 146V200H0Z" fill="#16264F" />
      {/* hiker with a backpack on the ridge */}
      <g fill="#050B1F" className="art-walk">
        <circle cx="196" cy="94" r="5.5" />
        <path d="M190 101h11l2 18h-15z" />
        <rect x="200" y="101" width="7" height="11" rx="2" />
        <path d="M192 119l-3 10M199 119l3 10" stroke="#050B1F" strokeWidth="3" strokeLinecap="round" />
        <path d="M187 104l-6 16" stroke="#050B1F" strokeWidth="2" />
      </g>
      {/* trail of footsteps */}
      <path d="M40 176C80 160 130 140 180 126" stroke="#FFE9A8" strokeWidth="2" strokeDasharray="2 8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function RoadTrip() {
  const road = "M-20 186C60 176 90 150 150 146C220 141 240 112 340 104";
  return (
    <svg viewBox={VIEW} className="size-full" aria-hidden>
      <Sky id="tc-road" from="#FFB389" to="#FFE9C7" />
      <circle cx="238" cy="70" r="26" fill="#FFF1BF" />
      <path d="M0 120L50 92L96 116L150 80L210 112L260 90L320 108V200H0Z" fill="#E0645C" opacity="0.45" />
      <path d="M0 150C80 136 200 132 320 130V200H0Z" fill="#3A56AC" />
      <path d={road} stroke="#16224A" strokeWidth="20" fill="none" strokeLinecap="round" />
      <path d={road} stroke="#FFD23F" strokeWidth="2" strokeDasharray="10 10" fill="none" className="art-dash" />
      {/* the car driving along the road */}
      <g className="art-drive" style={{ offsetPath: `path("${road}")` }}>
        <g transform="translate(0 -8)">
          <rect x="-16" y="-9" width="32" height="12" rx="4" fill="#FF6B5B" />
          <path d="M-9 -9l4-7h12l4 7z" fill="#FF6B5B" />
          <path d="M-6 -9l2-5h4v5zM2 -9v-5h3l3 5z" fill="#E3EEFF" />
          <circle cx="-9" cy="3" r="3.5" fill="#050B1F" />
          <circle cx="9" cy="3" r="3.5" fill="#050B1F" />
        </g>
      </g>
      {/* roadside pines */}
      <g fill="#16264F">
        <path d="M40 150l10-30 10 30z" />
        <path d="M280 124l8-24 8 24z" />
        <path d="M296 126l6-18 6 18z" />
      </g>
    </svg>
  );
}

function Weekend() {
  return (
    <svg viewBox={VIEW} className="size-full" aria-hidden>
      <Sky id="tc-weekend" from="#3D8BFF" to="#BFE3FF" />
      <circle cx="74" cy="52" r="22" fill="#FFD23F" className="scene-breathe" />
      <path d="M0 130L60 100L120 126L190 86L260 120L320 100V200H0Z" fill="#2A4590" opacity="0.55" />
      <path d="M0 160C90 150 230 150 320 160V200H0Z" fill="#16264F" />
      {/* suitcase with stickers, bobbing */}
      <g className="art-float">
        <rect x="132" y="96" width="62" height="58" rx="10" fill="#FF6B5B" />
        <rect x="150" y="86" width="26" height="12" rx="5" fill="none" stroke="#B54034" strokeWidth="4" />
        <path d="M144 96v58M182 96v58" stroke="#B54034" strokeWidth="3" />
        <circle cx="163" cy="118" r="8" fill="#FFD23F" />
        <rect x="150" y="134" width="22" height="9" rx="2" fill="#E3EEFF" />
      </g>
      {/* a clock: it's Friday */}
      <g transform="translate(250 64)">
        <circle r="22" fill="#FFFFFF" />
        <circle r="22" fill="none" stroke="#0E1F3B" strokeWidth="3" />
        <path d="M0 0V-14" stroke="#0E1F3B" strokeWidth="3" strokeLinecap="round" />
        <path d="M0 0H10" stroke="#FF6B5B" strokeWidth="2.4" strokeLinecap="round" className="art-tick" />
      </g>
      <Heart x={210} y={110} s={0.5} c="#FFD23F" d={-1} />
    </svg>
  );
}

function MultiCity() {
  const route = "M44 150C80 90 120 150 160 96C196 50 236 120 276 64";
  return (
    <svg viewBox={VIEW} className="size-full" aria-hidden>
      <Sky id="tc-multi" from="#0E1F3B" to="#26408F" />
      <Stars n={10} seed={8} />
      {/* a map grid */}
      <g stroke="#7CC4FF" strokeOpacity="0.14">
        {Array.from({ length: 8 }, (_, i) => (
          <path key={`v${i}`} d={`M${i * 44} 0V200`} />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <path key={`h${i}`} d={`M0 ${i * 44}H320`} />
        ))}
      </g>
      <path d={route} stroke="#FFD23F" strokeWidth="2.5" strokeDasharray="6 7" fill="none" className="art-dash" />
      {[
        [44, 150, "#FF6B5B"],
        [160, 96, "#7CC4FF"],
        [276, 64, "#FFD23F"],
      ].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r="14" fill={c as string} opacity="0.25" className="scene-breathe" style={{ animationDelay: `${-i}s` }} />
          <path d="M0 6C-8 -2 -8 -14 0 -14S8 -2 0 6Z" fill={c as string} />
          <circle cy="-8" r="2.6" fill="#0E1F3B" />
        </g>
      ))}
      <g className="art-drive" style={{ offsetPath: `path("${route}")`, animationDuration: "7s" }}>
        <path d="M12 0C12 -1 11 -2 9 -2H3L-3 -10H-6L-2 -2H-8L-10 -5H-12L-11 0L-12 5H-10L-8 2H-2L-6 10H-3L3 2H9C11 2 12 1 12 0Z" fill="#FFFFFF" transform="scale(1.3)" />
      </g>
    </svg>
  );
}

function Budget() {
  return (
    <svg viewBox={VIEW} className="size-full" aria-hidden>
      <Sky id="tc-budget" from="#E3EEFF" to="#BFE3FF" />
      <path d="M0 156C90 146 230 146 320 156V200H0Z" fill="#7C9BE6" opacity="0.5" />
      {/* piggy bank */}
      <g transform="translate(150 118)">
        <ellipse rx="48" ry="36" fill="#FF9F8F" />
        <circle cx="40" cy="-6" r="13" fill="#FF9F8F" />
        <ellipse cx="48" cy="-4" rx="6" ry="5" fill="#E0645C" />
        <path d="M-14 -34l10 -14 8 14z" fill="#E0645C" />
        <circle cx="26" cy="-14" r="3" fill="#0E1F3B" />
        <rect x="-10" y="-38" width="22" height="4" rx="2" fill="#B54034" />
        <path d="M-30 30v12M-12 32v12M14 32v12M30 30v12" stroke="#E0645C" strokeWidth="9" strokeLinecap="round" />
        <ellipse cx="-14" cy="-14" rx="12" ry="7" fill="#fff" opacity="0.4" />
      </g>
      {/* coins dropping in */}
      {[0, 1, 2].map((k) => (
        <g key={k} className="art-drop" style={{ animationDelay: `${-k * 0.9}s` }}>
          <ellipse cx="151" cy="40" rx="10" ry="10" fill="#FFD23F" stroke="#C98400" strokeWidth="2" />
          <text x="151" y="44.5" textAnchor="middle" fontSize="12" fontWeight="700" fill="#9A6400">₹</text>
        </g>
      ))}
      {/* stacks */}
      <g fill="#FFD23F" stroke="#C98400" strokeWidth="1.5">
        {[0, 1, 2, 3].map((k) => (
          <ellipse key={k} cx="252" cy={158 - k * 7} rx="18" ry="5" />
        ))}
        {[0, 1].map((k) => (
          <ellipse key={`b${k}`} cx="58" cy={158 - k * 7} rx="16" ry="4.5" />
        ))}
      </g>
    </svg>
  );
}

const ART: Record<string, () => React.JSX.Element> = {
  couples: Couples,
  family: Family,
  friends: Friends,
  solo: Solo,
  "road-trip": RoadTrip,
  "weekend-getaway": Weekend,
  "multi-city": MultiCity,
  budget: Budget,
};

export function TripArt({ slug }: { slug: string }) {
  const Art = ART[slug] ?? MultiCity;
  return <Art />;
}
