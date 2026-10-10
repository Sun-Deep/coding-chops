import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { Provenance } from "../../shared/vertical/type";
import { clamp } from "../../shared/video/timing";
import { DURATION, VERDICT_FROM, simAt } from "./beats";
import { CONDITIONS, HERO } from "./measurements";
import {
  COUNTER_Z,
  KIOSK_X,
  KIOSK_Z,
  PASS_X,
  TILL_X,
  poseAt,
  type Pose,
} from "./motion";
import { RUNS, YOU } from "./runs";
import { KIOSKS, type Customer, type Rule } from "./simulation";

/**
 * Two burger counters in the same lunch rush, one above the other, each a
 * lit cross-section of the room: the floor and the queue in front, the
 * counter, the pass where trays come up, and the kitchen behind. The same
 * customers walk in at both. Above, they queue for one cashier; below, they
 * order at six kiosks and then stand at the pickup counter, because the
 * kitchen behind both is the same.
 *
 * Orange is one thing: you. Your jacket, your order number on the board,
 * and your clock.
 */

export const HEADLINE_TOP = 232;
const PROVENANCE_TOP = 424;
const LEFT = 150;
const W = 780;
const H = 380;
const PANELS: { rule: Rule; label: string; top: number }[] = [
  { rule: "cashier", label: "One cashier", top: 494 },
  { rule: "kiosks", label: "Six kiosks", top: 920 },
];
const LABEL_GAP = 34;

/* ---------------------------------------------------------------- camera */

const CAM_Z = -6.6;
/** Eye level, a little above a standing head. */
const CAM_H = 2.3;
const HORIZON = 95;
/** The room is drawn 0.82 times as wide as it is modelled, so people read bigger. */
const XS = 0.7;
const BACK_Z = 7;

type Cam = { x: number; f: number };
const camAt = (frame: number): Cam => {
  const u = Math.min(1, Math.max(0, frame / DURATION));
  const e = u * u * (3 - 2 * u);
  // A slow push in, and a little handheld drift.
  const drift = 0.04 * Math.sin(frame * 0.021) + 0.02 * Math.sin(frame * 0.053);
  return { x: (6.85 + 0.3 * e) * XS + drift, f: 760 + 46 * e };
};
const d = (Z: number) => Z - CAM_Z;
const sc = (cam: Cam, Z: number) => cam.f / d(Z);
const sx = (cam: Cam, X: number, Z: number) =>
  W / 2 + (X * XS - cam.x) * sc(cam, Z);
const sy = (cam: Cam, h: number, Z: number) =>
  HORIZON + (CAM_H - h) * sc(cam, Z);
const P = (cam: Cam, X: number, Z: number, h: number) =>
  `${sx(cam, X, Z).toFixed(1)},${sy(cam, h, Z).toFixed(1)}`;
const quad = (cam: Cam, pts: [number, number, number][]) =>
  pts.map(([X, Z, h]) => P(cam, X, Z, h)).join(" ");

/* -------------------------------------------------------------- easing */

/**
 * The average of a value over the last few frames, so anything that the
 * model changes in one step (a number moving up the board, a tray sliding
 * along, a screen lighting up) glides instead of jumping. Frames where the
 * value is absent are left out; the second number is how many were present.
 */
const settle = (
  frame: number,
  value: (f: number) => number | null,
  frames = 6,
): [number, number] => {
  let sum = 0;
  let n = 0;
  for (let j = 0; j < frames; j++) {
    const v = value(frame - j);
    if (v === null) continue;
    sum += v;
    n++;
  }
  return [n ? sum / n : 0, n / frames];
};

/** One column of numbers, so a number moving up never crosses another. */
const ROWS = 3;

const making = (people: readonly Customer[], t: number) =>
  people
    .filter((c) => c.orderEnd <= t && c.ready > t)
    .sort((a, b) => a.number - b.number);
const waitingTrays = (people: readonly Customer[], t: number) =>
  people
    .filter((c) => c.ready <= t && c.served > t)
    .sort((a, b) => a.number - b.number);
/** A customer's place in a list at a frame, or null if not in it. */
const placeIn =
  (
    people: readonly Customer[],
    list: (p: readonly Customer[], t: number) => Customer[],
    id: number,
  ) =>
  (f: number) => {
    const i = list(people, simAt(f)).findIndex((c) => c.id === id);
    return i < 0 ? null : i;
  };

/* -------------------------------------------------------------- palette */

const WALL = "#17120F";
const WALL_LIT = "#2C211A";
const WOOD = "#5A3F2C";
const WOOD_DARK = "#2E2018";
const STEEL = "#8B9096";
const STEEL_DARK = "#3C4046";
const TILE = "#C9C2B4";
const LAMP = "#FFE3B8";
const SCREEN = "#DDE8F2";
const EMBER = "#9E3426";

const SKIN = ["#E6C8A6", "#C8A07E", "#A47A5C", "#7E5A42", "#5E4231", "#D9B08D"];
const HAIR = ["#1B1714", "#3A2A1F", "#5B4531", "#2B2723", "#8B7864", "#121010"];
/** Everyday clothes, kept well off orange, which is only ever you. */
const TOPS = [
  "#2F3A52",
  "#4B5337",
  "#5B2B34",
  "#7E6C55",
  "#3F4D62",
  "#5C6068",
  "#2A2E36",
  "#7A7D86",
  "#46393F",
  "#33504C",
];
const TROUSERS = [
  "#1E2230",
  "#2A2C31",
  "#3E4C63",
  "#5C5446",
  "#17181B",
  "#43464D",
];
const pick = <T,>(xs: readonly T[], n: number) => xs[Math.abs(n) % xs.length];

/* --------------------------------------------------------------- people */

type Look = {
  skin: string;
  hair: string;
  top: string;
  trousers: string;
  hairStyle: 0 | 1 | 2 | 3;
  height: number;
  build: number;
  bag: boolean;
  phone: boolean;
  phase: number;
};

const lookOf = (id: number, you: boolean): Look => ({
  skin: pick(SKIN, id * 5 + 1),
  hair: pick(HAIR, id * 3 + 2),
  top: you ? ACCENT : pick(TOPS, id * 7 + 3),
  trousers: pick(TROUSERS, id * 3 + 1),
  hairStyle: (Math.abs(id * 11 + 3) % 4) as Look["hairStyle"],
  height: 0.93 + ((id * 37) % 13) / 100,
  build: 0.92 + ((id * 53) % 18) / 100,
  bag: id % 4 === 1,
  phone: id % 3 !== 0,
  phase: (id * 1.7) % (Math.PI * 2),
});

