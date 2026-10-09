import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { Provenance } from "../../shared/vertical/type";
import { clamp } from "../../shared/video/timing";
import { VERDICT_FROM, simAt } from "./beats";
import { CONDITIONS } from "./measurements";
import { RUNS } from "./runs";
import {
  STEP,
  WALK_IN,
  WALK_OUT,
  tally,
  type Placed,
  type Rule,
} from "./simulation";

/**
 * Two station corridors, side by side, seen down their length from a camera
 * high on the wall, so the person walking towards you shows over the
 * shoulder of the one walking away. The same people meet in both, in the
 * same order, with the same reactions; on the left, after a bump, both step
 * again the moment they have reacted; on the right, each waits a random
 * moment first.
 *
 * Orange is one thing: a bump, two people stopped face to face on the same
 * side. The dance is the orange coming back again and again at the same spot.
 */

export const HEADLINE_TOP = 256;
const PROVENANCE_TOP = 430;
const PANEL_W = 370;
const SCENE_H = 740;
const LABEL_TOP = 462;
const COUNT_TOP = 494;
const SCENE_TOP = 536;
const PANELS: { rule: Rule; label: string; left: number }[] = [
  { rule: "instant", label: "Step again at once", left: 150 },
  { rule: "random", label: "Wait a random beat", left: 560 },
];

/** The camera: looking down the corridor from 2.5 m up. */
const CAM_H = 4.0;
const F = 370;
const HORIZON = 70;
const CX = PANEL_W / 2;
const HALF = 1.55;
const CEILING = 2.9;
const k = (z: number) => F / z;
const sx = (x: number, z: number) => CX + x * k(z);
const sy = (h: number, z: number) => HORIZON + (CAM_H - h) * k(z);

/** Where each pair meets: distance down the corridor, and its lane. */
const SPOT_AT = [{ z: 3.0, x: 0 }];
const SIDESTEP = 0.5;
const GAP_Z = 0.55;
const WALK_FROM = 2.2;

const SKIN = ["#E3C7A8", "#C9A88A", "#A57E62", "#8D6A52", "#6B4E3A", "#D8B595"];
const HAIR = ["#1E1A17", "#3B2A20", "#5A4632", "#2A2724", "#8C7B6A", "#141210"];
/** Muted everyday clothes, kept off orange, which here means a bump. */
const TOPS = [
  "#2E3A55",
  "#4A5236",
  "#5A2A33",
  "#8A7457",
  "#3E4C63",
  "#5A5F69",
  "#2B2F37",
  "#7D8089",
];
const TROUSERS = ["#1E2230", "#2A2C31", "#3E4C63", "#5C5446", "#17181B"];
const pick = <T,>(xs: readonly T[], n: number) => xs[Math.abs(n) % xs.length];

const ease = (u: number) => u * u * (3 - 2 * u);

/** Lateral position at time t of someone stepping at the given rounds. */
const lateralAt = (e: Placed, who: "a" | "b", base: number, t: number) => {
  let x = 0;
  for (const r of e.rounds) {
    const start = e.meet + r[who];
    const to = (who === "a" ? r.sideA : r.sideB) * SIDESTEP;
    if (t < start) break;
    const u = Math.min(1, (t - start) / STEP);
    x = x + (to - x) * ease(u);
  }
  return base + x;
};

type Body = {
  key: string;
  x: number;
  z: number;
  facing: "toward" | "away";
  seed: number;
  stride: number | null;
};

