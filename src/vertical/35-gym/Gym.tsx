import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { Provenance } from "../../shared/vertical/type";
import { clamp } from "../../shared/video/timing";
import { VERDICT_FROM, simAt } from "./beats";
import { CONDITIONS, HERO } from "./measurements";
import {
  BZ,
  DOOR_IN,
  DOOR_OUT,
  FOOT_X,
  HEAD_X,
  PAD_H,
  PLATE_DZ,
  RACK_DZ,
  RACK_X,
  barAt,
  stateAt,
  type Bar,
  type State,
} from "./motion";
import { RUNS, YOU } from "./runs";
import type { Lifter, Rule } from "./simulation";

/**
 * Two gyms at the after-work peak, one above the other, each the same corner
 * seen from the side: one bench with its rack, the mirror wall behind, and
 * the people waiting for it. The same lifters walk in at both. Above,
 * whoever has the bench sits on it between sets. Below, they step aside and
 * the next one lifts.
 *
 * Orange is one thing: you. Your shirt, and your clock.
 */

export const HEADLINE_TOP = 232;
const PROVENANCE_TOP = 424;
const LEFT = 150;
const W = 780;
const H = 380;
const PANELS: { rule: Rule; label: string; top: number }[] = [
  { rule: "keep", label: "Rest on the bench", top: 494 },
  { rule: "share", label: "Take turns", top: 920 },
];
const LABEL_GAP = 34;

/* ---------------------------------------------------------------- camera */

const CAM_Z = -3.4;
const CAM_H = 1.45;
const HORIZON = 144;
const WALL_Z = 6.4;

type Cam = { x: number; f: number };
const camAt = (frame: number): Cam => {
  const u = Math.min(1, Math.max(0, frame / 420));
  const e = u * u * (3 - 2 * u);
  // A slow push in, and a little handheld drift.
  const drift = 0.02 * Math.sin(frame * 0.021) + 0.01 * Math.sin(frame * 0.053);
  return { x: 0.2 + drift, f: 716 + 30 * e };
};
const sc = (cam: Cam, Z: number) => cam.f / (Z - CAM_Z);
const sx = (cam: Cam, X: number, Z: number) => W / 2 + (X - cam.x) * sc(cam, Z);
const sy = (cam: Cam, h: number, Z: number) =>
  HORIZON + (CAM_H - h) * sc(cam, Z);
const P = (cam: Cam, X: number, Z: number, h: number) =>
  `${sx(cam, X, Z).toFixed(1)},${sy(cam, h, Z).toFixed(1)}`;
const quad = (cam: Cam, pts: [number, number, number][]) =>
  pts.map(([X, Z, h]) => P(cam, X, Z, h)).join(" ");

/* -------------------------------------------------------------- palette */

const WALL = "#17130F";
const WALL_LIT = "#2E261F";
const STEEL = "#A7ADB3";
const STEEL_DARK = "#3B3F45";
const LEATHER = "#1B1B1F";
const LAMP = "#FFE3B8";
const SCREEN = "#DDE8F2";

const SKIN = ["#E6C8A6", "#C8A07E", "#A47A5C", "#7E5A42", "#5E4231", "#D9B08D"];
const HAIR = ["#1B1714", "#3A2A1F", "#5B4531", "#2B2723", "#8B7864", "#121010"];
/** Gym clothes, kept well off orange, which is only ever you. */
const TOPS = [
  "#3E4A5C",
  "#5A2E36",
  "#4A5238",
  "#6C6F76",
  "#33504C",
  "#7A6A58",
  "#46393F",
  "#2F3A52",
  "#8A8D94",
];
const SHORTS = ["#1A1B1F", "#2A2C31", "#3B4252", "#232629", "#4A4D55"];
const SHOES = ["#E9E4D8", "#2A2C31", "#8A8B8F", "#C9C2B4"];
const pick = <T,>(xs: readonly T[], n: number) => xs[Math.abs(n) % xs.length];

/** A colour darkened, for the far arm and leg. */
const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (s: number) =>
    Math.round(((n >> s) & 255) * k)
      .toString(16)
      .padStart(2, "0");
  return `#${c(16)}${c(8)}${c(0)}`;
};

/* --------------------------------------------------------------- people */

type Look = {
  skin: string;
  hair: string;
  top: string;
  shorts: string;
  shoes: string;
  hairStyle: 0 | 1 | 2 | 3;
  height: number;
  headphones: boolean;
};

const lookOf = (id: number, you: boolean): Look => ({
  skin: pick(SKIN, id * 5 + 1),
  hair: pick(HAIR, id * 3 + 2),
  top: you ? ACCENT : pick(TOPS, id * 7 + 3),
  shorts: pick(SHORTS, id * 3 + 1),
  shoes: pick(SHOES, id * 5 + 2),
  hairStyle: (Math.abs(id * 11 + 3) % 4) as Look["hairStyle"],
  height: 0.94 + ((id * 37) % 11) / 100,
  headphones: id % 3 === 1,
});

type V = [number, number];
const dir = (deg: number): V => [
  Math.cos((deg * Math.PI) / 180),
  Math.sin((deg * Math.PI) / 180),
];
const add = (a: V, b: V, k = 1): V => [a[0] + b[0] * k, a[1] + b[1] * k];

