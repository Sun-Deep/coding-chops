import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import { Car, CAR_SHADES } from "../23-phantom-jam/Car";
import { simAt } from "./beats";
import { clock } from "./measurements";
import {
  AISLE_W,
  DEFAULTS,
  DOOR_X,
  DRIVING,
  INSIDE,
  LANE,
  LOT_L,
  LOT_W,
  PARKING,
  STALLS,
  STALL_D,
  STALL_LIST,
  STALL_W,
  aisleX,
  type DriverKey,
  type Trip,
} from "./parking";
import { TRIPS } from "./runs";

/**
 * Two identical car parks seen from above, the store across the top. The same
 * cars are parked in both, the same ones leave and the same ones arrive. The
 * orange car on the left takes the nearest open stall in the row in front of
 * the door; the orange car on the right only takes a stall in the tinted band
 * by the store, and loops until one is open as it passes.
 *
 * Painted stall lines and a storefront make it read as a car park at frame
 * zero, before anything moves. The tint is the circler's rule made visible:
 * it is why the car on the right drives past open stalls.
 */

export const HEADLINE_TOP = 256;
const LABEL_TOP = 432;
const CLOCK_TOP = 460;
const K = 10.3;
const LOT_TOP = 562;
const STORE_H = 40;
const ORIGIN: Record<DriverKey, number> = {
  row: 100,
  circle: 930 - LOT_W * K,
};
const LABELS: Record<DriverKey, string> = {
  row: "Picks a row",
  circle: "Circles for a close spot",
};

const ASPHALT = "#181C24";
const LINE = "#C8C7C2";

const px = (d: DriverKey, x: number) => ORIGIN[d] + x * K;
const py = (y: number) => LOT_TOP + y * K;

/** Parked nose-in: the nose points away from the aisle. */
const parkedDeg = (side: number) => (side < 0 ? -90 : 90);

const at = (tr: Trip, t: number) => {
  const last = tr.x.length - 1;
  const f = Math.min(last, Math.max(0, t));
  const k = Math.min(last - 1, Math.floor(f));
  const u = f - k;
  const x = tr.x[k] + (tr.x[k + 1] - tr.x[k]) * u;
  const y = tr.y[k] + (tr.y[k + 1] - tr.y[k]) * u;
  return { x, y, k, u, mode: tr.mode[k] };
};

/** Heading, in degrees, from the direction of travel around tick k. */
const headingAt = (tr: Trip, k: number) => {
  for (let j = k; j < tr.x.length - 1; j++) {
    const dx = tr.x[j + 1] - tr.x[j];
    const dy = tr.y[j + 1] - tr.y[j];
    if (Math.abs(dx) + Math.abs(dy) > 0.01) {
      return (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    }
  }
  return 0;
};

const Person: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-9} y={-5} width={18} height={10} rx={5} fill={ACCENT} />
    <circle cx={0} cy={0} r={4.6} fill="#D8CDBE" />
    <path
      d="M -4.6 0 A 4.6 4.6 0 0 1 4.6 0 A 4.6 3.2 0 0 0 -4.6 0 Z"
      fill="#2B2420"
    />
  </g>
);

