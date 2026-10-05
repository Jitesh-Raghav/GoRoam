import { useId } from "react";

/** The GoRoam plane, nose pointing +x (same path as the site's logo and hero). */
export const PLANE =
  "M38 0C38 -3 35 -5 30 -5L10 -5L-8 -32L-18 -32L-6 -5L-24 -5L-31 -15L-38 -15L-34 0L-38 15L-31 15L-24 5L-6 5L-18 32L-8 32L10 5L30 5C35 5 38 3 38 0Z";

// Logo geometry (public/icon.svg): globe at (256, 262), orbit rx 206 / ry 66 tilted -24°.
const CX = 256;
const CY = 262;
const RX = 206;
const RY = 66;
const TILT = -24;
/** Where the plane sits in the static logo. */
export const PLANE_REST = 0.69;

function planeOn(theta: number) {
  const x = RX * Math.cos(theta);
  const y = RY * Math.sin(theta);
  // The plane flies with theta decreasing (anticlockwise on screen).
  const heading = (Math.atan2(-RY * Math.cos(theta), RX * Math.sin(theta)) * 180) / Math.PI;
  return { x, y, heading, front: Math.sin(theta) > -0.05 };
}

/**
 * The GoRoam mark, built from its parts so each can animate: the gold orbit
 * draws itself, the globe swells in, and the plane rides the orbit.
 */
export function Emblem({
  size,
  orbit = 1,
  globe = 1,
  theta = PLANE_REST,
  plane = 1,
  tile = 0,
  halo = 1,
}: {
  size: number;
  /** 0..1 how much of the orbit is drawn. */
  orbit?: number;
  /** 0..1 globe scale. */
  globe?: number;
  /** Plane position on the orbit, radians. */
  theta?: number;
  plane?: number;
  /** 0..1 opacity of the rounded app-icon tile behind. */
  tile?: number;
  halo?: number;
}) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (n: string) => `${u}-${n}`;
  const p = planeOn(theta);
  const planeEl = (
    <g transform={`rotate(${TILT} ${CX} ${CY}) translate(${CX + p.x} ${CY + p.y}) rotate(${p.heading}) scale(${1.25 * plane})`} opacity={plane > 0 ? 1 : 0}>
      <path d={PLANE} fill="#0B1F2C" transform="translate(3 5)" opacity={0.45} />
      <path d={PLANE} fill="#FFFFFF" />
    </g>
  );
  // Draw the orbit from the plane backwards, so it reads as the plane's own trail.
  const start = (((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2);
  const dash = { pathLength: 1, strokeDasharray: `${orbit} ${1 - orbit + 0.0001}`, strokeDashoffset: -start };
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" style={{ overflow: "visible" }}>
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
        <clipPath id={id("ball")}>
          <circle cx={CX} cy={CY} r={124} />
        </clipPath>
        <clipPath id={id("front")}>
          <rect x={-200} y={CY} width={912} height={400} />
        </clipPath>
      </defs>
      {tile > 0 && <rect width={512} height={512} rx={116} fill={`url(#${id("tile")})`} opacity={tile} />}
      <circle cx={CX} cy={CY} r={230} fill={`url(#${id("halo")})`} opacity={halo} />
      {/* Far side of the orbit, behind the globe. */}
      <g transform={`rotate(${TILT} ${CX} ${CY})`}>
        <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" stroke={`url(#${id("gold")})`} strokeWidth={18} strokeOpacity={0.55} strokeLinecap="round" {...dash} />
      </g>
      {!p.front && planeEl}
      <g transform={`translate(${CX} ${CY}) scale(${globe}) translate(${-CX} ${-CY})`}>
        <circle cx={CX} cy={CY} r={124} fill={`url(#${id("globe")})`} />
        <g clipPath={`url(#${id("ball")})`} fill="none" stroke="#FFFFFF" strokeOpacity={0.2} strokeWidth={5}>
          <ellipse cx={CX} cy={CY} rx={54} ry={124} />
          <ellipse cx={CX} cy={CY} rx={100} ry={124} />
          <path d="M120 262H392M130 205H382M130 319H382" />
        </g>
        <circle cx={CX} cy={CY} r={124} fill="none" stroke="#FFFFFF" strokeOpacity={0.18} strokeWidth={3} />
      </g>
      {/* Near side of the orbit, in front of the globe. */}
      <g transform={`rotate(${TILT} ${CX} ${CY})`} clipPath={`url(#${id("front")})`}>
        <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" stroke={`url(#${id("gold")})`} strokeWidth={18} strokeLinecap="round" {...dash} />
      </g>
      {p.front && planeEl}
    </svg>
  );
}