/** The elbow, bending clockwise from shoulder to hand: down and back. */
const elbow = (s: V, hand: V, a: number, b: number): V => {
  const dx = hand[0] - s[0];
  const dy = hand[1] - s[1];
  const d = Math.min(a + b - 1e-3, Math.max(1e-3, Math.hypot(dx, dy)));
  const u: V = [
    dx / Math.hypot(dx, dy || 1e-6),
    dy / Math.hypot(dx, dy || 1e-6),
  ];
  const along = (a * a - b * b + d * d) / (2 * d);
  const up = Math.sqrt(Math.max(0, a * a - along * along));
  return [s[0] + u[0] * along + u[1] * up, s[1] + u[1] * along - u[0] * up];
};

/** Where a person's head is on screen, for the label over it. */
const headOnScreen = (cam: Cam, st: State, look: Look) => {
  const r = st.rig;
  const k = look.height;
  const shoulder = add([0, r.hipH], dir(r.torso), 0.5);
  const head = add(shoulder, dir(r.torso + r.head * 0.4), 0.18);
  const sgn = st.facing >= 0 ? 1 : -1;
  const X = st.X + head[0] * k * sgn;
  return { x: sx(cam, X, st.Z), y: sy(cam, head[1] * k, st.Z) };
};

/**
 * Someone in profile, jointed: hip, knees, ankles, shoulder, elbows, hands
 * and head, set by the rig and drawn as rounded limbs. The far arm and leg
 * are darker and drawn first.
 */