/**
 * A customer seen from behind, feet on the floor at (X, Z). Drawn in metres
 * and scaled by perspective. A warm rim on the left from the pendants, a cool
 * one on the right near the screens.
 */
const Customer3D: React.FC<{
  cam: Cam;
  pose: Pose;
  look: Look;
  you: boolean;
  frame: number;
  coolRim: boolean;
  kiosk: boolean;
}> = ({ cam, pose, look, you, frame, coolRim, kiosk }) => {
  const s = sc(cam, pose.Z) * look.height;
  // Stride and bob grow with speed; idle sway fades in as they stop.
  const stride = pose.walked * 5.2;
  const go = Math.min(1, pose.speed);
  const fwd = Math.sin(stride) * go;
  const bob = 0.025 * Math.abs(Math.cos(stride)) * go;
  const sway = 0.018 * Math.sin(frame * 0.07 + look.phase) * (1 - go);
  const breathe = 1 + 0.008 * Math.sin(frame * 0.11 + look.phase);
  // Poses eased in and out by the motion pass.
  const phoneW = look.phone && !you ? pose.waiting : 0;
  const tapW = kiosk ? pose.ordering : 0;
  const tap = Math.max(0, Math.sin(frame * 0.5 + look.phase)) * tapW;
  const bend = Math.max(phoneW, pose.carrying);
  const armLength = 0.56 - 0.2 * bend;
  const w = look.build;
  const rim = coolRim ? SCREEN : LAMP;
  const torso = `M ${-0.21 * w} -0.84 L ${-0.25 * w} -1.36 Q ${-0.25 * w} -1.47 ${-0.15 * w} -1.48 L ${0.15 * w} -1.48 Q ${0.25 * w} -1.47 ${0.25 * w} -1.36 L ${0.21 * w} -0.84 Z`;
  const leg = (hipX: number, f: number) => {
    const lift = Math.max(0, f) * 0.09;
    return (
      <g key={hipX}>
        <path
          d={`M ${hipX - 0.07} -0.88 L ${hipX + 0.07} -0.88 L ${hipX + 0.06} ${-0.07 - lift} L ${hipX - 0.06} ${-0.07 - lift} Z`}
          fill={look.trousers}
        />
        <ellipse
          cx={hipX}
          cy={-0.035 - lift}
          rx={0.08}
          ry={0.038}
          fill="#0B0C0F"
        />
      </g>
    );
  };
  const headY = -1.64 + 0.04 * phoneW;
  return (
    <g
      transform={`translate(${sx(cam, pose.X + sway, pose.Z)} ${sy(cam, 0, pose.Z)}) scale(${s})`}
    >
      <ellipse cx={0} cy={0} rx={0.36} ry={0.075} fill="url(#contact)" />
      {leg(-0.08, fwd)}
      {leg(0.08, -fwd)}
      <g transform={`translate(0 ${-bob}) scale(1 ${breathe})`}>
        {pose.carrying > 0.02 ? (
          <rect
            x={-0.3}
            y={-1.08}
            width={0.6}
            height={0.05}
            rx={0.01}
            fill="#6B4A33"
            opacity={pose.carrying}
          />
        ) : null}
        <path d={torso} fill={look.top} />
        <path d={torso} fill="url(#torso-shade)" />
        <path
          d={`M ${-0.25 * w} -1.36 L ${-0.21 * w} -0.84`}
          stroke={rim}
          strokeOpacity={0.5}
          strokeWidth={0.025}
          fill="none"
        />
        {/* Arms: by the side, raised to a screen, or bent for a phone or tray. */}
        <rect
          x={-0.31 * w}
          y={-1.42 + 0.05 * fwd}
          width={0.085}
          height={armLength}
          rx={0.04}
          fill={look.top}
        />
        {/* The right arm swings up to the screen and taps, or bends. */}
        <g transform={`rotate(${-150 * tapW + 12 * tap} ${0.26 * w} -1.38)`}>
          <rect
            x={0.225 * w}
            y={-1.42 - 0.05 * fwd}
            width={0.085}
            height={armLength + 0.02 * tapW}
            rx={0.04}
            fill={look.top}
          />
        </g>
        {look.bag ? (
          <rect
            x={-0.15}
            y={-1.42}
            width={0.3}
            height={0.36}
            rx={0.06}
            fill="#26282D"
          />
        ) : null}
        {/* Phone light spilling past the shoulder. */}
        <rect
          x={-0.048}
          y={-1.57}
          width={0.096}
          height={0.1}
          fill={look.skin}
        />
        <ellipse cx={0} cy={headY} rx={0.105} ry={0.125} fill={look.skin} />
        {/* Hair, from behind: short, long, a bun, or a cap. */}
        {look.hairStyle === 0 ? (
          <ellipse
            cx={0}
            cy={headY - 0.02}
            rx={0.11}
            ry={0.12}
            fill={look.hair}
          />
        ) : look.hairStyle === 1 ? (
          <path
            d={`M -0.115 ${headY - 0.02} Q -0.12 ${headY - 0.15} 0 ${headY - 0.15} Q 0.12 ${headY - 0.15} 0.115 ${headY - 0.02} L 0.13 ${headY + 0.22} L -0.13 ${headY + 0.22} Z`}
            fill={look.hair}
          />
        ) : look.hairStyle === 2 ? (
          <>
            <ellipse
              cx={0}
              cy={headY - 0.02}
              rx={0.11}
              ry={0.12}
              fill={look.hair}
            />
            <circle cx={0} cy={headY - 0.15} r={0.055} fill={look.hair} />
          </>
        ) : (
          <>
            <ellipse
              cx={0}
              cy={headY - 0.03}
              rx={0.11}
              ry={0.11}
              fill={look.hair}
            />
            <path
              d={`M -0.12 ${headY - 0.04} Q 0 ${headY - 0.2} 0.12 ${headY - 0.04} Z`}
              fill={pick(TOPS, look.phase * 10)}
            />
          </>
        )}
        <path
          d={`M -0.105 ${headY + 0.02} Q -0.115 ${headY - 0.09} -0.06 ${headY - 0.12}`}
          stroke={rim}
          strokeOpacity={0.45}
          strokeWidth={0.02}
          fill="none"
        />
      </g>
      {you ? (
        <text
          x={0}
          y={-1.95}
          textAnchor="middle"
          fontFamily={theme.monoFamily}
          fontSize={0.24}
          fontWeight={700}
          letterSpacing="0.12em"
          fill={ACCENT}
        >
          YOU
        </text>
      ) : null}
    </g>
  );
};

