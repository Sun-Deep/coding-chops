import {
  FLOOR_S,
  RIDERS,
  RUNS,
  START_FLOOR,
  STOP_S,
  type Rider,
  type RuleKey,
} from "./measurements";

/**
 * Both rules, run again here on the measured riders, so the picture is drawn
 * from a simulation rather than from keyframes typed in by hand. The logic is
 * `scripts/measure-elevator.mjs` line for line, and the module throws on load
 * if any rider gets out at a different second or either car travels a
 * different number of floors than the committed run.
 */

type View = {
  floor: number;
  dir: number;
  waiting: Rider[];
  inside: Rider[];
};

type Step =
  | { stop: true; board: Rider[]; dir?: number }
  | { stop?: false; dir: number };

/** One stretch of the car's day: moving between two floors, or stopped at one. */
export type Leg = {
  readonly from: number;
  readonly to: number;
  readonly fromFloor: number;
  readonly toFloor: number;
  readonly kind: "move" | "stop" | "idle";
  /** On a stop: who got out and who got in. */
  readonly off: readonly number[];
  readonly on: readonly number[];
};

export type Day = {
  readonly legs: readonly Leg[];
  readonly picked: readonly number[];
  readonly out: readonly number[];
  readonly floors: number;
  readonly stops: number;
};

const inOrder = ({ floor, waiting, inside }: View): Step => {
  const rider = inside[0] ?? waiting[0];
  const target = inside[0] ? rider.to : rider.from;
  if (target === floor) {
    const next = inside[0] ? waiting[0] : rider;
    return { stop: true, board: next && next.from === floor ? [next] : [] };
  }
  return { dir: Math.sign(target - floor) };
};

const sweep = ({ floor, dir, waiting, inside }: View): Step => {
  const heading = (r: Rider) => Math.sign(r.to - r.from);
  const targets = [...inside.map((r) => r.to), ...waiting.map((r) => r.from)];
  const ahead = (d: number) => targets.some((f) => Math.sign(f - floor) === d);

  let d = dir !== 0 && ahead(dir) ? dir : 0;
  if (d === 0) {
    const here = waiting.find((r) => r.from === floor);
    if (here) d = heading(here);
    else {
      const nearest = targets.reduce((a, b) =>
        Math.abs(b - floor) < Math.abs(a - floor) ? b : a,
      );
      d = Math.sign(nearest - floor);
    }
  }

  const off = inside.some((r) => r.to === floor);
  const board = waiting.filter((r) => r.from === floor && heading(r) === d);
  if (off || board.length) return { stop: true, board, dir: d };
  return { dir: d };
};

const simulate = (choose: (v: View) => Step): Day => {
  let t = 0;
  let floor = START_FLOOR;
  let dir = 0;
  const waiting: Rider[] = [];
  const inside: Rider[] = [];
  const pending = [...RIDERS];
  const picked = new Array<number>(RIDERS.length).fill(-1);
  const out = new Array<number>(RIDERS.length).fill(-1);
  const legs: Leg[] = [];
  let floors = 0;
  let stops = 0;

  const arrive = () => {
    while (pending.length && pending[0].at <= t) {
      waiting.push(pending.shift() as Rider);
    }
  };

  arrive();
  while (waiting.length || inside.length || pending.length) {
    if (!waiting.length && !inside.length) {
      const next = pending[0].at;
      legs.push({
        from: t,
        to: next,
        fromFloor: floor,
        toFloor: floor,
        kind: "idle",
        off: [],
        on: [],
      });
      t = next;
      arrive();
      continue;
    }
    const step = choose({ floor, dir, waiting, inside });
    if (step.stop) {
      stops++;
      const off: number[] = [];
      for (let k = inside.length - 1; k >= 0; k--) {
        if (inside[k].to === floor) {
          out[inside[k].id] = t + STOP_S / 2;
          off.push(inside[k].id);
          inside.splice(k, 1);
        }
      }
      const on: number[] = [];
      for (const r of step.board) {
        waiting.splice(waiting.indexOf(r), 1);
        inside.push(r);
        picked[r.id] = t + STOP_S / 2;
        on.push(r.id);
      }
      legs.push({
        from: t,
        to: t + STOP_S,
        fromFloor: floor,
        toFloor: floor,
        kind: "stop",
        off,
        on,
      });
      t += STOP_S;
      dir = step.dir ?? dir;
      arrive();
      continue;
    }
    dir = step.dir;
    legs.push({
      from: t,
      to: t + FLOOR_S,
      fromFloor: floor,
      toFloor: floor + dir,
      kind: "move",
      off: [],
      on: [],
    });
    floor += dir;
    floors++;
    t += FLOOR_S;
    arrive();
  }
  return { legs, picked, out, floors, stops };
};

export const DAYS: Readonly<Record<RuleKey, Day>> = {
  order: simulate(inOrder),
  sweep: simulate(sweep),
};

for (const key of ["order", "sweep"] as const) {
  const day = DAYS[key];
  const run = RUNS[key];
  if (
    day.floors !== run.floors ||
    day.stops !== run.stops ||
    day.out.some((t, i) => t !== run.out[i])
  ) {
    throw new Error(`simulation.ts: ${key} disagrees with the committed run`);
  }
}

/** Where a car is at simulated second `t`: a fractional floor, and whether its doors are open. */
export const carAt = (day: Day, t: number) => {
  const legs = day.legs;
  if (t <= 0) return { floor: START_FLOOR, leg: legs[0], u: 0 };
  let lo = 0;
  let hi = legs.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (legs[mid].from <= t) lo = mid;
    else hi = mid - 1;
  }
  const leg = legs[lo];
  const u = Math.min(1, Math.max(0, (t - leg.from) / (leg.to - leg.from || 1)));
  return {
    floor: leg.fromFloor + (leg.toFloor - leg.fromFloor) * u,
    leg,
    u: t > leg.to ? 1 : u,
  };
};

/** The last second anything happens on this car. */
export const endOf = (day: Day) => day.legs[day.legs.length - 1].to;
