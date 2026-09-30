import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { WIDTH } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { EASE_IN_OUT } from "../../shared/video/motion";
import { clamp } from "../../shared/video/timing";
import { VERDICT_FROM, simAt } from "./beats";
import { DAYS, carAt, type Day, type Leg } from "./simulation";
import {
  FLOORS,
  RIDERS,
  YOU,
  YOUR_TRIP,
  clock,
  type Rider,
  type RuleKey,
} from "./measurements";

/**
 * Two buildings, one clock. The left car serves calls in the order the
 * buttons were pressed and the right one sweeps, and the same seven people
 * press the same buttons at the same seconds in both.
 *
 * Drawn as a cross-section: a shaft with a car on a cable, landings beside it
 * where people stand, and a call lamp on the wall at each floor. The floor
 * numbers run down the middle, shared, so the two buildings read as the same
 * building twice.
 *
 * The one orange thing is you, in both buildings: the figure, its call lamp
 * while it is lit, and the clock counting your trip.
 */

export const HEADLINE_TOP = 256;
const LABEL_TOP = 440;
const CLOCK_TOP = 470;

/** Top of the tenth floor, and the height of one floor. */
const TOP = 532;
const FLOOR_H = 72;
/** The line a person on floor k stands on. */
const baseOf = (k: number) => TOP + (FLOORS - k + 1) * FLOOR_H;

const MID = WIDTH / 2;
const SHAFT_W = 132;
/** Gap between each shaft and the floor numbers in the middle. */
const GUTTER = 34;
const LANDING = 224;
const SLOT = 46;
const CAR_W = 124;
const CAR_H = 64;
const CAR_SLOT = 27;

type Side = { key: RuleKey; sign: -1 | 1 };
const SIDES: readonly Side[] = [
  { key: "order", sign: -1 },
  { key: "sweep", sign: 1 },
];

const LABELS: Record<RuleKey, string> = {
  order: "In order pressed",
  sweep: "One way, then back",
};

/** The shaft's edge nearest the landing, and its centre. */
const shaftOuter = (s: Side) => MID + s.sign * (GUTTER + SHAFT_W);
const shaftCentre = (s: Side) => MID + s.sign * (GUTTER + SHAFT_W / 2);
const landingFar = (s: Side) => shaftOuter(s) + s.sign * LANDING;
const laneCentre = (s: Side) => (MID + s.sign * GUTTER + landingFar(s)) / 2;
const slotX = (s: Side, i: number) => shaftOuter(s) + s.sign * (40 + i * SLOT);
const carSlotX = (s: Side, i: number) =>
  shaftCentre(s) + s.sign * (CAR_W / 2 - 20 - i * CAR_SLOT);

const heading = (r: Rider) => Math.sign(r.to - r.from);

const boardLeg = (day: Day, id: number) =>
  day.legs.find((l) => l.kind === "stop" && l.on.includes(id)) as Leg;
const exitLeg = (day: Day, id: number) =>
  day.legs.find((l) => l.kind === "stop" && l.off.includes(id)) as Leg;

/** Simulated seconds into a stop that a rider starts and stops walking. */
const WALK_FROM = 1;
const WALK_TO = 3.5;
const LEAVE_TO = 7;

/** Someone standing. The feet sit on `y`. */
const Figure: React.FC<{
  x: number;
  y: number;
  color: string;
  opacity?: number;
  scale?: number;
}> = ({ x, y, color, opacity = 1, scale = 1 }) => (
  <g
    transform={`translate(${x} ${y}) scale(${scale})`}
    opacity={opacity}
    fill={color}
  >
    <circle cx={0} cy={-46} r={10} />
    <rect x={-12} y={-33} width={24} height={33} rx={9} />
  </g>
);

