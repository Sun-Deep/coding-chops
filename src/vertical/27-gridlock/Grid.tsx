import { Easing, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { Provenance } from "../../shared/vertical/type";
import { clamp } from "../../shared/video/timing";
import { Car, CAR_SHADES } from "../23-phantom-jam/Car";
import {
  FOCUS,
  LOCK_FRAME,
  PULL_FROM,
  PULL_TO,
  SIM_FROM,
  ZOOM,
  simAt,
} from "./beats";
import {
  CAR_L,
  COL_X,
  HEADING,
  MAP_H,
  MAP_W,
  RECORD,
  ROAD,
  ROW_Y,
  STREETS,
  boxesOf,
  lightAt,
  pointAt,
  type CarTrack,
  type Dir,
  type Rule,
  type Run,
} from "./simulation";
import { CONDITIONS } from "./measurements";
import { RUNS, throughBy } from "./runs";

/**
 * Two copies of the same block and its four junctions, seen from above, side
 * by side. The same cars arrive at the same moments in both. On the left
 * drivers go whenever the light is green; on the right they wait until there
 * is room past the junction.
 *
 * Orange is one thing only: a car standing still inside a junction, which is
 * what blocks the cross street. When the four junctions round the block on the
 * left are all held that way, an orange loop is drawn round it, each car waiting
 * on the next. That loop is the deadlock.
 *
 * The streets are one-way and the arrows painted on them say which way, so
 * the loop's direction can be checked against the road.
 */

export const HEADLINE_TOP = 256;
const K = 10;
const WIDTH = MAP_W * K;
const GAP = 40;
const PROVENANCE_TOP = 430;
const LABEL_TOP = 462;
const COUNT_TOP = 492;
export const MAP_TOP = 530;
export const MAP_BOTTOM = MAP_TOP + MAP_H * K;
const PANELS: { rule: Rule; label: string; left: number }[] = [
  { rule: "green", label: "Go on green", left: 540 - GAP / 2 - WIDTH },
  { rule: "room", label: "Wait for room", left: 540 + GAP / 2 },
];

/**
 * The streets and blocks carry on past the map's edge. Only the close-up at
 * the start sees past it, where the queue waiting to enter the bottom left
 * junction stands.
 */
const BEYOND = 16;

const ROAD_FILL = "#1B1E24";
const KERB = "#2A2E36";
const ROOFS = ["#22262E", "#1E222A", "#252A33", "#1C2027"];

const RIGHT_OF: Record<Dir, { x: number; y: number }> = {
  E: { x: 0, y: 1 },
  W: { x: 0, y: -1 },
  S: { x: -1, y: 0 },
  N: { x: 1, y: 0 },
};

const sampleAt = (c: CarTrack, t: number) => {
  const f = (t - c.on) / RECORD;
  if (f < 0 || f > c.s.length - 1) return null;
  const k = Math.min(c.s.length - 2, Math.floor(f));
  const u = f - k;
  if (k < 0) return { s: c.s[0], v: c.v[0], dv: 0 };
  return {
    s: c.s[k] + (c.s[k + 1] - c.s[k]) * u,
    v: c.v[k] + (c.v[k + 1] - c.v[k]) * u,
    dv: c.v[k + 1] - c.v[k],
  };
};

const BOXES = STREETS.map(boxesOf);

/** Standing still with any part of the car inside a junction. */
const blocking = (street: number, s: number, v: number) =>
  v < 0.3 && BOXES[street].some((b) => s > b.sIn + 0.3 && s - CAR_L < b.sOut);

/** Blocks between the roads, each split into a few roofs. */
const City: React.FC = () => {
  const xs = [
    -BEYOND,
    ...COL_X.flatMap((x) => [x - ROAD / 2, x + ROAD / 2]),
    MAP_W + BEYOND,
  ];
  const ys = [
    -BEYOND,
    ...ROW_Y.flatMap((y) => [y - ROAD / 2, y + ROAD / 2]),
    MAP_H + BEYOND,
  ];
  const out: React.ReactNode[] = [];
  for (let i = 0; i < ys.length; i += 2) {
    for (let j = 0; j < xs.length; j += 2) {
      const x0 = xs[j];
      const x1 = xs[j + 1];
      const y0 = ys[i];
      const y1 = ys[i + 1];
      out.push(
        <rect
          key={`k${i}${j}`}
          x={x0}
          y={y0}
          width={x1 - x0}
          height={y1 - y0}
          fill={KERB}
        />,
      );
      // Roofs, inset from the pavement, split along the longer side.
      const pad = 1.3;
      const w = x1 - x0 - 2 * pad;
      const h = y1 - y0 - 2 * pad;
      if (w <= 0 || h <= 0) continue;
      const n = Math.max(1, Math.round(Math.max(w, h) / 9));
      for (let m = 0; m < n; m++) {
        const across = w >= h;
        const rx = across ? x0 + pad + (m * w) / n : x0 + pad;
        const ry = across ? y0 + pad : y0 + pad + (m * h) / n;
        const rw = across ? w / n - 0.5 : w;
        const rh = across ? h : h / n - 0.5;
        out.push(
          <rect
            key={`r${i}${j}${m}`}
            x={rx}
            y={ry}
            width={rw}
            height={rh}
            rx={0.4}
            fill={ROOFS[(i * 3 + j + m) % ROOFS.length]}
          />,
        );
      }
    }
  }
  return <>{out}</>;
};

const Roads: React.FC = () => (
  <>
    {ROW_Y.map((y) => (
      <rect
        key={`row${y}`}
        x={-BEYOND}
        y={y - ROAD / 2}
        width={MAP_W + 2 * BEYOND}
        height={ROAD}
        fill={ROAD_FILL}
      />
    ))}
    {COL_X.map((x) => (
      <rect
        key={`col${x}`}
        x={x - ROAD / 2}
        y={-BEYOND}
        width={ROAD}
        height={MAP_H + 2 * BEYOND}
        fill={ROAD_FILL}
      />
    ))}
    {/* The box: hatched, so "inside the junction" is a place you can see. */}
    <defs>
      <pattern
        id="hatch"
        patternUnits="userSpaceOnUse"
        width={1.6}
        height={1.6}
      >
        <path
          d="M 0 0 L 1.6 1.6 M 1.6 0 L 0 1.6"
          stroke={theme.colors.chalk}
          strokeWidth={0.1}
        />
      </pattern>
    </defs>
    {ROW_Y.flatMap((y) =>
      COL_X.map((x) => (
        <rect
          key={`box${x}${y}`}
          x={x - ROAD / 2 + 0.4}
          y={y - ROAD / 2 + 0.4}
          width={ROAD - 0.8}
          height={ROAD - 0.8}
          fill="url(#hatch)"
          stroke={theme.colors.chalk}
          strokeWidth={0.18}
          opacity={0.16}
        />
      )),
    )}
    {/* One-way arrows. */}
    {STREETS.map((st, k) =>
      BOXES[k].map((b, m) => {
        const a = pointAt(st, b.sIn - (m === 0 ? 6 : 12));
        return (
          <g key={`${k}${m}`}>
            <g
              transform={`translate(${a.x} ${a.y}) rotate(${HEADING[st.dir]})`}
              opacity={0.22}
            >
              <path
                d="M 0 -1.9 L 1.1 -0.5 L 0.35 -0.5 L 0.35 1.6 L -0.35 1.6 L -0.35 -0.5 L -1.1 -0.5 Z"
                fill={theme.colors.chalk}
              />
            </g>
          </g>
        );
      }),
    )}
  </>
);

/**
 * Each street's signal is its stop line, lit green or red, so which light
 * belongs to which queue is never in doubt: it is the line the queue is
 * standing at.
 */
const Lights: React.FC<{ run: Run; t: number }> = ({ run, t }) => (
  <>
    {STREETS.map((st, k) =>
      BOXES[k].map((b, m) => {
        const go =
          lightAt(run.offsets[b.node], t) ===
          (st.axis === "row" ? "rows" : "cols");
        const p = pointAt(st, b.sIn - 0.45);
        const r = RIGHT_OF[st.dir];
        const half = ROAD / 2 - 0.6;
        const c = go ? theme.colors.gain : theme.colors.loss;
        const line = {
          x1: p.x - r.x * half,
          y1: p.y - r.y * half,
          x2: p.x + r.x * half,
          y2: p.y + r.y * half,
        };
        return (
          <g key={`${k}${m}`}>
            <line {...line} stroke={c} strokeOpacity={0.25} strokeWidth={3} />
            <line
              {...line}
              stroke={c}
              strokeWidth={1.1}
              strokeLinecap="round"
            />
          </g>
        );
      }),
    )}
  </>
);

/**
 * The wait-for loop round the block, anticlockwise like its streets, and the
 * word for it written inside, along the block. The narration names it too,
 * but most viewers do not read the subtitle; the word on the picture is the
 * one they see.
 */
const Loop: React.FC<{ opacity: number; dash: number; word: number }> = ({
  opacity,
  dash,
  word,
}) => {
  const inset = ROAD / 2 + 0.9;
  const x0 = COL_X[0] + inset;
  const x1 = COL_X[1] - inset;
  const y0 = ROW_Y[0] + inset;
  const y1 = ROW_Y[1] - inset;
  const r = 2.2;
  const d = [
    `M ${x1 - r} ${y0}`,
    `L ${x0 + r} ${y0}`,
    `Q ${x0} ${y0} ${x0} ${y0 + r}`,
    `L ${x0} ${y1 - r}`,
    `Q ${x0} ${y1} ${x0 + r} ${y1}`,
    `L ${x1 - r} ${y1}`,
    `Q ${x1} ${y1} ${x1} ${y1 - r}`,
    `L ${x1} ${y0 + r}`,
    `Q ${x1} ${y0} ${x1 - r} ${y0}`,
  ].join(" ");
  const arrows = [
    { x: (x0 + x1) / 2, y: y0, deg: 270 },
    { x: x0, y: (y0 + y1) / 2, deg: 180 },
    { x: (x0 + x1) / 2, y: y1, deg: 90 },
    { x: x1, y: (y0 + y1) / 2, deg: 0 },
  ];
  return (
    <g opacity={opacity}>
      <path
        d={d}
        fill="none"
        stroke={ACCENT}
        strokeWidth={0.55}
        strokeDasharray="1.6 1.1"
        strokeDashoffset={-dash}
      />
      {arrows.map((a) => (
        <path
          key={a.deg}
          d="M 0 -1.3 L 1.1 0.6 L -1.1 0.6 Z"
          fill={ACCENT}
          transform={`translate(${a.x} ${a.y}) rotate(${a.deg})`}
        />
      ))}
      <text
        x={0}
        y={0}
        transform={`translate(${(x0 + x1) / 2} ${(y0 + y1) / 2}) rotate(-90) scale(${0.92 + 0.08 * word})`}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily={theme.fontFamily}
        fontWeight={800}
        fontSize={6.6}
        letterSpacing="0.04em"
        fill={ACCENT}
        opacity={word}
      >
        DEADLOCK
      </text>
    </g>
  );
};

/**
 * On the right, a driver stopped at a green line is waiting for room. The
 * space they need past the junction is outlined, so the wait has a reason
 * on screen: that space is still full.
 */
const RoomNeeded: React.FC<{ run: Run; t: number }> = ({ run, t }) => (
  <>
    {run.cars.flatMap((c) => {
      const p = sampleAt(c, t);
      if (!p || p.v > 0.3) return [];
      const st = STREETS[c.street];
      const b = BOXES[c.street].find(
        (x) => x.sIn - p.s > -0.2 && x.sIn - p.s < 4,
      );
      if (!b) return [];
      const want = st.axis === "row" ? "rows" : "cols";
      if (lightAt(run.offsets[b.node], t) !== want) return [];
      const at = pointAt(st, b.sOut + 0.6 + CAR_L / 2);
      return [
        <g
          key={c.id}
          transform={`translate(${at.x} ${at.y}) rotate(${HEADING[st.dir]})`}
        >
          <rect
            x={-1.25}
            y={-CAR_L / 2 - 0.3}
            width={2.5}
            height={CAR_L + 0.6}
            rx={0.5}
            fill={theme.colors.chalk}
            fillOpacity={0.06}
            stroke={theme.colors.chalk}
            strokeWidth={0.3}
            strokeDasharray="0.7 0.5"
          />
        </g>,
      ];
    })}
  </>
);

const Panel: React.FC<{ rule: Rule; left: number; frame: number }> = ({
  rule,
  left,
  frame,
}) => {
  const run = RUNS[rule];
  const t = simAt(frame);
  const loop =
    rule === "green"
      ? interpolate(frame, [LOCK_FRAME, LOCK_FRAME + 8], [0, 1], clamp)
      : 0;
  const u = interpolate(frame, [PULL_FROM, PULL_TO], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.45, 0, 0.55, 1),
  });
  const zoom = ZOOM + (1 - ZOOM) * u;
  const fx = FOCUS.x + (MAP_W / 2 - FOCUS.x) * u;
  const fy = FOCUS.y + (MAP_H / 2 - FOCUS.y) * u;
  const cars = run.cars.flatMap((c) => {
    const p = sampleAt(c, t);
    if (!p) return [];
    const at = pointAt(STREETS[c.street], p.s - CAR_L / 2);
    const out = BEYOND + 4;
    if (at.x < -out || at.x > MAP_W + out || at.y < -out || at.y > MAP_H + out)
      return [];
    return [{ c, p, at }];
  });
  const id = `p-${rule}`;
  const h = MAP_H * K;
  return (
    <g transform={`translate(${left} ${MAP_TOP})`}>
      <defs>
        <clipPath id={`${id}-window`}>
          <rect x={0} y={0} width={WIDTH} height={h} rx={12} />
        </clipPath>
        <clipPath id={`${id}-clip`}>
          <rect
            x={-BEYOND}
            y={-BEYOND}
            width={MAP_W + 2 * BEYOND}
            height={MAP_H + 2 * BEYOND}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-window)`}>
        <g
          transform={`translate(${WIDTH / 2} ${h / 2}) scale(${K * zoom}) translate(${-fx} ${-fy})`}
        >
          <g clipPath={`url(#${id}-clip)`}>
            <City />
            <Roads />
            <Lights run={run} t={t} />
            {rule === "room" ? <RoomNeeded run={run} t={t} /> : null}
            {cars.map(({ c, p, at }) => {
              const stuck = blocking(c.street, p.s, p.v);
              const brake = p.v < 0.5 ? 1 : p.dv < -0.05 ? 0.7 : 0;
              return (
                <g
                  key={c.id}
                  transform={`translate(${at.x} ${at.y}) rotate(${HEADING[STREETS[c.street].dir]})`}
                >
                  <Car
                    id={`${id}-${c.id}`}
                    scale={1}
                    body={stuck ? ACCENT : CAR_SHADES[c.id % CAR_SHADES.length]}
                    brake={brake}
                    brakeColor={theme.colors.loss}
                    beam={false}
                  />
                </g>
              );
            })}
            {loop > 0 ? (
              <Loop
                opacity={loop}
                dash={frame * 0.12}
                word={interpolate(
                  frame,
                  [LOCK_FRAME + 8, LOCK_FRAME + 20],
                  [0, 1],
                  clamp,
                )}
              />
            ) : null}
          </g>
        </g>
      </g>
    </g>
  );
};

export const Grid: React.FC = () => {
  const frame = useCurrentFrame();
  const t = simAt(frame);
  return (
    <>
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0 }}
      >
        {PANELS.map((p) => (
          <Panel key={p.rule} rule={p.rule} left={p.left} frame={frame} />
        ))}
      </svg>
      <Provenance top={PROVENANCE_TOP}>{CONDITIONS}</Provenance>
      {PANELS.map((p) => (
        <div
          key={p.rule}
          style={{
            position: "absolute",
            top: LABEL_TOP,
            left: p.left,
            width: WIDTH,
            textAlign: "center",
            fontFamily: theme.monoFamily,
            textTransform: "uppercase",
            color: theme.colors.chalk,
          }}
        >
          <div style={{ fontSize: 23, letterSpacing: "0.14em" }}>{p.label}</div>
          <div
            style={{
              marginTop: COUNT_TOP - LABEL_TOP - 28,
              fontSize: 21,
              letterSpacing: "0.1em",
              color: theme.colors.grayDark,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: theme.colors.chalk,
              }}
            >
              {throughBy(p.rule, SIM_FROM, t)}
            </span>{" "}
            cars through
          </div>
        </div>
      ))}
    </>
  );
};
