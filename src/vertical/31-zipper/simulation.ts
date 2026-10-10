/**
 * A two-lane road where the right lane ends at a row of cones. One module,
 * imported by both the reel and `scripts/measure-zipper.mjs`, so the frames
 * and the committed run are the same code.
 *
 * Cars arrive at random, seeded, half in each lane. Past the cones there is
 * one lane, and one car gets through it every HEADWAY seconds, the capacity
 * of a lane at a lane closure. More cars arrive than that, so a queue builds.
 * When there is a car waiting at the front of both lanes they go one from
 * each lane in turn; when only one lane has a car at the front, it goes.
 *
 * Two ways to drive the lane that ends:
 *
 *   early   its drivers move over to the other lane as soon as they can, and
 *           join the back of that lane's queue; a share STAY of them stay in
 *           the ending lane to the cones
 *   zipper  everyone uses both lanes to the cones, keeping to their own
 *           unless the other has BALANCE fewer cars queued
 *
 * The second is the zipper merge. Turn about at the front is round-robin:
 * each queue gets the next turn in rotation, whatever its length, which is
 * how a computer shares one processor between programs.
 *
 * Both roads get the same cars at the same moments, so the only difference is
 * who moves over early. Who goes through when is decided by the cones alone
 * (`schedule`); the motion the reel draws (`simulate`) follows that schedule
 * and cannot change it.
 */

export type Rule = "early" | "zipper";

export const CAR_L = 4.5;
/** Front to front in a stopped queue. */
export const SPACING = 7;
/** Seconds between cars through the cones. */
export const HEADWAY = 2.25;
/** Cars per second arriving, both lanes together. */
export const DEMAND = 2000 / 3600;
/** Share of drivers in the ending lane who stay in it to the cones, early rule. */
export const STAY = 0.25;
/** Cars appear this far before the cones, at full speed, and leave this far after. */
export const SPAWN = 900;
export const EXIT = 80;
export const SPEED = 20;
/** The "lane ends" sign, metres before the cones. Early movers pull over once past it. */
export const SIGN = 300;
/** Zipper rule: a driver switches lanes if the other queue is this many cars shorter. */
export const BALANCE = 2;
export const SEED = 1;

export type Options = {
  readonly stay?: number;
  readonly demand?: number;
  readonly headway?: number;
  readonly balance?: number;
};

export type Car = {
  readonly id: number;
  /** Second it appears, SPAWN metres before the cones. */
  readonly arrive: number;
  /** Lane it arrives in: 0 the lane that goes on, 1 the lane that ends. */
  readonly from: 0 | 1;
  /** Under the early rule, this driver stays in the ending lane. */
  readonly stays: boolean;
  /** Lane it queues in at the cones. */
  readonly lane: 0 | 1;
  /** Second it is let through the cones. */
  readonly through: number;
};

const rng = (seed: number) => {
  let s = seed >>> 0;
  const next = () =>
    (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 8; i++) next();
  return next;
};

/** Seconds from appearing to the cones on an empty road. */
export const FREE = SPAWN / SPEED;

/**
 * Who goes through the cones when. Arrival gaps, lanes and stay flags come
 * from generators of their own, so changing STAY moves nobody's arrival.
 */
