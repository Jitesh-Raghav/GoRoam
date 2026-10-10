"use client";

import { useEffect, useRef } from "react";
import { AmbientLight, Color, DirectionalLight, MeshPhongMaterial, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { polygonToCells } from "h3-js";
import ThreeGlobe from "three-globe";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countriesTopo from "world-atlas/countries-110m.json";
import { DESTINATIONS } from "@/lib/destinations";

/** Long-haul legs only: short hops would draw tall loops at a shared arc height. */
const TOUR = ["taj-mahal", "santorini", "big-ben", "statue-of-liberty", "christ-the-redeemer", "machu-picchu", "golden-gate-bridge", "mount-fuji", "sydney-opera-house", "angkor-wat", "taj-mahal"];

const bySlug = new Map(DESTINATIONS.map((d) => [d.slug, d]));
/**
 * Country outlines, minus the few polygons h3 can't tile (an awkward shape in
 * the 110m data makes it throw, which would stop that country drawing at all).
 */
const countries = feature(countriesTopo as unknown as Topology, (countriesTopo as unknown as Topology).objects.countries as GeometryCollection).features.flatMap((f) => {
  const g = f.geometry;
  if (g?.type !== "Polygon" && g?.type !== "MultiPolygon") return [];
  const polygons = (g.type === "Polygon" ? [g.coordinates] : g.coordinates).filter((rings) => {
    try {
      polygonToCells(rings as number[][][], 3, true);
      return true;
    } catch {
      return false;
    }
  });
  return polygons.length ? [{ ...f, geometry: { type: "MultiPolygon" as const, coordinates: polygons } }] : [];
});

/** A little variety between countries, so the hexes read as a map rather than a flat fill. */
const shade = (name = "") => {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return [`rgba(60, 207, 188, 0.82)`, `rgba(44, 176, 162, 0.78)`, `rgba(120, 222, 208, 0.7)`][h % 3];
};

interface Ring {
  lat: number;
  lng: number;
  active: boolean;
}

/**
 * The landing globe: countries as glowing hexagons on a deep ocean sphere,
 * dashed flight arcs along the tour, and rings pulsing on each place. It
 * flies to `focus` when that changes; dragging hands control to the visitor
 * until the next change. Calls `onFail` if WebGL isn't available.
 */
export default function HexGlobe({ focus, places, onGrab, onFail }: { focus: string; places: string[]; onGrab: () => void; onFail: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const focusRef = useRef(focus);
  focusRef.current = focus;
  const grabRef = useRef(onGrab);
  grabRef.current = onGrab;
  const failRef = useRef(onFail);
  failRef.current = onFail;
  const api = useRef<{ setRings: (active: string) => void } | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch {
      failRef.current();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "pan-y";
    renderer.domElement.style.cursor = "grab";

    const scene = new Scene();
    scene.add(new AmbientLight(0xbfdcd8, 1.6));
    const sun = new DirectionalLight(0xffffff, 1.2);
    sun.position.set(-200, 300, 400);
    scene.add(sun);

    const ringsFor = (active: string): Ring[] =>
      places.flatMap((slug) => {
        const d = bySlug.get(slug);
        return d ? [{ lat: d.lat, lng: d.lng, active: slug === active }] : [];
      });

    const globe = new ThreeGlobe({ animateIn: !reduced })
      .showGlobe(true)
      .showAtmosphere(true)
      .atmosphereColor("#3ccfbc")
      .atmosphereAltitude(0.16)
      .hexPolygonsData(countries)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.42)
      .hexPolygonAltitude(0.006)
      .hexPolygonColor((f) => shade((f as { properties?: { name?: string } }).properties?.name))
      .arcsData(
        TOUR.slice(1).map((slug, i) => {
          const a = bySlug.get(TOUR[i])!;
          const b = bySlug.get(slug)!;
          return { startLat: a.lat, startLng: a.lng, endLat: b.lat, endLng: b.lng };
        })
      )
      .arcColor(() => ["rgba(60, 207, 188, 0.15)", "rgba(233, 194, 124, 0.95)"])
      .arcAltitudeAutoScale(0.35)
      .arcStroke(0.45)
      .arcDashLength(0.45)
      .arcDashGap(0.25)
      .arcDashInitialGap(() => Math.random())
      .arcDashAnimateTime(reduced ? 0 : 3200)
      .pointsData(DESTINATIONS.map((d) => ({ lat: d.lat, lng: d.lng })))
      .pointColor(() => "#e9c27c")
      .pointAltitude(0.012)
      .pointRadius(0.55)
      .ringsData(ringsFor(focusRef.current))
      .ringColor((r: object) => ((r as Ring).active ? (t: number) => `rgba(233, 194, 124, ${1 - t})` : (t: number) => `rgba(60, 207, 188, ${0.7 * (1 - t)})`))
      .ringMaxRadius((r: object) => ((r as Ring).active ? 7 : 3.2))
      .ringPropagationSpeed(reduced ? 0 : 2.2)
      .ringRepeatPeriod((r: object) => ((r as Ring).active ? 900 : 1700));

    const mat = globe.globeMaterial() as MeshPhongMaterial;
    mat.color = new Color("#0b2532");
    mat.emissive = new Color("#06141c");
    mat.emissiveIntensity = 0.6;
    mat.shininess = 0.6;
    scene.add(globe);
    api.current = { setRings: (active) => globe.ringsData(ringsFor(active)) };

    const camera = new PerspectiveCamera(42, 1, 1, 2000);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.45;
    controls.minPolarAngle = Math.PI * 0.22;
    controls.maxPolarAngle = Math.PI * 0.78;
    const DISTANCE = 345;

    // The camera's resting point over a place, a little north of it so the place sits mid-frame.
    const viewOf = (slug: string) => {
      const d = bySlug.get(slug);
      if (!d) return null;
      const c = globe.getCoords(d.lat - 8, d.lng, 0);
      return new Vector3(c.x, c.y, c.z).normalize().multiplyScalar(DISTANCE);
    };
    const start = viewOf(focusRef.current) ?? new Vector3(0, 0, DISTANCE);
    camera.position.copy(start);

    let following = true;
    let shown = focusRef.current;
    const onStart = () => {
      following = false;
      renderer.domElement.style.cursor = "grabbing";
      grabRef.current();
    };
    const onEnd = () => (renderer.domElement.style.cursor = "grab");
    controls.addEventListener("start", onStart);
    controls.addEventListener("end", onEnd);

    const resize = () => {
      const size = el.clientWidth;
      renderer.setSize(size, size, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      if (focusRef.current !== shown) {
        shown = focusRef.current;
        following = true;
        api.current?.setRings(shown);
      }
      const target = following ? viewOf(shown) : null;
      if (target) {
        // Glide along the sphere towards the place, keeping the same distance.
        camera.position.lerp(target, reduced ? 1 : 0.045).setLength(DISTANCE);
      } else if (!reduced) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.35;
      }
      if (following) controls.autoRotate = false;
      controls.update();
      renderer.render(scene, camera);
    };
    loop();
    requestAnimationFrame(() => el.style.setProperty("opacity", "1"));

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      controls.removeEventListener("start", onStart);
      controls.removeEventListener("end", onEnd);
      controls.dispose();
      globe.pauseAnimation?.();
      renderer.dispose();
      renderer.domElement.remove();
      api.current = null;
    };
    // The globe is built once; focus changes flow in through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative aspect-square w-full">
      {/* A soft lagoon halo behind the sphere. */}
      <div className="pointer-events-none absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(60,207,188,0.18),transparent_65%)] blur-2xl" />
      <div ref={host} role="img" aria-label="Interactive globe of GoRoam destinations, countries drawn as hexagons" className="relative size-full opacity-0 transition-opacity duration-[1200ms]" />
    </div>
  );
}
