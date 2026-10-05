import { AbsoluteFill, useCurrentFrame } from "remotion";
import { spr } from "../anim";
import { useFormat } from "../format";
import { C, F } from "../theme";
import { FPS, allWords, type Timeline } from "../timeline";

const MAX_CHARS = 20;

/** Group the read into short caption pages that never straddle two lines of the script. */
function pages(t: Timeline) {
  const words = allWords(t);
  const out: (typeof words)[] = [];
  let cur: typeof words = [];
  for (const w of words) {
    const len = cur.reduce((s, x) => s + x.text.length + 1, 0) + w.text.length;
    const prev = cur[cur.length - 1];
    if (cur.length && (len > MAX_CHARS || prev.beat !== w.beat || /[.]$/.test(prev.text))) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
  }
  if (cur.length) out.push(cur);
  return out;
}

/** Word-by-word burned-in captions for the vertical cuts (socials autoplay muted). */
export function Captions({ timeline }: { timeline: Timeline }) {
  const frame = useCurrentFrame();
  const { H, vertical } = useFormat();
  const t = frame / FPS;
  const all = pages(timeline);
  const pageIndex = all.findIndex((p, i) => t >= p[0].start - 0.08 && t < Math.min(p[p.length - 1].end + 0.35, all[i + 1]?.[0].start ?? Infinity));
  if (pageIndex < 0) return null;
  const page = all[pageIndex];
  const pageStart = Math.round((page[0].start - 0.08) * FPS);
  const s = spr(frame, pageStart);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: vertical ? H - 500 : H - 200,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 16,
            padding: "18px 30px",
            borderRadius: 26,
            background: "rgba(6,19,27,0.72)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontFamily: F.sans,
            fontWeight: 700,
            fontSize: vertical ? 62 : 58,
            letterSpacing: "-0.01em",
            transform: `translateY(${(1 - s) * 18}px) scale(${0.94 + s * 0.06})`,
            opacity: Math.min(1, s * 2),
          }}
        >
          {page.map((w, i) => {
            const active = t >= w.start - 0.03;
            return (
              <span key={i} style={{ color: active ? (t < w.end + 0.05 ? C.sun2 : C.white) : "rgba(255,255,255,0.38)" }}>
                {w.text}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}