/** Where one rider is at simulated second t, or null if they are not on screen. */
const place = (s: Side, day: Day, r: Rider, t: number) => {
  if (t < r.at) return null;
  const on = boardLeg(day, r.id);
  const off = exitLeg(day, r.id);
  const car = carAt(day, t);
  const carBase = baseOf(car.floor) - 4;

  const landingSlot = () =>
    RIDERS.filter(
      (o) =>
        o.from === r.from &&
        o.at <= t &&
        (o.at < r.at || (o.at === r.at && o.id < r.id)) &&
        boardLeg(day, o.id).from + WALK_FROM > t,
    ).length;

  const inCar = () =>
    RIDERS.filter((o) => {
      const b = boardLeg(day, o.id);
      const e = exitLeg(day, o.id);
      return (
        b.from + WALK_FROM <= t &&
        e.from + WALK_TO > t &&
        (b.from < on.from || (b.from === on.from && o.id < r.id))
      );
    }).length;

  const appear = interpolate(t, [r.at, r.at + 1.2], [0, 1], clamp);

  if (t < on.from + WALK_FROM) {
    return {
      x: slotX(s, landingSlot()),
      y: baseOf(r.from) - 8 * (1 - appear),
      opacity: appear,
    };
  }
  if (t < on.from + WALK_TO) {
    const u = interpolate(
      t,
      [on.from + WALK_FROM, on.from + WALK_TO],
      [0, 1],
      EASE_IN_OUT,
    );
    return {
      x:
        slotX(s, landingSlot()) +
        (carSlotX(s, inCar()) - slotX(s, landingSlot())) * u,
      y: baseOf(r.from) - 4 * u,
      opacity: 1,
    };
  }
  if (t < off.from + WALK_FROM) {
    return { x: carSlotX(s, inCar()), y: carBase, opacity: 1 };
  }
  if (t < off.from + LEAVE_TO) {
    const u = interpolate(
      t,
      [off.from + WALK_FROM, off.from + LEAVE_TO],
      [0, 1],
      EASE_IN_OUT,
    );
    const fade = interpolate(
      t,
      [off.from + WALK_TO, off.from + LEAVE_TO],
      [1, 0],
      clamp,
    );
    return {
      x:
        carSlotX(s, inCar()) +
        (landingFar(s) - 30 * s.sign - carSlotX(s, inCar())) * u,
      y: baseOf(r.to) - 4 * (1 - Math.min(1, u * 3)),
      opacity: fade,
    };
  }
  return null;
};

/** 0 shut, 1 open. Doors open over the first second of a stop and shut over the last. */
const doorsAt = (leg: Leg, t: number) =>
  leg.kind !== "stop"
    ? 0
    : Math.min(
        interpolate(t, [leg.from, leg.from + 1], [0, 1], clamp),
        interpolate(t, [leg.to - 1, leg.to], [1, 0], clamp),
      );

const Building: React.FC<{ side: Side; t: number }> = ({ side, t }) => {
  const day = DAYS[side.key];
  const car = carAt(day, t);
  const carBottom = baseOf(car.floor) - 4;
  const carTop = carBottom - CAR_H;
  const cx = shaftCentre(side);
  const doors = doorsAt(car.leg, t);
  const doorX = cx + side.sign * (CAR_W / 2);
  const gap = (CAR_H - 6) * doors;
  const shaftInner = MID + side.sign * GUTTER;
  const lineFrom = Math.min(shaftOuter(side), landingFar(side));
  const lineTo = Math.max(shaftOuter(side), landingFar(side));

  const waitingAt = (k: number, d: number) =>
    RIDERS.filter(
      (r) =>
        r.from === k &&
        heading(r) === d &&
        r.at <= t &&
        boardLeg(day, r.id).from + WALK_FROM > t,
    );

  return (
    <g>
      {/* Shaft walls and landings. */}
      <line
        x1={shaftInner}
        x2={shaftInner}
        y1={TOP - 8}
        y2={baseOf(1)}
        stroke={theme.colors.gray}
        strokeOpacity={0.35}
        strokeWidth={2}
      />
      <line
        x1={shaftOuter(side)}
        x2={shaftOuter(side)}
        y1={TOP - 8}
        y2={baseOf(1)}
        stroke={theme.colors.gray}
        strokeOpacity={0.35}
        strokeWidth={2}
      />
      {Array.from({ length: FLOORS }, (_, i) => {
        const k = i + 1;
        return (
          <line
            key={k}
            x1={lineFrom}
            x2={lineTo}
            y1={baseOf(k)}
            y2={baseOf(k)}
            stroke={theme.colors.gray}
            strokeOpacity={0.45}
            strokeWidth={2}
          />
        );
      })}

      {/* Call lamps on the landing wall: up above, down below. */}
      {Array.from({ length: FLOORS }, (_, i) => {
        const k = i + 1;
        const lx = shaftOuter(side) + side.sign * 15;
        return [1, -1].map((d) => {
          const waiting = waitingAt(k, d);
          const lit = waiting.length > 0;
          const mine = waiting.some((r) => r.id === YOU);
          const y = baseOf(k) - 52 + (d === 1 ? 0 : 18);
          const points =
            d === 1
              ? `${lx - 7},${y + 6} ${lx + 7},${y + 6} ${lx},${y - 6}`
              : `${lx - 7},${y - 6} ${lx + 7},${y - 6} ${lx},${y + 6}`;
          if ((k === 1 && d === -1) || (k === FLOORS && d === 1)) return null;
          return (
            <polygon
              key={`${k}-${d}`}
              points={points}
              fill={
                mine ? ACCENT : lit ? theme.colors.chalk : theme.colors.gray
              }
              opacity={lit ? 1 : 0.28}
            />
          );
        });
      })}

      {/* The cable, then the car. */}
      <line
        x1={cx}
        x2={cx}
        y1={TOP - 8}
        y2={carTop}
        stroke={theme.colors.gray}
        strokeOpacity={0.5}
        strokeWidth={2}
      />
      <rect
        x={cx - CAR_W / 2}
        y={carTop}
        width={CAR_W}
        height={CAR_H}
        rx={4}
        fill="#1A202B"
      />
      <path
        d={[
          `M ${doorX} ${carTop + 3}`,
          `L ${cx - side.sign * (CAR_W / 2)} ${carTop + 3}`,
          `L ${cx - side.sign * (CAR_W / 2)} ${carBottom - 3}`,
          `L ${doorX} ${carBottom - 3}`,
        ].join(" ")}
        fill="none"
        stroke={theme.colors.chalk}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* The door side: two leaves parting from the middle. */}
      <line
        x1={doorX}
        x2={doorX}
        y1={carTop + 3}
        y2={carTop + 3 + (CAR_H - 6 - gap) / 2}
        stroke={theme.colors.chalk}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <line
        x1={doorX}
        x2={doorX}
        y1={carBottom - 3 - (CAR_H - 6 - gap) / 2}
        y2={carBottom - 3}
        stroke={theme.colors.chalk}
        strokeWidth={3}
        strokeLinecap="round"
      />

      {/* People, drawn last so someone stepping through the doors is in front of them. */}
      {RIDERS.map((r) => {
        const p = place(side, day, r, t);
        if (!p) return null;
        const you = r.id === YOU;
        return (
          <Figure
            key={r.id}
            x={p.x}
            y={p.y}
            color={you ? ACCENT : theme.colors.chalk}
            opacity={p.opacity * (you ? 1 : 0.72)}
          />
        );
      })}
    </g>
  );
};