/** Staff, facing you across the counter: cap, apron, the top of the body. */
const Staff: React.FC<{
  cam: Cam;
  X: number;
  Z: number;
  seed: number;
  frame: number;
  reach?: number;
}> = ({ cam, X, Z, seed, frame, reach = 0 }) => {
  const s = sc(cam, Z);
  const skin = pick(SKIN, seed * 3 + 2);
  const sway = 0.02 * Math.sin(frame * 0.09 + seed);
  return (
    <g
      transform={`translate(${sx(cam, X + sway, Z)} ${sy(cam, 0, Z)}) scale(${s})`}
    >
      <path
        d="M -0.24 -0.9 L -0.25 -1.38 Q -0.25 -1.47 -0.15 -1.48 L 0.15 -1.48 Q 0.25 -1.47 0.25 -1.38 L 0.24 -0.9 Z"
        fill="#2A2D33"
      />
      <path
        d="M -0.16 -0.9 L -0.16 -1.3 L 0.16 -1.3 L 0.16 -0.9 Z"
        fill="#17191D"
      />
      <rect
        x={0.22}
        y={-1.42}
        width={0.085}
        height={0.5 - reach * 0.2}
        rx={0.04}
        fill="#2A2D33"
      />
      <rect
        x={-0.305}
        y={-1.42}
        width={0.085}
        height={0.5}
        rx={0.04}
        fill="#2A2D33"
      />
      <rect x={-0.045} y={-1.57} width={0.09} height={0.1} fill={skin} />
      <ellipse cx={0} cy={-1.65} rx={0.1} ry={0.12} fill={skin} />
      <ellipse cx={0} cy={-1.65} rx={0.1} ry={0.12} fill="url(#face-shade)" />
      <path d="M -0.11 -1.7 Q 0 -1.84 0.11 -1.7 Z" fill="#202227" />
      <rect
        x={-0.13}
        y={-1.71}
        width={0.26}
        height={0.03}
        rx={0.01}
        fill="#202227"
      />
    </g>
  );
};

/* ----------------------------------------------------------------- room */

const Room: React.FC<{ cam: Cam; frame: number }> = ({ cam, frame }) => {
  const steam = Array.from({ length: 9 }, (_, i) => {
    const u = (((frame * 0.012 + i / 9) % 1) + 1) % 1;
    const X = 7.4 + (i % 3) * 0.55 + 0.18 * Math.sin(frame * 0.03 + i);
    const h = 1.05 + u * 1.3;
    return { X, h, u, i };
  });
  const flicker = 0.92 + 0.08 * Math.sin(frame * 0.9) * Math.sin(frame * 0.37);
  return (
    <g>
      {/* Back wall and the kitchen's tiled splashback. */}
      <polygon
        points={quad(cam, [
          [-4, BACK_Z, 0],
          [18, BACK_Z, 0],
          [18, BACK_Z, 6],
          [-4, BACK_Z, 6],
        ])}
        fill="url(#wall)"
      />
      <polygon
        points={quad(cam, [
          [3.2, BACK_Z, 0.9],
          [14.6, BACK_Z, 0.9],
          [14.6, BACK_Z, 2.25],
          [3.2, BACK_Z, 2.25],
        ])}
        fill={TILE}
        opacity={0.16}
      />
      {Array.from({ length: 30 }, (_, i) => 3.2 + i * 0.38).map((X) => (
        <line
          key={`tv${X}`}
          x1={sx(cam, X, BACK_Z)}
          x2={sx(cam, X, BACK_Z)}
          y1={sy(cam, 0.9, BACK_Z)}
          y2={sy(cam, 2.25, BACK_Z)}
          stroke="#000"
          strokeOpacity={0.18}
          strokeWidth={0.8}
        />
      ))}
      {[1.12, 1.35, 1.58, 1.81, 2.04].map((h) => (
        <line
          key={`th${h}`}
          x1={sx(cam, 3.2, BACK_Z)}
          x2={sx(cam, 14.6, BACK_Z)}
          y1={sy(cam, h, BACK_Z)}
          y2={sy(cam, h, BACK_Z)}
          stroke="#000"
          strokeOpacity={0.18}
          strokeWidth={0.8}
        />
      ))}
      {/* Menu light boxes along the top of the wall. */}
      {[0, 1, 2, 3].map((i) => {
        const X0 = 0.4 + i * 2.25;
        return (
          <g key={`m${i}`}>
            <polygon
              points={quad(cam, [
                [X0, BACK_Z, 2.75],
                [X0 + 2.05, BACK_Z, 2.75],
                [X0 + 2.05, BACK_Z, 3.65],
                [X0, BACK_Z, 3.65],
              ])}
              fill="url(#menu)"
              opacity={flicker}
            />
            {/* A burger and fries, drawn plainly. */}
            <ellipse
              cx={sx(cam, X0 + 0.6, BACK_Z)}
              cy={sy(cam, 3.26, BACK_Z)}
              rx={0.32 * sc(cam, BACK_Z)}
              ry={0.11 * sc(cam, BACK_Z)}
              fill="#B9874F"
            />
            <rect
              x={sx(cam, X0 + 0.28, BACK_Z)}
              y={sy(cam, 3.18, BACK_Z)}
              width={0.64 * sc(cam, BACK_Z)}
              height={0.07 * sc(cam, BACK_Z)}
              fill="#4A2E22"
            />
            <rect
              x={sx(cam, X0 + 0.3, BACK_Z)}
              y={sy(cam, 3.12, BACK_Z)}
              width={0.6 * sc(cam, BACK_Z)}
              height={0.05 * sc(cam, BACK_Z)}
              fill="#7D8A4C"
            />
            <ellipse
              cx={sx(cam, X0 + 0.6, BACK_Z)}
              cy={sy(cam, 3.02, BACK_Z)}
              rx={0.32 * sc(cam, BACK_Z)}
              ry={0.07 * sc(cam, BACK_Z)}
              fill="#A9783F"
            />
            {[0, 1, 2, 3, 4].map((k) => (
              <rect
                key={k}
                x={sx(cam, X0 + 1.25 + k * 0.08, BACK_Z)}
                y={sy(cam, 3.42 - (k % 2) * 0.05, BACK_Z)}
                width={0.04 * sc(cam, BACK_Z)}
                height={0.32 * sc(cam, BACK_Z)}
                fill="#D8B45E"
              />
            ))}
            <polygon
              points={quad(cam, [
                [X0 + 1.18, BACK_Z, 2.95],
                [X0 + 1.68, BACK_Z, 2.95],
                [X0 + 1.62, BACK_Z, 3.2],
                [X0 + 1.24, BACK_Z, 3.2],
              ])}
              fill="#6E2C2A"
            />
            <rect
              x={sx(cam, X0 + 0.1, BACK_Z)}
              y={sy(cam, 2.88, BACK_Z)}
              width={1.85 * sc(cam, BACK_Z)}
              height={0.035 * sc(cam, BACK_Z)}
              fill="#3A2A1E"
              opacity={0.6}
            />
          </g>
        );
      })}
      {/* The kitchen: hood, grill, fryers, steam. */}
      <polygon
        points={quad(cam, [
          [6.6, 6.0, 2.25],
          [10.6, 6.0, 2.25],
          [10.6, 6.8, 2.75],
          [6.6, 6.8, 2.75],
        ])}
        fill={STEEL_DARK}
      />
      <polygon
        points={quad(cam, [
          [6.6, 6.0, 2.12],
          [10.6, 6.0, 2.12],
          [10.6, 6.0, 2.25],
          [6.6, 6.0, 2.25],
        ])}
        fill={LAMP}
        opacity={0.7}
      />
      <polygon
        points={quad(cam, [
          [3.2, 6.3, 0],
          [14.6, 6.3, 0],
          [14.6, 6.3, 0.95],
          [3.2, 6.3, 0.95],
        ])}
        fill={STEEL_DARK}
      />
      <polygon
        points={quad(cam, [
          [3.2, 6.3, 0.95],
          [14.6, 6.3, 0.95],
          [14.6, 6.95, 0.95],
          [3.2, 6.95, 0.95],
        ])}
        fill={STEEL}
        opacity={0.7}
      />
      <polygon
        points={quad(cam, [
          [7.2, 6.35, 0.96],
          [9.4, 6.35, 0.96],
          [9.4, 6.9, 0.96],
          [7.2, 6.9, 0.96],
        ])}
        fill={EMBER}
        opacity={0.55 + 0.1 * Math.sin(frame * 0.4)}
      />
      <ellipse
        cx={sx(cam, 8.3, 6.6)}
        cy={sy(cam, 1.05, 6.6)}
        rx={1.6 * sc(cam, 6.6)}
        ry={0.35 * sc(cam, 6.6)}
        fill="url(#ember-glow)"
      />
      {[4.0, 4.7, 11.0, 11.7].map((X) => (
        <polygon
          key={`fr${X}`}
          points={quad(cam, [
            [X, 6.4, 0.96],
            [X + 0.55, 6.4, 0.96],
            [X + 0.55, 6.85, 0.96],
            [X, 6.85, 0.96],
          ])}
          fill="#1C1E22"
          stroke={STEEL}
          strokeOpacity={0.35}
          strokeWidth={0.8}
        />
      ))}
      {steam.map((p) => (
        <circle
          key={`s${p.i}`}
          cx={sx(cam, p.X, 6.6)}
          cy={sy(cam, p.h, 6.6)}
          r={(0.12 + 0.25 * p.u) * sc(cam, 6.6)}
          fill="#E9E4D8"
          opacity={0.1 * Math.sin(Math.PI * p.u)}
          filter="url(#soft)"
        />
      ))}
    </g>
  );
};