/** Both people of one encounter at time t, or nothing if it is not on. */
const pairAt = (e: Placed, spot: number, n: number, t: number): Body[] => {
  const { z: zc, x: lane } = SPOT_AT[spot];
  const end = e.passed + WALK_OUT;
  if (t < e.start || t > end) return [];
  const speed = (WALK_FROM - GAP_Z) / WALK_IN;
  let za: number;
  let zb: number;
  let walking: boolean;
  if (t < e.meet) {
    const u = (t - e.start) / WALK_IN;
    za = zc - WALK_FROM + (WALK_FROM - GAP_Z) * u;
    zb = zc + WALK_FROM - (WALK_FROM - GAP_Z) * u;
    walking = true;
  } else if (t < e.passed - STEP * 0.5) {
    za = zc - GAP_Z;
    zb = zc + GAP_Z;
    walking = false;
  } else {
    const d = Math.max(0, t - (e.passed - STEP * 0.5)) * speed * 1.1;
    za = zc - GAP_Z + d;
    zb = zc + GAP_Z - d;
    walking = true;
  }
  const phase = (z: number) => (walking ? z * 5.5 : null);
  return [
    {
      key: `${spot}-${n}-a`,
      x: lateralAt(e, "a", lane, t),
      z: za,
      facing: "away",
      seed: spot * 17 + n * 5 + 1,
      stride: phase(za),
    },
    {
      key: `${spot}-${n}-b`,
      x: lateralAt(e, "b", lane, t),
      z: zb,
      facing: "toward",
      seed: spot * 17 + n * 5 + 3,
      stride: phase(-zb),
    },
  ];
};

/** A person, feet at (x, z) on the floor, scaled by perspective. */
const Person: React.FC<Body> = ({ x, z, facing, seed, stride }) => {
  const s = k(z);
  const top = pick(TOPS, seed * 7 + 2);
  const skin = pick(SKIN, seed * 5 + 1);
  const hair = pick(HAIR, seed * 3 + 2);
  const trousers = pick(TROUSERS, seed * 3 + 1);
  const height = 0.93 + ((seed * 37) % 13) / 100;
  const build = 0.92 + ((seed * 53) % 18) / 100;
  const bag = seed % 3 === 0;
  const fwd = stride !== null ? Math.sin(stride) : 0;
  const bob = stride !== null ? 0.02 * Math.abs(Math.cos(stride)) : 0;
  const w = build;
  const torso = `M ${-0.21 * w} -0.82 L ${-0.24 * w} -1.38 Q ${-0.24 * w} -1.47 ${-0.15 * w} -1.48 L ${0.15 * w} -1.48 Q ${0.24 * w} -1.47 ${0.24 * w} -1.38 L ${0.21 * w} -0.82 Z`;
  const leg = (hipX: number, f: number) => {
    const lift = Math.max(0, f) * 0.08;
    return (
      <g key={hipX}>
        <path
          d={`M ${hipX - 0.065} -0.86 L ${hipX + 0.065} -0.86 L ${hipX + 0.058} ${-0.06 - lift} L ${hipX - 0.058} ${-0.06 - lift} Z`}
          fill={trousers}
        />
        <ellipse
          cx={hipX}
          cy={-0.03 - lift}
          rx={0.075}
          ry={0.035}
          fill="#0B0C0F"
        />
      </g>
    );
  };
  return (
    <g transform={`translate(${sx(x, z)} ${sy(0, z)}) scale(${s * height})`}>
      <ellipse cx={0} cy={0} rx={0.3} ry={0.06} fill="#000" opacity={0.4} />
      {leg(-0.075, fwd)}
      {leg(0.075, -fwd)}
      <g transform={`translate(0 ${-bob})`}>
        {facing === "toward" && bag ? (
          <rect
            x={0.2 * w}
            y={-1.0}
            width={0.12}
            height={0.2}
            rx={0.03}
            fill="#2A2C31"
          />
        ) : null}
        <path d={torso} fill={top} />
        <path d={torso} fill="url(#torso-shade)" />
        <rect
          x={-0.3 * w}
          y={-1.42 + 0.05 * fwd}
          width={0.08}
          height={0.56}
          rx={0.04}
          fill={top}
        />
        <rect
          x={0.22 * w}
          y={-1.42 - 0.05 * fwd}
          width={0.08}
          height={0.56}
          rx={0.04}
          fill={top}
        />
        {facing === "away" && bag ? (
          <rect
            x={-0.16}
            y={-1.42}
            width={0.32}
            height={0.36}
            rx={0.06}
            fill="#2A2C31"
          />
        ) : null}
        <rect x={-0.045} y={-1.56} width={0.09} height={0.1} fill={skin} />
        <ellipse cx={0} cy={-1.64} rx={0.1} ry={0.12} fill={skin} />
        {facing === "away" ? (
          <ellipse cx={0} cy={-1.66} rx={0.105} ry={0.12} fill={hair} />
        ) : (
          <>
            <ellipse
              cx={0}
              cy={-1.64}
              rx={0.1}
              ry={0.12}
              fill="url(#face-shade)"
            />
            <path
              d="M -0.105 -1.64 Q -0.11 -1.78 0 -1.78 Q 0.11 -1.78 0.105 -1.64 Q 0.06 -1.71 0 -1.71 Q -0.06 -1.71 -0.105 -1.64 Z"
              fill={hair}
            />
          </>
        )}
      </g>
    </g>
  );
};