/**
 * Floors this car has travelled so far. The payoff line's two numbers, counted
 * up where the viewer can watch them happen rather than announced at the end.
 */
const ODOMETER_TOP = 1262;
const Odometer: React.FC<{ side: Side; t: number; verdict: number }> = ({
  side,
  t,
  verdict,
}) => {
  const day = DAYS[side.key];
  const floors = day.legs.filter((l) => l.kind === "move" && l.to <= t).length;
  return (
    <div
      style={{
        position: "absolute",
        top: ODOMETER_TOP,
        left: laneCentre(side) - 170,
        width: 340,
        textAlign: "center",
        fontFamily: theme.monoFamily,
        fontVariantNumeric: "tabular-nums",
        fontSize: 22,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: theme.colors.chalk,
        opacity: 0.55 + 0.45 * verdict,
      }}
    >
      {floors} floors
    </div>
  );
};

/** Your trip so far, on this car's clock. Stops when you step out. */
const Clock: React.FC<{ side: Side; t: number }> = ({ side, t }) => {
  const trip = YOUR_TRIP[side.key];
  const since = t - RIDERS[YOU].at;
  const done = since >= trip;
  const shown = Math.min(trip, Math.max(0, since));
  const started = since >= 0;
  return (
    <div
      style={{
        position: "absolute",
        top: CLOCK_TOP,
        left: laneCentre(side) - 170,
        width: 340,
        textAlign: "center",
        fontFamily: theme.monoFamily,
        fontVariantNumeric: "tabular-nums",
        color: ACCENT,
        opacity: started ? 1 : 0.4,
        fontSize: 44,
        fontWeight: done ? 700 : 500,
        letterSpacing: "-0.02em",
      }}
    >
      <span style={{ fontSize: 22, letterSpacing: "0.18em", marginRight: 14 }}>
        YOU
      </span>
      {clock(shown)}
    </div>
  );
};

export const Elevator: React.FC = () => {
  const frame = useCurrentFrame();
  const t = simAt(frame);
  const verdict = interpolate(
    frame,
    [VERDICT_FROM, VERDICT_FROM + 8],
    [0, 1],
    clamp,
  );

  return (
    <>
      {SIDES.map((side) => (
        <div
          key={side.key}
          style={{
            position: "absolute",
            top: LABEL_TOP,
            left: laneCentre(side) - 190,
            width: 380,
            textAlign: "center",
            fontFamily: theme.monoFamily,
            fontSize: 23,
            fontWeight: 500,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: theme.colors.chalk,
          }}
        >
          {LABELS[side.key]}
        </div>
      ))}
      {SIDES.map((side) => (
        <Clock key={side.key} side={side} t={t} />
      ))}
      {SIDES.map((side) => (
        <Odometer key={side.key} side={side} t={t} verdict={verdict} />
      ))}

      <svg
        width={WIDTH}
        height={1920}
        style={{ position: "absolute", inset: 0 }}
      >
        {Array.from({ length: FLOORS }, (_, i) => {
          const k = i + 1;
          return (
            <text
              key={k}
              x={MID}
              y={baseOf(k) - FLOOR_H / 2 + 8}
              textAnchor="middle"
              fontFamily={theme.monoFamily}
              fontSize={22}
              fill={theme.colors.grayDark}
            >
              {k}
            </text>
          );
        })}
        {SIDES.map((side) => (
          <Building key={side.key} side={side} t={t} />
        ))}
      </svg>
    </>
  );
};
