import type { ReactNode } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { prog } from "./anim";
import { Soundtrack } from "./audio/Soundtrack";
import { Captions } from "./components/captions";
import { Grain } from "./components/kit";
import { useFormat } from "./format";
import { SCENES } from "./scenes";
import { promptLayout } from "./scenes/Prompt";
import type { Transition, Variant } from "./script";
import { C, E } from "./theme";
import { OVERLAP, buildTimeline, type Manifest } from "./timeline";

export interface FilmProps extends Record<string, unknown> {
  variant: Variant;
  manifest: Manifest;
  captions: boolean;
}

/** Where an iris opens from, per scene, so cuts are motivated by what was on screen. */
function irisOrigin(id: string, vertical: boolean): [number, number] {
  if (id === "build") {
    // Open from the Generate button the viewer just watched get pressed.
    const { button } = promptLayout(vertical);
    return vertical ? [(button.x / 1080) * 100, (button.y / 1920) * 100] : [(button.x / 1920) * 100, (button.y / 1080) * 100];
  }
  return [50, 50];
}

function Enter({ type, id, children }: { type: Transition; id: string; children: ReactNode }) {
  const frame = useCurrentFrame();
  const { vertical } = useFormat();
  if (type === "cut") return <AbsoluteFill>{children}</AbsoluteFill>;
  const p = prog(frame, 0, OVERLAP + 4, type === "iris" ? E.inOutQuart : E.outExpo);
  if (p >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  if (type === "iris") {
    const [x, y] = irisOrigin(id, vertical);
    return <AbsoluteFill style={{ clipPath: `circle(${p * 120}% at ${x}% ${y}%)` }}>{children}</AbsoluteFill>;
  }
  if (type === "fade") return <AbsoluteFill style={{ opacity: p }}>{children}</AbsoluteFill>;
  // push: slide in over the outgoing scene
  const d = (1 - p) * 100;
  return (
    <AbsoluteFill style={{ transform: vertical ? `translateY(${d}%)` : `translateX(${d}%)`, boxShadow: "0 0 120px rgba(4,14,20,0.45)" }}>
      {children}
    </AbsoluteFill>
  );
}

/** The outgoing half of a transition: a push shoves it aside, an iris pushes in on it. */
function Exit({ next, dur, children }: { next?: Transition; dur: number; children: ReactNode }) {
  const frame = useCurrentFrame();
  const { vertical } = useFormat();
  if (!next || next === "cut") return <AbsoluteFill>{children}</AbsoluteFill>;
  const p = prog(frame, dur - OVERLAP, OVERLAP, E.inOutQuart);
  if (p <= 0) return <AbsoluteFill>{children}</AbsoluteFill>;
  if (next === "push") {
    const d = -p * 30;
    return (
      <AbsoluteFill style={{ transform: vertical ? `translateY(${d}%) scale(${1 - p * 0.06})` : `translateX(${d}%) scale(${1 - p * 0.06})`, filter: `brightness(${1 - p * 0.35})` }}>
        {children}
      </AbsoluteFill>
    );
  }
  return <AbsoluteFill style={{ transform: `scale(${1 + p * 0.08})` }}>{children}</AbsoluteFill>;
}

export function Film({ variant, manifest, captions }: FilmProps) {
  const timeline = buildTimeline(variant, manifest);
  return (
    <AbsoluteFill style={{ background: C.night }}>
      {timeline.beats.map((b, i) => {
        const { Component } = SCENES[b.beat.id];
        const next = timeline.beats[i + 1]?.beat.enter;
        return (
          <Sequence key={`${b.beat.id}-${i}`} from={b.from} durationInFrames={b.dur} name={b.beat.id} premountFor={30}>
            <Enter type={i === 0 ? "cut" : b.beat.enter} id={b.beat.id}>
              <Exit next={next} dur={b.dur}>
                <Component dur={b.dur} variant={variant} beat={b} />
              </Exit>
            </Enter>
          </Sequence>
        );
      })}
      <Grain />
      {captions && <Captions timeline={timeline} />}
      <Soundtrack timeline={timeline} manifest={manifest} />
    </AbsoluteFill>
  );
}
