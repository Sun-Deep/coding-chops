import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { Provenance } from "../../shared/vertical/type";
import { clamp } from "../../shared/video/timing";
import { VERDICT_FROM, simAt } from "./beats";
import { CONDITIONS, HERO } from "./measurements";
import { RUNS, YOU, carAt } from "./runs";
import { CAR_L, EXIT, SIGN, type Rule } from "./simulation";

/**
 * Two roads at night, side by side, each seen from a camera riding a little
 * above and behind the followed car. The same cars arrive at the same moments
 * on both. On the left the followed car moves over at the sign and joins the
 * back of one long queue, with the ending lane empty beside it; drivers who
 * stay in that lane go past. On the right both lanes queue to the cones and
 * go through one from each lane in turn.
 *
 * Orange is one thing: you. Your car, and what the queue costs you.
 */

export const HEADLINE_TOP = 256;
const PROVENANCE_TOP = 430;
const PANEL_W = 370;
const SCENE_H = 740;
const LABEL_TOP = 462;
const COUNT_TOP = 494;
const SCENE_TOP = 536;
const PANELS: { rule: Rule; label: string; sign: string[]; left: number }[] = [
  {
    rule: "early",
    label: "Move over early",
    sign: ["RIGHT LANE", "ENDS", "MERGE LEFT"],
    left: 150,
  },
  {
    rule: "zipper",
    label: "Use both lanes",
    sign: ["USE BOTH LANES", "TAKE TURNS", "AT THE CONES"],
    left: 560,
  },
];

/** The camera: 7.5 m up, 12 m behind the followed car, on the lane line. */
const CAM_H = 7.5;
const BACK = 12;
const F = 640;
const HORIZON = 160;
const CX = PANEL_W / 2;
const NEAR = 3;
const FAR = 520;
const LANE_W = 3.6;
const EDGE = LANE_W;
const laneX = (lane: number) => -LANE_W / 2 + lane * LANE_W;

type Cam = { xc: number };
const k = (z: number) => F / z;
const sx = (X: number, z: number) => CX + X * k(z);
const sy = (h: number, z: number) => HORIZON + (CAM_H - h) * k(z);
const pt = (X: number, z: number, h: number) =>
  `${sx(X, z).toFixed(1)},${sy(h, z).toFixed(1)}`;

/** Cars nearer than this are below the bottom of the frame. */
const CAR_NEAR = 8;
/**
 * The camera stops following 12 m before the cones, so once you are through
 * it holds on the merge, and the turn about there stays in view.
 */
const FOLLOW_TO = -12;

/** Neutral bodies, silver to graphite, so the orange is only ever you. */
const SHADES = [
  "#C9C6BE",
  "#9EA0A4",
  "#6E7176",
  "#B7B2A6",
  "#54575D",
  "#DAD7CF",
];
const shade = (id: number) => SHADES[(id * 7 + 3) % SHADES.length];
const mix = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (s: number) =>
    Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
  return `rgb(${c(16)},${c(8)},${c(0)})`;
};

const TAIL = "#E0342C";

type Drawn = {
  id: number;
  X: number;
  rear: number;
  v: number;
  a: number;
};