/** The counter, the till or its closed sign, the pass and its heat lamps. */
const Counter: React.FC<{
  cam: Cam;
  rule: Rule;
  t: number;
  frame: number;
  people: readonly Customer[];
}> = ({ cam, rule, t, frame, people }) => {
  const z0 = COUNTER_Z;
  const z1 = COUNTER_Z + 0.65;
  const top = 1.05;
  const trays = waitingTrays(people, t).slice(0, 6);
  return (
    <g>
      {/* Top surface, then the lit wooden front. */}
      <polygon
        points={quad(cam, [
          [2.6, z0, top],
          [15, z0, top],
          [15, z1, top],
          [2.6, z1, top],
        ])}
        fill="#6E6559"
      />
      <polygon
        points={quad(cam, [
          [2.6, z0, top],
          [15, z0, top],
          [15, z0, top - 0.06],
          [2.6, z0, top - 0.06],
        ])}
        fill="#A39985"
      />
      <polygon
        points={quad(cam, [
          [2.6, z0, 0],
          [15, z0, 0],
          [15, z0, top - 0.06],
          [2.6, z0, top - 0.06],
        ])}
        fill={WOOD}
      />
      {Array.from({ length: 13 }, (_, i) => 2.9 + i * 0.95).map((X) => (
        <ellipse
          key={`sc${X}`}
          cx={sx(cam, X, z0)}
          cy={sy(cam, top - 0.15, z0)}
          rx={0.42 * sc(cam, z0)}
          ry={0.55 * sc(cam, z0)}
          fill="url(#scallop)"
        />
      ))}
      <polygon
        points={quad(cam, [
          [2.6, z0, 0],
          [15, z0, 0],
          [15, z0, 0.12],
          [2.6, z0, 0.12],
        ])}
        fill={WOOD_DARK}
      />
      {/* The heat lamp shelf over the pass, and its glow. */}
      <polygon
        points={quad(cam, [
          [PASS_X[0] - 0.3, z1, 1.75],
          [PASS_X[1] + 0.4, z1, 1.75],
          [PASS_X[1] + 0.4, z1, 1.88],
          [PASS_X[0] - 0.3, z1, 1.88],
        ])}
        fill={STEEL_DARK}
      />
      <polygon
        points={quad(cam, [
          [PASS_X[0] - 0.3, z1, 1.72],
          [PASS_X[1] + 0.4, z1, 1.72],
          [PASS_X[1] + 0.4, z1, 1.76],
          [PASS_X[0] - 0.3, z1, 1.76],
        ])}
        fill={LAMP}
      />
      <polygon
        points={quad(cam, [
          [PASS_X[0] - 0.3, z1, 1.72],
          [PASS_X[1] + 0.4, z1, 1.72],
          [PASS_X[1] + 0.7, z0 - 0.2, top],
          [PASS_X[0] - 0.6, z0 - 0.2, top],
        ])}
        fill="url(#heat)"
      />
      {/* Trays waiting on the pass. */}
      {trays.map((c) => {
        const [i, present] = settle(frame, placeIn(people, waitingTrays, c.id));
        const X = PASS_X[0] + 0.2 + i * 0.7;
        const Z = z0 + 0.3;
        const k = sc(cam, Z);
        return (
          <g key={c.id} opacity={present}>
            <polygon
              points={quad(cam, [
                [X - 0.25, Z - 0.18, top + 0.01],
                [X + 0.25, Z - 0.18, top + 0.01],
                [X + 0.25, Z + 0.18, top + 0.01],
                [X - 0.25, Z + 0.18, top + 0.01],
              ])}
              fill="#5A3E2B"
            />
            <rect
              x={sx(cam, X - 0.17, Z)}
              y={sy(cam, top + 0.13, Z)}
              width={0.2 * k}
              height={0.12 * k}
              rx={0.02 * k}
              fill="#D9CDB4"
            />
            <rect
              x={sx(cam, X + 0.07, Z)}
              y={sy(cam, top + 0.2, Z)}
              width={0.09 * k}
              height={0.19 * k}
              rx={0.015 * k}
              fill="#7B2E2B"
            />
            <rect
              x={sx(cam, X + 0.07, Z)}
              y={sy(cam, top + 0.24, Z)}
              width={0.09 * k}
              height={0.03 * k}
              fill="#E9E4D8"
              opacity={0.7}
            />
          </g>
        );
      })}
      {/* The till, or a closed till with a sign pointing at the kiosks. */}
      {rule === "cashier" ? (
        <g>
          <polygon
            points={quad(cam, [
              [TILL_X - 0.22, z0 + 0.1, top],
              [TILL_X + 0.22, z0 + 0.1, top],
              [TILL_X + 0.2, z0 + 0.05, top + 0.36],
              [TILL_X - 0.2, z0 + 0.05, top + 0.36],
            ])}
            fill={SCREEN}
            opacity={0.85}
          />
          <ellipse
            cx={sx(cam, TILL_X, z0)}
            cy={sy(cam, top + 0.18, z0)}
            rx={0.5 * sc(cam, z0)}
            ry={0.35 * sc(cam, z0)}
            fill="url(#screen-glow)"
          />
        </g>
      ) : null}
    </g>
  );
};

