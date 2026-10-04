import { useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { simAt } from "./beats";
import { BELT, LENGTH, RECORD, STEP, type Rider } from "./escalator";
import { RUNS } from "./runs";

/**
 * A Tube escalator shaft seen from the top landing, looking down. Two
 * escalators side by side under one tunnel, a steel divider between them
 * with its row of uplighter lamps, poster frames on the curved walls, and the
 * crowd at the bottom that never runs out.
 *
 * Walkers wear the accent, so the one lane of walkers, with its gaps, stands
 * out from the packed lanes of standers around it.
 *
 * Everything is placed in metres and projected, so a person 1.7 m tall near
 * the camera is about two hundred pixels and the same person at the bottom of
 * the shaft is a few. People are drawn front on, riding up towards the
 * camera. Standers ride still on their step; walkers climb, legs moving, and
 * the gaps they leave are what the reel is about.
 *
 * The rider's left is the screen's right, because they face the camera, so
 * on the left escalator the walking lane is the screen-right lane.
 */

export const HEADLINE_TOP = 256;

/** Camera and projection. */
const Z0 = 5;
const F = 620;
const VP_Y = 556;
const NEAR_Y = 1262;
const MID = 540;
const VERT = 0.92;

const project = (X: number, s: number, h = 0) => {
  const z = LENGTH - s + Z0;
  const k = F / z;
  return {
    x: MID + X * k,
    y: VP_Y + ((NEAR_Y - VP_Y) * Z0) / z - h * k * VERT,
    k,
  };
};

const poly = (pts: { x: number; y: number }[]) =>
  pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

/** Lateral layout, metres from the tunnel's centre line. */
const ESC = {
  left: { from: -2.0, to: -0.8 },
  right: { from: 0.8, to: 2.0 },
};
const LANE_X = {
  walkLeft: { walk: -1.1, stand: -1.7 },
  standBoth: { a: 1.1, b: 1.7 },
};
const WALL = 3.3;

const COATS = [
  "#3A3F4A",
  "#5A5F69",
  "#7D8089",
  "#2B2F37",
  "#9A9CA2",
  "#4B4339",
  "#61574C",
  "#22262D",
];
const SKIN = ["#E3C7A8", "#C9A88A", "#A57E62", "#8D6A52", "#6B4E3A", "#D8B595"];
const HAIR = ["#1E1A17", "#3B2A20", "#5A4632", "#2A2724", "#8C7B6A", "#141210"];

const pick = <T,>(xs: readonly T[], n: number) => xs[Math.abs(n) % xs.length];

/** A person front on, feet at (x, y), scaled by k pixels a metre. */
/**
 * A person front on, feet at (x, y), scaled by k pixels a metre. `stride` is
 * the phase of their climb, null for someone standing still on their step.
 * The first cut lifted knees, which looked wrong front on; the second only
 * bobbed, which did not look like walking at all. This one steps.
 */
const Person: React.FC<{
  x: number;
  y: number;
  k: number;
  seed: number;
  stride: number | null;
}> = ({ x, y, k, seed, stride }) => {
  const s = k * VERT;
  // Walkers wear the accent: the orange marks walking and nothing else.
  const coat = stride !== null ? ACCENT : pick(COATS, seed * 7 + 3);
  const skin = pick(SKIN, seed * 5 + 1);
  const hair = pick(HAIR, seed * 3 + 2);
  const walking = stride !== null;
  const phase = stride ?? 0;
  // Front on, a step shows as which foot is forward: the forward foot is on
  // a nearer step, so it sits lower in the frame and a touch larger; the back
  // foot sits higher, heel up. Weight sways to the planted side and the
  // opposite arm comes forward. One cycle for every two steps climbed.
  const fwd = walking ? Math.sin(phase) : 0;
  const sway = walking ? 0.035 * fwd : 0;
  const bob = walking ? 0.025 * Math.abs(Math.cos(phase)) : 0;
  const body =
    "M -0.22 -0.8 L -0.24 -1.38 Q -0.24 -1.47 -0.15 -1.48 L 0.15 -1.48 Q 0.24 -1.47 0.24 -1.38 L 0.22 -0.8 Z";
  const leg = (hipX: number, f: number) => {
    // The back foot rises with its heel up, the forward foot drops a step.
    const footY = 0.17 * f;
    const footX = hipX + 0.015 * f * Math.sign(hipX);
    const w = 0.055 * (1 + 0.12 * f);
    return (
      <g>
        <path
          d={`M ${hipX - 0.06} -0.86 L ${hipX + 0.06} -0.86 L ${footX + w} ${footY - 0.05 + (f < 0 ? 0.08 * f : 0)} L ${footX - w} ${footY - 0.05 + (f < 0 ? 0.08 * f : 0)} Z`}
          fill="#1B1E24"
        />
        <ellipse
          cx={footX}
          cy={footY - 0.025}
          rx={0.075 * (1 + 0.15 * f)}
          ry={0.035}
          fill="#0B0C0F"
        />
      </g>
    );
  };
  const arm = (x0: number, f: number) => (
    <rect
      x={x0 - 0.04 * (1 + 0.15 * f)}
      y={-1.42 + 0.06 * f}
      width={0.08 * (1 + 0.15 * f)}
      height={0.56 + 0.03 * f}
      rx={0.04}
      fill={coat}
    />
  );
  // Draw the back leg first, so the forward one is in front of it.
  const legs =
    fwd >= 0
      ? [leg(0.075, -fwd), leg(-0.075, fwd)]
      : [leg(-0.075, fwd), leg(0.075, -fwd)];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={0.26} ry={0.06} fill="#000" opacity={0.35} />
      {legs}
      <g transform={`translate(${sway} ${-bob})`}>
        <path d={body} fill={coat} />
        {arm(-0.26, -fwd)}
        {arm(0.26, fwd)}
        <path d={body} fill="url(#coat-shade)" />
        <rect x={-0.05} y={-1.56} width={0.1} height={0.1} fill={skin} />
        <ellipse cx={0} cy={-1.64} rx={0.1} ry={0.12} fill={skin} />
        <path
          d="M -0.105 -1.64 Q -0.11 -1.78 0 -1.78 Q 0.11 -1.78 0.105 -1.64 Q 0.06 -1.71 0 -1.71 Q -0.06 -1.71 -0.105 -1.64 Z"
          fill={hair}
        />
      </g>
    </g>
  );
};