/** A car seen from above and behind: shadow, body, cabin, lights. */
const CarBox: React.FC<{ c: Drawn; cam: Cam; you: boolean }> = ({
  c,
  cam,
  you,
}) => {
  const z0 = c.rear - cam.xc;
  if (z0 < CAR_NEAR || z0 > FAR) return null;
  const body = you ? ACCENT : shade(c.id);
  const fog = Math.max(0, Math.min(1, (z0 - 60) / 260));
  const X = c.X;
  const hw = 0.9;
  const cw = 0.74;
  // Which flank faces the camera.
  const flank = X > 0 ? -1 : 1;
  const P = (u: number, r: number, h: number) => pt(X + u, z0 + r, h);
  const poly = (pts: string[], fill: string, opacity = 1) => (
    <polygon points={pts.join(" ")} fill={fill} opacity={opacity} />
  );
  // Brake lights: full when braking or held at a stop, dim when rolling.
  const brake = c.a < -0.4 || c.v < 0.6 ? 1 : 0.35;
  const s = k(z0);
  const tiny = s * 1.8 < 6;
  const lights = [-1, 1].map((side) => {
    const lx = sx(X + side * 0.68, z0);
    const ly = sy(0.66, z0);
    const r = Math.max(1.4, 0.16 * s);
    return (
      <g key={side}>
        <circle
          cx={lx}
          cy={ly}
          r={r * (2.6 + 2.2 * brake)}
          fill="url(#tail-glow)"
          opacity={0.35 + 0.5 * brake}
        />
        <rect
          x={lx - r * 1.1}
          y={ly - r * 0.45}
          width={r * 2.2}
          height={r * 0.9}
          rx={r * 0.3}
          fill={TAIL}
          opacity={0.55 + 0.45 * brake}
        />
      </g>
    );
  });
  if (tiny) return <g>{lights}</g>;
  return (
    <g>
      {/* Shadow on the road. */}
      {poly(
        [
          P(-hw - 0.15, -0.2, 0),
          P(hw + 0.15, -0.2, 0),
          P(hw + 0.15, 4.7, 0),
          P(-hw - 0.15, 4.7, 0),
        ],
        "#000",
        0.5,
      )}
      <g opacity={1 - 0.75 * fog}>
        {/* Lower body: flank, deck, rear face. */}
        {poly(
          [
            P(flank * hw, 0, 0.28),
            P(flank * hw, CAR_L, 0.28),
            P(flank * hw, CAR_L, 0.8),
            P(flank * hw, 0, 0.8),
          ],
          mix(body, 0.52),
        )}
        {poly(
          [
            P(-hw, 0, 0.8),
            P(hw, 0, 0.8),
            P(hw, CAR_L, 0.8),
            P(-hw, CAR_L, 0.8),
          ],
          mix(body, 0.95),
        )}
        {poly(
          [P(-hw, 0, 0.28), P(hw, 0, 0.28), P(hw, 0, 0.8), P(-hw, 0, 0.8)],
          mix(body, 0.68),
        )}
        {/* Tyres and the dark under the bumper. */}
        {poly(
          [
            P(-hw + 0.04, 0.02, 0.02),
            P(hw - 0.04, 0.02, 0.02),
            P(hw - 0.04, 0.02, 0.28),
            P(-hw + 0.04, 0.02, 0.28),
          ],
          "#0A0B0D",
        )}
        {/* Cabin: flank windows, rear window, roof. */}
        {poly(
          [
            P(flank * hw, 1.0, 0.8),
            P(flank * hw, 3.4, 0.8),
            P(flank * cw, 2.85, 1.38),
            P(flank * cw, 1.55, 1.38),
          ],
          "#14181E",
        )}
        {poly(
          [
            P(-hw + 0.05, 1.0, 0.8),
            P(hw - 0.05, 1.0, 0.8),
            P(cw, 1.55, 1.38),
            P(-cw, 1.55, 1.38),
          ],
          "#0E1116",
        )}
        {poly(
          [
            P(-cw + 0.12, 1.08, 0.88),
            P(cw - 0.12, 1.08, 0.88),
            P(cw - 0.1, 1.2, 1.0),
            P(-cw + 0.1, 1.2, 1.0),
          ],
          "#FFFFFF",
          0.08,
        )}
        {poly(
          [
            P(-cw, 1.55, 1.38),
            P(cw, 1.55, 1.38),
            P(cw, 2.85, 1.38),
            P(-cw, 2.85, 1.38),
          ],
          mix(body, 1.08),
        )}
        {/* Number plate. */}
        {poly(
          [
            P(-0.26, -0.005, 0.36),
            P(0.26, -0.005, 0.36),
            P(0.26, -0.005, 0.5),
            P(-0.26, -0.005, 0.5),
          ],
          "#D8D4C8",
          0.85,
        )}
      </g>
      {lights}
      {you ? (
        <text
          x={sx(X, z0 + 2.2)}
          y={sy(1.38, z0 + 2.2) - Math.max(10, 0.5 * k(z0))}
          textAnchor="middle"
          fontFamily={theme.monoFamily}
          fontSize={Math.max(15, Math.min(24, 0.42 * k(z0)))}
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

/** Light thrown on the road ahead of a car. */
const Beam: React.FC<{ c: Drawn; cam: Cam }> = ({ c, cam }) => {
  if (c.rear - cam.xc < CAR_NEAR) return null;
  const z = c.rear + CAR_L - cam.xc;
  if (z > 160) return null;
  const reach = 6 + Math.min(18, c.v * 1.1);
  const pts = [
    pt(c.X - 0.75, z, 0),
    pt(c.X + 0.75, z, 0),
    pt(c.X + 1.6, z + reach, 0),
    pt(c.X - 1.6, z + reach, 0),
  ].join(" ");
  return <polygon points={pts} fill="url(#beam)" opacity={0.5} />;
};

/** A traffic cone, white with a dark band, here and in the taper. */
const Cone: React.FC<{ X: number; x: number; cam: Cam }> = ({ X, x, cam }) => {
  const z = x - cam.xc;
  if (z < NEAR || z > 320) return null;
  const s = k(z);
  const w = Math.max(1.2, 0.36 * s);
  const h = Math.max(2, 0.75 * s);
  const bx = sx(X, z);
  const by = sy(0, z);
  return (
    <g>
      <path
        d={`M ${bx - w / 2} ${by} L ${bx - w / 7} ${by - h} L ${bx + w / 7} ${by - h} L ${bx + w / 2} ${by} Z`}
        fill={theme.colors.chalk}
        opacity={0.9}
      />
      <rect
        x={bx - w * 0.33}
        y={by - h * 0.55}
        width={w * 0.66}
        height={h * 0.18}
        fill="#2A2C31"
      />
    </g>
  );
};

/** Where the cones stand: the taper across the ending lane, then its edge. */
const CONES: { X: number; x: number }[] = [];
for (let i = 0; i <= 8; i++)
  CONES.push({ X: EDGE - 0.2 - (i / 8) * (EDGE - 0.4), x: -6 + i * 3 });
for (let x = 24 + 6; x < 260; x += 8) CONES.push({ X: 0.2, x });

const Scene: React.FC<{
  sign: string[];
  cam: Cam;
  frame: number;
}> = ({ sign, cam, frame }) => {
  const zOf = (x: number) => x - cam.xc;
  const poly = (pts: string[], fill: string, opacity = 1) => (
    <polygon points={pts.join(" ")} fill={fill} opacity={opacity} />
  );
  const near = NEAR;
  const far = FAR;
  // Dashes along the lane line, fixed to the road so they stream past.
  const dashes: number[] = [];
  for (
    let x = Math.ceil((cam.xc + near) / 12) * 12;
    x < Math.min(-8, cam.xc + far);
    x += 12
  )
    dashes.push(x);
  // Street lights on the median every 50 m.
  const lamps: number[] = [];
  for (let x = Math.ceil((cam.xc + near) / 50) * 50; x < cam.xc + 400; x += 50)
    lamps.push(x);
  const signX = -SIGN;
  const zs = zOf(signX);
  const arrowOn = Math.floor(frame / 9) % 2 === 0;
  const zb = zOf(46);
  return (
    <g>
      <rect x={0} y={0} width={PANEL_W} height={SCENE_H} fill="url(#sky)" />
      {/* City glow and a low skyline on the horizon. */}
      <ellipse cx={CX} cy={HORIZON} rx={260} ry={46} fill="url(#city)" />
      {[
        [-170, 18],
        [-140, 30],
        [-118, 14],
        [-96, 40],
        [-70, 22],
        [-40, 34],
        [60, 26],
        [86, 44],
        [112, 20],
        [140, 32],
        [168, 16],
      ].map(([dx, h]) => (
        <rect
          key={dx}
          x={CX + dx}
          y={HORIZON - h}
          width={20}
          height={h}
          fill="#15171D"
        />
      ))}
      {/* The road, both shoulders, the median wall and the guardrail. */}
      {poly(
        [
          pt(-EDGE - 0.9, near, 0),
          pt(EDGE + 0.9, near, 0),
          pt(EDGE + 0.9, far, 0),
          pt(-EDGE - 0.9, far, 0),
        ],
        "url(#asphalt)",
      )}
      {poly(
        [
          pt(-EDGE - 0.9, near, 0),
          pt(-EDGE - 0.9, far, 0),
          pt(-EDGE - 0.9, far, 0.9),
          pt(-EDGE - 0.9, near, 0.9),
        ],
        "#2A2B30",
      )}
      {poly(
        [
          pt(-EDGE - 0.9, near, 0.9),
          pt(-EDGE - 0.9, far, 0.9),
          pt(-EDGE - 1.3, far, 0.9),
          pt(-EDGE - 1.3, near, 0.9),
        ],
        "#3A3B40",
      )}
      {poly(
        [
          pt(EDGE + 1.0, near, 0.55),
          pt(EDGE + 1.0, far, 0.55),
          pt(EDGE + 1.0, far, 0.75),
          pt(EDGE + 1.0, near, 0.75),
        ],
        "#6B6D72",
        0.8,
      )}
      {/* Edge lines. */}
      {[-EDGE, EDGE].map((X) =>
        poly(
          [
            pt(X - 0.08, near, 0),
            pt(X + 0.08, near, 0),
            pt(X + 0.08, far, 0),
            pt(X - 0.08, far, 0),
          ],
          theme.colors.chalk,
          0.55,
        ),
      )}
      {/* Lane line, dashed, up to the taper. */}
      {dashes.map((x) => {
        const z = zOf(x);
        return (
          <polygon
            key={x}
            points={[
              pt(-0.07, z, 0),
              pt(0.07, z, 0),
              pt(0.07, z + 3, 0),
              pt(-0.07, z + 3, 0),
            ].join(" ")}
            fill={theme.colors.chalk}
            opacity={0.6}
          />
        );
      })}
      {/* Pools of light under the street lights. */}
      {lamps.map((x) => {
        const z = zOf(x);
        if (z < 4) return null;
        return (
          <g key={x}>
            <ellipse
              cx={sx(-0.6, z)}
              cy={sy(0, z)}
              rx={5.2 * k(z)}
              ry={Math.max(1, (5.2 * k(z) * CAM_H) / z)}
              fill="url(#pool)"
            />
          </g>
        );
      })}
      {/* The sign, on the right shoulder. */}
      {zs > NEAR && zs < 420 ? (
        <g>
          <line
            x1={sx(EDGE + 1.8, zs)}
            x2={sx(EDGE + 1.8, zs)}
            y1={sy(0, zs)}
            y2={sy(2.4, zs)}
            stroke="#55575C"
            strokeWidth={Math.max(1, 0.12 * k(zs))}
          />
          <rect
            x={sx(EDGE + 0.4, zs)}
            y={sy(4.6, zs)}
            width={2.8 * k(zs)}
            height={2.2 * k(zs)}
            rx={0.12 * k(zs)}
            fill={theme.colors.chalk}
          />
          {sign.map((line, i) => (
            <text
              key={line}
              x={sx(EDGE + 1.8, zs)}
              y={sy(4.6 - 0.62 - i * 0.62, zs)}
              textAnchor="middle"
              fontFamily={theme.fontFamily}
              fontWeight={800}
              fontSize={0.42 * k(zs)}
              fill="#16181C"
            >
              {line}
            </text>
          ))}
        </g>
      ) : null}
      {/* The flashing arrow board in the closed lane, past the cones. */}
      {zb > NEAR && zb < 500 ? (
        <g>
          <rect
            x={sx(laneX(1) - 1.2, zb)}
            y={sy(2.6, zb)}
            width={2.4 * k(zb)}
            height={1.3 * k(zb)}
            fill="#0C0D10"
            stroke="#3A3C42"
            strokeWidth={Math.max(0.6, 0.05 * k(zb))}
          />
          {arrowOn
            ? [-0.8, -0.5, -0.2, 0.1, 0.4, 0.7, -0.6, -0.6].map((u, i) => {
                const hh = i === 6 ? 2.25 : i === 7 ? 1.65 : 1.95;
                const uu = i >= 6 ? -0.5 : u;
                return (
                  <circle
                    key={i}
                    cx={sx(laneX(1) + uu, zb)}
                    cy={sy(hh, zb)}
                    r={Math.max(0.8, 0.08 * k(zb))}
                    fill={theme.colors.chalk}
                  />
                );
              })
            : null}
          {arrowOn ? (
            <ellipse
              cx={sx(laneX(1), zb)}
              cy={sy(1.95, zb)}
              rx={1.8 * k(zb)}
              ry={1.0 * k(zb)}
              fill="url(#board-glow)"
            />
          ) : null}
        </g>
      ) : null}
    </g>
  );
};

/** Lamp heads drawn over the cars, so near ones overlap the top of frame. */
const Lamps: React.FC<{ cam: Cam }> = ({ cam }) => {
  const out: React.ReactNode[] = [];
  for (let x = Math.ceil((cam.xc + 30) / 50) * 50; x < cam.xc + 400; x += 50) {
    const z = x - cam.xc;
    const X = -EDGE - 1.1;
    out.push(
      <g key={x}>
        <line
          x1={sx(X, z)}
          x2={sx(X, z)}
          y1={sy(0.9, z)}
          y2={sy(10, z)}
          stroke="#3B3D43"
          strokeWidth={Math.max(0.8, 0.14 * k(z))}
        />
        <line
          x1={sx(X, z)}
          x2={sx(X + 2.2, z)}
          y1={sy(10, z)}
          y2={sy(10, z)}
          stroke="#3B3D43"
          strokeWidth={Math.max(0.8, 0.12 * k(z))}
        />
        <circle
          cx={sx(X + 2.2, z)}
          cy={sy(9.85, z)}
          r={Math.max(1.5, 0.5 * k(z))}
          fill="url(#lamp)"
        />
      </g>,
    );
  }
  return <>{out}</>;
};

const youX = (rule: Rule, t: number) => {
  const c = carAt(RUNS[rule], YOU, t);
  return c ? Math.min(FOLLOW_TO, c.x) : FOLLOW_TO;
};

const Panel: React.FC<{
  rule: Rule;
  sign: string[];
  left: number;
  frame: number;
}> = ({ rule, sign, left, frame }) => {
  const t = simAt(frame);
  const cam: Cam = { xc: youX(rule, t) - CAR_L - BACK };
  const run = RUNS[rule];
  const drawn: Drawn[] = [];
  for (let i = 0; i < run.cars.length; i++) {
    const c = carAt(run, i, t);
    if (!c || c.x > EXIT) continue;
    drawn.push({ id: i, X: laneX(c.lane), rear: c.x - CAR_L, v: c.v, a: c.a });
  }
  // Far to near, and cones in with the cars so near ones cover far cars.
  type Item = { z: number; node: React.ReactNode };
  const items: Item[] = [
    ...drawn.map((c) => ({
      z: c.rear - cam.xc,
      node: <CarBox key={`c${c.id}`} c={c} cam={cam} you={c.id === YOU} />,
    })),
    ...CONES.map((p) => ({
      z: p.x - cam.xc,
      node: <Cone key={`k${p.x}${p.X}`} X={p.X} x={p.x} cam={cam} />,
    })),
  ];
  items.sort((a, b) => b.z - a.z);
  return (
    <g transform={`translate(${left} ${SCENE_TOP})`}>
      <defs>
        <clipPath id={`${rule}-clip`}>
          <rect x={0} y={0} width={PANEL_W} height={SCENE_H} rx={12} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${rule}-clip)`}>
        <Scene sign={sign} cam={cam} frame={frame} />
        {drawn.map((c) => (
          <Beam key={`b${c.id}`} c={c} cam={cam} />
        ))}
        {items.map((it) => it.node)}
        <Lamps cam={cam} />
        <rect x={0} y={0} width={PANEL_W} height={SCENE_H} fill="url(#haze)" />
      </g>
    </g>
  );
};

/**
 * Cars that arrive after you and get through the cones before you, counted
 * as each one goes past you. At the end it is `passedBy`, the measured
 * figure.
 */
const gotPast = (rule: Rule, t: number) => {
  const run = RUNS[rule];
  const cars = run.cars;
  const you = carAt(run, YOU, t);
  let n = 0;
  for (const c of cars) {
    if (c.arrive <= cars[YOU].arrive || c.through >= cars[YOU].through)
      continue;
    const at = carAt(run, c.id, t);
    if (c.through <= t || !you || (at && at.x > you.x)) n++;
  }
  return n;
};

const mmss = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

export const Road: React.FC = () => {
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
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#07080B" />
            <stop offset={HORIZON / SCENE_H} stopColor="#151821" />
            <stop offset={HORIZON / SCENE_H + 0.001} stopColor="#0C0D10" />
            <stop offset="1" stopColor="#0C0D10" />
          </linearGradient>
          <radialGradient id="city" cx="0.5" cy="1" r="0.6">
            <stop offset="0" stopColor="#E9E4D8" stopOpacity={0.1} />
            <stop offset="1" stopColor="#E9E4D8" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="asphalt" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#15161A" />
            <stop offset="1" stopColor="#24252A" />
          </linearGradient>
          <radialGradient id="pool" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#F2E6CC" stopOpacity={0.14} />
            <stop offset="1" stopColor="#F2E6CC" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="lamp" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#FFF4DD" stopOpacity={0.95} />
            <stop offset="0.35" stopColor="#F2E6CC" stopOpacity={0.4} />
            <stop offset="1" stopColor="#F2E6CC" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="tail-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={TAIL} stopOpacity={0.55} />
            <stop offset="1" stopColor={TAIL} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="board-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#FFF4DD" stopOpacity={0.22} />
            <stop offset="1" stopColor="#FFF4DD" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="beam" x1="0" x2="0" y1="1" y2="0">
            <stop offset="0" stopColor="#F2E6CC" stopOpacity={0.16} />
            <stop offset="1" stopColor="#F2E6CC" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="haze" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#07080B" stopOpacity={0.5} />
            <stop
              offset={HORIZON / SCENE_H}
              stopColor="#07080B"
              stopOpacity={0.15}
            />
            <stop
              offset={(HORIZON + 80) / SCENE_H}
              stopColor="#07080B"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        {PANELS.map((p) => (
          <Panel
            key={p.rule}
            rule={p.rule}
            sign={p.sign}
            left={p.left}
            frame={frame}
          />
        ))}
      </svg>
      <Provenance top={PROVENANCE_TOP}>{CONDITIONS}</Provenance>
      {PANELS.map((p) => {
        const cars = RUNS[p.rule].cars;
        const you = carAt(RUNS[p.rule], YOU, t);
        const passed = gotPast(p.rule, t);
        const toCones = you ? Math.max(0, -you.x) : 0;
        const through = cars[YOU].through <= t;
        const name = p.rule === "zipper" ? named : 0;
        const verdict = frame >= VERDICT_FROM - 6;
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
              {p.rule === "zipper" ? (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: -4,
                    fontFamily: theme.fontFamily,
                    fontSize: 38,
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    opacity: name,
                    transform: `translateY(${(1 - name) * 10}px)`,
                  }}
                >
                  Round-robin
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
              {verdict ? (
                <>
                  you lost{" "}
                  <span
                    style={{ fontSize: 34, fontWeight: 700, color: ACCENT }}
                  >
                    {mmss(HERO[p.rule].lost)}
                  </span>
                </>
              ) : (
                <>
                  <span
                    style={{ fontSize: 34, fontWeight: 700, color: ACCENT }}
                  >
                    {passed}
                  </span>{" "}
                  got past you{"  "}·{"  "}
                  <span
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: theme.colors.chalk,
                    }}
                  >
                    {through ? "through" : `${Math.round(toCones)} m`}
                  </span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};