const Lot: React.FC<{ driver: DriverKey; t: number }> = ({ driver, t }) => {
  const tr = TRIPS[driver];
  const n = STALL_LIST.length;
  const hero = at(tr, t);
  const parkedHere = (i: number) => i === tr.stall && hero.mode !== DRIVING;
  const k = Math.min(Math.floor(t), tr.x.length - 2);
  const u = Math.min(1, Math.max(0, t - k));
  const x0 = ORIGIN[driver];

  return (
    <g>
      {/* The store and its door. */}
      <rect
        x={x0}
        y={LOT_TOP - STORE_H}
        width={LOT_W * K}
        height={STORE_H}
        rx={4}
        fill="#262C37"
      />
      <rect
        x={px(driver, DOOR_X) - 1.6 * K}
        y={LOT_TOP - STORE_H + 8}
        width={3.2 * K}
        height={STORE_H - 8}
        fill="#E9E4D8"
        opacity={0.85}
      />

      {/* Asphalt and painted stall lines. */}
      <rect
        x={x0}
        y={LOT_TOP}
        width={LOT_W * K}
        height={LOT_L * K}
        fill={ASPHALT}
      />
      {driver === "circle" ? (
        <g>
          <rect
            x={x0}
            y={py(LANE)}
            width={LOT_W * K}
            height={DEFAULTS.near * STALL_W * K}
            fill={ACCENT}
            opacity={0.09}
          />
          <line
            x1={x0}
            x2={x0 + LOT_W * K}
            y1={py(LANE + DEFAULTS.near * STALL_W)}
            y2={py(LANE + DEFAULTS.near * STALL_W)}
            stroke={ACCENT}
            strokeOpacity={0.6}
            strokeWidth={2}
            strokeDasharray="6 6"
          />
        </g>
      ) : null}
      {Array.from({ length: 2 }, (_, a) =>
        [-1, 1].map((side) => {
          const inner = aisleX(a) + side * (AISLE_W / 2);
          const outer = inner + side * STALL_D;
          return Array.from({ length: STALLS + 1 }, (_, j) => (
            <line
              key={`${a}${side}${j}`}
              x1={px(driver, inner)}
              x2={px(driver, outer)}
              y1={py(LANE + j * STALL_W)}
              y2={py(LANE + j * STALL_W)}
              stroke={LINE}
              strokeOpacity={0.35}
              strokeWidth={1.5}
            />
          ));
        }),
      )}

      {/* Everyone else: parked, leaving, arriving. */}
      {STALL_LIST.map((st, i) => {
        if (parkedHere(i)) return null;
        const now = tr.full[k * n + i];
        const next = tr.full[(k + 1) * n + i];
        if (!now && !next) return null;
        let shift = 0;
        let opacity = 1;
        if (now && !next) {
          shift = 3 * u;
          opacity = 1 - u;
        } else if (!now && next) {
          shift = 3 * (1 - u);
          opacity = u;
        }
        const cx = px(driver, st.x - st.side * shift);
        const cy = py(st.y);
        return (
          <g
            key={i}
            transform={`translate(${cx} ${cy}) rotate(${parkedDeg(st.side)})`}
            opacity={opacity}
          >
            <Car
              id={`${driver}-${i}`}
              scale={K}
              body={CAR_SHADES[i % CAR_SHADES.length]}
              brake={0}
              brakeColor={theme.colors.loss}
              beam={false}
            />
          </g>
        );
      })}

      {/* You: the car, then on foot to the door. */}
      {(() => {
        const st = tr.stall >= 0 ? STALL_LIST[tr.stall] : null;
        const parked = hero.mode !== DRIVING && hero.mode !== PARKING;
        const carX = parked && st ? st.x : hero.x;
        const carY = parked && st ? st.y : hero.y;
        const deg =
          parked && st
            ? parkedDeg(st.side)
            : hero.mode === PARKING && st
              ? interpolate(
                  t,
                  [tr.parkedAt - DEFAULTS.park, tr.parkedAt],
                  [headingAt(tr, k), parkedDeg(st.side)],
                  clamp,
                )
              : headingAt(tr, k);
        return (
          <g>
            <g
              transform={`translate(${px(driver, carX)} ${py(carY)}) rotate(${deg})`}
            >
              <Car
                id={`${driver}-you`}
                scale={K}
                body={ACCENT}
                brake={0}
                brakeColor={theme.colors.loss}
              />
            </g>
            {parked && hero.mode !== INSIDE ? (
              <Person x={px(driver, hero.x)} y={py(hero.y)} />
            ) : null}
          </g>
        );
      })()}
    </g>
  );
};

export const Lots: React.FC = () => {
  const frame = useCurrentFrame();
  const t = simAt(frame);
  return (
    <>
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0 }}
      >
        <Lot driver="row" t={t} />
        <Lot driver="circle" t={t} />
      </svg>
      {(["row", "circle"] as const).map((d) => {
        const done = t >= TRIPS[d].seconds;
        const centre = ORIGIN[d] + (LOT_W * K) / 2;
        return (
          <div key={d}>
            <div
              style={{
                position: "absolute",
                top: LABEL_TOP,
                left: centre - 220,
                width: 440,
                textAlign: "center",
                fontFamily: theme.monoFamily,
                fontSize: 21,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: theme.colors.chalk,
              }}
            >
              {LABELS[d]}
            </div>
            <div
              style={{
                position: "absolute",
                top: CLOCK_TOP,
                left: centre - 180,
                width: 360,
                textAlign: "center",
                fontFamily: theme.monoFamily,
                fontVariantNumeric: "tabular-nums",
                fontSize: 46,
                fontWeight: done ? 700 : 500,
                color: done ? ACCENT : theme.colors.chalk,
              }}
            >
              {clock(Math.min(t, TRIPS[d].seconds))}
            </div>
          </div>
        );
      })}
    </>
  );
};