/** Where a rider is at simulated second t, metres along the incline. */
const sOf = (r: Rider, t: number) => {
  const f = (t - r.on) / RECORD;
  const i = Math.floor(f);
  if (i < 0) return -1;
  if (i >= r.s.length - 1) return r.s[r.s.length - 1];
  return r.s[i] + (r.s[i + 1] - r.s[i]) * (f - i);
};

type Drawable = { z: number; el: React.ReactNode };

const EscalatorBand: React.FC<{ from: number; to: number; t: number }> = ({
  from,
  to,
  t,
}) => {
  const surface = [
    project(from, 0),
    project(to, 0),
    project(to, LENGTH),
    project(from, LENGTH),
  ];
  // Each step: a grooved tread, then a bright nosing at its front edge, all
  // moving up towards the camera at belt speed.
  const phase = (BELT * t) % STEP;
  const steps: React.ReactNode[] = [];
  for (let s = phase - STEP; s < LENGTH; s += STEP) {
    const s0 = Math.max(0, s);
    const s1 = Math.min(LENGTH, s + STEP);
    if (s1 <= s0) continue;
    const near = s1 / LENGTH;
    const tread = [
      project(from + 0.04, s0),
      project(to - 0.04, s0),
      project(to - 0.04, s1 - 0.03),
      project(from + 0.04, s1 - 0.03),
    ];
    const a = project(from + 0.04, s1 - 0.03);
    const b = project(to - 0.04, s1 - 0.03);
    const k = Math.round(((s - phase) / STEP) % 2);
    steps.push(
      <g key={(s - phase).toFixed(2)}>
        <polygon points={poly(tread)} fill={k ? "#22262E" : "#1D2128"} />
        <line
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke="#C8C7C2"
          strokeOpacity={0.15 + 0.45 * near}
          strokeWidth={Math.max(0.7, a.k * 0.03)}
        />
      </g>,
    );
  }
  return (
    <g>
      <polygon points={poly(surface)} fill="#1A1E25" />
      {steps}
    </g>
  );
};

