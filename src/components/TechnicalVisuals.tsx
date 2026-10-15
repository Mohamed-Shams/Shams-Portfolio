"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  Activity,
  CircuitBoard,
  MonitorCog,
  Network,
  Waypoints,
  Database,
  Cloud,
  Factory,
  Workflow,
  Monitor,
  Router,
  ClipboardCheck,
  Wrench,
  ShieldCheck,
  Gauge,
  Plus,
  Minus,
  RotateCcw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BrandIcon, type BrandName } from "./BrandMarks";
import { GLOBE_LAND, GLOBE_COAST, GLOBE_BORDERS } from "../lib/globe-geography";

type GlobeEngine = {
  geo: typeof import("d3-geo");
  world: typeof import("../lib/globe-world.json");
};

/* Recognisable products get their real mark (Simple Icons, CC0) instead of a
   generic glyph; concepts and brands without a permission-compatible source
   (Ignition, AVEVA, WinCC, SOFREL...) keep the lucide icon so nothing is
   ever drawn from memory. */
const BRANDS: Record<string, BrandName> = {
  /* skills grid */
  MQTT: "mqtt",
  Python: "python",
  "JavaScript / HTML / CSS": "javascript",
  "MS SQL / MySQL / PostgreSQL": "postgresql",
  InfluxDB: "influxdb",
  "Docker / Git / n8n": "docker",
  Dataiku: "dataiku",
  "AWS AI Services": "amazonaws",
  /* case-study technology tags */
  PostgreSQL: "postgresql",
  MSSQL: "microsoftsqlserver",
  Oracle: "oracle",
  "Azure DevOps": "azuredevops",
};

function conceptIcon(name: string): LucideIcon {
  if (name.startsWith("Ignition")) return Activity;
  if (name.startsWith("AVEVA")) return Workflow;
  if (name.startsWith("WinCC")) return CircuitBoard;
  if (name.startsWith("SCADA")) return MonitorCog;
  if (name === "HMI") return Monitor;
  if (name === "Industrial IoT" || name === "IIoT") return Factory;
  if (name === "OPC UA") return Network;
  if (name === "REST APIs") return Waypoints;
  if (name === "Stream IIOT") return Cloud;
  if (name === "SOFREL RTU") return Router;
  if (name === "Testing") return ClipboardCheck;
  if (name === "Commissioning") return Wrench;
  if (name === "QA") return ShieldCheck;
  if (name === "10K+ Sensors") return Gauge;
  if (name.includes("SQL")) return Database;
  return Cloud;
}

/** Icon for one tool name: a brand mark when the tool is a recognisable
    product, otherwise a concept glyph. Used by the skills grid and the
    case-study technology cards. */
export function TechIcon({
  name,
  size = 26,
}: {
  name: string;
  size?: number;
}) {
  const brand = BRANDS[name];
  if (brand) return <BrandIcon name={brand} size={size} />;
  const Icon = conceptIcon(name);
  return <Icon size={size} strokeWidth={1.75} aria-hidden="true" />;
}

/* One glyph per tool. Two pairs used to share an icon (both SQL/InfluxDB tiles
   drew the same cylinder, Industrial IoT and AWS the same cloud), which made the
   grid read as three repeated shapes rather than fifteen distinct tools. */