const Person: React.FC<{
  cam: Cam;
  st: State;
  look: Look;
  bar: Bar;
  frame: number;
}> = ({ cam, st, look, bar, frame }) => {
  const r = st.rig;
  const s = sc(cam, st.Z) * look.height;
  const sgn = st.facing >= 0 ? 1 : -1;
  const fx = Math.max(0.22, Math.abs(st.facing)) * sgn;
  const hip: V = [0, r.hipH];
  const shoulder = add(hip, dir(r.torso), 0.5);
  const neck = add(shoulder, dir(r.torso), 0.06);
  const head = add(shoulder, dir(r.torso + r.head * 0.4), 0.18);
  const faceDeg = r.torso - 90 + r.head;
  // Hands: where the rig puts them, or on the bar.
  const barLocal: V = [
    ((bar.X - st.X) * sgn) / look.height,
    bar.h / look.height,
  ];
  const handAt = (h: V, grip: number): V => {
    const own = add(hip, h);
    return [
      own[0] + (barLocal[0] + grip - own[0]) * st.onBar,
      own[1] + (barLocal[1] - own[1]) * st.onBar,
    ];
  };
  const tug = st.reach * 0.025 * Math.sin(frame * 0.45);
  const handN = add(handAt(r.handN, 0), [tug, 0]);
  const handF = add(handAt(r.handF, -0.01), [tug * 0.8, 0]);
  const leg = (thigh: number, shin: number) => {
    const knee = add(hip, dir(thigh), 0.44);
    const ankle = add(knee, dir(shin), 0.43);
    return { knee, ankle };
  };
  const legN = leg(r.thighN, r.shinN);
  const legF = leg(r.thighF, r.shinF);
  const line = (a: V, b: V, w: number, color: string, key: string) => (
    <line
      key={key}
      x1={a[0]}
      y1={a[1]}
      x2={b[0]}
      y2={b[1]}
      stroke={color}
      strokeWidth={w}
      strokeLinecap="round"
    />
  );
  const drawLeg = (l: { knee: V; ankle: V }, far: boolean, key: string) => {
    const k = far ? 0.72 : 1;
    const shortsEnd = add(hip, [l.knee[0] - hip[0], l.knee[1] - hip[1]], 0.8);
    return (
      <g key={key}>
        {line(l.knee, l.ankle, 0.1, shade(look.skin, k), `${key}s`)}
        {line(shortsEnd, l.knee, 0.11, shade(look.skin, k), `${key}k`)}
        {line(hip, shortsEnd, 0.17, shade(look.shorts, k), `${key}t`)}
        <path
          d={`M ${l.ankle[0] - 0.05} ${l.ankle[1] + 0.02} L ${l.ankle[0] + 0.15} ${l.ankle[1] - 0.04} L ${l.ankle[0] + 0.15} ${l.ankle[1] - 0.08} L ${l.ankle[0] - 0.06} ${l.ankle[1] - 0.08} Z`}
          fill={shade(look.shoes, k)}
        />
      </g>
    );
  };
  const drawArm = (hand: V, far: boolean, key: string) => {
    const k = far ? 0.72 : 1;
    const e = elbow(shoulder, hand, 0.29, 0.28);
    const sleeve = add(shoulder, [e[0] - shoulder[0], e[1] - shoulder[1]], 0.5);
    return (
      <g key={key}>
        {line(sleeve, e, 0.085, shade(look.skin, k), `${key}u`)}
        {line(e, hand, 0.075, shade(look.skin, k), `${key}f`)}
        {line(shoulder, sleeve, 0.12, shade(look.top, k), `${key}s`)}
        <circle
          cx={hand[0]}
          cy={hand[1]}
          r={0.045}
          fill={shade(look.skin, k)}
        />
      </g>
    );
  };
  const face = dir(faceDeg);
  const back = (deg: number) => add(head, dir(faceDeg + deg), 0.112);
  const hairPath = (from: number, to: number) => {
    const a = back(from);
    const b = back(to);
    return `M ${a[0]} ${a[1]} A 0.112 0.112 0 1 1 ${b[0]} ${b[1]} Z`;
  };
  const phoneAt = add(handN, dir(faceDeg + 200), 0.02);
  return (
    <g
      transform={`translate(${sx(cam, st.X, st.Z)} ${sy(cam, 0, st.Z)}) scale(${s * fx} ${-s})`}
    >
      {r.hipH > 0.8 ? (
        <ellipse cx={0.02} cy={0} rx={0.32} ry={0.05} fill="url(#contact)" />
      ) : null}
      {drawArm(handF, true, "af")}
      {drawLeg(legF, true, "lf")}
      {/* Torso, and the shorts at the hip. */}
      {/* Torso: narrower at the waist, fuller at the chest. */}
      <path
        d={(() => {
          const n = dir(r.torso + 90);
          const waist = add(hip, dir(r.torso), 0.06);
          const chest = add(hip, dir(r.torso), 0.36);
          const pts: V[] = [
            add(waist, n, 0.12),
            add(chest, n, 0.14),
            add(shoulder, n, 0.1),
            add(shoulder, n, -0.12),
            add(chest, n, -0.15),
            add(waist, n, -0.12),
          ];
          return `M ${pts.map((p) => `${p[0]} ${p[1]}`).join(" L ")} Z`;
        })()}
        fill={look.top}
        stroke={look.top}
        strokeWidth={0.07}
        strokeLinejoin="round"
      />
      {/* Light from the lamps along the back of the shirt. */}
      <line
        x1={add(add(hip, dir(r.torso), 0.1), dir(r.torso + 90), 0.1)[0]}
        y1={add(add(hip, dir(r.torso), 0.1), dir(r.torso + 90), 0.1)[1]}
        x2={add(add(hip, dir(r.torso), 0.45), dir(r.torso + 90), 0.1)[0]}
        y2={add(add(hip, dir(r.torso), 0.45), dir(r.torso + 90), 0.1)[1]}
        stroke={LAMP}
        strokeOpacity={0.22}
        strokeWidth={0.04}
        strokeLinecap="round"
      />
      <circle cx={hip[0]} cy={hip[1]} r={0.125} fill={look.shorts} />
      {line(shoulder, neck, 0.09, look.skin, "neck")}
      <circle cx={head[0]} cy={head[1]} r={0.112} fill={look.skin} />
      {look.hairStyle === 3 ? (
        <>
          <path d={hairPath(60, 250)} fill={pick(TOPS, look.height * 100)} />
          <line
            x1={add(head, dir(faceDeg + 55), 0.1)[0]}
            y1={add(head, dir(faceDeg + 55), 0.1)[1]}
            x2={add(head, dir(faceDeg + 20), 0.2)[0]}
            y2={add(head, dir(faceDeg + 20), 0.2)[1]}
            stroke="#121316"
            strokeWidth={0.03}
            strokeLinecap="round"
          />
        </>
      ) : (
        <path
          d={hairPath(
            look.hairStyle === 0 ? 70 : 55,
            look.hairStyle === 1 ? 285 : 245,
          )}
          fill={look.hair}
        />
      )}
      {look.hairStyle === 2 ? (
        <circle
          cx={add(head, dir(faceDeg + 150), 0.12)[0]}
          cy={add(head, dir(faceDeg + 150), 0.12)[1]}
          r={0.05}
          fill={look.hair}
        />
      ) : null}
      {/* Nose, eye and ear. */}
      <path
        d={`M ${add(head, dir(faceDeg + 14), 0.1)[0]} ${add(head, dir(faceDeg + 14), 0.1)[1]} L ${add(head, face, 0.145)[0]} ${add(head, face, 0.145)[1]} L ${add(head, dir(faceDeg - 22), 0.105)[0]} ${add(head, dir(faceDeg - 22), 0.105)[1]} Z`}
        fill={look.skin}
      />
      <circle
        cx={add(head, dir(faceDeg + 22), 0.072)[0]}
        cy={add(head, dir(faceDeg + 22), 0.072)[1]}
        r={0.012}
        fill="#16110E"
      />
      <circle
        cx={add(head, dir(faceDeg + 180), 0.015)[0]}
        cy={add(head, dir(faceDeg + 180), 0.015)[1]}
        r={0.024}
        fill={shade(look.skin, 0.85)}
      />
      {look.headphones ? (
        <>
          <path
            d={`M ${back(5)[0]} ${back(5)[1]} A 0.125 0.125 0 0 1 ${back(175)[0]} ${back(175)[1]}`}
            stroke="#121316"
            strokeWidth={0.025}
            fill="none"
            transform={`translate(${face[0] * 0} 0)`}
          />
          <circle
            cx={add(head, dir(faceDeg + 180), 0.015)[0]}
            cy={add(head, dir(faceDeg + 180), 0.015)[1]}
            r={0.05}
            fill="#121316"
          />
        </>
      ) : null}
      {st.phone > 0.02 ? (
        <circle
          cx={head[0] + face[0] * 0.06}
          cy={head[1] + face[1] * 0.06}
          r={0.14}
          fill="url(#phone-glow)"
          opacity={st.phone}
        />
      ) : null}
      {drawLeg(legN, false, "ln")}
      {drawArm(handN, false, "an")}
      {st.phone > 0.02 ? (
        <g opacity={st.phone}>
          <rect
            x={phoneAt[0] - 0.035}
            y={phoneAt[1] - 0.055}
            width={0.07}
            height={0.11}
            rx={0.012}
            fill="#0E0F11"
            transform={`rotate(${faceDeg + 90} ${phoneAt[0]} ${phoneAt[1]})`}
          />
          <rect
            x={phoneAt[0] - 0.026}
            y={phoneAt[1] - 0.045}
            width={0.052}
            height={0.09}
            rx={0.008}
            fill={SCREEN}
            opacity={0.9}
            transform={`rotate(${faceDeg + 90} ${phoneAt[0]} ${phoneAt[1]})`}
          />
        </g>
      ) : null}
    </g>
  );
};

