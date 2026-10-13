"use client";
import { useId } from "react";
import type { GalleryKind, Project } from "@/lib/content";

/* Original illustrative artwork for the case-study galleries.
   Everything here is drawn from scratch as vector geometry in the site's own
   palette — no project photographs, no screenshots and no third-party assets
   are used, and no real project documentation is depicted. Scene motifs are
   stylised technical illustrations of each project's subject matter; the
   `flow` renderer draws only the four architecture steps recorded in
   content.ts, and `ops` composes the project's real tags and verified scale
   tiles into a control-room style view. */

const W = 960;
const H = 540;

const C = {
  bgTop: "#0d1c26",
  bgBottom: "#091119",
  ground: "#0b161f",
  panel: "#101b25",
  panel2: "#131e29",
  line: "#26415a",
  lineSoft: "#1c3246",
  blue: "#2a8bb8",
  blueL: "#7cbbdd",
  blueB: "#39b8ed",
  amber: "#f1a342",
  amberL: "#f5ad35",
  text: "#c6d6e2",
  muted: "#7f93a3",
  white: "#e8f1f7",
};

const MONO = '"JetBrains Mono", monospace';
const SANS = 'Inter, Alexandria, sans-serif';

/* Rough advance-width estimates for layout maths (SVG has no text measuring
   before layout, and these chips only need to be generously padded). */
const monoW = (s: string, size: number) => s.length * size * 0.62;
const sansW = (s: string, size: number) => s.length * size * 0.56;

/** Deterministic 0..1 generator seeded by the project slug, so every render
    of the same project draws the same artwork (SSR and hydration agree). */
function makeRnd(slug: string) {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
}

/** Greedy word wrap for SVG node labels (both scripts split on spaces). */
function wrap(text: string, max: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + " " + w).length <= max) cur += " " + w;
    else {
      lines.push(cur);
      cur = w;
      if (lines.length === maxLines) {
        lines[maxLines - 1] = lines[maxLines - 1].slice(0, max - 1) + "…";
        return lines;
      }
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].slice(0, max - 1) + "…";
  }
  return lines;
}

type ChipOpts = {
  fill?: string;
  stroke?: string;
  color?: string;
  size?: number;
  mono?: boolean;
  x?: number;
  y?: number;
};

/** Rounded label chip with auto width. Returns [g, width]. */
function chip(
  key: string,
  text: string,
  x: number,
  y: number,
  o: ChipOpts = {},
) {
  const size = o.size ?? 13;
  const mono = o.mono !== false;
  const w = Math.round((mono ? monoW(text, size) : sansW(text, size)) + 26);
  const h = size + 16;
  return (
    <g key={key}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={h / 2}
        fill={o.fill ?? "#0f1f2b"}
        stroke={o.stroke ?? C.line}
        strokeWidth={1}
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + size * 0.36}
        textAnchor="middle"
        fontFamily={mono ? MONO : SANS}
        fontSize={size}
        fill={o.color ?? C.blueL}
      >
        {text}
      </text>
    </g>
  );
}

/** Small instrument panel with a deterministic trend polyline. */
function trendPanel(
  key: string,
  x: number,
  y: number,
  w: number,
  h: number,
  rnd: () => number,
) {
  const pts: string[] = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const px = x + 14 + (i * (w - 28)) / (n - 1);
    const py = y + h - 14 - (0.15 + rnd() * 0.7) * (h - 30);
    pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }
  return (
    <g key={key}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill={C.panel}
        stroke={C.lineSoft}
      />
      {[0.3, 0.55, 0.8].map((f, i) => (
        <line
          key={i}
          x1={x + 10}
          x2={x + w - 10}
          y1={y + h * f}
          y2={y + h * f}
          stroke={C.lineSoft}
          strokeDasharray="3 5"
        />
      ))}
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={C.amber}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <circle
        cx={x + w - 14}
        cy={Number(pts[pts.length - 1].split(",")[1])}
        r={3.5}
        fill={C.amberL}
      />
    </g>
  );
}

/** Shared backdrop: gradient, blueprint grid and the project title chip. */
function Frame({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  const tw = monoW(title, 16) + 40;
  return (
    <>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.bgTop} />
          <stop offset="1" stopColor={C.bgBottom} />
        </linearGradient>
        <pattern
          id={`${id}-grid`}
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M40 0H0V40"
            fill="none"
            stroke="#1688b5"
            strokeWidth="0.5"
            opacity="0.09"
          />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-bg)`} />
      <rect width={W} height={H} fill={`url(#${id}-grid)`} />
      {children}
      <g>
        <rect
          x={24}
          y={22}
          width={tw}
          height={34}
          rx={17}
          fill="#0d1a24"
          stroke={C.line}
        />
      <circle cx={44} cy={39} r={4} fill={C.amber} />
      <text
        x={56}
        y={44}
        fontFamily={MONO}
        fontSize={16}
        fill={C.white}
        letterSpacing="0.5"
        /* LTR anchoring keeps the label flowing rightward from the accent dot
           even on Arabic pages; the glyphs themselves stay bidi-correct. */
        direction="ltr"
      >
        {title}
      </text>
      </g>
      {/* corner ticks — technical-drawing flourish */}
      <g stroke={C.blue} strokeWidth={1.5} opacity={0.5}>
        <path d="M16 40V16h24" fill="none" />
        <path d={`M${W - 40} 16h24v24`} fill="none" />
        <path d={`M16 ${H - 40}v24h24`} fill="none" />
        <path d={`M${W - 24} ${H - 16}v-24h-24`} fill="none" />
      </g>
    </>
  );
}