export const schedule = (
  rule: Rule,
  seed: number = SEED,
  until = 600,
  opts: Options = {},
): Car[] => {
  const demand = opts.demand ?? DEMAND;
  const stay = opts.stay ?? STAY;
  const headway = opts.headway ?? HEADWAY;
  const balance = opts.balance ?? BALANCE;
  const gaps = rng(seed * 7919 + 1);
  const lanes = rng(seed * 7919 + 2);
  const stays = rng(seed * 7919 + 3);
  const list: { t: number; from: 0 | 1; stays: boolean }[] = [];
  for (let t = -Math.log(1 - gaps()) / demand; t < until; ) {
    list.push({ t, from: lanes() < 0.5 ? 0 : 1, stays: stays() < stay });
    t += -Math.log(1 - gaps()) / demand;
  }
  const queue: number[][] = [[], []];
  const lane = new Array<0 | 1>(list.length);
  const through = new Array<number>(list.length).fill(Infinity);
  const head = [0, 0];
  let free = 0;
  let last: 0 | 1 = 1;
  const ready = (l: 0 | 1) =>
    head[l] < queue[l].length ? list[queue[l][head[l]]].t + FREE : Infinity;
  /** Let cars through the cones, in order, up to second `until`. */
  const serve = (until: number) => {
    for (;;) {
      const r = [ready(0), ready(1)];
      const t = Math.max(free, Math.min(r[0], r[1]));
      if (t === Infinity || t > until) return;
      let pick: 0 | 1;
      if (r[0] <= t && r[1] <= t) pick = last === 0 ? 1 : 0;
      else pick = r[0] <= t ? 0 : 1;
      through[queue[pick][head[pick]]] = t;
      head[pick]++;
      last = pick;
      free = t + headway;
    }
  };
  list.forEach((c, i) => {
    serve(c.t);
    let l: 0 | 1;
    if (rule === "early") l = c.from === 1 && c.stays ? 1 : 0;
    else {
      // Using both lanes: keep to your own unless the other is clearly
      // shorter, which keeps the two queues about level.
      const ahead = [0, 1].map((k) => queue[k].length - head[k]);
      const other = (1 - c.from) as 0 | 1;
      l = ahead[other] <= ahead[c.from] - balance ? other : c.from;
    }
    lane[i] = l;
    queue[l].push(i);
  });
  serve(Infinity);
  return list.map((c, id) => ({
    id,
    arrive: c.t,
    from: c.from,
    stays: c.stays,
    lane: lane[id],
    through: through[id],
  }));
};

/** Seconds lost to the queue. */
export const delay = (c: Car) => c.through - c.arrive - FREE;

/**
 * The motion the reel draws. Every car drives in at SPEED, brakes to its
 * place in its lane's queue (SPACING behind the car ahead, counting only cars
 * not yet through), creeps up as the queue moves, and at its `through`
 * second pulls away. An early mover pulls over once past the sign; a zipper
 * driver switching lanes does it at the back of the other lane's queue.
 * Recorded every RECORD seconds.
 */
export type Motion = {
  readonly cars: readonly Car[];
  readonly steps: number;
  /** Per step per car: metres from the cones (negative before), lane 0 to 1, speed, acceleration. NaN while off the road. */
  readonly x: Float32Array;
  readonly lane: Float32Array;
  readonly v: Float32Array;
  readonly a: Float32Array;
};

export const RECORD = 0.1;
const DT = 0.05;
/** Gap the front car stops at, before the line. */
const FRONT = 2;
const ACCEL = 2.5;
const BRAKE = 2.2;
const MOVE_M = 40;