/** A self-order kiosk, screen facing the room. */
const Kiosk: React.FC<{
  cam: Cam;
  k: number;
  /** 0 idle to 1 in use, eased. */
  busy: number;
  frame: number;
}> = ({ cam, k, busy, frame }) => {
  const X = KIOSK_X(k);
  const Z = KIOSK_Z;
  const s = sc(cam, Z);
  const tiles = [0, 1, 2].flatMap((r) => [0, 1].map((c) => ({ r, c })));
  return (
    <g>
      <ellipse
        cx={sx(cam, X, Z)}
        cy={sy(cam, 0, Z)}
        rx={0.42 * s}
        ry={0.07 * s}
        fill="#000"
        opacity={0.5}
      />
      <polygon
        points={quad(cam, [
          [X - 0.12, Z, 0],
          [X + 0.12, Z, 0],
          [X + 0.12, Z, 0.78],
          [X - 0.12, Z, 0.78],
        ])}
        fill="#1D1F24"
      />
      <polygon
        points={quad(cam, [
          [X - 0.32, Z, 0.75],
          [X + 0.32, Z, 0.75],
          [X + 0.32, Z, 1.95],
          [X - 0.32, Z, 1.95],
        ])}
        fill="#141518"
      />
      <polygon
        points={quad(cam, [
          [X - 0.27, Z - 0.01, 0.82],
          [X + 0.27, Z - 0.01, 0.82],
          [X + 0.27, Z - 0.01, 1.88],
          [X - 0.27, Z - 0.01, 1.88],
        ])}
        fill={SCREEN}
        opacity={0.7 + 0.25 * busy}
      />
      {tiles.map(({ r, c }) => (
        <rect
          key={`${r}${c}`}
          x={sx(cam, X - 0.23 + c * 0.24, Z)}
          y={sy(cam, 1.78 - r * 0.24, Z)}
          width={0.2 * s}
          height={0.2 * s}
          rx={0.02 * s}
          fill={
            ["#B9874F", "#7D8A4C", "#6E2C2A", "#D8B45E", "#8B9096", "#A9783F"][
              (r * 2 + c + k) % 6
            ]
          }
          opacity={0.75}
        />
      ))}
      <rect
        x={sx(cam, X - 0.23, Z)}
        y={sy(cam, 1.0, Z)}
        width={0.46 * s}
        height={0.1 * s}
        rx={0.02 * s}
        fill="#2A2D33"
        opacity={0.5 + busy * (0.3 + 0.2 * Math.sin(frame * 0.6 + k))}
      />
      <ellipse
        cx={sx(cam, X, Z)}
        cy={sy(cam, 1.35, Z)}
        rx={0.9 * s}
        ry={0.9 * s}
        fill="url(#screen-glow)"
        opacity={0.6 + 0.4 * busy}
      />
    </g>
  );
};

/** The order screen over the pass: numbers being made, and numbers ready. */
const Board: React.FC<{
  cam: Cam;
  t: number;
  frame: number;
  people: readonly Customer[];
  yours: number;
}> = ({ cam, t, frame, people, yours }) => {
  const Z = COUNTER_Z + 0.3;
  const X0 = 8.75;
  const X1 = 13.95;
  const h0 = 2.1;
  const h1 = 3.65;
  const k = sc(cam, Z);
  const lists = { making, ready: waitingTrays };
  const col = (which: keyof typeof lists, X: number, title: string) => {
    const list = lists[which](people, t);
    return (
      <g>
        <text
          x={sx(cam, X, Z)}
          y={sy(cam, h1 - 0.22, Z)}
          fontFamily={theme.monoFamily}
          fontSize={0.17 * k}
          letterSpacing="0.1em"
          fill="#8A8B8F"
        >
          {title}
        </text>
        {list.slice(0, ROWS).map((c) => {
          // Numbers slide up as the ones ahead leave, and fade in when new.
          const [i, present] = settle(
            frame,
            placeIn(people, lists[which], c.id),
          );
          return (
            <text
              key={c.id}
              x={sx(cam, X, Z)}
              y={sy(cam, h1 - 0.62 - i * 0.4, Z) + (1 - present) * 8}
              fontFamily={theme.monoFamily}
              fontWeight={700}
              fontSize={0.38 * k}
              fill={c.number === yours ? ACCENT : theme.colors.chalk}
              opacity={present}
            >
              {c.number}
            </text>
          );
        })}
        {list.length > ROWS ? (
          <text
            x={sx(cam, X + 1.3, Z)}
            y={sy(cam, h1 - 0.62, Z)}
            fontFamily={theme.monoFamily}
            fontSize={0.24 * k}
            fill="#8A8B8F"
          >
            +{list.length - ROWS}
          </text>
        ) : null}
      </g>
    );
  };
  return (
    <g>
      <line
        x1={sx(cam, X0 + 0.5, Z)}
        x2={sx(cam, X0 + 0.5, Z)}
        y1={sy(cam, h1, Z)}
        y2={-10}
        stroke="#3A3C42"
        strokeWidth={1.5}
      />
      <line
        x1={sx(cam, X1 - 0.5, Z)}
        x2={sx(cam, X1 - 0.5, Z)}
        y1={sy(cam, h1, Z)}
        y2={-10}
        stroke="#3A3C42"
        strokeWidth={1.5}
      />
      <polygon
        points={quad(cam, [
          [X0, Z, h0],
          [X1, Z, h0],
          [X1, Z, h1],
          [X0, Z, h1],
        ])}
        fill="#0B0C0F"
        stroke="#30333A"
        strokeWidth={2}
      />
      <line
        x1={sx(cam, (X0 + X1) / 2, Z)}
        x2={sx(cam, (X0 + X1) / 2, Z)}
        y1={sy(cam, h1 - 0.08, Z)}
        y2={sy(cam, h0 + 0.08, Z)}
        stroke="#25272C"
        strokeWidth={1.5}
      />
      {col("making", X0 + 0.18, "PREPARING")}
      {col("ready", (X0 + X1) / 2 + 0.18, "READY")}
    </g>
  );
};