/* ── Scene motifs ────────────────────────────────────────────────────────── */

function horizon(y: number) {
  return (
    <g key="horizon">
      <rect x={0} y={y} width={W} height={H - y} fill={C.ground} />
      <line x1={0} x2={W} y1={y} y2={y} stroke={C.line} strokeWidth={1.5} />
    </g>
  );
}

function sceneAir(rnd: () => number) {
  const skyline = [
    [620, 70, 60],
    [700, 60, 110],
    [770, 80, 80],
    [860, 70, 140],
  ];
  return (
    <g>
      {horizon(430)}
      {skyline.map(([x, w, h], i) => (
        <rect
          key={i}
          x={x}
          y={430 - h}
          width={w}
          height={h}
          fill="#0f1d28"
          stroke={C.lineSoft}
        />
      ))}
      {/* analyzer + cabinet */}
      <rect x={90} y={280} width={150} height={150} rx={7} fill={C.panel} stroke={C.blue} />
      <line x1={165} y1={280} x2={165} y2={430} stroke={C.line} />
      <rect x={105} y={296} width={56} height={34} rx={4} fill="#0b2231" stroke={C.blueL} />
      <polyline points="110,322 122,310 134,316 146,302 156,306" fill="none" stroke={C.blueB} strokeWidth={1.6} />
      {[360, 378, 396].map((y) => (
        <line key={y} x1={178} y1={y} x2={230} y2={y} stroke={C.line} strokeWidth={3} />
      ))}
      <circle cx={196} cy={312} r={5} fill={C.amber} />
      <circle cx={214} cy={312} r={5} fill={C.blue} />
      <rect x={254} y={336} width={92} height={94} rx={6} fill={C.panel2} stroke={C.blue} />
      <rect x={268} y={352} width={64} height={8} rx={4} fill="#1c3d54" />
      <rect x={268} y={368} width={44} height={8} rx={4} fill="#1c3d54" />
      <rect x={268} y={384} width={54} height={8} rx={4} fill={C.amber} opacity={0.55} />
      <line x1={240} y1={358} x2={254} y2={358} stroke={C.blueL} strokeWidth={2} />
      {/* telemetry mast */}
      <line x1={470} y1={430} x2={470} y2={120} stroke={C.blueL} strokeWidth={3} />
      <line x1={438} y1={162} x2={502} y2={162} stroke={C.blueL} strokeWidth={2} />
      <line x1={444} y1={212} x2={496} y2={212} stroke={C.blueL} strokeWidth={2} />
      {[
        [438, 162],
        [502, 162],
        [444, 212],
        [496, 212],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={7} fill="#0d1a24" stroke={C.amber} strokeWidth={2} />
      ))}
      <circle cx={470} cy={116} r={9} fill="#0d1a24" stroke={C.blueB} strokeWidth={2} />
      <line x1={470} y1={116} x2={496} y2={104} stroke={C.blueB} strokeWidth={2} />
      <circle cx={498} cy={103} r={5} fill={C.amber} />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M470 120 q${(i - 1) * 46} ${-40 - i * 14} ${(i - 1) * 96} ${-34 - i * 8}`}
          fill="none"
          stroke={C.blue}
          strokeWidth={1.5}
          strokeDasharray="5 6"
          opacity={0.75}
        />
      ))}
      {/* cloud */}
      <g>
        <rect x={600} y={64} width={132} height={54} rx={27} fill="#0e2230" stroke={C.blueB} />
        <circle cx={636} cy={64} r={22} fill="#0e2230" stroke={C.blueB} />
        <circle cx={678} cy={58} r={28} fill="#0e2230" stroke={C.blueB} />
        <rect x={600} y={80} width={132} height={38} fill="#0e2230" />
        <line x1={600} y1={118} x2={732} y2={118} stroke={C.blueB} />
        <text x={666} y={98} textAnchor="middle" fontFamily={MONO} fontSize={17} fill={C.blueB}>
          AQMS
        </text>
      </g>
      {chip("c1", "PM2.5", 350, 250, { color: C.amberL })}
      {chip("c2", "NO₂", 530, 300, { color: C.blueL })}
      {chip("c3", "O₃", 590, 218, { color: C.blueL })}
      {chip("c4", "STATION", 92, 446, { color: C.muted, stroke: C.lineSoft })}
      {trendPanel("t", 620, 446, 316, 74, rnd)}
    </g>
  );
}

function sceneJuice() {
  const tank = (cx: number, level: number) => {
    /* Liquid sits on the tank floor (y=412) and rises with `level`; the bright
       surface line keeps the fill from reading as a flat brown block. */
    const ly = 412 - level * 210;
    return (
      <g key={`tank${cx}`}>
        <rect x={cx - 52} y={176} width={104} height={236} fill="#101f2b" stroke={C.blue} />
        <rect x={cx - 52} y={ly} width={104} height={412 - ly} fill={C.amber} opacity={0.22} />
        <line
          x1={cx - 52}
          y1={ly}
          x2={cx + 52}
          y2={ly}
          stroke={C.amberL}
          strokeWidth={2.5}
        />
        <ellipse cx={cx} cy={176} rx={52} ry={15} fill="#152734" stroke={C.blue} />
        <line x1={cx - 52} y1={262} x2={cx + 52} y2={262} stroke={C.line} />
        <line x1={cx - 52} y1={330} x2={cx + 52} y2={330} stroke={C.line} />
        <path d={`M${cx - 34} 412l-8 24M${cx + 34} 412l8 24`} stroke={C.blueL} strokeWidth={3} />
        <circle cx={cx} cy={176} r={5} fill={C.amber} />
      </g>
    );
  };
  return (
    <g>
      {horizon(436)}
      {[150, 292, 434].map((cx, i) => tank(cx, [0.62, 0.4, 0.78][i]))}
      {/* manifold */}
      <path d="M150 161V132h284v29" fill="none" stroke={C.blueL} strokeWidth={3} />
      <path d="M292 132V112" fill="none" stroke={C.blueL} strokeWidth={3} />
      <path d="M292 112h385v188" fill="none" stroke={C.blueL} strokeWidth={3} />
      {[[196, 132], [366, 132], [420, 112], [530, 112]].map(([ax, ay]) => (
        <path key={`${ax}`} d={`M${ax} ${ay - 6} l12 6 -12 6z`} fill={C.amber} />
      ))}
      {/* filler / conveyor */}
      <rect x={592} y={300} width={170} height={110} rx={6} fill={C.panel} stroke={C.blue} />
      <rect x={610} y={318} width={134} height={44} rx={4} fill="#0b2231" stroke={C.blueL} />
      <polyline points="616,352 640,336 664,344 688,324 712,330 738,318" fill="none" stroke={C.amber} strokeWidth={2} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={604 + i * 40} y={376} width={16} height={26} rx={3} fill="none" stroke={C.amberL} />
      ))}
      <line x1={592} y1={424} x2={860} y2={424} stroke={C.blueL} strokeWidth={3} />
      {/* HMI */}
      <rect x={790} y={110} width={146} height={200} rx={8} fill={C.panel} stroke={C.blue} />
      <rect x={790} y={110} width={146} height={30} rx={8} fill="#152734" />
      <circle cx={806} cy={125} r={4} fill={C.amber} />
      <circle cx={820} cy={125} r={4} fill={C.blue} />
      <circle cx={834} cy={125} r={4} fill={C.line} />
      <polyline points="800,220 822,196 844,206 866,176 890,184 922,158" fill="none" stroke={C.blueB} strokeWidth={2} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx={806} cy={252 + i * 20} r={5} fill={i === 1 ? C.amber : C.blue} />
          <rect x={818} y={248 + i * 20} width={104 - i * 18} height={8} rx={4} fill="#1c3d54" />
        </g>
      ))}
      {/* PLC packages */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={596 + i * 84} y={456} width={70} height={64} rx={5} fill={C.panel2} stroke={C.line} />
          <circle cx={610 + i * 84} cy={472} r={4} fill={C.blueB} />
          <circle cx={624 + i * 84} cy={472} r={4} fill={C.amber} />
          <text x={631 + i * 84} y={504} textAnchor="middle" fontFamily={MONO} fontSize={13} fill={C.muted}>
            PLC
          </text>
        </g>
      ))}
      {chip("c1", "65 BRIX", 92, 458, { color: C.amberL })}
      {chip("c2", "7+ PACKAGES", 240, 458, { color: C.blueL })}
      {/* dashed monitoring links PLC → HMI */}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M${666 + i * 84} 456 C ${700 + i * 60} 400, ${800} 380, 862 310`}
          fill="none"
          stroke={C.blue}
          strokeWidth={1}
          strokeDasharray="4 6"
          opacity={0.55}
        />
      ))}
    </g>
  );
}

