import { Easing, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import { simAt } from "./beats";
import {
  COLS,
  OUTSIDE,
  ROWS,
  SEATED,
  depthOf,
  sideOf,
  type Boarding,
  type MethodKey,
} from "./boarding";
import { clock } from "./measurements";
import { RUNS } from "./runs";

/**
 * Three cabins from above, nose up, the same 72 people boarding each in a
 * different order. A passenger in the aisle is chalk while they walk, red on
 * any second they are stuck behind somebody, and grey once they sit. The bag
 * they carry rises into the overhead bin while they stand at their row.
 *
 * Red is the one colour besides the accent and it means stuck, the same
 * meaning the brake lights had in the traffic cut. The accent marks a cabin
 * whose last passenger has sat down.
 */

export const HEADLINE_TOP = 256;
const LABEL_TOP = 438;
const CLOCK_TOP = 468;

const CENTRES: Record<MethodKey, number> = {
  backToFront: 260,
  random: 540,
  windowFirst: 820,
};
const LABELS: Record<MethodKey, string> = {
  backToFront: "Back to front",
  random: "Random",
  windowFirst: "Window first",
};

const TOP = 640;
const ROW_H = 48;
const AISLE = 32;
const SEAT_W = 27;
const HALF = AISLE / 2 + 3 * SEAT_W + 8;
/** Nose cone from the first row to its tip. */
const NOSE = 110;
const TAIL = 72;

const STUCK = theme.colors.loss;
const SEAT = "#232934";
const BODY = "#121620";

const rowY = (row: number) => TOP + (row - 1) * ROW_H + ROW_H / 2;
const seatX = (col: number) =>
  (sideOf(col) === 0 ? -1 : 1) *
  (AISLE / 2 + depthOf(col) * SEAT_W + SEAT_W / 2);

const Person: React.FC<{
  x: number;
  y: number;
  color: string;
  opacity: number;
}> = ({ x, y, color, opacity }) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity}>
    {/* Shoulders and arms, in the colour that says what they are doing. */}
    <rect x={-12.5} y={-6.5} width={25} height={13} rx={6.5} fill={color} />
    <rect
      x={-12.5}
      y={-6.5}
      width={25}
      height={13}
      rx={6.5}
      fill="url(#shade)"
    />
    {/* Head, a different tone from the shirt, with hair on top. */}
    <circle cx={0} cy={0} r={6} fill="#D8CDBE" />
    <path d="M -6 0 A 6 6 0 0 1 6 0 A 6 4.2 0 0 0 -6 0 Z" fill="#2B2420" />
  </g>
);