export function TechSymbol({ name }: { name: string }) {
  const color =
    name.startsWith("Ignition") ||
    name.startsWith("JavaScript") ||
    name === "Python" ||
    name.startsWith("AWS")
      ? "amber"
      : name.startsWith("AVEVA") || name === "MQTT"
        ? "violet"
        : name === "Dataiku" || name.startsWith("SCADA")
          ? "teal"
          : "blue";
  return (
    <span className={`tech-symbol tech-${color}`} aria-hidden="true">
      <TechIcon name={name} size={30} />
    </span>
  );
}
export function FlowDiagram({
  labels,
  paused = false,
}: {
  labels: { from: string; via: string; to: string; db: string; dash: string };
  paused?: boolean;
}) {
  const flowSvgRef = useRef<SVGSVGElement>(null);

  // The signal runs by default even if the OS requests reduced motion.
  // Visitors can pause it explicitly, including the native SVG timeline.
  useEffect(() => {
    const svg = flowSvgRef.current;
    if (!svg) return;
    if (paused) svg.pauseAnimations();
    else svg.unpauseAnimations();
    return () => svg.unpauseAnimations();
  }, [paused]);
  const node = (x: number, y: number, w: number, label: string, accent: boolean, index: number) => (
    <g key={label} className={accent ? "flow-svg-node is-active" : "flow-svg-node"}
      style={{ "--flow-sequence": index } as CSSProperties}>
      <rect
        x={x}
        y={y}
        width={w}
        height={40}
        rx={7}
        fill={accent ? "#f1a34214" : "#12365526"}
        stroke={accent ? "#f1a342" : "#2a8bb8"}
        strokeWidth="1"
      />
      <text
        x={x + w / 2}
        y={y + 25}
        textAnchor="middle"
        fontSize="12"
        fontFamily="JetBrains Mono, monospace"
        fill={accent ? "#f5ad35" : "#7cbbdd"}
      >
        {label}
      </text>
    </g>
  );
  const arrow = (x1: number, x2: number, y: number, key: string) => (
    <g key={key} className="flow-svg-link">
      <line
        x1={x1}
        y1={y}
        x2={x2 - 8}
        y2={y}
        stroke="#2a8bb8"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <line
        className="flow-svg-stream"
        x1={x1}
        y1={y}
        x2={x2 - 8}
        y2={y}
        stroke="#3ec9ef"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="4 11"
      />
      <path
        d={`M${x2} ${y} l-7 -4 v8 z`}
        fill="#2a8bb8"
      />
    </g>
  );
  /* The SVG labels are viewBox units: below the wide desktop the drawing is
     scaled down until the 12-unit type renders at 5–9px. The same five steps are
     therefore also rendered as real text, and the two swap at 1151px so exactly
     one of them is ever displayed (and exposed to assistive tech). */
  const steps = [labels.from, labels.via, labels.to, labels.db, labels.dash];
  return (
    <>
      <ol className="flow-steps">
        {steps.map((label, i) => (
          <li
            key={label}
            className={"flow-step" + (i === 2 ? " accent" : "")}
            style={{ "--flow-sequence": i } as CSSProperties}
          >
            {i > 0 && <span className="flow-link" aria-hidden="true" />}
            <span className="flow-chip">{label}</span>
          </li>
        ))}
      </ol>
      <svg
        ref={flowSvgRef}
        className="flow-diagram"
        viewBox="0 0 1080 96"
        role="img"
        aria-label={
          (labels.from + " → " + labels.via + " → " + labels.to + " → " + labels.db + " → " + labels.dash)
        }
      >
        {/* One packet travels through ALL five nodes, not four unrelated loops.
            The path stays left-to-right in both EN and AR: actual signal
            direction represents PLC -> SCADA -> dashboards. */}
        <path className="flow-throughline" d="M81 48 L279 48 L495 42 L722.5 48 L930 48" />
        {node(6, 28, 150, labels.from, false, 0)}
        {arrow(164, 210, 48, "a")}
        {node(214, 28, 130, labels.via, false, 1)}
        {arrow(352, 396, 48, "b")}
        {node(400, 22, 190, labels.to, true, 2)}
        {arrow(598, 644, 48, "c")}
        {node(648, 28, 149, labels.db, false, 3)}
        {arrow(805, 851, 48, "d")}
        {node(855, 28, 150, labels.dash, false, 4)}
        <circle className="flow-svg-halo" r="11" fill="#24cfff" opacity=".28" aria-hidden="true">
          <animateMotion path="M81 48 L279 48 L495 42 L722.5 48 L930 48"
            dur="9s" calcMode="linear" repeatCount="indefinite" />
        </circle>
        <circle className="flow-svg-packet" r="5.5" fill="#fff0be" aria-hidden="true">
          <animateMotion path="M81 48 L279 48 L495 42 L722.5 48 L930 48"
            dur="9s" calcMode="linear" repeatCount="indefinite" />
        </circle>
      </svg>
    </>
  );
}
export function Scada() {
  return (
    <div className="scada" aria-hidden="true">
      <div className="scada-display">
        <span>SCADA</span>
        <svg viewBox="0 0 180 135">
          <defs>
            <pattern
              id="scada-grid"
              width="20"
              height="18"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M20 0H0V18"
                fill="none"
                stroke="#1688b5"
                strokeWidth=".5"
              />
            </pattern>
          </defs>
          <rect
            x="29"
            y="18"
            width="142"
            height="108"
            fill="url(#scada-grid)"
          />
          {/* Y-axis ticks + an explicitly illustrative read-out label, so the
              panel can never read as live plant telemetry. */}
          <g stroke="#3d7091" strokeWidth="1">
            <path d="M26 33h3M26 61h3M26 89h3M26 117h3" />
          </g>
          <text
            x="30"
            y="13"
            fontSize="6"
            fontFamily="JetBrains Mono, monospace"
            letterSpacing="1"
            fill="#619cb8"
          >
            TREND · 24 H · SIMULATED
          </text>
          <text
            x="171"
            y="133"
            textAnchor="end"
            fontSize="5.5"
            fontFamily="JetBrains Mono, monospace"
            letterSpacing="1"
            fill="#528aa4"
          >
            ACQ / HR
          </text>
          <g stroke="#1688b5" fill="none" strokeWidth=".7">
            <rect x="3" y="32" width="18" height="88" />
            <path d="M6 40h12M6 46h7M6 53h10M6 76h12M6 90h9M6 106h11M29 125H173M29 18v107" />
          </g>
          <path
            className="scada-trace"
            d="M30 112 46 99 59 106 70 69 88 81 103 59 117 65 133 38 143 48 171 15"
            fill="none"
            stroke="#39b8ed"
            strokeWidth="1.6"
          />
          <path
            d="M30 120 50 117 74 95 99 103 118 81 143 64 171 63"
            fill="none"
            stroke="#1688b5"
            strokeDasharray="3 3"
          />
          {[
            [46, 99],
            [70, 69],
            [103, 59],
            [133, 38],
            [171, 15],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="2" fill="#98dcff" />
          ))}
        </svg>
      </div>
      <div className="scada-labels">
        <span>IIoT</span>
        <span>Data</span>
        <span>Automation</span>
        <span>Analytics</span>
        <span>AI</span>
        <i />
      </div>
    </div>
  );
}
function point(lon: number, lat: number, centerLon = 20, centerLat = 0, zoom = 1) {
  const a = ((lon - centerLon) * Math.PI) / 180,
    b = (lat * Math.PI) / 180,
    c = (centerLat * Math.PI) / 180;
  const x = Math.cos(b) * Math.sin(a),
    y = -(Math.sin(b) * Math.cos(c) - Math.cos(b) * Math.sin(c) * Math.cos(a)),
    z = Math.sin(b) * Math.sin(c) + Math.cos(b) * Math.cos(c) * Math.cos(a);
  const tilt = -0.25;
  return {
    x: Number(
      (240 + 215 * zoom * (x * Math.cos(tilt) - y * Math.sin(tilt))).toFixed(3),
    ),
    y: Number(
      (240 + 215 * zoom * (x * Math.sin(tilt) + y * Math.cos(tilt))).toFixed(3),
    ),
    z,
  };
}
// The contact globe uses a fixed orthographic projection centred on 20°E.
// Use the very same projection for location beacons: arbitrary SVG positions
// would drift off the countries whenever the artwork is resized or mirrored.
const workLocations = [
  { id: "egypt", name: "Egypt", arabic: "مصر", lon: 30.8, lat: 26.8 },
  { id: "saudi", name: "Saudi Arabia", arabic: "السعودية", lon: 45.1, lat: 24.2 },
] as const;

