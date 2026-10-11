"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A full-bleed fragment shader on a <canvas>, in raw WebGL (no three.js).
 * The shader gets `u_res` (pixels), `u_time` (seconds of *flow*, which only
 * advances while `active`), and up to four `u_c0..u_c3` colours.
 *
 * - `active` false: time eases to a stop and the last frame stays on screen,
 *   so a resting card shows one still picture.
 * - Off screen or in a hidden tab: nothing renders.
 * - Reduced motion, or no WebGL: renders once (or not at all) and the
 *   `fallback` underneath shows through.
 */
export interface ShaderCanvasProps {
  frag: string;
  colors: string[];
  /** Flow while true; ease to a halt when false. Defaults to always flowing. */
  active?: boolean;
  /** Flow speed multiplier. */
  speed?: number;
  /** Seconds of flow to start from, so cards at rest don't all look alike. */
  seed?: number;
  /** Render resolution as a fraction of CSS pixels (the shaders are soft; 0.5 is plenty). */
  scale?: number;
  /** How quickly the flow gathers and settles (per second). Lower feels thicker, like honey. */
  inertia?: number;
  className?: string;
}

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function ShaderCanvas({ frag, colors, active = true, speed = 1, seed = 0, scale = 0.5, inertia = 3, className }: ShaderCanvasProps) {
  const ref = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const kick = useRef<() => void>(() => {});

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    // A fresh canvas per mount: a context released by an earlier mount can't be revived.
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity .7s";
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false, powerPreference: "low-power" });
    if (!gl) return;
    host.appendChild(canvas);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, `precision mediump float;\n${frag}`));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.remove();
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    colors.slice(0, 4).forEach((c, i) => gl.uniform3fv(gl.getUniformLocation(prog, `u_c${i}`), rgb(c)));

    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * scale));
      const h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, w, h);
    };

    let t = seed;
    let rate = activeRef.current && !reduced ? 1 : 0;
    let visible = true;
    let raf = 0;
    let last = performance.now();
    const draw = () => {
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const target = activeRef.current && !reduced ? 1 : 0;
      // Ease the flow in and out, like a liquid gathering speed and settling.
      rate += (target - rate) * Math.min(1, dt * inertia);
      t += dt * rate * speed;
      resize();
      draw();
      if (visible && !document.hidden && (target > 0 || rate > 0.002)) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf && visible) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    kick.current = start;

    resize();
    draw();
    requestAnimationFrame(() => (canvas.style.opacity = "1"));
    start();

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    const onVis = () => !document.hidden && start();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
    // The program is built once; colours and shader are fixed per instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wake the loop when hovering starts.
  useEffect(() => {
    if (active) kick.current();
  }, [active]);

  return <div ref={ref} aria-hidden className={cn("pointer-events-none", className)} />;
}

/** Shared GLSL: value noise and fbm. */
const NOISE = `
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
`;

/**
 * Liquid colour: two rounds of domain warping push the noise around like ink
 * in water. Colours flow from u_c0 (base) through u_c1 and u_c2 to u_c3.
 * Transparent toward the left so text stays readable on top.
 */
export const FLUID_FRAG = `
uniform vec2 u_res;uniform float u_time;uniform vec3 u_c0,u_c1,u_c2,u_c3;
${NOISE}
void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  vec2 p=uv*vec2(u_res.x/u_res.y,1.)*1.25;
  float t=u_time*.22;
  vec2 q=vec2(fbm(p+vec2(0.,t)),fbm(p+vec2(5.2,1.3)-t*.7));
  vec2 r=vec2(fbm(p+3.5*q+vec2(1.7,9.2)+t*.6),fbm(p+3.5*q+vec2(8.3,2.8)-t*.4));
  float f=fbm(p+3.*r);
  vec3 col=mix(u_c0,u_c1,smoothstep(.15,.65,f));
  col=mix(col,u_c2,smoothstep(.35,.9,length(q)*.9));
  col=mix(col,u_c3,smoothstep(.55,1.,r.x*f*1.6));
  float a=smoothstep(.05,.75,uv.x+.25*f-.1)*smoothstep(-.1,.55,uv.y+.3*f);
  gl_FragColor=vec4(col,a*.95);
}`;

/**
 * Behind the product film: slow aurora-like glow, mostly navy with azure and
 * sky light pooling around the centre and a hint of lemon.
 */
export const GLOW_FRAG = `
uniform vec2 u_res;uniform float u_time;uniform vec3 u_c0,u_c1,u_c2,u_c3;
${NOISE}
void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  vec2 p=(uv-vec2(.5,.42))*vec2(u_res.x/u_res.y,1.);
  float t=u_time*.08;
  vec2 w=vec2(fbm(p*1.4+t),fbm(p*1.4-t+4.));
  float f=fbm(p*1.8+w*2.4);
  float d=length(p*vec2(.55,1.45));
  float glow=smoothstep(1.15,.05,d);
  // Ribbons of light drifting across, like an aurora over the sea.
  float ribbon=smoothstep(.45,.0,abs(f-.5-.25*sin(p.x*2.2+t*3.)))*glow;
  vec3 col=u_c0;
  col=mix(col,u_c1,clamp(glow*.6*smoothstep(.2,.8,f)+ribbon*.4,0.,1.));
  col=mix(col,u_c2,clamp(ribbon*.4+glow*glow*smoothstep(.6,.95,f)*.45,0.,1.));
  col=mix(col,u_c3,smoothstep(.78,1.,f)*glow*.4);
  gl_FragColor=vec4(col,1.);
}`;