/** Pendant lamps over the floor, with their cones and pools of light. */
const PENDANTS = [
  { X: 0.9, Z: 2.0 },
  { X: 3.6, Z: 2.0 },
  { X: 6.4, Z: 2.0 },
];
const Pools: React.FC<{ cam: Cam }> = ({ cam }) => (
  <g>
    {PENDANTS.map((p) => (
      <ellipse
        key={`pool${p.X}`}
        cx={sx(cam, p.X, p.Z)}
        cy={sy(cam, 0, p.Z)}
        rx={1.5 * sc(cam, p.Z)}
        ry={0.55 * sc(cam, p.Z)}
        fill="url(#pool)"
      />
    ))}
  </g>
);
const Lamps: React.FC<{ cam: Cam; frame: number }> = ({ cam, frame }) => (
  <g>
    {PENDANTS.map((p) => {
      const k = sc(cam, p.Z);
      const x = sx(cam, p.X, p.Z);
      const y = sy(cam, 2.75, p.Z);
      return (
        <g key={`lamp${p.X}`}>
          <polygon
            points={`${x - 0.2 * k},${y} ${x + 0.2 * k},${y} ${x + 1.2 * k},${sy(cam, 0, p.Z)} ${x - 1.2 * k},${sy(cam, 0, p.Z)}`}
            fill="url(#cone)"
          />
          <line
            x1={x}
            x2={x}
            y1={-10}
            y2={y - 0.22 * k}
            stroke="#2E3036"
            strokeWidth={1.2}
          />
          <path
            d={`M ${x - 0.22 * k} ${y} L ${x - 0.1 * k} ${y - 0.24 * k} L ${x + 0.1 * k} ${y - 0.24 * k} L ${x + 0.22 * k} ${y} Z`}
            fill="#1E1F23"
          />
          <ellipse cx={x} cy={y} rx={0.2 * k} ry={0.045 * k} fill={LAMP} />
          <circle cx={x} cy={y} r={0.5 * k} fill="url(#bulb)" />
          {Array.from({ length: 7 }, (_, i) => {
            const u = (((frame * 0.004 + i * 0.143 + p.X * 0.1) % 1) + 1) % 1;
            const h = 2.6 - u * 2.4;
            const spread = (h / 2.6) * 0.2 + (1 - h / 2.6) * 1.0;
            const dx = spread * Math.sin(i * 2.3 + frame * 0.01);
            return (
              <circle
                key={`dust${i}`}
                cx={x + dx * k}
                cy={sy(cam, h, p.Z)}
                r={Math.max(0.6, 0.012 * k)}
                fill={LAMP}
                opacity={0.35 * Math.sin(Math.PI * u)}
              />
            );
          })}
        </g>
      );
    })}
  </g>
);

/** Out-of-focus things nearest the lens: a table edge with a cup, a plant. */
const Foreground: React.FC<{ cam: Cam }> = ({ cam }) => (
  <g filter="url(#dof)" opacity={0.9}>
    <polygon
      points={quad(cam, [
        [-1.5, -1.2, 0.76],
        [2.6, -1.2, 0.76],
        [2.6, -0.3, 0.76],
        [-1.5, -0.3, 0.76],
      ])}
      fill="#2B211A"
    />
    <polygon
      points={quad(cam, [
        [-1.5, -1.2, 0.76],
        [2.6, -1.2, 0.76],
        [2.6, -1.2, 0.68],
        [-1.5, -1.2, 0.68],
      ])}
      fill="#120E0B"
    />
    <rect
      x={sx(cam, 1.55, -0.75)}
      y={sy(cam, 0.98, -0.75)}
      width={0.16 * sc(cam, -0.75)}
      height={0.22 * sc(cam, -0.75)}
      rx={0.02 * sc(cam, -0.75)}
      fill="#7B2E2B"
    />
    <ellipse
      cx={sx(cam, 14.2, -0.6)}
      cy={sy(cam, 0.9, -0.6)}
      rx={0.7 * sc(cam, -0.6)}
      ry={0.9 * sc(cam, -0.6)}
      fill="#1F2A20"
    />
    <ellipse
      cx={sx(cam, 13.7, -0.6)}
      cy={sy(cam, 1.25, -0.6)}
      rx={0.45 * sc(cam, -0.6)}
      ry={0.6 * sc(cam, -0.6)}
      fill="#263424"
    />
  </g>
);

/** Floor: glossy dark tiles running back to the counter. */
const Floor: React.FC<{ cam: Cam }> = ({ cam }) => (
  <g>
    <polygon
      points={quad(cam, [
        [-4, -2, 0],
        [18, -2, 0],
        [18, COUNTER_Z, 0],
        [-4, COUNTER_Z, 0],
      ])}
      fill="url(#floor)"
    />
    {Array.from({ length: 23 }, (_, i) => -4 + i * 1).map((X) => (
      <line
        key={`fx${X}`}
        x1={sx(cam, X, -2)}
        y1={sy(cam, 0, -2)}
        x2={sx(cam, X, COUNTER_Z)}
        y2={sy(cam, 0, COUNTER_Z)}
        stroke="#000"
        strokeOpacity={0.22}
        strokeWidth={1}
      />
    ))}
    {[-1, 0, 1, 2, 3, 4].map((Z) => (
      <line
        key={`fz${Z}`}
        x1={sx(cam, -4, Z)}
        y1={sy(cam, 0, Z)}
        x2={sx(cam, 18, Z)}
        y2={sy(cam, 0, Z)}
        stroke="#000"
        strokeOpacity={0.22}
        strokeWidth={1}
      />
    ))}
  </g>
);