/** The orange mark of a bump, between two people stopped face to face. */
const Bump: React.FC<{ x: number; z: number; u: number }> = ({ x, z, u }) => {
  const r = (0.12 + 0.18 * u) * k(z);
  return (
    <g opacity={1 - u}>
      <circle
        cx={sx(x, z)}
        cy={sy(1.2, z)}
        r={r}
        fill="none"
        stroke={ACCENT}
        strokeWidth={Math.max(2, 0.04 * k(z))}
      />
      <circle cx={sx(x, z)} cy={sy(1.2, z)} r={r * 0.35} fill={ACCENT} />
    </g>
  );
};

const Hall: React.FC = () => {
  const far = 60;
  const near = 1.2;
  const poly = (pts: [number, number][]) =>
    pts.map(([a, b]) => `${a},${b}`).join(" ");
  const floor: [number, number][] = [
    [sx(-HALF, near), sy(0, near)],
    [sx(HALF, near), sy(0, near)],
    [sx(HALF, far), sy(0, far)],
    [sx(-HALF, far), sy(0, far)],
  ];
  const wall = (side: number): [number, number][] => [
    [sx(side * HALF, near), sy(0, near)],
    [sx(side * HALF, far), sy(0, far)],
    [sx(side * HALF, far), sy(CEILING, far)],
    [sx(side * HALF, near), sy(CEILING, near)],
  ];
  return (
    <g>
      <rect x={0} y={0} width={PANEL_W} height={SCENE_H} fill="#121317" />
      <polygon points={poly(wall(-1))} fill="#1E1F25" />
      <polygon points={poly(wall(1))} fill="#1A1B21" />
      <polygon points={poly(floor)} fill="#24252B" />
      {/* Floor tiles across, and the joints running away. */}
      {[1.6, 2.4, 3.4, 4.6, 6, 7.6, 9.5, 11.7, 14.5, 18, 23, 30].map((z) => (
        <line
          key={`t${z}`}
          x1={sx(-HALF, z)}
          x2={sx(HALF, z)}
          y1={sy(0, z)}
          y2={sy(0, z)}
          stroke="#1B1C21"
          strokeWidth={1.5}
        />
      ))}
      {[-0.775, 0, 0.775].map((x) => (
        <line
          key={`j${x}`}
          x1={sx(x, near)}
          y1={sy(0, near)}
          x2={sx(x, far)}
          y2={sy(0, far)}
          stroke="#1B1C21"
          strokeWidth={1.5}
        />
      ))}
      {/* Posters along both walls, and a strip of ceiling light. */}
      {[3.2, 6.8, 10.5, 15].map((z) =>
        [-1, 1].map((side) => (
          <polygon
            key={`p${z}${side}`}
            points={poly([
              [sx(side * HALF, z), sy(2.1, z)],
              [sx(side * HALF, z + 1.4), sy(2.1, z + 1.4)],
              [sx(side * HALF, z + 1.4), sy(1.0, z + 1.4)],
              [sx(side * HALF, z), sy(1.0, z)],
            ])}
            fill={side < 0 ? "#2C2E36" : "#30323A"}
            stroke="#3A3D46"
            strokeWidth={1}
          />
        )),
      )}
      {[2, 3.5, 5.5, 8, 11.5, 16, 23].map((z) => (
        <rect
          key={`l${z}`}
          x={sx(-0.12, z)}
          y={sy(CEILING, z) - 1}
          width={0.24 * k(z)}
          height={Math.max(1.5, 0.05 * k(z))}
          fill="#E9E4D8"
          opacity={0.5}
        />
      ))}
      <rect
        x={0}
        y={0}
        width={PANEL_W}
        height={SCENE_H}
        fill="url(#hall-fog)"
      />
    </g>
  );
};