export const simulate = (
  rule: Rule,
  seed: number = SEED,
  until = 600,
  opts: Options = {},
): Motion => {
  const cars = schedule(rule, seed, until, opts);
  const n = cars.length;
  const steps = Math.floor(until / RECORD) + 1;
  const X = new Float32Array(steps * n).fill(NaN);
  const LANE = new Float32Array(steps * n).fill(NaN);
  const V = new Float32Array(steps * n);
  const A = new Float32Array(steps * n);

  // Each car's place in its queue lane, and that lane's through times in
  // order, so "cars ahead not yet through" is a count.
  const byLane: number[][] = [[], []];
  for (const c of cars) byLane[c.lane].push(c.id);
  const indexIn = new Array<number>(n);
  for (const lane of byLane) lane.forEach((id, i) => (indexIn[id] = i));
  const laneThrough = byLane.map((lane) => lane.map((id) => cars[id].through));
  const doneBefore = (lane: 0 | 1, t: number) => {
    const xs = laneThrough[lane];
    let lo = 0;
    let hi = xs.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (xs[mid] <= t) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };

  const x = new Array<number>(n).fill(-SPAWN);
  const v = new Array<number>(n).fill(SPEED);
  const acc = new Array<number>(n).fill(0);
  const side = cars.map((c) => c.from as number);
  const moveFrom = new Array<number | null>(n).fill(null);

  const total = Math.round(until / DT);
  for (let k = 0; k <= total; k++) {
    const t = k * DT;
    for (const c of cars) {
      const i = c.id;
      if (c.arrive > t || x[i] > EXIT) continue;
      let a: number;
      if (t >= c.through) {
        a = ACCEL * (1 - (v[i] / SPEED) ** 4);
      } else {
        const rank = indexIn[i] - doneBefore(c.lane, t);
        const slot = -FRONT - rank * SPACING;
        const gap = Math.max(0, slot - x[i]);
        const want = Math.min(SPEED, Math.sqrt(2 * BRAKE * gap));
        a = Math.max(-8, Math.min(ACCEL, (want - v[i]) / 0.6));
      }
      acc[i] = a;
      v[i] = Math.max(0, v[i] + a * DT);
      x[i] += v[i] * DT;

      // Moving over: an early mover pulls over once past the sign; a
      // zipper driver switching to the shorter lane does it on reaching the
      // back of that lane's queue.
      if (c.from !== c.lane && moveFrom[i] === null) {
        const rank = indexIn[i] - doneBefore(c.lane, t);
        const slot = -FRONT - rank * SPACING;
        if (slot - x[i] < MOVE_M || (rule === "early" && x[i] > -SIGN))
          moveFrom[i] = x[i];
      }
      if (moveFrom[i] !== null && t < c.through) {
        const u = Math.min(1, (x[i] - moveFrom[i]!) / 24 + 0.04);
        side[i] = c.from + (c.lane - c.from) * u * u * (3 - 2 * u);
      }
      // Past the cones the ending lane folds into the other.
      if (c.lane === 1 && t >= c.through && x[i] > -4) {
        const u = Math.min(1, (x[i] + 4) / 26);
        side[i] = 1 - u * u * (3 - 2 * u);
      }
    }
    if (k % 2 === 0) {
      const s = k / 2;
      if (s >= steps) break;
      for (const c of cars) {
        const i = c.id;
        if (c.arrive > t || x[i] > EXIT) continue;
        const at = s * n + i;
        X[at] = x[i];
        LANE[at] = side[i];
        V[at] = v[i];
        A[at] = acc[i];
      }
    }
  }
  return { cars, steps, x: X, lane: LANE, v: V, a: A };
};

/** Metres from the cones back to the last stopped or crawling car, at t. */
export const queueAt = (run: Motion, t: number) => {
  const s = Math.min(run.steps - 1, Math.round(t / RECORD));
  const n = run.cars.length;
  let far = 0;
  for (let i = 0; i < n; i++) {
    const x = run.x[s * n + i];
    if (!Number.isNaN(x) && x < 0 && run.v[s * n + i] < 3)
      far = Math.max(far, -x);
  }
  return far;
};

/**
 * The car the reel follows: the first to arrive in the ending lane after
 * `after` seconds who, under the early rule, moves over. And the first after
 * it who stays in the ending lane.
 */
export const HERO_AFTER = 180;
export const hero = (cars: readonly Car[], after = HERO_AFTER) => {
  const you = cars.find((c) => c.arrive > after && c.from === 1 && !c.stays)!;
  const them = cars.find(
    (c) => c.arrive > you.arrive && c.from === 1 && c.stays,
  )!;
  return { you: you.id, them: them.id };
};

/** Cars that arrived after car `id` and got through the cones before it. */
export const passedBy = (cars: readonly Car[], id: number, t = Infinity) =>
  cars.filter(
    (c) =>
      c.arrive > cars[id].arrive &&
      c.through < cars[id].through &&
      c.through <= t,
  ).length;