/* ----------------------------------------------------------------- room */

const Room: React.FC<{ cam: Cam; t: number }> = ({ cam, t }) => {
  const k = sc(cam, WALL_Z);
  const minutes = ((t % 3600) / 3600) * 360;
  const hours = (((18 + t / 3600) % 12) / 12) * 360;
  const cx = sx(cam, 0.2, WALL_Z);
  const cy = sy(cam, 2.62, WALL_Z);
  const r = 0.26 * k;
  return (
    <g>
      <polygon
        points={quad(cam, [
          [-8, WALL_Z, 0],
          [8, WALL_Z, 0],
          [8, WALL_Z, 4.5],
          [-8, WALL_Z, 4.5],
        ])}
        fill="url(#wall)"
      />
      {Array.from({ length: 17 }, (_, i) => 0.25 + i * 0.25).map((h) => (
        <line
          key={`c${h}`}
          x1={sx(cam, -8, WALL_Z)}
          x2={sx(cam, 8, WALL_Z)}
          y1={sy(cam, h, WALL_Z)}
          y2={sy(cam, h, WALL_Z)}
          stroke="#000"
          strokeOpacity={0.15}
          strokeWidth={0.8}
        />
      ))}
      {/* The mirror, with the lamps caught in it. */}
      <polygon
        points={quad(cam, [
          [-2.5, WALL_Z - 0.02, 0.35],
          [2.85, WALL_Z - 0.02, 0.35],
          [2.85, WALL_Z - 0.02, 2.15],
          [-2.5, WALL_Z - 0.02, 2.15],
        ])}
        fill="url(#mirror)"
        stroke="#4A4F56"
        strokeWidth={1.4}
      />
      {[-1.7, 0.2, 1.9].map((X, i) => (
        <polygon
          key={`sh${X}`}
          points={quad(cam, [
            [X, WALL_Z - 0.02, 0.35],
            [X + 0.35, WALL_Z - 0.02, 0.35],
            [X + 0.9, WALL_Z - 0.02, 2.15],
            [X + 0.55, WALL_Z - 0.02, 2.15],
          ])}
          fill="#FFFFFF"
          opacity={0.03 + 0.01 * i}
        />
      ))}
      {/* Doors, lit from the corridor. */}
      {[DOOR_IN.X, DOOR_OUT.X].map((X) => (
        <g key={`door${X}`}>
          <polygon
            points={quad(cam, [
              [X - 0.5, WALL_Z, 0],
              [X + 0.5, WALL_Z, 0],
              [X + 0.5, WALL_Z, 2.2],
              [X - 0.5, WALL_Z, 2.2],
            ])}
            fill="url(#doorway)"
          />
          <polygon
            points={quad(cam, [
              [X - 0.56, WALL_Z - 0.01, 0],
              [X + 0.56, WALL_Z - 0.01, 0],
              [X + 0.56, WALL_Z - 0.01, 2.26],
              [X - 0.56, WALL_Z - 0.01, 2.26],
            ])}
            fill="none"
            stroke="#3A3530"
            strokeWidth={2}
          />
        </g>
      ))}
      {/* The clock, running with the model. */}
      <circle cx={cx} cy={cy} r={r * 1.12} fill="#0E0F11" />
      <circle cx={cx} cy={cy} r={r} fill="#E9E4D8" opacity={0.92} />
      {Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2).map((a) => (
        <line
          key={`tick${a}`}
          x1={cx + Math.sin(a) * r * 0.78}
          y1={cy - Math.cos(a) * r * 0.78}
          x2={cx + Math.sin(a) * r * 0.92}
          y2={cy - Math.cos(a) * r * 0.92}
          stroke="#1A1B1F"
          strokeWidth={1}
        />
      ))}
      <line
        x1={cx}
        y1={cy}
        x2={cx + Math.sin((hours * Math.PI) / 180) * r * 0.5}
        y2={cy - Math.cos((hours * Math.PI) / 180) * r * 0.5}
        stroke="#121316"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <line
        x1={cx}
        y1={cy}
        x2={cx + Math.sin((minutes * Math.PI) / 180) * r * 0.8}
        y2={cy - Math.cos((minutes * Math.PI) / 180) * r * 0.8}
        stroke="#121316"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      {/* Dumbbells on a two-tier rack along the mirror. */}
      {[0.42, 0.74].map((h) => (
        <g key={`tier${h}`}>
          <polygon
            points={quad(cam, [
              [-2.3, 6.0, h - 0.04],
              [-0.3, 6.0, h - 0.04],
              [-0.3, 6.0, h],
              [-2.3, 6.0, h],
            ])}
            fill={STEEL_DARK}
          />
          {Array.from({ length: 9 }, (_, i) => -2.18 + i * 0.22).map((X, i) => {
            const size = 0.08 + 0.01 * i * (h > 0.5 ? 0.6 : 1);
            const kk = sc(cam, 5.95);
            return (
              <g key={`db${X}`}>
                {[-0.07, 0.04].map((o) => (
                  <rect
                    key={o}
                    x={sx(cam, X + o, 5.95)}
                    y={sy(cam, h + size, 5.95)}
                    width={0.045 * kk}
                    height={size * kk}
                    rx={0.01 * kk}
                    fill="#17181B"
                  />
                ))}
              </g>
            );
          })}
        </g>
      ))}
      {[-2.28, -0.32].map((X) => (
        <line
          key={`leg${X}`}
          x1={sx(cam, X, 6.0)}
          x2={sx(cam, X, 6.0)}
          y1={sy(cam, 0, 6.0)}
          y2={sy(cam, 0.74, 6.0)}
          stroke={STEEL_DARK}
          strokeWidth={2}
        />
      ))}
      {/* Kettlebells along the wall. */}
      {[0.6, 0.95, 1.3, 1.65].map((X) => (
        <g key={`kb${X}`}>
          <circle
            cx={sx(cam, X, 6.0)}
            cy={sy(cam, 0.13, 6.0)}
            r={0.13 * sc(cam, 6.0)}
            fill="#17181B"
          />
          <path
            d={`M ${sx(cam, X - 0.07, 6.0)} ${sy(cam, 0.22, 6.0)} Q ${sx(cam, X, 6.0)} ${sy(cam, 0.42, 6.0)} ${sx(cam, X + 0.07, 6.0)} ${sy(cam, 0.22, 6.0)}`}
            stroke="#17181B"
            strokeWidth={0.035 * sc(cam, 6.0)}
            fill="none"
          />
        </g>
      ))}
      {[-2.0, 2.2].map((X) => (
        <ellipse
          key={`wash${X}`}
          cx={sx(cam, X, WALL_Z)}
          cy={sy(cam, 2.5, WALL_Z)}
          rx={1.4 * k}
          ry={1.4 * k}
          fill="url(#wash)"
        />
      ))}
    </g>
  );
};