const Panel: React.FC<{ rule: Rule; left: number; frame: number }> = ({
  rule,
  left,
  frame,
}) => {
  const t = simAt(frame);
  const spots = [RUNS[rule]];
  const bodies: Body[] = [];
  const bumps: { x: number; z: number; u: number; key: string }[] = [];
  spots.forEach((list, spot) =>
    list.forEach((e) => {
      const n = e.index;
      bodies.push(...pairAt(e, spot, n, t));
      for (const r of e.rounds) {
        if (!r.collided) continue;
        const at = e.meet + r.end;
        const u = (t - at) / 0.5;
        if (u >= 0 && u < 1)
          bumps.push({
            x: SPOT_AT[spot].x + r.sideA * SIDESTEP,
            z: SPOT_AT[spot].z,
            u,
            key: `${spot}-${n}-${at}`,
          });
      }
    }),
  );
  bodies.sort((a, b) => b.z - a.z);
  return (
    <g transform={`translate(${left} ${SCENE_TOP})`}>
      <defs>
        <clipPath id={`${rule}-clip`}>
          <rect x={0} y={0} width={PANEL_W} height={SCENE_H} rx={12} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${rule}-clip)`}>
        <Hall />
        {bodies.map((b) => (
          <Person {...b} key={b.key} />
        ))}
        {bumps.map((b) => (
          <Bump key={b.key} x={b.x} z={b.z} u={b.u} />
        ))}
      </g>
    </g>
  );
};

export const Corridor: React.FC = () => {
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
          <linearGradient id="torso-shade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity={0.1} />
            <stop offset="0.45" stopColor="#fff" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.35} />
          </linearGradient>
          <radialGradient id="face-shade" cx="0.35" cy="0.35" r="0.8">
            <stop offset="0.5" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.3} />
          </radialGradient>
          <linearGradient id="hall-fog" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#0A0B0E" stopOpacity={0.55} />
            <stop offset="0.35" stopColor="#0A0B0E" stopOpacity={0} />
          </linearGradient>
        </defs>
        {PANELS.map((p) => (
          <Panel key={p.rule} rule={p.rule} left={p.left} frame={frame} />
        ))}
      </svg>
      <Provenance top={PROVENANCE_TOP}>{CONDITIONS}</Provenance>
      {PANELS.map((p) => {
        const now = tally(RUNS[p.rule], t);
        const name = p.rule === "random" ? named : 0;
        return (
          <div
            key={p.rule}
            style={{
              position: "absolute",
              top: LABEL_TOP,
              left: p.left,
              width: PANEL_W,
              textAlign: "center",
              color: theme.colors.chalk,
            }}
          >
            <div style={{ position: "relative", height: 30 }}>
              <div
                style={{
                  fontFamily: theme.monoFamily,
                  fontSize: 23,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  opacity: 1 - name,
                }}
              >
                {p.label}
              </div>
              {p.rule === "random" ? (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: -6,
                    fontFamily: theme.fontFamily,
                    fontSize: 46,
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    opacity: name,
                    transform: `translateY(${(1 - name) * 10}px)`,
                  }}
                >
                  Random backoff
                </div>
              ) : null}
            </div>
            <div
              style={{
                marginTop: COUNT_TOP - LABEL_TOP - 30,
                fontFamily: theme.monoFamily,
                fontSize: 19,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: theme.colors.grayDark,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: 34, fontWeight: 700, color: ACCENT }}>
                {now.bumps}
              </span>{" "}
              bumps{"  "}·{"  "}
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: theme.colors.chalk,
                }}
              >
                {now.passed}
              </span>{" "}
              past
            </div>
          </div>
        );
      })}
    </>
  );
};