export function GlobeArt({ locale = "en" }: { locale?: "en" | "ar" }) {
  const ar = locale === "ar";
  const svgRef = useRef<SVGSVGElement>(null);
  const isMounted = useRef(true);
  const enginePromise = useRef<Promise<GlobeEngine> | null>(null);
  const [engine, setEngine] = useState<GlobeEngine | null>(null);
  const [view, setView] = useState({ lon: 20, lat: 0, zoom: 1 });
  const [dragging, setDragging] = useState(false);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const viewRef = useRef(view);
  const visibleRef = useRef(false);
  const hoveredRef = useRef(false);
  const focusedRef = useRef(false);
  const engineReadyRef = useRef(false);
  const motionFrameRef = useRef<number | null>(null);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drag = useRef<{
    id: number; x: number; y: number; lon: number; lat: number;
    moved: boolean; lastFrame: number; lastX: number; lastY: number;
    velocityLon: number; velocityLat: number; pointerType: string;
  } | null>(null);
  const applyView = useCallback((next: { lon: number; lat: number; zoom: number }) => {
    const bounded = {
      lon: ((next.lon + 540) % 360) - 180,
      lat: Math.max(-65, Math.min(65, next.lat)),
      zoom: Math.max(1, Math.min(1.65, next.zoom)),
    };
    viewRef.current = bounded;
    if (isMounted.current) setView(bounded);
  }, []);
  const stopMotion = useCallback(() => {
    if (idleTimeoutRef.current !== null) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
    if (motionFrameRef.current !== null) {
      cancelAnimationFrame(motionFrameRef.current);
      motionFrameRef.current = null;
    }
  }, []);
  const scheduleIdle = useCallback(() => {
    stopMotion();
    if (!engineReadyRef.current || !visibleRef.current ||
        hoveredRef.current || focusedRef.current || drag.current) return;
    // A restrained, bounded drift keeps the real geography alive without
    // revolving experience markers away from the user's chosen region.
    idleTimeoutRef.current = setTimeout(() => {
      idleTimeoutRef.current = null;
      if (!visibleRef.current || hoveredRef.current || focusedRef.current || drag.current) return;
      const anchor = viewRef.current;
      const start = performance.now();
      let previous = 0;
      const tick = (now: number) => {
        if (!visibleRef.current || hoveredRef.current || focusedRef.current || drag.current) {
          motionFrameRef.current = null;
          return;
        }
        // Updating at <=12fps avoids redrawing the Natural Earth projection
        // every animation frame; halo, twinkles and orbit remain CSS-smooth.
        if (now - previous >= 85) {
          const elapsed = now - start;
          applyView({
            ...anchor,
            lon: anchor.lon + Math.sin(elapsed / 5200) * 1.5,
            lat: anchor.lat + Math.sin(elapsed / 7400) * .35,
          });
          previous = now;
        }
        motionFrameRef.current = requestAnimationFrame(tick);
      };
      motionFrameRef.current = requestAnimationFrame(tick);
    }, 2700);
  }, [applyView, stopMotion]);
  const coastAfterRelease = useCallback((velocityLon: number, velocityLat: number) => {
    stopMotion();
    if (Math.hypot(velocityLon, velocityLat) < .002 || !visibleRef.current) {
      scheduleIdle();
      return;
    }
    const start = performance.now();
    let previous = start;
    const tick = (now: number) => {
      if (!visibleRef.current || drag.current) {
        motionFrameRef.current = null;
        return;
      }
      const dt = Math.min(42, now - previous);
      previous = now;
      const decay = Math.exp(-dt / 190);
      velocityLon *= decay;
      velocityLat *= decay;
      const current = viewRef.current;
      applyView({
        ...current,
        lon: current.lon + velocityLon * dt,
        lat: current.lat + velocityLat * dt,
      });
      if (Math.hypot(velocityLon, velocityLat) < .001 || now - start > 1100) {
        motionFrameRef.current = null;
        scheduleIdle();
      } else {
        motionFrameRef.current = requestAnimationFrame(tick);
      }
    };
    motionFrameRef.current = requestAnimationFrame(tick);
  }, [applyView, scheduleIdle, stopMotion]);
  const loadEngine = useCallback(() => {
    if (!enginePromise.current) {
      enginePromise.current = Promise.all([
        import("d3-geo"), import("../lib/globe-world.json"),
      ]).then(([geo, world]) => {
        const value = { geo, world: world.default };
        engineReadyRef.current = true;
        if (isMounted.current) setEngine(value);
        return value;
      }).catch((error) => {
        enginePromise.current = null; // allow a later retry on a transient failure
        throw error;
      });
    }
    // Preloading must not surface unhandled rejection errors in the browser.
    void enginePromise.current.catch(() => {});
    return enginePromise.current;
  }, []);
  useEffect(() => {
    isMounted.current = true;
    const el = svgRef.current;
    if (!el) return;
    // Network/code splitting: fetch the geographic engine only as visitors
    // approach the Contact section. The static globe remains SSR-visible.
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      void loadEngine();
      observer.disconnect();
    }, { rootMargin: "280px" });
    observer.observe(el);
    return () => {
      isMounted.current = false;
      observer.disconnect();
    };
  }, [loadEngine]);
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    // No geo reprojection or requestAnimationFrame loop while off screen.
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = !!entry?.isIntersecting;
      if (!visibleRef.current) stopMotion();
      else scheduleIdle();
    }, { threshold: .12 });
    observer.observe(el);
    return () => {
      observer.disconnect();
      stopMotion();
    };
  }, [scheduleIdle, stopMotion]);
  useEffect(() => {
    if (engine) scheduleIdle();
  }, [engine, scheduleIdle]);
  const changed = view.lon !== 20 || view.lat !== 0 || view.zoom !== 1;
  const projected = useMemo(() => {
    if (!engine || !changed) return null;
    const projection = engine.geo.geoOrthographic()
      .rotate([-view.lon, -view.lat, 0])
      .scale(215 * view.zoom).translate([240, 240])
      .angle(0.25 * 180 / Math.PI).clipAngle(90).precision(.65);
    const path = engine.geo.geoPath(projection).digits(1);
    const geo = engine.world;
    // GeometryCollections are sourced from Natural Earth 1:110m. They are
    // reprojected together, clipping hidden back-side coastlines correctly.
    return {
      land: path(geo.land as import("d3-geo").GeoPermissibleObjects) ?? "",
      coast: path(geo.coast as import("d3-geo").GeoPermissibleObjects) ?? "",
      borders: path(geo.borders as import("d3-geo").GeoPermissibleObjects) ?? "",
    };
  }, [changed, engine, view]);
  const rotate = (lon: number, lat: number) =>
    applyView({ ...viewRef.current, lon, lat });
  const zoomBy = (amount: number) => {
    stopMotion();
    void loadEngine().then(() => {
      if (isMounted.current) {
        applyView({ ...viewRef.current, zoom: +(viewRef.current.zoom + amount).toFixed(2) });
        scheduleIdle();
      }
    }).catch(() => {}); // retain the SSR globe if offline
  };
  const resetView = () => {
    stopMotion();
    applyView({ lon: 20, lat: 0, zoom: 1 });
    setActiveCountry(null);
    scheduleIdle();
  };
  const pointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (drag.current) return; // single-pointer interaction (no pinch conflict)
    if ((event.target as Element).closest(".globe-beacon")) return;
    stopMotion();
    void loadEngine();
    drag.current = {
      id: event.pointerId, x: event.clientX, y: event.clientY,
      lon: viewRef.current.lon, lat: viewRef.current.lat, lastFrame: performance.now(),
      lastX: event.clientX, lastY: event.clientY,
      velocityLon: 0, velocityLat: 0, moved: false, pointerType: event.pointerType,
    };
  };
  const pointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (!current.moved) {
      if (Math.hypot(dx, dy) < 8) return;
      if (current.pointerType === "touch" && Math.abs(dy) > Math.abs(dx) * 1.15) {
        // Let the browser handle vertical swipe to scroll down the page.
        drag.current = null;
        scheduleIdle();
        return;
      }
      if (!engineReadyRef.current) return;
      current.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
      setActiveCountry(null);
    }
    if (!engineReadyRef.current) return;
    const time = performance.now();
    if (time - current.lastFrame < 28) return; // ~30fps max while dragging
    const dt = Math.max(1, time - current.lastFrame);
    const scale = 480 / event.currentTarget.getBoundingClientRect().width / viewRef.current.zoom;
    // Cap release velocity: quick swipes coast briefly but never spin away.
    current.velocityLon = Math.max(-.09, Math.min(.09,
      -(event.clientX - current.lastX) * .43 * scale / dt));
    current.velocityLat = Math.max(-.07, Math.min(.07,
      (event.clientY - current.lastY) * .35 * scale / dt));
    current.lastFrame = time;
    current.lastX = event.clientX;
    current.lastY = event.clientY;
    rotate(current.lon - dx * .43 * scale, current.lat + dy * .35 * scale);
  };
  const finishPointer = (event: ReactPointerEvent<SVGSVGElement>, cancelled = false) => {
    if (drag.current?.id !== event.pointerId) return;
    const current = drag.current;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
    if (current.moved && !cancelled) {
      const age = performance.now() - current.lastFrame;
      const decay = age > 120 ? 0 : Math.exp(-age / 80);
      coastAfterRelease(current.velocityLon * decay, current.velocityLat * decay);
    } else scheduleIdle();
  };
  const onGlobeKey = (event: ReactKeyboardEvent<SVGSVGElement>) => {
    if (event.target !== event.currentTarget) return;
    const increments: Record<string, [number, number]> = {
      ArrowLeft: [-12, 0], ArrowRight: [12, 0],
      ArrowUp: [0, 10], ArrowDown: [0, -10],
    };
    const delta = increments[event.key];
    if (delta) {
      event.preventDefault();
      stopMotion();
      void loadEngine().then(() => {
        if (isMounted.current) {
          rotate(viewRef.current.lon + delta[0], viewRef.current.lat + delta[1]);
          scheduleIdle();
        }
      }).catch(() => {});
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault(); zoomBy(.15);
    } else if (event.key === "-") {
      event.preventDefault(); zoomBy(-.15);
    } else if (event.key === "Home") {
      event.preventDefault(); resetView();
    }
  };
  const nodes = [];
  for (let lat = -60; lat <= 75; lat += 15)
    for (let lon = -180; lon <= 180; lon += 15) {
      const p = point(lon, lat, view.lon, view.lat, view.zoom);
      if (p.z > 0.05) nodes.push({ ...p, lat, lon });
    }
  const [egypt, saudi] = workLocations.map((location) => ({
    ...location,
    ...point(location.lon, location.lat, view.lon, view.lat, view.zoom),
  }));
  const visibleMarkers = [egypt, saudi].filter((p) => p.z > 0.02);
  // Slight northward arc between the two geography-accurate beacons.
  const connection = `M${egypt.x} ${egypt.y} Q${((egypt.x + saudi.x) / 2).toFixed(2)} ${Math.min(egypt.y, saudi.y) - 35} ${saudi.x} ${saudi.y}`;
  return (
    <>
    <svg
      ref={svgRef}
      className="globe-art"
      viewBox="0 0 480 480"
      fill="none"
      role="group"
      tabIndex={0}
      data-interactive-ready={engine ? "true" : "false"}
      data-dragging={dragging ? "true" : "false"}
      data-rotation={`${view.lon.toFixed(1)},${view.lat.toFixed(1)}`}
      data-zoom={view.zoom.toFixed(2)}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={(event) => finishPointer(event)}
      onPointerCancel={(event) => finishPointer(event, true)}
      onLostPointerCapture={(event) => finishPointer(event, true)}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          hoveredRef.current = true;
          stopMotion();
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") {
          hoveredRef.current = false;
          if (!drag.current) scheduleIdle();
        }
      }}
      onFocusCapture={() => {
        focusedRef.current = true;
        stopMotion();
      }}
      onBlurCapture={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        focusedRef.current = false;
        scheduleIdle();
      }}
      onKeyDown={onGlobeKey}
      aria-label={locale === "ar"
        ? "كرة أرضية تفاعلية. اسحب للتدوير، الأسهم للتحريك، وزائد أو ناقص للتكبير أو التصغير. مواقع مصر والسعودية."
        : "Interactive globe. Drag to rotate, use arrow keys to turn and plus/minus to zoom. Egypt and Saudi Arabia experience markers."}
    >
      <defs>
        <radialGradient id="earth-glow">
          <stop stopColor="#125273" stopOpacity=".2" />
          <stop offset=".82" stopColor="#07354c" stopOpacity=".13" />
          <stop offset="1" stopColor="#1688b5" stopOpacity=".08" />
        </radialGradient>
        <clipPath id="earth-disc">
          <circle cx="240" cy="240" r="216" />
        </clipPath>
        <radialGradient id="work-beacon-glow">
          <stop stopColor="#ffe4a8" stopOpacity=".52" />
          <stop offset=".35" stopColor="#f1a342" stopOpacity=".24" />
          <stop offset="1" stopColor="#f1a342" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle
        cx="240"
        cy="240"
        r="215"
        fill="url(#earth-glow)"
        stroke="#1688b5"
        strokeWidth=".8"
      />
      <g clipPath="url(#earth-disc)">
        {nodes.map((p, i) => (
          <g key={`${p.lat}-${p.lon}`}>
            {[
              point(p.lon + 15, p.lat, view.lon, view.lat, view.zoom),
              point(p.lon, p.lat + 15, view.lon, view.lat, view.zoom),
              point(p.lon + 15, p.lat + 15, view.lon, view.lat, view.zoom),
            ]
              .filter((q) => q.z > 0)
              .map((q, j) => (
                <path
                  key={j}
                  d={`M${p.x},${p.y}L${q.x},${q.y}`}
                  stroke="#1688b5"
                  strokeWidth=".5"
                  opacity={Number((0.15 + p.z * 0.28).toFixed(3))}
                />
              ))}
            <circle
              className={i % 11 === 0 ? "globe-node" : undefined}
              style={
                i % 11 === 0
                  ? { animationDelay: `${((i % 44) / 11) * 1.4}s` }
                  : undefined
              }
              cx={p.x}
              cy={p.y}
              r={i % 11 === 0 ? 2.2 : 1}
              fill={i % 11 === 0 ? "#f1a342" : "#278bb2"}
              opacity={i % 11 === 0 ? 0.9 : 0.6}
            />
          </g>
        ))}
        {/* Natural Earth 1:110m coastline and national boundaries projected
            with the SAME orthographic globe geometry as the beacons. Lines
            are horizon-clipped so no back-side zigzags cross the oceans. */}
        <path
          className="globe-land-fill"
          d={projected?.land ?? GLOBE_LAND}
          fill="#0b293c"
          fillOpacity=".48"
          fillRule="evenodd"
        />
        <path
          className="globe-coastline"
          d={projected?.coast ?? GLOBE_COAST}
          stroke="#3498c1"
          strokeWidth="1.25"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity=".93"
        />
        <path
          className="globe-country-borders"
          d={projected?.borders ?? GLOBE_BORDERS}
          stroke="#31738e"
          strokeWidth=".58"
          strokeLinecap="round"
          opacity=".65"
        />
        {/* A regional link, not one of the generic decorative signal arcs.
            Both ends share the precise land projection used above. */}
        <g className="globe-region-connection" aria-hidden="true"
          style={{ display: visibleMarkers.length === 2 ? undefined : "none" }}>
          <path className="globe-region-base" d={connection} />
          <path className="globe-region-trail" d={connection} />
          <circle className="globe-region-traveller" r="2.7" fill="#ffe4aa">
            <animateMotion dur="5.4s" repeatCount="indefinite" path={connection} />
          </circle>
        </g>
        {/* The three signal arcs draw themselves once the contact section has
            revealed (`.contact.in`), then stay. One-shot, offset only. */}
        {[
          { d: "M125 345Q255 75 414 167", delay: "0.2s" },
          { d: "M70 195Q264 400 410 325", delay: "0.5s" },
          { d: "M91 358Q265 233 418 360", delay: "0.8s" },
        ].map((arc) => (
          <path
            key={arc.d}
            className="globe-signal"
            style={{ animationDelay: arc.delay }}
            d={arc.d}
            stroke="#c78134"
            strokeWidth=".7"
            opacity=".65"
          />
        ))}
        {/* Geo-anchored beacons: Cairo/Egypt and Riyadh/Saudi Arabia.
            A keyboard-focusable graphic gives non-mouse visitors the same
            unobtrusive label as pointer hover, without a fake button. */}
        {visibleMarkers.map((location) => (
          <g
            key={location.id}
            className={`globe-beacon globe-beacon--${location.id}${activeCountry === location.id ? " is-selected" : ""}`}
            data-country={location.id}
            transform={`translate(${location.x} ${location.y})`}
            role="button"
            tabIndex={0}
            aria-pressed={activeCountry === location.id}
            onClick={() => {
              stopMotion();
              setActiveCountry((current) => current === location.id ? null : location.id);
              scheduleIdle();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                stopMotion();
                setActiveCountry((current) => current === location.id ? null : location.id);
                scheduleIdle();
              }
            }}
            aria-label={locale === "ar"
              ? `${location.arabic} — خبرة في المشروعات`
              : `${location.name} — project experience`}
          >
            <title>{`${location.name} / ${location.arabic}`}</title>
            <circle className="globe-beacon-halo" r="28" fill="url(#work-beacon-glow)" />
            <circle className="globe-beacon-ripple" r="10" />
            <circle className="globe-beacon-ripple globe-beacon-ripple--second" r="10" />
            <circle className="globe-beacon-ring" r="8" />
            <circle className="globe-beacon-core" r="4.5" />
            <circle className="globe-beacon-hotspot" r="2" />
            <text
              className="globe-beacon-label"
              x={location.id === "egypt" ? -18 : 18}
              y="23"
              textAnchor={location.id === "egypt" ? "end" : "start"}
              direction={locale === "ar" ? "rtl" : "ltr"}
            >
              {locale === "ar" ? location.arabic : location.name}
            </text>
          </g>
        ))}
      </g>
      {/* Slow dashed orbit ring around the globe (rotates, 90s/turn). */}
      <g className="globe-orbit">
        <ellipse
          cx="240"
          cy="240"
          rx="256"
          ry="78"
          transform="rotate(-24 240 240)"
          stroke="#1688b5"
          strokeWidth=".5"
          strokeDasharray="3 7"
          opacity=".35"
        />
      </g>
    </svg>
    <div className="globe-controls" role="group"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          hoveredRef.current = true;
          stopMotion();
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") {
          hoveredRef.current = false;
          scheduleIdle();
        }
      }}
      onFocusCapture={() => {
        focusedRef.current = true;
        stopMotion();
      }}
      onBlurCapture={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        focusedRef.current = false;
        scheduleIdle();
      }}
      aria-label={ar ? "التحكم في الكرة الأرضية" : "Globe controls"}>
      <button type="button" onClick={() => zoomBy(.15)} disabled={view.zoom >= 1.65}
        aria-label={ar ? "تكبير الكرة الأرضية" : "Zoom in globe"} title={ar ? "تكبير" : "Zoom in"}>
        <Plus size={16}/>
      </button>
      <button type="button" onClick={() => zoomBy(-.15)} disabled={view.zoom <= 1}
        aria-label={ar ? "تصغير الكرة الأرضية" : "Zoom out globe"} title={ar ? "تصغير" : "Zoom out"}>
        <Minus size={16}/>
      </button>
      <button type="button" onClick={resetView}
        aria-label={ar ? "إعادة الكرة الأرضية لوضعها الأول" : "Reset globe view"}
        title={ar ? "إعادة ضبط" : "Reset view"}>
        <RotateCcw size={16}/>
      </button>
    </div>
    <span className="globe-drag-hint" aria-hidden="true">
      {ar ? "اسحب الكرة لاستكشافها" : "Drag to explore"}
    </span>
    </>
  );
}