const Floor: React.FC<{ cam: Cam }> = ({ cam }) => (
  <g>
    <polygon
      points={quad(cam, [
        [-8, 0.5, 0],
        [8, 0.5, 0],
        [8, WALL_Z, 0],
        [-8, WALL_Z, 0],
      ])}
      fill="url(#floor)"
    />
    {Array.from({ length: 17 }, (_, i) => -8 + i).map((X) => (
      <line
        key={`fx${X}`}
        x1={sx(cam, X, 0.5)}
        y1={sy(cam, 0, 0.5)}
        x2={sx(cam, X, WALL_Z)}
        y2={sy(cam, 0, WALL_Z)}
        stroke="#000"
        strokeOpacity={0.3}
        strokeWidth={1}
      />
    ))}
    {[1, 2, 3, 4, 5, 6].map((Z) => (
      <line
        key={`fz${Z}`}
        x1={sx(cam, -8, Z)}
        y1={sy(cam, 0, Z)}
        x2={sx(cam, 8, Z)}
        y2={sy(cam, 0, Z)}
        stroke="#000"
        strokeOpacity={0.3}
        strokeWidth={1}
      />
    ))}
    {/* The platform mat under the bench. */}
    <polygon
      points={quad(cam, [
        [-1.15, BZ - 1.15, 0.004],
        [1.35, BZ - 1.15, 0.004],
        [1.35, BZ + 1.15, 0.004],
        [-1.15, BZ + 1.15, 0.004],
      ])}
      fill="#1E1F22"
      stroke="#2E3035"
      strokeWidth={1.2}
    />
  </g>
);

const LAMPS = [
  { X: 0.1, Z: BZ, h: 3.1 },
  { X: -2.2, Z: BZ + 1.6, h: 3.0 },
  { X: 2.5, Z: BZ + 1.6, h: 3.0 },
];
const Pools: React.FC<{ cam: Cam }> = ({ cam }) => (
  <g>
    {LAMPS.map((p, i) => (
      <ellipse
        key={`pool${p.X}`}
        cx={sx(cam, p.X, p.Z)}
        cy={sy(cam, 0, p.Z)}
        rx={(i === 0 ? 1.8 : 1.4) * sc(cam, p.Z)}
        ry={(i === 0 ? 0.9 : 0.6) * sc(cam, p.Z)}
        fill="url(#pool)"
        opacity={i === 0 ? 1.3 : 0.8}
      />
    ))}
  </g>
);
const Lamps: React.FC<{ cam: Cam; frame: number }> = ({ cam, frame }) => (
  <g>
    {LAMPS.map((p) => {
      const k = sc(cam, p.Z);
      const x = sx(cam, p.X, p.Z);
      const y = sy(cam, p.h, p.Z);
      return (
        <g key={`lamp${p.X}`}>
          <polygon
            points={`${x - 0.22 * k},${y} ${x + 0.22 * k},${y} ${x + 1.3 * k},${sy(cam, 0, p.Z)} ${x - 1.3 * k},${sy(cam, 0, p.Z)}`}
            fill="url(#cone)"
          />
          <line
            x1={x}
            x2={x}
            y1={-10}
            y2={y - 0.2 * k}
            stroke="#2E3036"
            strokeWidth={1.2}
          />
          <path
            d={`M ${x - 0.25 * k} ${y} Q ${x} ${y - 0.32 * k} ${x + 0.25 * k} ${y} Z`}
            fill="#1E1F23"
          />
          <ellipse cx={x} cy={y} rx={0.22 * k} ry={0.045 * k} fill={LAMP} />
          {Array.from({ length: 6 }, (_, i) => {
            const u = (((frame * 0.004 + i * 0.167 + p.X * 0.1) % 1) + 1) % 1;
            const h = p.h - 0.2 - u * 2.4;
            const dx = (0.2 + u) * Math.sin(i * 2.3 + frame * 0.01);
            return (
              <circle
                key={`dust${i}`}
                cx={x + dx * k}
                cy={sy(cam, h, p.Z)}
                r={Math.max(0.6, 0.011 * k)}
                fill={LAMP}
                opacity={0.3 * Math.sin(Math.PI * u)}
              />
            );
          })}
        </g>
      );
    })}
  </g>
);