function sceneWells() {
  const wells = [140, 320, 500, 680];
  return (
    <g>
      {/* strata */}
      <rect x={0} y={300} width={W} height={60} fill="#0e1922" />
      <rect x={0} y={360} width={W} height={64} fill="#101d26" />
      <rect x={0} y={424} width={W} height={H - 424} fill="#0b1e2c" />
      <line x1={0} x2={W} y1={300} y2={300} stroke={C.line} strokeWidth={1.5} />
      <line x1={0} x2={W} y1={360} y2={360} stroke={C.lineSoft} strokeDasharray="6 6" />
      <line x1={0} x2={W} y1={424} y2={424} stroke={C.lineSoft} strokeDasharray="6 6" />
      <path
        d="M0 402 C 140 392, 260 412, 400 402 S 660 392, 960 404"
        fill="none"
        stroke={C.blueB}
        strokeWidth={2.5}
        opacity={0.9}
      />
      <text x={30} y={448} fontFamily={MONO} fontSize={13} fill={C.blueL} opacity={0.8}>
        AQUIFER
      </text>
      {wells.map((x, i) => (
        <g key={x}>
          <rect x={x - 7} y={300} width={14} height={118} fill="#152430" stroke={C.lineSoft} />
          <rect x={x - 7} y={214} width={14} height={90} fill="#1a2c3a" stroke={C.blueL} />
          <rect x={x - 24} y={196} width={48} height={24} rx={4} fill={C.panel2} stroke={C.blue} />
          <circle cx={x} cy={182} r={14} fill="none" stroke={C.amber} strokeWidth={3} />
          <line x1={x - 10} y1={182} x2={x + 10} y2={182} stroke={C.amber} strokeWidth={3} />
          <circle cx={x + 34} cy={224} r={11} fill="#0d1a24" stroke={C.blueL} />
          <line x1={x + 34} y1={224} x2={x + 39} y2={217} stroke={C.amberL} strokeWidth={2} />
          <rect x={x - 17} y={444} width={34} height={48} rx={4} fill={C.panel} stroke={C.blue} />
          <circle cx={x} cy={468} r={8} fill="none" stroke={C.blueB} strokeWidth={2} />
          <path
            d={`M${x} 208 C ${x + 90} 150, ${x + 200} 130, 812 168`}
            fill="none"
            stroke={C.blue}
            strokeWidth={1.2}
            strokeDasharray="5 6"
            opacity={0.7}
          />
        </g>
      ))}
      {/* gateway */}
      <rect x={790} y={150} width={130} height={96} rx={7} fill={C.panel} stroke={C.blue} />
      <line x1={855} y1={150} x2={855} y2={112} stroke={C.blueL} strokeWidth={3} />
      <circle cx={855} cy={106} r={7} fill={C.amber} />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M855 100 a${28 + i * 22} ${28 + i * 22} 0 0 1 ${28 + i * 22} ${28 + i * 22}`}
          fill="none"
          stroke={C.blue}
          strokeWidth={1.4}
          transform={`rotate(-90 855 100)`}
          opacity={0.8 - i * 0.2}
        />
      ))}
      <circle cx={822} cy={186} r={5} fill={C.blueB} />
      <circle cx={844} cy={186} r={5} fill={C.amber} />
      <circle cx={866} cy={186} r={5} fill={C.blue} />
      <rect x={812} y={206} width={86} height={8} rx={4} fill="#1c3d54" />
      <path d="M855 112 C 880 70, 880 60, 900 52" fill="none" stroke={C.blueB} strokeDasharray="5 6" strokeWidth={1.5} />
      {chip("g1", "GATEWAY", 790, 260, { color: C.muted, stroke: C.lineSoft })}
      {chip("g2", "7,000+ WELLS", 392, 316, { color: C.amberL })}
      {chip("g3", "IGNITION", 826, 24, { color: C.blueB })}
    </g>
  );
}

function sceneCity() {
  const buildings: [number, number, number][] = [
    [50, 92, 190],
    [156, 68, 268],
    [238, 112, 152],
    [364, 84, 306],
    [462, 122, 206],
    [598, 92, 258],
    [704, 66, 168],
    [784, 104, 236],
  ];
  const nodes: [number, number][] = [
    [96, 248],
    [190, 170],
    [406, 132],
    [520, 232],
    [644, 180],
    [836, 202],
  ];
  return (
    <g>
      {horizon(438)}
      {buildings.map(([x, w, h], i) => (
        <g key={i}>
          <rect x={x} y={438 - h} width={w} height={h} fill="#0f1d28" stroke={C.lineSoft} />
          {Array.from({ length: Math.floor(h / 34) }).map((_, r) =>
            Array.from({ length: Math.floor(w / 26) }).map((_, c) => (
              <rect
                key={`${r}-${c}`}
                x={x + 12 + c * 26}
                y={438 - h + 16 + r * 34}
                width={12}
                height={16}
                fill={
                  (r * 7 + c * 3 + i) % 5 === 0
                    ? C.amber
                    : "#17324a"
                }
                opacity={(r * 7 + c * 3 + i) % 5 === 0 ? 0.75 : 1}
              />
            )),
          )}
        </g>
      ))}
      {nodes.map(([cx, cy], i) => (
        <g key={`n${i}`}>
          <circle cx={cx} cy={cy} r={15} fill={C.amber} opacity={0.16} />
          <circle cx={cx} cy={cy} r={7} fill={C.amber} />
        </g>
      ))}
      {nodes.slice(0, -1).map(([ax, ay], i) => {
        const [bx, by] = nodes[i + 1];
        return (
          <line
            key={`l${i}`}
            x1={ax}
            y1={ay}
            x2={bx}
            y2={by}
            stroke={C.blue}
            strokeWidth={1.2}
            strokeDasharray="5 6"
            opacity={0.7}
          />
        );
      })}
      {/* hub — kept above the floating gallery controls (bottom ~491) */}
      <rect x={356} y={424} width={250} height={56} rx={10} fill={C.panel} stroke={C.amber} />
      <text x={481} y={458} textAnchor="middle" fontFamily={MONO} fontSize={16} fill={C.amberL}>
        IGNITION ALL-IN-ONE
      </text>
      {[
        [190, 170],
        [406, 132],
        [644, 180],
      ].map(([cx, cy], i) => (
        <path
          key={i}
          d={`M${cx} ${cy} C ${cx} ${cy + 110}, ${481} ${370}, 481 424`}
          fill="none"
          stroke={C.blueB}
          strokeWidth={1.2}
          strokeDasharray="5 7"
          opacity={0.6}
        />
      ))}
      {chip("c1", "10,000+ SENSORS", 706, 26, { color: C.amberL })}
      {chip("c2", "SECURE NETWORK", 60, 470, { color: C.blueL })}
    </g>
  );
}

function sceneRig() {
  const legL = [214, 430, 286, 118];
  const legR = [392, 430, 320, 118];
  const rungs = Array.from({ length: 7 }, (_, i) => {
    const f = (i + 1) / 8;
    const yl = legL[1] + (legL[3] - legL[1]) * f;
    const xr = legL[0] + (legL[2] - legL[0]) * f;
    const xl = legR[0] + (legR[2] - legR[0]) * f;
    return { yl, xr, xl };
  });
  return (
    <g>
      {horizon(430)}
      {/* derrick */}
      <path
        d={`M${legL[0]} ${legL[1]}L${legL[2]} ${legL[3]}M${legR[0]} ${legR[1]}L${legR[2]} ${legR[3]}`}
        stroke={C.blueL}
        strokeWidth={4}
        fill="none"
      />
      {rungs.map((r, i) => (
        <line key={i} x1={r.xr} y1={r.yl} x2={r.xl} y2={r.yl} stroke={C.blue} strokeWidth={2} />
      ))}
      {rungs.slice(0, 6).map((r, i) => {
        const n = rungs[i + 1];
        return (
          <line
            key={`d${i}`}
            x1={r.xr}
            y1={r.yl}
            x2={n.xl}
            y2={n.yl}
            stroke={C.blue}
            strokeWidth={1.4}
            opacity={0.7}
          />
        );
      })}
      <rect x={278} y={92} width={54} height={26} rx={4} fill={C.panel2} stroke={C.amber} />
      <line x1={305} y1={118} x2={305} y2={178} stroke={C.amberL} strokeWidth={2} />
      <rect x={293} y={178} width={24} height={40} rx={4} fill={C.panel} stroke={C.amber} />
      <rect x={200} y={420} width={210} height={14} rx={3} fill="#152734" stroke={C.line} />
      <rect x={430} y={366} width={116} height={64} rx={6} fill={C.panel} stroke={C.blue} />
      <circle cx={452} cy={388} r={6} fill={C.blueB} />
      <rect x={468} y={382} width={64} height={10} rx={5} fill="#1c3d54" />
      <rect x={468} y={400} width={44} height={10} rx={5} fill={C.amber} opacity={0.6} />
      {/* asset monitor */}
      <rect x={598} y={104} width={330} height={252} rx={10} fill={C.panel} stroke={C.blue} />
      <rect x={598} y={104} width={330} height={36} rx={10} fill="#152734" />
      <rect x={598} y={130} width={330} height={10} fill="#152734" />
      <text x={618} y={129} fontFamily={MONO} fontSize={15} fill={C.blueL}>
        ASSET MONITORING
      </text>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <circle cx={622} cy={172 + i * 44} r={6} fill={i === 2 ? C.amber : C.blueB} />
          <rect x={640} y={162 + i * 44} width={190 - i * 24} height={10} rx={5} fill="#1c3d54" />
          <rect x={640} y={180 + i * 44} width={130 + i * 18} height={8} rx={4} fill="#152734" />
          <rect x={852} y={164 + i * 44} width={54} height={22} rx={11} fill="#0f1f2b" stroke={C.line} />
          <text x={879} y={180 + i * 44} textAnchor="middle" fontFamily={MONO} fontSize={12} fill={C.muted}>
            {["OK", "OK", "CHK", "OK"][i]}
          </text>
        </g>
      ))}
      <path d="M420 400 C 500 400, 540 300, 598 260" fill="none" stroke={C.blue} strokeDasharray="5 6" strokeWidth={1.4} />
      <path d="M470 366 C 540 320, 560 220, 598 180" fill="none" stroke={C.blue} strokeDasharray="5 6" strokeWidth={1.4} />
      {chip("c1", "1,300 ASSETS", 60, 460, { color: C.amberL })}
      {chip("c2", "FAILOVER", 240, 460, { color: C.blueL })}
      {chip("c3", "HISTORIAN", 60, 496, { color: C.blueL })}
    </g>
  );
}

function sceneWater() {
  const zones: [number, string][] = [
    [146, "DMA"],
    [426, "DMZ"],
    [706, "DMA"],
  ];
  return (
    <g>
      {horizon(438)}
      {/* zone panels */}
      {zones.map(([x, label], i) => (
        <g key={x}>
          <rect x={x} y={116} width={168} height={120} rx={9} fill={C.panel} stroke={C.blue} />
          <text x={x + 18} y={146} fontFamily={MONO} fontSize={17} fill={C.blueL}>
            {label} {i + 1}
          </text>
          <rect x={x + 18} y={160} width={132} height={9} rx={4} fill="#1c3d54" />
          <rect x={x + 18} y={176} width={96 - i * 12} height={9} rx={4} fill="#1c3d54" />
          <circle cx={x + 32} cy={208} r={14} fill="none" stroke={C.blueL} />
          <line x1={x + 32} y1={208} x2={x + 40} y2={198} stroke={C.amberL} strokeWidth={2} />
          <rect x={x + 58} y={198} width={92} height={20} rx={10} fill="#0f1f2b" stroke={C.line} />
          <text x={x + 104} y={213} textAnchor="middle" fontFamily={MONO} fontSize={12} fill={C.muted}>
            {i === 1 ? "T&C" : "LIVE"}
          </text>
          <line x1={x + 84} y1={236} x2={x + 84} y2={318} stroke={C.blueL} strokeWidth={3} strokeDasharray="8 6" />
        </g>
      ))}
      {/* main pipe */}
      <line x1={70} y1={336} x2={890} y2={336} stroke="#17394f" strokeWidth={16} />
      <line x1={70} y1={336} x2={890} y2={336} stroke={C.blue} strokeWidth={2} strokeDasharray="14 10" />
      {[150, 370, 640].map((x) => (
        <path key={x} d={`M${x} 326 l14 10 -14 10z`} fill={C.amber} />
      ))}
      {[230, 510, 790].map((x) => (
        <g key={`v${x}`}>
          <path d={`M${x - 14} 322 l14 14 -14 14 z M${x + 14} 322 l-14 14 14 14 z`} fill={C.panel2} stroke={C.amber} strokeWidth={2} />
        </g>
      ))}
      {/* RTU — raised so its label clears the main pipe */}
      <rect x={846} y={234} width={80} height={78} rx={7} fill={C.panel2} stroke={C.blue} />
      <line x1={886} y1={234} x2={886} y2={206} stroke={C.blueL} strokeWidth={3} />
      <circle cx={886} cy={200} r={6} fill={C.amber} />
      <circle cx={866} cy={256} r={5} fill={C.blueB} />
      <rect x={878} y={250} width={38} height={9} rx={4} fill="#1c3d54" />
      <rect x={860} y={274} width={56} height={9} rx={4} fill="#1c3d54" />
      <text x={886} y={324} textAnchor="middle" fontFamily={MONO} fontSize={14} fill={C.muted}>
        SOFREL RTU
      </text>
      {["MADINAH", "YANBU", "TABUK"].map((r, i) =>
        chip(`r${i}`, r, 70 + i * 150, 464, { color: C.blueL, stroke: C.lineSoft }),
      )}
      {trendPanel("t", 596, 448, 330, 74, makeRnd("water"))}
    </g>
  );
}

function sceneQa() {
  const rows = [0, 1, 2];
  return (
    <g>
      {/* browser */}
      <rect x={64} y={104} width={430} height={300} rx={10} fill="#0e1a24" stroke={C.blue} />
      <path d="M64 144h430" stroke={C.line} />
      <rect x={64} y={104} width={430} height={40} rx={10} fill="#152734" />
      <rect x={64} y={132} width={430} height={12} fill="#152734" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={88 + i * 18} cy={124} r={5} fill={[C.blueB, C.amber, C.line][i]} />
      ))}
      <rect x={152} y={115} width={300} height={18} rx={9} fill="#0b1720" />
      <text x={166} y={129} fontFamily={MONO} fontSize={12} fill={C.muted}>
        modon.gov.sa / portal
      </text>
      {rows.map((i) => (
        <g key={i}>
          <rect x={92} y={170 + i * 70} width={374} height={54} rx={8} fill={C.panel2} stroke={C.lineSoft} />
          <circle cx={124} cy={197 + i * 70} r={14} fill="none" stroke={i === 2 ? C.amber : C.blueB} strokeWidth={2.5} />
          {i !== 2 && (
            <path d={`M117 ${197 + i * 70} l5 6 10 -12`} fill="none" stroke={C.blueB} strokeWidth={2.5} />
          )}
          {i === 2 && (
            <text x={124} y={203 + i * 70} textAnchor="middle" fontFamily={MONO} fontSize={16} fill={C.amber}>
              !
            </text>
          )}
          <rect x={152} y={182 + i * 70} width={180 - i * 30} height={10} rx={5} fill="#1c3d54" />
          <rect x={152} y={200 + i * 70} width={250 - i * 40} height={8} rx={4} fill="#152734" />
          <rect x={386} y={186 + i * 70} width={62} height={24} rx={12} fill="#0f1f2b" stroke={C.line} />
          <text x={417} y={202 + i * 70} textAnchor="middle" fontFamily={MONO} fontSize={12} fill={C.muted}>
            {["PASS", "PASS", "RETEST"][i]}
          </text>
        </g>
      ))}
      {/* phone */}
      <rect x={540} y={128} width={158} height={296} rx={22} fill="#0e1a24" stroke={C.blueL} />
      <rect x={556} y={156} width={126} height={240} rx={6} fill={C.panel2} />
      <rect x={596} y={138} width={46} height={8} rx={4} fill="#1c3d54" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={566} y={170 + i * 54} width={106} height={40} rx={6} fill="#142634" />
          <circle cx={584} cy={190 + i * 54} r={8} fill={i === 3 ? C.amber : C.blueB} />
          <rect x={598} y={184 + i * 54} width={62} height={8} rx={4} fill="#1c3d54" />
        </g>
      ))}
      <rect x={596} y={412} width={46} height={6} rx={3} fill="#1c3d54" />
      {/* checklist rail */}
      {[
        "AZURE DEVOPS",
        "REGRESSION",
        "CROSS-BROWSER",
        "ACCEPTANCE",
      ].map((t, i) => (
        <g key={t}>
          <rect x={734} y={128 + i * 64} width={196} height={48} rx={9} fill={C.panel} stroke={C.line} />
          <circle cx={758} cy={152 + i * 64} r={7} fill={i % 2 ? C.amber : C.blueB} />
          <text x={776} y={157 + i * 64} fontFamily={MONO} fontSize={14} fill={C.text}>
            {t}
          </text>
        </g>
      ))}
      {chip("c1", "AUTH", 64, 452, { color: C.blueL })}
      {chip("c2", "COMPLAINTS", 158, 452, { color: C.blueL })}
      {chip("c3", "DASHBOARDS", 320, 452, { color: C.blueL })}
      {chip("c4", "WEB + MOBILE", 700, 452, { color: C.amberL })}
    </g>
  );
}

function Scene({ p }: { p: Project }) {
  /* Keep the generator local to this render. Passing a mutable generator
     through component props lets React dev/StrictMode reuse and advance the
     same closure across render probes, which can produce SSR hydration
     mismatches even though the seed itself is deterministic. */
  const rnd = makeRnd(p.slug + "scene");
  switch (p.slug) {
    case "ncec-air-quality":
      return sceneAir(rnd);
    case "dohler-cloudy-line":
      return sceneJuice();
    case "ground-water":
      return sceneWells();
    case "modon-poc":
      return sceneCity();
    case "drilling-equipment":
      return sceneRig();
    case "water-network":
      return sceneWater();
    default:
      return sceneQa();
  }
}

/* ── Architecture diagram (four verified steps) ──────────────────────────── */

function FlowView({ p, locale }: { p: Project; locale: "en" | "ar" }) {
  const xs = [26, 265, 504, 743];
  const y = 196;
  const nw = 190;
  const nh = 118;
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill="#0b1720" />
      <g opacity={0.5}>
        {xs.map((x, i) => {
          if (i === 3) return null;
          const x1 = x + nw + 6;
          const x2 = xs[i + 1] - 18;
          return (
            <g key={`a${i}`}>
              <line
                x1={x1}
                y1={y + nh / 2}
                x2={x2 + 4}
                y2={y + nh / 2}
                stroke={i % 2 ? C.amber : C.blue}
                strokeWidth={2}
                strokeDasharray="6 6"
              />
              <path
                d={`M${x2 + 16} ${y + nh / 2} l-12 -6 v12 z`}
                fill={i % 2 ? C.amber : C.blue}
              />
            </g>
          );
        })}
      </g>
      {p.architecture.nodes.map((node, i) => {
        const x = xs[i];
        const accent = i === 0 || i === 3;
        const lines = wrap(node[locale], 17, 3);
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={nw}
              height={nh}
              rx={10}
              fill={C.panel}
              stroke={accent ? C.amber : C.blue}
              strokeWidth={1.5}
            />
            <circle cx={x + 24} cy={y + 24} r={13} fill={accent ? C.amber : C.blue} />
            <text
              x={x + 24}
              y={y + 28}
              textAnchor="middle"
              fontFamily={MONO}
              fontSize={13}
              fill="#0b1720"
              fontWeight={700}
            >
              {String(i + 1).padStart(2, "0")}
            </text>
            {lines.map((ln, j) => (
              <text
                key={j}
                x={x + nw / 2}
                y={y + 64 + j * 21 - ((lines.length - 1) * 21) / 2}
                textAnchor="middle"
                fontFamily={SANS}
                fontSize={15.5}
                fill={C.text}
              >
                {ln}
              </text>
            ))}
          </g>
        );
      })}
      {/* baseline rail */}
      <line x1={26} y1={378} x2={933} y2={378} stroke={C.line} />
      <circle cx={26} cy={378} r={4} fill={C.amber} />
      <circle cx={933} cy={378} r={4} fill={C.amber} />
      <text x={480} y={416} textAnchor="middle" fontFamily={MONO} fontSize={15} fill={C.muted}>
        {p.slug === "modon-testing" ? "TEST DATA PATH" : "INDUSTRIAL DATA PATH"}
      </text>
      <g transform="translate(0,452)">
        <rect x={330} y={0} width={300} height={44} rx={22} fill="#0f1f2b" stroke={C.line} />
        <text x={480} y={28} textAnchor="middle" fontFamily={MONO} fontSize={15} fill={C.blueL}>
          {p.tags.join("  ·  ")}
        </text>
      </g>
    </g>
  );
}

/* ── Operations view (real tags + verified scale tiles) ──────────────────── */

function OpsView({
  p,
  title,
  locale,
}: {
  p: Project;
  title: string;
  locale: "en" | "ar";
}) {
  const rnd = makeRnd(p.slug + "-ops");
  const values = p.scale.map((s) => s.value);
  const step = 300 / Math.max(values.length, 1);
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const px = 280 + (i * 410) / 9;
    const py = 360 - (0.15 + rnd() * 0.7) * 210;
    pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }
  return (
    <g>
      {/* left rail — the project's real tags */}
      <rect x={28} y={96} width={190} height={316} rx={10} fill={C.panel} stroke={C.line} />
      <text x={44} y={124} fontFamily={MONO} fontSize={14} fill={C.muted}>
        STACK
      </text>
      {p.tags.map((t, i) => (
        <g key={t}>
          <rect x={44} y={140 + i * 56} width={158} height={42} rx={8} fill={C.panel2} stroke={C.line} />
          <circle cx={64} cy={161 + i * 56} r={6} fill={i % 2 ? C.amber : C.blueB} />
          <text x={80} y={167 + i * 56} fontFamily={SANS} fontSize={15} fill={C.text}>
            {t.length > 16 ? t.slice(0, 15) + "…" : t}
          </text>
        </g>
      ))}
      {/* main screen */}
      <rect x={244} y={96} width={464} height={316} rx={10} fill="#0c1923" stroke={C.blue} />
      <rect x={244} y={96} width={464} height={38} rx={10} fill="#152734" />
      <rect x={244} y={124} width={464} height={10} fill="#152734" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={266 + i * 18} cy={115} r={5} fill={[C.blueB, C.amber, C.line][i]} />
      ))}
      <text x={690} y={121} textAnchor="end" fontFamily={MONO} fontSize={14} fill={C.blueL}>
        LIVE
      </text>
      {[0.25, 0.45, 0.65, 0.85].map((f) => (
        <line
          key={f}
          x1={266}
          x2={686}
          y1={160 + f * 210}
          y2={160 + f * 210}
          stroke={C.lineSoft}
          strokeDasharray="3 6"
        />
      ))}
      <polyline points={pts.join(" ")} fill="none" stroke={C.amber} strokeWidth={2.5} strokeLinejoin="round" />
      <polyline
        points={pts.filter((_, i) => i % 2 === 0).join(" ")}
        fill="none"
        stroke={C.blueB}
        strokeWidth={1.6}
        strokeDasharray="6 6"
      />
      <circle cx={690} cy={160 + 0.85 * 210 - 40} r={5} fill={C.amberL} />
      <text x={476} y={470} textAnchor="middle" fontFamily={MONO} fontSize={15} fill={C.muted}>
        {title}
      </text>
      {/* right rail — verified scale values */}
      <rect x={732} y={96} width={200} height={316} rx={10} fill={C.panel} stroke={C.line} />
      <text x={748} y={124} fontFamily={MONO} fontSize={14} fill={C.muted}>
        SCALE
      </text>
      {values.map((v, i) => {
        const size = v.length <= 7 ? 30 : v.length <= 12 ? 22 : 16;
        return (
          <g key={v}>
            <rect x={748} y={140 + i * step} width={168} height={step - 14} rx={8} fill={C.panel2} stroke={C.line} />
            <text
              x={832}
              y={140 + i * step + (step - 14) / 2 + size * 0.36}
              textAnchor="middle"
              fontFamily={MONO}
              fontSize={size}
              fill={C.amberL}
            >
              {v}
            </text>
          </g>
        );
      })}
      <rect x={244} y={440} width={464} height={44} rx={22} fill="#0f1f2b" stroke={C.line} />
      <text
        x={476}
        y={468}
        textAnchor="middle"
        fontFamily={SANS}
        fontSize={16}
        fill={C.blueL}
      >
        {p.sector[locale]}
      </text>
    </g>
  );
}

/* ── Public renderer ─────────────────────────────────────────────────────── */

export function ProjectArt({
  project,
  kind,
  label,
  title,
  locale = "en",
  slice,
}: {
  project: Project;
  kind: GalleryKind;
  /** Accessible description of what this artwork shows. */
  label: string;
  /** Short mono label drawn in the artwork's title chip. */
  title: string;
  /** Active locale: diagram nodes and the ops sector line follow it. */
  locale?: "en" | "ar";
  /** Fill the box (thumbnails) instead of letterboxing (hero). */
  slice?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="project-art"
      role="img"
      aria-label={label}
      preserveAspectRatio={slice ? "xMidYMid slice" : "xMidYMid meet"}
      focusable="false"
    >
      <Frame id={uid} title={title}>
        {kind === "flow" ? (
          <FlowView p={project} locale={locale} />
        ) : kind === "ops" ? (
          <OpsView p={project} title={title} locale={locale} />
        ) : (
          <Scene p={project} />
        )}
      </Frame>
    </svg>
  );
}
