import { useId } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { prog, rand } from "../anim";
import { PLANE } from "../components/emblem";
import { Glow, Words } from "../components/kit";
import { useFormat } from "../format";
import { wordFrame, type Cue, type SceneProps } from "../scene";
import { C, E, F } from "../theme";

const TAU = Math.PI * 2;

function Stars({ W, H }: { W: number; H: number }) {
  const frame = useCurrentFrame();
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 140 }, (_, i) => {
        const x = rand(i * 3.1) * W;
        const y = rand(i * 7.7) * H;
        const r = 0.6 + rand(i * 1.3) * 1.6;
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frame / (9 + rand(i) * 14) + i));
        return <circle key={i} cx={x} cy={y} r={r} fill="#d8f3ee" opacity={tw * (0.25 + rand(i * 9.1) * 0.5)} />;
      })}
    </svg>
  );
}

/** "Every great trip starts with a feeling." A gold flight path draws itself around the line. */
export function ColdOpen({ dur, beat }: SceneProps) {
  const frame = useCurrentFrame();
  const { W, H, cx, cy, vertical, v } = useFormat();
  const u = useId().replace(/[^a-zA-Z0-9]/g, "");

  const rx = v(800, 500);
  const ry = v(270, 380);
  const tilt = vertical ? -14 : -9;
  // The plane laps the orbit once and a quarter, drawing it as it goes.
  const flight = prog(frame, 0, dur + 10, E.outQuart);
  const theta0 = 0.35 * Math.PI;
  const theta = theta0 - flight * TAU * 1.3;
  const drawn = Math.min(1, (theta0 - theta) / TAU);
  const start = (((theta % TAU) + TAU) % TAU) / TAU;
  const px = rx * Math.cos(theta);
  const py = ry * Math.sin(theta);
  const heading = (Math.atan2(-ry * Math.cos(theta), rx * Math.sin(theta)) * 180) / Math.PI;
  const front = Math.sin(theta) > 0;
  const depth = (Math.sin(theta) + 1) / 2; // 0 far, 1 near
  const planeScale = 0.8 + depth * 0.9;

  const push = interpolate(frame, [0, dur], [1, 1.07]);
  const closed = prog(frame, 70, 30); // orbit completes: a shine runs round it
  const glow = prog(frame, wordFrame(beat, 5) - 6, 40);

  const orbit = (half: "back" | "front") => (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id={`${u}-gold`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#C8741F" />
          <stop offset="0.45" stopColor="#FFD98A" />
          <stop offset="0.7" stopColor="#F4A340" />
          <stop offset="1" stopColor="#FFE7B0" />
        </linearGradient>
        <clipPath id={`${u}-${half}`}>
          <rect x={-W} y={half === "back" ? -H : 0} width={W * 2} height={H} />
        </clipPath>
        <filter id={`${u}-blur`}>
          <feGaussianBlur stdDeviation={6} />
        </filter>
      </defs>
      <g transform={`translate(${cx} ${cy}) rotate(${tilt})`}>
        <g clipPath={`url(#${u}-${half})`} opacity={half === "back" ? 0.55 : 1}>
          {[true, false].map((blur) => (
            <ellipse
              key={String(blur)}
              cx={0}
              cy={0}
              rx={rx}
              ry={ry}
              fill="none"
              stroke={`url(#${u}-gold)`}
              strokeWidth={blur ? 10 : 4}
              strokeLinecap="round"
              filter={blur ? `url(#${u}-blur)` : undefined}
              opacity={blur ? 0.55 + closed * 0.3 : 1}
              pathLength={1}
              strokeDasharray={`${drawn} ${1 - drawn + 0.0001}`}
              strokeDashoffset={-start}
            />
          ))}
        </g>
        {(half === "front") === front && (
          <g transform={`translate(${px} ${py}) rotate(${heading}) scale(${planeScale})`}>
            <path d={PLANE} fill="#000" opacity={0.35} transform="translate(4 8)" />
            <path d={PLANE} fill="#fff" />
          </g>
        )}
      </g>
    </svg>
  );

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 70% at 50% 45%, #10334a 0%, ${C.night} 70%)`, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <Stars W={W} H={H} />
        <Glow x={cx} y={cy} r={v(560, 460)} color="rgba(52,209,191,0.22)" opacity={0.6 + glow * 0.4} />
        <Glow x={cx} y={cy + 40} r={v(420, 360)} color="rgba(244,163,64,0.28)" opacity={glow} />
        {orbit("back")}
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <Words
            text={vertical ? "Every great\ntrip starts\nwith a feeling." : "Every great trip\nstarts with a feeling."}
            start={0}
            at={beat.words.map((_, i) => wordFrame(beat, i) - 5)}
            accent={["feeling."]}
            accentColor={C.sun2}
            style={{ fontFamily: F.display, fontSize: v(150, 128), lineHeight: 1.02, color: C.paper, letterSpacing: "-0.01em" }}
          />
        </AbsoluteFill>
        {orbit("front")}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export const coldCues = ({ beat }: SceneProps): Cue[] => [
  { at: 0, sfx: "whoosh", gain: 0.9 },
  { at: 70, sfx: "shimmer", gain: 0.55 },
  { at: wordFrame(beat, 5) - 8, sfx: "riser", gain: 0.5 },
];