const Rail: React.FC<{ x: number }> = ({ x }) => (
  <polygon
    points={poly([
      project(x - 0.07, 0, 0.9),
      project(x + 0.07, 0, 0.9),
      project(x + 0.07, LENGTH, 0.9),
      project(x - 0.07, LENGTH, 0.9),
    ])}
    fill="#0B0C0F"
  />
);

export const Shaft: React.FC = () => {
  const frame = useCurrentFrame();
  const t = simAt(frame);

  const drawables: Drawable[] = [];

  // Riders, all four lanes.
  const lanes: { x: number; riders: readonly Rider[]; walking: boolean }[] = [
    { x: LANE_X.walkLeft.walk, riders: RUNS.walkLeft.lanes[0], walking: true },
    {
      x: LANE_X.walkLeft.stand,
      riders: RUNS.walkLeft.lanes[1],
      walking: false,
    },
    { x: LANE_X.standBoth.a, riders: RUNS.standBoth.lanes[0], walking: false },
    { x: LANE_X.standBoth.b, riders: RUNS.standBoth.lanes[1], walking: false },
  ];
  lanes.forEach((lane, li) => {
    for (const r of lane.riders) {
      if (r.on > t || r.off <= t) continue;
      const s = sOf(r, t);
      if (s < 0 || s > LENGTH + 0.3) continue;
      const p = project(lane.x, s);
      drawables.push({
        z: LENGTH - s,
        el: (
          <Person
            key={`${li}-${r.id}`}
            x={p.x}
            y={p.y}
            k={p.k}
            seed={li * 997 + r.id}
            stride={
              lane.walking
                ? ((s - BELT * (t - r.on)) / (2 * STEP)) * 2 * Math.PI
                : null
            }
          />
        ),
      });
    }
  });

  // The crowd waiting at the bottom: a few rows beyond the first step.
  for (let row = 0; row < 5; row++) {
    for (const [x0, x1] of [
      [ESC.left.from, ESC.left.to],
      [ESC.right.from, ESC.right.to],
    ]) {
      for (let c = 0; c < 4; c++) {
        const x =
          x0 + ((c + 0.5) * (x1 - x0)) / 4 + Math.sin(row * 3.1 + c) * 0.08;
        const s = -0.6 - row * 0.7;
        const p = project(x, s);
        drawables.push({
          z: LENGTH - s,
          el: (
            <Person
              key={`q-${row}-${c}-${x0}`}
              x={p.x}
              y={p.y}
              k={p.k}
              seed={row * 11 + c * 3 + (x0 < 0 ? 0 : 5)}
              stride={null}
            />
          ),
        });
      }
    }
  }

  // Uplighters down the divider.
  for (let s = 1.5; s < LENGTH; s += 3) {
    const base = project(0, s, 0.95);
    const top = project(0, s, 2.15);
    const w = Math.max(1, 0.09 * base.k);
    drawables.push({
      z: LENGTH - s,
      el: (
        <g key={`lamp-${s}`}>
          <rect
            x={base.x - w / 2}
            y={top.y}
            width={w}
            height={base.y - top.y}
            fill="#8E9096"
          />
          <ellipse
            cx={top.x}
            cy={top.y}
            rx={w * 2.6}
            ry={w * 1.6}
            fill="#FFF3DC"
            opacity={0.18}
            filter="url(#lamp-glow)"
          />
          <ellipse
            cx={top.x}
            cy={top.y}
            rx={w * 1.1}
            ry={w * 0.7}
            fill="#FFF3DC"
          />
        </g>
      ),
    });
  }

  drawables.sort((a, b) => b.z - a.z);

  // Poster frames on both walls.
  const posters: React.ReactNode[] = [];
  for (let s = 2; s < LENGTH - 1; s += 5) {
    for (const side of [-1, 1]) {
      const x = side * WALL;
      const pts = [
        project(x, s, 1.0),
        project(x, s + 2.2, 1.0),
        project(x, s + 2.2, 2.3),
        project(x, s, 2.3),
      ];
      posters.push(
        <polygon
          key={`${s}${side}`}
          points={poly(pts)}
          fill={pick(
            ["#2C313B", "#343A45", "#262B33", "#3A4049"],
            Math.round(s) + side,
          )}
          stroke="#4A505A"
          strokeWidth={1}
        />,
      );
    }
  }

  const wall = (side: number) =>
    poly([
      project(side * WALL, -6, 0),
      project(side * WALL, LENGTH + 2, 0),
      project(side * WALL * 0.9, LENGTH + 2, 3.4),
      project(side * WALL * 0.9, -6, 3.4),
    ]);

  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="coat-shade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity={0.35} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0.08} />
          <stop offset="1" stopColor="#000" stopOpacity={0.35} />
        </linearGradient>
        <linearGradient id="steel" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#4A505A" />
          <stop offset="0.5" stopColor="#8E9096" />
          <stop offset="1" stopColor="#4A505A" />
        </linearGradient>
        <radialGradient id="far-light" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF3DC" stopOpacity={0.35} />
          <stop offset="1" stopColor="#FFF3DC" stopOpacity={0} />
        </radialGradient>
        <filter id="lamp-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id="shaft">
          <rect x={0} y={520} width={1080} height={NEAR_Y + 30 - 520} />
        </clipPath>
      </defs>
      <g clipPath="url(#shaft)">
        <rect
          x={0}
          y={520}
          width={1080}
          height={NEAR_Y + 30 - 520}
          fill="#0E1015"
        />
        <ellipse
          cx={MID}
          cy={VP_Y + 70}
          rx={160}
          ry={90}
          fill="url(#far-light)"
        />
        <polygon points={wall(-1)} fill="#1C2028" />
        <polygon points={wall(1)} fill="#1C2028" />
        {posters}
        <EscalatorBand from={ESC.left.from} to={ESC.left.to} t={t} />
        <EscalatorBand from={ESC.right.from} to={ESC.right.to} t={t} />
        {/* The steel divider between the two escalators, and the outer skirts. */}
        <polygon
          points={poly([
            project(-0.8, 0, 0.95),
            project(0.8, 0, 0.95),
            project(0.8, LENGTH, 0.95),
            project(-0.8, LENGTH, 0.95),
          ])}
          fill="url(#steel)"
          opacity={0.75}
        />
        {[-2.0, 2.0].map((x) => (
          <polygon
            key={x}
            points={poly([
              project(x, 0, 0.95),
              project(x + Math.sign(x) * 0.5, 0, 0.95),
              project(x + Math.sign(x) * 0.5, LENGTH, 0.95),
              project(x, LENGTH, 0.95),
            ])}
            fill="#3A3F48"
          />
        ))}
        {[-2.0, -0.8, 0.8, 2.0].map((x) => (
          <Rail key={x} x={x} />
        ))}
        {drawables.map((d) => d.el)}
        {/* The top landing's comb plate, nearest the camera. */}
        <polygon
          points={poly([
            project(-2.0, LENGTH - 0.05),
            project(2.0, LENGTH - 0.05),
            { x: MID + 2.0 * (F / Z0) * 1.05, y: NEAR_Y + 30 },
            { x: MID - 2.0 * (F / Z0) * 1.05, y: NEAR_Y + 30 },
          ])}
          fill="#5A5F69"
          opacity={0.9}
        />
        {/* What each lane is for, painted on the landing where it ends. */}
        {(
          [
            [LANE_X.walkLeft.stand, "STAND"],
            [LANE_X.walkLeft.walk, "WALK"],
            [LANE_X.standBoth.a, "STAND"],
            [LANE_X.standBoth.b, "STAND"],
          ] as const
        ).map(([x, word]) => {
          const p = project(x, LENGTH);
          return (
            <text
              key={`${x}`}
              x={p.x}
              y={NEAR_Y + 22}
              textAnchor="middle"
              fontFamily={theme.monoFamily}
              fontSize={19}
              fontWeight={700}
              letterSpacing="0.12em"
              fill={word === "WALK" ? ACCENT : theme.colors.chalk}
            >
              {word}
            </text>
          );
        })}
      </g>
    </svg>
  );
};
