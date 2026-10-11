"use client";
import {
  Activity,
  CircuitBoard,
  MonitorCog,
  Network,
  Rss,
  Waypoints,
  Code2,
  Database,
  Container,
  Workflow,
  Cloud,
  ChartNoAxesCombined,
  Braces,
} from "lucide-react";
export function TechSymbol({ name }: { name: string }) {
  const Icon = name.startsWith("Ignition")
    ? Activity
    : name.startsWith("AVEVA")
      ? Workflow
      : name.startsWith("WinCC")
        ? CircuitBoard
        : name.startsWith("SCADA")
          ? MonitorCog
          : name === "OPC UA"
            ? Network
            : name === "MQTT"
              ? Rss
              : name === "REST APIs"
                ? Waypoints
                : name === "Python"
                  ? Braces
                  : name.startsWith("JavaScript")
                    ? Code2
                    : name.includes("SQL") || name === "InfluxDB"
                      ? Database
                      : name.startsWith("Docker")
                        ? Container
                        : name === "Dataiku"
                          ? ChartNoAxesCombined
                          : Cloud;
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
      <Icon size={30} />
      {name === "Python" && <small>Py</small>}
    </span>
  );
}
export function FlowDiagram({
  labels,
}: {
  labels: { from: string; via: string; to: string; db: string; dash: string };
}) {
  const node = (x: number, y: number, w: number, label: string, accent: boolean) => (
    <g key={label}>
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
    <g key={key}>
      <line
        x1={x1}
        y1={y}
        x2={x2 - 8}
        y2={y}
        stroke="#2a8bb8"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <path
        d={`M${x2} ${y} l-7 -4 v8 z`}
        fill="#2a8bb8"
      />
    </g>
  );
  return (
    <svg
      className="flow-diagram"
      viewBox="0 0 1080 96"
      role="img"
      aria-label={
        (labels.from + " → " + labels.via + " → " + labels.to + " → " + labels.db + " → " + labels.dash)
      }
    >
      {node(6, 28, 150, labels.from, false)}
      {arrow(164, 210, 48, "a")}
      {node(214, 28, 130, labels.via, false)}
      {arrow(352, 396, 48, "b")}
      {node(400, 22, 190, labels.to, true)}
      {arrow(598, 644, 48, "c")}
      {node(648, 28, 149, labels.db, false)}
      {arrow(805, 851, 48, "d")}
      {node(855, 28, 150, labels.dash, false)}
      <circle className="flow-dot dot-a" r="3" fill="#f1a342" />
      <circle className="flow-dot dot-b" r="3" fill="#278bb2" />
      <circle className="flow-dot dot-c" r="3" fill="#f1a342" />
      <circle className="flow-dot dot-d" r="3" fill="#278bb2" />
    </svg>
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
const land = [
  [
    [-17, 36],
    [6, 37],
    [25, 32],
    [35, 31],
    [43, 12],
    [50, 10],
    [42, -12],
    [32, -29],
    [18, -35],
    [10, -18],
    [2, 5],
    [-15, 12],
    [-17, 36],
  ],
  [
    [-10, 36],
    [-9, 44],
    [0, 49],
    [-7, 57],
    [7, 59],
    [13, 70],
    [29, 71],
    [36, 61],
    [29, 52],
    [40, 46],
    [30, 40],
    [18, 42],
    [10, 37],
    [-10, 36],
  ],
  [
    [35, 31],
    [49, 29],
    [60, 24],
    [72, 21],
    [80, 7],
    [90, 22],
    [110, 22],
    [123, 40],
    [135, 48],
    [155, 60],
    [120, 70],
    [75, 73],
    [40, 60],
  ],
  [
    [-80, 10],
    [-66, 9],
    [-48, -3],
    [-35, -10],
    [-47, -27],
    [-67, -55],
    [-73, -39],
    [-80, 10],
  ],
];
function point(lon: number, lat: number) {
  const a = ((lon - 20) * Math.PI) / 180,
    b = (lat * Math.PI) / 180;
  const x = Math.cos(b) * Math.sin(a),
    y = -Math.sin(b),
    z = Math.cos(b) * Math.cos(a);
  const tilt = -0.25;
  return {
    x: Number(
      (240 + 215 * (x * Math.cos(tilt) - y * Math.sin(tilt))).toFixed(3),
    ),
    y: Number(
      (240 + 215 * (x * Math.sin(tilt) + y * Math.cos(tilt))).toFixed(3),
    ),
    z,
  };
}
export function GlobeArt() {
  const nodes = [];
  for (let lat = -60; lat <= 75; lat += 15)
    for (let lon = -60; lon <= 105; lon += 15) {
      const p = point(lon, lat);
      if (p.z > 0.05) nodes.push({ ...p, lat, lon });
    }
  return (
    <svg
      className="globe-art"
      viewBox="0 0 480 480"
      fill="none"
      aria-hidden="true"
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
          <g key={i}>
            {[
              point(p.lon + 15, p.lat),
              point(p.lon, p.lat + 15),
              point(p.lon + 15, p.lat + 15),
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
              cx={p.x}
              cy={p.y}
              r={i % 11 === 0 ? 2.2 : 1}
              fill={i % 11 === 0 ? "#f1a342" : "#278bb2"}
              opacity={i % 11 === 0 ? 0.9 : 0.6}
            />
          </g>
        ))}
        {land.map((shape, i) => (
          <path
            key={i}
            d={shape
              .map(([lon, lat], j) => {
                const p = point(lon, lat);
                return `${j ? "L" : "M"}${p.x} ${p.y}`;
              })
              .join(" ")}
            stroke="#3498c1"
            strokeWidth="1"
            fill="#0b293c"
            fillOpacity=".2"
          />
        ))}
        <path
          d="M125 345Q255 75 414 167M70 195Q264 400 410 325M91 358Q265 233 418 360"
          stroke="#c78134"
          strokeWidth=".7"
          opacity=".65"
        />
      </g>
      <ellipse
        cx="240"
        cy="240"
        rx="246"
        ry="95"
        transform="rotate(-44 240 240)"
        stroke="#1688b5"
        strokeWidth=".5"
        opacity=".4"
      />
      <g transform="translate(281 173)">
        <path
          d="M0 31C-12 13-17 7-17 0a17 17 0 0134 0c0 8-6 15-17 31Z"
          fill="#f1a342"
        />
        <circle cy="-1" r="6" fill="#101820" />
      </g>
    </svg>
  );
}