export const Plane: React.FC<{
  method: MethodKey;
  t: number;
  x: number;
  opacity: number;
}> = ({ method, t, x, opacity }) => {
  const run: Boarding = RUNS[method];
  const cx = x;
  const n = run.people.length;
  const k = Math.min(run.ticks - 2, Math.max(0, Math.floor(t)));
  const u = Math.min(1, Math.max(0, t - k));
  const bodyEnd = TOP + ROWS * ROW_H + 8;
  const tailTip = bodyEnd + TAIL;
  const wingY = rowY(5) - ROW_H / 2;

  return (
    <g opacity={opacity}>
      {/* Wing roots and tailplanes, fading out so neighbours never clash. */}
      {[-1, 1].map((d) => (
        <g key={d}>
          <path
            d={`M ${cx + d * (HALF - 4)} ${wingY} L ${cx + d * (HALF + 34)} ${wingY + 40} L ${cx + d * (HALF + 34)} ${wingY + 84} L ${cx + d * (HALF - 4)} ${wingY + 108} Z`}
            fill={`url(#wing-${d < 0 ? "l" : "r"})`}
          />
          <path
            d={`M ${cx + d * HALF * 0.5} ${bodyEnd + 18} L ${cx + d * (HALF + 26)} ${bodyEnd + 50} L ${cx + d * (HALF + 26)} ${bodyEnd + 64} L ${cx + d * HALF * 0.3} ${bodyEnd + 58} Z`}
            fill={`url(#wing-${d < 0 ? "l" : "r"})`}
          />
        </g>
      ))}

      {/* Fuselage: a pointed nose, straight sides, a tapering tail. */}
      <path
        d={[
          `M ${cx - HALF} ${TOP - 4}`,
          `C ${cx - HALF} ${TOP - 70} ${cx - HALF * 0.42} ${TOP - NOSE + 2} ${cx} ${TOP - NOSE}`,
          `C ${cx + HALF * 0.42} ${TOP - NOSE + 2} ${cx + HALF} ${TOP - 70} ${cx + HALF} ${TOP - 4}`,
          `L ${cx + HALF} ${bodyEnd}`,
          `C ${cx + HALF} ${bodyEnd + 40} ${cx + 16} ${tailTip - 6} ${cx + 8} ${tailTip}`,
          `L ${cx - 8} ${tailTip}`,
          `C ${cx - 16} ${tailTip - 6} ${cx - HALF} ${bodyEnd + 40} ${cx - HALF} ${bodyEnd}`,
          "Z",
        ].join(" ")}
        fill={BODY}
        stroke={theme.colors.gray}
        strokeOpacity={0.6}
        strokeWidth={2}
      />
      {/* Fin, seen edge on from above. */}
      <line
        x1={cx}
        x2={cx}
        y1={bodyEnd + 14}
        y2={tailTip - 6}
        stroke={theme.colors.gray}
        strokeWidth={5}
        strokeLinecap="round"
      />
      {/* Cockpit windscreen. */}
      <path
        d={`M ${cx - 46} ${TOP - NOSE + 30} Q ${cx} ${TOP - NOSE + 14} ${cx + 46} ${TOP - NOSE + 30} L ${cx + 40} ${TOP - NOSE + 42} Q ${cx} ${TOP - NOSE + 28} ${cx - 40} ${TOP - NOSE + 42} Z`}
        fill="#06080C"
        stroke={theme.colors.gray}
        strokeOpacity={0.5}
        strokeWidth={1}
      />
      {/* A window beside every row, both sides. */}
      {Array.from({ length: ROWS }, (_, r) =>
        [-1, 1].map((d) => (
          <rect
            key={`${r}${d}`}
            x={cx + d * (HALF - 4) - 2}
            y={rowY(r + 1) - 5}
            width={4}
            height={10}
            rx={2}
            fill="#C8D0DA"
            opacity={0.45}
          />
        )),
      )}
      {/* The door, front left. */}
      <rect
        x={cx - HALF - 3}
        y={TOP - 40}
        width={6}
        height={30}
        rx={2}
        fill={theme.colors.chalk}
        opacity={0.55}
      />

      {Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS }, (_, col) => (
          <rect
            key={`${r}-${col}`}
            x={cx + seatX(col) - 11.5}
            y={rowY(r + 1) - 12}
            width={23}
            height={24}
            rx={5}
            fill={SEAT}
          />
        )),
      )}

      {run.people.map((p) => {
        const a = run.cell[k * n + p.id];
        const b = run.cell[(k + 1) * n + p.id];
        if (a === OUTSIDE && b === OUTSIDE) return null;

        const aisleAt = (c: number) => ({
          x: cx,
          y: c === 0 ? TOP - ROW_H / 2 : rowY(c),
        });
        const seat = { x: cx + seatX(p.col), y: rowY(p.row) };

        let pos: { x: number; y: number };
        let opacity = 1;
        let state: "walk" | "stuck" | "stow" | "seated" = "walk";
        if (a === SEATED) {
          pos = seat;
          state = "seated";
        } else if (a === OUTSIDE) {
          pos = aisleAt(0);
          opacity = u;
        } else if (b === SEATED) {
          const from = aisleAt(a);
          const v = interpolate(u, [0, 1], [0, 1], clamp);
          pos = { x: from.x + (seat.x - from.x) * v, y: from.y };
          state = "stow";
        } else {
          const from = aisleAt(a);
          const to = aisleAt(b);
          pos = { x: from.x, y: from.y + (to.y - from.y) * u };
          if (run.stuck[k * n + p.id]) state = "stuck";
          if (run.stowing[k * n + p.id]) state = "stow";
        }

        const color =
          state === "seated"
            ? "#6A6E76"
            : state === "stuck"
              ? STUCK
              : theme.colors.chalk;

        // The bag: carried until they reach their row, then lifted into the bin.
        const stowStart = (() => {
          for (let s = 0; s < run.ticks; s++) {
            if (run.stowing[s * n + p.id]) return s;
          }
          return run.ticks;
        })();
        const sitAt = run.seatedAt[p.id];
        const lift = interpolate(t, [stowStart, sitAt - 0.5], [0, 1], clamp);
        const showBag = p.bag && state !== "seated" && lift < 1;
        const binX = cx + (sideOf(p.col) === 0 ? -1 : 1) * (AISLE / 2 + SEAT_W);

        return (
          <g key={p.id}>
            {showBag ? (
              <g
                transform={`translate(${pos.x + 15 + (binX - pos.x - 15) * lift} ${pos.y + 2})`}
                opacity={opacity * (1 - lift * 0.6)}
              >
                {/* A carry-on from above: the case and its handle. */}
                <rect
                  x={-5}
                  y={-8}
                  width={10}
                  height={14}
                  rx={2}
                  fill="#8E9096"
                />
                <rect
                  x={-3}
                  y={-11}
                  width={6}
                  height={4}
                  rx={1.5}
                  fill="none"
                  stroke="#8E9096"
                  strokeWidth={1.4}
                />
              </g>
            ) : null}
            <Person x={pos.x} y={pos.y} color={color} opacity={opacity} />
          </g>
        );
      })}
    </g>
  );
};