/** Bright things mirrored softly in the glossy floor. */
const Reflections: React.FC<{ cam: Cam; rule: Rule }> = ({ cam, rule }) => (
  <g filter="url(#soft)" opacity={0.55}>
    {PENDANTS.map((p) => (
      <ellipse
        key={`rp${p.X}`}
        cx={sx(cam, p.X, p.Z + 0.6)}
        cy={sy(cam, 0, p.Z + 0.6)}
        rx={0.25 * sc(cam, p.Z)}
        ry={0.06 * sc(cam, p.Z)}
        fill={LAMP}
        opacity={0.5}
      />
    ))}
    {rule === "kiosks"
      ? Array.from({ length: KIOSKS }, (_, k) => (
          <ellipse
            key={`rk${k}`}
            cx={sx(cam, KIOSK_X(k), KIOSK_Z - 0.35)}
            cy={sy(cam, 0, KIOSK_Z - 0.35)}
            rx={0.3 * sc(cam, KIOSK_Z)}
            ry={0.07 * sc(cam, KIOSK_Z)}
            fill={SCREEN}
            opacity={0.45}
          />
        ))
      : null}
  </g>
);

/** Bloom: soft copies of the brightest things, laid over the scene. */
const Bloom: React.FC<{ cam: Cam; rule: Rule }> = ({ cam, rule }) => (
  <g filter="url(#bloom)" style={{ mixBlendMode: "screen" }} opacity={0.7}>
    {[0, 1, 2, 3].map((i) => {
      const X0 = 0.4 + i * 2.25;
      return (
        <polygon
          key={`bm${i}`}
          points={quad(cam, [
            [X0, BACK_Z, 2.75],
            [X0 + 2.05, BACK_Z, 2.75],
            [X0 + 2.05, BACK_Z, 3.65],
            [X0, BACK_Z, 3.65],
          ])}
          fill="#F4E6CC"
          opacity={0.35}
        />
      );
    })}
    {PENDANTS.map((p) => (
      <ellipse
        key={`bl${p.X}`}
        cx={sx(cam, p.X, p.Z)}
        cy={sy(cam, 2.75, p.Z)}
        rx={0.35 * sc(cam, p.Z)}
        ry={0.12 * sc(cam, p.Z)}
        fill={LAMP}
      />
    ))}
    {rule === "kiosks"
      ? Array.from({ length: KIOSKS }, (_, k) => (
          <polygon
            key={`bk${k}`}
            points={quad(cam, [
              [KIOSK_X(k) - 0.27, KIOSK_Z, 0.82],
              [KIOSK_X(k) + 0.27, KIOSK_Z, 0.82],
              [KIOSK_X(k) + 0.27, KIOSK_Z, 1.88],
              [KIOSK_X(k) - 0.27, KIOSK_Z, 1.88],
            ])}
            fill={SCREEN}
            opacity={0.4}
          />
        ))
      : null}
    <polygon
      points={quad(cam, [
        [PASS_X[0] - 0.3, COUNTER_Z + 0.65, 1.72],
        [PASS_X[1] + 0.4, COUNTER_Z + 0.65, 1.72],
        [PASS_X[1] + 0.4, COUNTER_Z + 0.65, 1.78],
        [PASS_X[0] - 0.3, COUNTER_Z + 0.65, 1.78],
      ])}
      fill={LAMP}
    />
  </g>
);

/** At the payoff: the kitchen, named as the step that sets the pace. */
const Slowest: React.FC<{ cam: Cam; frame: number }> = ({ cam, frame }) => {
  const u = interpolate(
    frame,
    [VERDICT_FROM + 6, VERDICT_FROM + 20],
    [0, 1],
    clamp,
  );
  if (u <= 0) return null;
  const Z = 6.0;
  const x0 = sx(cam, 3.4, Z);
  const x1 = sx(cam, 8.5, Z);
  const y = sy(cam, 1.55, Z);
  return (
    <g opacity={u}>
      <path
        d={`M ${x0} ${y + 10} L ${x0} ${y} L ${x1} ${y} L ${x1} ${y + 10}`}
        fill="none"
        stroke={theme.colors.chalk}
        strokeWidth={2}
      />
      <rect
        x={(x0 + x1) / 2 - 116}
        y={y - 30}
        width={232}
        height={26}
        rx={4}
        fill="#0B0C0F"
        opacity={0.8}
      />
      <text
        x={(x0 + x1) / 2}
        y={y - 11}
        textAnchor="middle"
        fontFamily={theme.monoFamily}
        fontSize={16}
        fontWeight={700}
        letterSpacing="0.1em"
        fill={theme.colors.chalk}
      >
        SLOWEST STEP: KITCHEN
      </text>
    </g>
  );
};

/* ---------------------------------------------------------------- panel */