/** One upright of the rack, with its hook. */
const Upright: React.FC<{ cam: Cam; Z: number }> = ({ cam, Z }) => (
  <g>
    <polygon
      points={quad(cam, [
        [RACK_X - 0.35, Z, 0],
        [RACK_X + 0.3, Z, 0],
        [RACK_X + 0.3, Z, 0.05],
        [RACK_X - 0.35, Z, 0.05],
      ])}
      fill={STEEL_DARK}
    />
    <polygon
      points={quad(cam, [
        [RACK_X - 0.03, Z, 0],
        [RACK_X + 0.03, Z, 0],
        [RACK_X + 0.03, Z, 1.5],
        [RACK_X - 0.03, Z, 1.5],
      ])}
      fill={STEEL_DARK}
    />
    <polygon
      points={quad(cam, [
        [RACK_X - 0.03, Z, 0],
        [RACK_X - 0.012, Z, 0],
        [RACK_X - 0.012, Z, 1.5],
        [RACK_X - 0.03, Z, 1.5],
      ])}
      fill={STEEL}
      opacity={0.5}
    />
    <path
      d={`M ${sx(cam, RACK_X, Z)} ${sy(cam, 1.09, Z)} L ${sx(cam, RACK_X - 0.13, Z)} ${sy(cam, 1.09, Z)} L ${sx(cam, RACK_X - 0.13, Z)} ${sy(cam, 1.15, Z)}`}
      stroke={STEEL}
      strokeWidth={2.5}
      fill="none"
    />
  </g>
);

/** The bench: a padded top on a steel frame, running along X. */
const Bench: React.FC<{ cam: Cam }> = ({ cam }) => (
  <g>
    {[FOOT_X + 0.12, HEAD_X - 0.12].map((X) => (
      <g key={`bl${X}`}>
        <polygon
          points={quad(cam, [
            [X - 0.03, BZ, 0],
            [X + 0.03, BZ, 0],
            [X + 0.03, BZ, PAD_H - 0.08],
            [X - 0.03, BZ, PAD_H - 0.08],
          ])}
          fill={STEEL_DARK}
        />
        <polygon
          points={quad(cam, [
            [X - 0.03, BZ - 0.2, 0.03],
            [X + 0.03, BZ - 0.2, 0.03],
            [X + 0.03, BZ + 0.2, 0.03],
            [X - 0.03, BZ + 0.2, 0.03],
          ])}
          fill={STEEL_DARK}
          stroke={STEEL_DARK}
          strokeWidth={3}
        />
      </g>
    ))}
    <polygon
      points={quad(cam, [
        [FOOT_X, BZ - 0.15, PAD_H],
        [HEAD_X, BZ - 0.15, PAD_H],
        [HEAD_X, BZ + 0.15, PAD_H],
        [FOOT_X, BZ + 0.15, PAD_H],
      ])}
      fill="#26262B"
    />
    <polygon
      points={quad(cam, [
        [FOOT_X, BZ - 0.15, PAD_H - 0.08],
        [HEAD_X, BZ - 0.15, PAD_H - 0.08],
        [HEAD_X, BZ - 0.15, PAD_H],
        [FOOT_X, BZ - 0.15, PAD_H],
      ])}
      fill={LEATHER}
    />
    <polygon
      points={quad(cam, [
        [FOOT_X + 0.05, BZ - 0.151, PAD_H - 0.012],
        [HEAD_X - 0.05, BZ - 0.151, PAD_H - 0.012],
        [HEAD_X - 0.05, BZ - 0.151, PAD_H - 0.022],
        [FOOT_X + 0.05, BZ - 0.151, PAD_H - 0.022],
      ])}
      fill="#FFFFFF"
      opacity={0.08}
    />
  </g>
);

/** A plate on the bar's sleeve, face on: rubber, a ring, the steel hub. */
const Plate: React.FC<{ cam: Cam; bar: Bar; Z: number }> = ({
  cam,
  bar,
  Z,
}) => {
  const k = sc(cam, Z);
  const x = sx(cam, bar.X, Z);
  const y = sy(cam, bar.h, Z);
  const r = bar.plate * k;
  return (
    <g>
      <circle
        cx={x + 0.03 * k * Math.sign(bar.X - 0.2)}
        cy={y}
        r={r}
        fill="#0E0F11"
      />
      <circle cx={x} cy={y} r={r} fill="url(#plate)" />
      <circle
        cx={x}
        cy={y}
        r={r * 0.72}
        fill="none"
        stroke="#3A3D42"
        strokeWidth={Math.max(1, 0.012 * k)}
      />
      <circle cx={x} cy={y} r={0.03 * k} fill={STEEL} />
    </g>
  );
};