/**
 * The opening: one whole airliner from above, wings, engines and tailplanes,
 * so the first frames say "plane" before anything else. The other two cabins
 * slide out from behind it while the wings fade, which leaves room for three.
 */
const INTRO_FROM = 4;
const INTRO_TO = 16;

export const BigWings: React.FC<{ cx: number; opacity: number }> = ({
  cx,
  opacity,
}) => {
  if (opacity <= 0) return null;
  const root = TOP + 3 * ROW_H;
  const tail = TOP + ROWS * ROW_H + 8;
  return (
    <g opacity={opacity}>
      {[-1, 1].map((d) => (
        <g key={d}>
          <path
            d={`M ${cx + d * HALF} ${root} L ${cx + d * 470} ${root + 170} L ${cx + d * 470} ${root + 220} L ${cx + d * HALF} ${root + 150} Z`}
            fill="#2A313D"
            stroke={theme.colors.gray}
            strokeOpacity={0.6}
            strokeWidth={2}
          />
          <rect
            x={cx + d * 200 - 17}
            y={root + 18}
            width={34}
            height={74}
            rx={15}
            fill="#323A47"
            stroke={theme.colors.gray}
            strokeOpacity={0.6}
            strokeWidth={2}
          />
          <path
            d={`M ${cx + d * HALF * 0.5} ${tail + 16} L ${cx + d * 200} ${tail + 66} L ${cx + d * 200} ${tail + 86} L ${cx + d * HALF * 0.3} ${tail + 60} Z`}
            fill="#2A313D"
            stroke={theme.colors.gray}
            strokeOpacity={0.6}
            strokeWidth={2}
          />
        </g>
      ))}
    </g>
  );
};

export const Cabins: React.FC = () => {
  const frame = useCurrentFrame();
  const t = simAt(frame);
  const spread = interpolate(frame, [INTRO_FROM, INTRO_TO], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const xOf = (m: MethodKey) => 540 + (CENTRES[m] - 540) * spread;
  const shown = (m: MethodKey) =>
    m === "random" ? 1 : interpolate(spread, [0, 0.35], [0, 1], clamp);
  /** Side cabins first, so they slide out from behind the middle one. */
  const order: MethodKey[] = ["backToFront", "windowFirst", "random"];
  return (
    <>
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <linearGradient id="shade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0.18} />
            <stop offset="1" stopColor="#000" stopOpacity={0.25} />
          </linearGradient>
          {(["l", "r"] as const).map((side) => (
            <linearGradient
              key={side}
              id={`wing-${side}`}
              x1={side === "l" ? "1" : "0"}
              x2={side === "l" ? "0" : "1"}
              y1="0"
              y2="0"
            >
              <stop offset="0" stopColor={BODY} stopOpacity={1} />
              <stop offset="0.6" stopColor="#232A35" stopOpacity={1} />
              <stop offset="1" stopColor="#232A35" stopOpacity={0.2} />
            </linearGradient>
          ))}
        </defs>
        <BigWings cx={540} opacity={1 - spread} />
        {order.map((m) => (
          <Plane key={m} method={m} t={t} x={xOf(m)} opacity={shown(m)} />
        ))}
      </svg>
      {(Object.keys(CENTRES) as MethodKey[]).map((m) => {
        const done = t >= RUNS[m].seconds;
        return (
          <div key={m} style={{ opacity: shown(m) }}>
            <div
              style={{
                position: "absolute",
                top: LABEL_TOP,
                left: CENTRES[m] - 140,
                width: 280,
                textAlign: "center",
                fontFamily: theme.monoFamily,
                fontSize: 22,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: theme.colors.chalk,
              }}
            >
              {LABELS[m]}
            </div>
            <div
              style={{
                position: "absolute",
                top: CLOCK_TOP,
                left: CENTRES[m] - 140,
                width: 280,
                textAlign: "center",
                fontFamily: theme.monoFamily,
                fontVariantNumeric: "tabular-nums",
                fontSize: 46,
                fontWeight: done ? 700 : 500,
                color: done ? ACCENT : theme.colors.chalk,
              }}
            >
              {clock(Math.min(t, RUNS[m].seconds))}
            </div>
          </div>
        );
      })}
    </>
  );
};