const Panel: React.FC<{ rule: Rule; top: number; frame: number }> = ({
  rule,
  top,
  frame,
}) => {
  const cam = camAt(frame);
  const t = simAt(frame);
  const people = RUNS[rule];
  const yours = people[YOU].number;
  const busyAt = (k: number) => (f: number) => {
    const at = simAt(f);
    return people.some(
      (c) => c.station === k && c.orderStart <= at && c.orderEnd > at,
    )
      ? 1
      : 0;
  };
  type Item = { Z: number; node: React.ReactNode };
  const items: Item[] = [];
  people.forEach((c) => {
    const pose = poseAt(rule, c.id, frame);
    if (!pose) return;
    const you = c.id === YOU;
    items.push({
      Z: pose.Z,
      node: (
        <Customer3D
          key={`p${c.id}`}
          cam={cam}
          pose={pose}
          look={lookOf(c.id, you)}
          you={you}
          frame={frame}
          coolRim={rule === "kiosks" && pose.X < 6.5}
          kiosk={rule === "kiosks"}
        />
      ),
    });
  });
  if (rule === "kiosks")
    for (let k = 0; k < KIOSKS; k++)
      items.push({
        Z: KIOSK_Z,
        node: (
          <Kiosk
            key={`k${k}`}
            cam={cam}
            k={k}
            busy={settle(frame, busyAt(k), 8)[0]}
            frame={frame}
          />
        ),
      });
  items.sort((a, b) => b.Z - a.Z);
  // Cooks keep moving while the kitchen has work, which in a rush is always.
  const cookX = 8.2 + 1.1 * Math.sin(frame * 0.045);
  const runnerX = 10.6 + 2.0 * Math.sin(frame * 0.031 + 1);
  return (
    <g transform={`translate(${LEFT} ${top})`}>
      <defs>
        <clipPath id={`${rule}-clip`}>
          <rect x={0} y={0} width={W} height={H} rx={14} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${rule}-clip)`}>
        <rect x={0} y={0} width={W} height={H} fill={WALL} />
        <Room cam={cam} frame={frame} />
        <Staff cam={cam} X={cookX} Z={5.75} seed={2} frame={frame} />
        <Staff
          cam={cam}
          X={runnerX}
          Z={5.4}
          seed={5}
          frame={frame}
          reach={Math.max(0, Math.sin(frame * 0.031 + 1))}
        />
        {rule === "cashier" ? (
          <Staff cam={cam} X={TILL_X} Z={5.0} seed={7} frame={frame} />
        ) : null}
        <Counter cam={cam} rule={rule} t={t} frame={frame} people={people} />
        <Floor cam={cam} />
        <Pools cam={cam} />
        <Reflections cam={cam} rule={rule} />
        <Board cam={cam} t={t} frame={frame} people={people} yours={yours} />
        {items.map((it) => it.node)}
        <Lamps cam={cam} frame={frame} />
        <Bloom cam={cam} rule={rule} />
        <Slowest cam={cam} frame={frame} />
        <Foreground cam={cam} />
        <rect
          x={0}
          y={0}
          width={W}
          height={H}
          fill="url(#grade)"
          style={{ mixBlendMode: "soft-light" }}
        />
        <rect x={0} y={0} width={W} height={H} fill="url(#vignette)" />
        <rect
          x={0}
          y={0}
          width={W}
          height={H}
          filter="url(#grain)"
          opacity={0.06}
        />
      </g>
      <rect
        x={0.5}
        y={0.5}
        width={W - 1}
        height={H - 1}
        rx={14}
        fill="none"
        stroke="#2A2B30"
      />
    </g>
  );
};

const mmss = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Where you are and how long you have been there, from the model. */
const yourClock = (rule: Rule, t: number) => {
  const c = RUNS[rule][YOU];
  if (t < c.arrive) return { word: "", clock: 0 };
  const clock = Math.min(t, c.served) - c.arrive;
  if (t >= c.served) return { word: "tray in", clock: HERO[rule].total };
  if (t >= c.orderEnd) return { word: "waiting for food", clock };
  if (t >= c.orderStart) return { word: "ordering", clock };
  return { word: "in line", clock };
};

export const Restaurant: React.FC = () => {
  const frame = useCurrentFrame();
  const t = simAt(frame);
  const named = interpolate(
    frame,
    [VERDICT_FROM, VERDICT_FROM + 12],
    [0, 1],
    clamp,
  );
  return (
    <>
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <linearGradient id="wall" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#15110E" />
            <stop offset="0.5" stopColor={WALL_LIT} />
            <stop offset="1" stopColor={WALL} />
          </linearGradient>
          <linearGradient id="menu" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#F4E6CC" />
            <stop offset="1" stopColor="#D9C29C" />
          </linearGradient>
          <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#2A231E" />
            <stop offset="1" stopColor="#141110" />
          </linearGradient>
          <radialGradient id="pool" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={LAMP} stopOpacity={0.34} />
            <stop offset="0.6" stopColor={LAMP} stopOpacity={0.08} />
            <stop offset="1" stopColor={LAMP} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="cone" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={LAMP} stopOpacity={0.16} />
            <stop offset="1" stopColor={LAMP} stopOpacity={0.01} />
          </linearGradient>
          <radialGradient id="bulb" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#FFF6E6" stopOpacity={0.55} />
            <stop offset="1" stopColor={LAMP} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="scallop" cx="0.5" cy="0" r="0.8">
            <stop offset="0" stopColor={LAMP} stopOpacity={0.3} />
            <stop offset="1" stopColor={LAMP} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="heat" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#FFD9A0" stopOpacity={0.32} />
            <stop offset="1" stopColor="#FFD9A0" stopOpacity={0.04} />
          </linearGradient>
          <radialGradient id="ember-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#C2452F" stopOpacity={0.35} />
            <stop offset="1" stopColor="#C2452F" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="screen-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={SCREEN} stopOpacity={0.22} />
            <stop offset="1" stopColor={SCREEN} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="phone-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={SCREEN} stopOpacity={0.55} />
            <stop offset="1" stopColor={SCREEN} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="contact" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#000" stopOpacity={0.6} />
            <stop offset="1" stopColor="#000" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="streak-warm" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={LAMP} stopOpacity={0.35} />
            <stop offset="1" stopColor={LAMP} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="streak-cool" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={SCREEN} stopOpacity={0.3} />
            <stop offset="1" stopColor={SCREEN} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="torso-shade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity={0.12} />
            <stop offset="0.45" stopColor="#fff" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.4} />
          </linearGradient>
          <radialGradient id="face-shade" cx="0.35" cy="0.35" r="0.8">
            <stop offset="0.5" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.3} />
          </radialGradient>
          <linearGradient id="grade" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#2E5A6B" stopOpacity={0.55} />
            <stop offset="0.5" stopColor="#FFB070" stopOpacity={0.25} />
            <stop offset="1" stopColor="#24485A" stopOpacity={0.55} />
          </linearGradient>
          <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.55" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.55} />
          </radialGradient>
          <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={4} />
          </filter>
          <filter id="bloom" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={9} />
          </filter>
          <filter id="dof" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={7} />
          </filter>
          <filter id="grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.9}
              numOctaves={2}
              seed={frame % 7}
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        {PANELS.map((p) => (
          <Panel key={p.rule} rule={p.rule} top={p.top} frame={frame} />
        ))}
      </svg>
      <Provenance top={PROVENANCE_TOP}>{CONDITIONS}</Provenance>
      {PANELS.map((p) => {
        const now = yourClock(p.rule, t);
        const name = p.rule === "kiosks" ? named : 0;
        const verdict = frame >= VERDICT_FROM - 6;
        return (
          <div
            key={p.rule}
            style={{
              position: "absolute",
              top: p.top - LABEL_GAP,
              left: LEFT,
              width: W,
              height: 30,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              color: theme.colors.chalk,
            }}
          >
            <div style={{ position: "relative", width: 380, height: 30 }}>
              <div
                style={{
                  position: "absolute",
                  bottom: 2,
                  fontFamily: theme.monoFamily,
                  fontSize: 23,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  opacity: 1 - name,
                }}
              >
                {p.label}
              </div>
              {p.rule === "kiosks" ? (
                <div
                  style={{
                    position: "absolute",
                    bottom: -4,
                    fontFamily: theme.fontFamily,
                    fontSize: 38,
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    opacity: name,
                    transform: `translateY(${(1 - name) * 10}px)`,
                  }}
                >
                  Amdahl's law
                </div>
              ) : null}
            </div>
            <div
              style={{
                fontFamily: theme.monoFamily,
                fontSize: 19,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: theme.colors.grayDark,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              {verdict ? "tray in" : now.word}{" "}
              <span style={{ fontSize: 34, fontWeight: 700, color: ACCENT }}>
                {mmss(verdict ? HERO[p.rule].total : now.clock)}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
};