/** The bar between its plates, seen almost end on. */
const BarLine: React.FC<{ cam: Cam; bar: Bar }> = ({ cam, bar }) => (
  <line
    x1={sx(cam, bar.X, BZ - 1.1)}
    y1={sy(cam, bar.h, BZ - 1.1)}
    x2={sx(cam, bar.X, BZ + 1.1)}
    y2={sy(cam, bar.h, BZ + 1.1)}
    stroke={STEEL}
    strokeWidth={Math.max(2.5, 0.03 * sc(cam, BZ))}
    strokeLinecap="round"
  />
);

/** A small chalk tag over something on the floor. */
const Tag: React.FC<{
  x: number;
  y: number;
  text: string;
  opacity: number;
}> = ({ x, y, text, opacity }) =>
  opacity > 0.01 ? (
    <g opacity={opacity}>
      <rect
        x={x - text.length * 6.2 - 12}
        y={y - 22}
        width={text.length * 12.4 + 24}
        height={30}
        rx={6}
        fill="#0B0C0F"
        opacity={0.82}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fontFamily={theme.monoFamily}
        fontSize={18}
        fontWeight={700}
        letterSpacing="0.1em"
        fill={theme.colors.chalk}
      >
        {text}
      </text>
    </g>
  ) : null;

/** Out-of-focus things nearest the lens. */
const Foreground: React.FC<{ cam: Cam }> = ({ cam }) => (
  <g filter="url(#dof)" opacity={0.9}>
    <circle
      cx={sx(cam, -2.5, 0.9)}
      cy={sy(cam, 0.15, 0.9)}
      r={0.16 * sc(cam, 0.9)}
      fill="#111214"
    />
    <path
      d={`M ${sx(cam, -2.62, 0.9)} ${sy(cam, 0.26, 0.9)} Q ${sx(cam, -2.5, 0.9)} ${sy(cam, 0.5, 0.9)} ${sx(cam, -2.38, 0.9)} ${sy(cam, 0.26, 0.9)}`}
      stroke="#111214"
      strokeWidth={0.045 * sc(cam, 0.9)}
      fill="none"
    />
  </g>
);

/* ---------------------------------------------------------------- panel */

const smoothOver = (frame: number, value: (f: number) => number, n = 8) => {
  let sum = 0;
  for (let j = 0; j < n; j++) sum += value(frame - j);
  return sum / n;
};
const someone = (rule: Rule, frame: number, kind: State["kind"]) => {
  for (const l of RUNS[rule]) {
    const st = stateAt(rule, l.id, frame);
    if (
      st &&
      st.kind === kind &&
      (kind !== "sit" || st.rig.hipH < 0.7) &&
      (kind !== "plates" || st.reach > 0.5)
    )
      return st;
  }
  return null;
};

const Panel: React.FC<{ rule: Rule; top: number; frame: number }> = ({
  rule,
  top,
  frame,
}) => {
  const cam = camAt(frame);
  const t = simAt(frame);
  const bar = barAt(rule, frame);
  type Item = { Z: number; node: React.ReactNode };
  const items: Item[] = [
    {
      Z: BZ + PLATE_DZ,
      node: <Plate key="pf" cam={cam} bar={bar} Z={BZ + PLATE_DZ} />,
    },
    { Z: BZ + RACK_DZ, node: <Upright key="uf" cam={cam} Z={BZ + RACK_DZ} /> },
    { Z: BZ + 0.02, node: <Bench key="bench" cam={cam} /> },
    { Z: BZ - 0.01, node: <BarLine key="bar" cam={cam} bar={bar} /> },
    { Z: BZ - RACK_DZ, node: <Upright key="un" cam={cam} Z={BZ - RACK_DZ} /> },
    {
      Z: BZ - PLATE_DZ + 0.01,
      node: <Plate key="pn" cam={cam} bar={bar} Z={BZ - PLATE_DZ} />,
    },
  ];
  const labels: { x: number; y: number }[] = [];
  RUNS[rule].forEach((l) => {
    const st = stateAt(rule, l.id, frame);
    if (!st) return;
    const you = l.id === YOU;
    const look = lookOf(l.id, you);
    items.push({
      Z: st.Z,
      node: (
        <Person
          key={`p${l.id}`}
          cam={cam}
          st={st}
          look={look}
          bar={bar}
          frame={frame}
        />
      ),
    });
    if (you) {
      const h = headOnScreen(cam, st, look);
      // Over the head, and clear of the bar and its plate when lying.
      const plateTop =
        sy(cam, bar.h, BZ - PLATE_DZ) - bar.plate * sc(cam, BZ - PLATE_DZ);
      const y = h.y - 0.24 * sc(cam, st.Z);
      labels.push({
        x: h.x,
        y: st.rig.hipH < 0.8 && st.onBar > 0.1 ? Math.min(y, plateTop - 8) : y,
      });
    }
  });
  items.sort((a, b) => b.Z - a.Z);
  const window = interpolate(
    frame,
    [150, 162, VERDICT_FROM - 8, VERDICT_FROM],
    [0, 1, 1, 0],
    clamp,
  );
  const sitter = rule === "keep" ? someone(rule, frame, "sit") : null;
  const idle =
    rule === "keep"
      ? smoothOver(frame, (f) => (someone(rule, f, "sit") ? 1 : 0)) * window
      : 0;
  const changer = rule === "share" ? someone(rule, frame, "plates") : null;
  const change =
    rule === "share"
      ? smoothOver(frame, (f) => (someone(rule, f, "plates") ? 1 : 0), 6) *
        window
      : 0;
  return (
    <g transform={`translate(${LEFT} ${top})`}>
      <defs>
        <clipPath id={`${rule}-clip`}>
          <rect x={0} y={0} width={W} height={H} rx={14} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${rule}-clip)`}>
        <rect x={0} y={0} width={W} height={H} fill={WALL} />
        <Room cam={cam} t={t} />
        <Floor cam={cam} />
        <Pools cam={cam} />
        {items.map((it) => it.node)}
        <ellipse
          cx={sx(cam, 0.1, BZ)}
          cy={sy(cam, 0.8, BZ)}
          rx={2.0 * sc(cam, BZ)}
          ry={1.3 * sc(cam, BZ)}
          fill="url(#key)"
          style={{ mixBlendMode: "screen" }}
        />
        <Lamps cam={cam} frame={frame} />
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
          opacity={0.05}
        />
        {labels.map((p) => (
          <text
            key="you"
            x={p.x}
            y={p.y}
            textAnchor="middle"
            fontFamily={theme.monoFamily}
            fontSize={20}
            fontWeight={700}
            letterSpacing="0.12em"
            fill={ACCENT}
          >
            YOU
          </text>
        ))}
        <Tag
          x={sx(cam, -0.3, BZ)}
          y={sy(cam, 1.62, BZ)}
          text="BENCH IDLE"
          opacity={sitter ? idle : 0}
        />
        <Tag
          x={changer ? sx(cam, changer.X, changer.Z) : 0}
          y={changer ? sy(cam, 2.1, changer.Z) : 0}
          text="PLATE CHANGE"
          opacity={changer ? change : 0}
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

/** What you are doing, and how long since you walked in, from the model. */
const yourClock = (rule: Rule, t: number) => {
  const l: Lifter = RUNS[rule][YOU];
  const clock = Math.max(0, Math.min(t, l.done) - l.arrive);
  if (t < l.arrive + 8) return { word: "walking in", clock };
  const first = l.sets[0];
  if (t < first.swap) return { word: "waiting", clock };
  for (const s of l.sets) {
    if (t >= s.swap && t < s.lift) return { word: "changing plates", clock };
    if (t >= s.lift && t < s.end) return { word: "lifting", clock };
  }
  return { word: "resting", clock };
};

export const Gym: React.FC = () => {
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
            <stop offset="0" stopColor="#100E0C" />
            <stop offset="0.6" stopColor={WALL_LIT} />
            <stop offset="1" stopColor={WALL} />
          </linearGradient>
          <linearGradient id="mirror" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#27303A" />
            <stop offset="0.5" stopColor="#1B232B" />
            <stop offset="1" stopColor="#11161B" />
          </linearGradient>
          <linearGradient id="doorway" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#6A533B" />
            <stop offset="1" stopColor="#2E241B" />
          </linearGradient>
          <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#201D1B" />
            <stop offset="1" stopColor="#0F0F10" />
          </linearGradient>
          <radialGradient id="plate" cx="0.4" cy="0.35" r="0.7">
            <stop offset="0" stopColor="#2C2E33" />
            <stop offset="1" stopColor="#141518" />
          </radialGradient>
          <radialGradient id="pool" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={LAMP} stopOpacity={0.3} />
            <stop offset="0.6" stopColor={LAMP} stopOpacity={0.07} />
            <stop offset="1" stopColor={LAMP} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="key" cx="0.5" cy="0.45" r="0.5">
            <stop offset="0" stopColor={LAMP} stopOpacity={0.2} />
            <stop offset="0.6" stopColor={LAMP} stopOpacity={0.05} />
            <stop offset="1" stopColor={LAMP} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="wash" cx="0.5" cy="0.3" r="0.5">
            <stop offset="0" stopColor={LAMP} stopOpacity={0.12} />
            <stop offset="1" stopColor={LAMP} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="cone" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={LAMP} stopOpacity={0.14} />
            <stop offset="1" stopColor={LAMP} stopOpacity={0.01} />
          </linearGradient>
          <radialGradient id="phone-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={SCREEN} stopOpacity={0.45} />
            <stop offset="1" stopColor={SCREEN} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="contact" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#000" stopOpacity={0.55} />
            <stop offset="1" stopColor="#000" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="grade" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#2E5A6B" stopOpacity={0.5} />
            <stop offset="0.5" stopColor="#FFB070" stopOpacity={0.25} />
            <stop offset="1" stopColor="#24485A" stopOpacity={0.5} />
          </linearGradient>
          <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.55" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.55} />
          </radialGradient>
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
        const name = p.rule === "share" ? named : 0;
        const verdict = frame >= VERDICT_FROM;
        const word = verdict ? "your turn at" : now.word;
        const clock = verdict ? HERO[p.rule].wait : now.clock;
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
                  whiteSpace: "nowrap",
                  opacity: 1 - name,
                }}
              >
                {p.label}
              </div>
              {p.rule === "share" ? (
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
                  Multitasking
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
              {word}{" "}
              <span style={{ fontSize: 34, fontWeight: 700, color: ACCENT }}>
                {mmss(clock)}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
};
