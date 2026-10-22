/**
 * The car park. One module, imported by both the reel and
 * `scripts/measure-parking.mjs`, so the frames and the committed run are the
 * same code.
 *
 * Two aisles of 20 stalls a side, the store across the top with its door in
 * the middle, between the two aisles. Distances are metres and time is one-second ticks.
 *
 * The rest of the car park moves while you park: every parked car leaves at
 * random (on average after DWELL seconds) and other cars arrive every GAP
 * seconds on average and take the free stall nearest the door. So a close
 * spot that opens up is usually gone again quickly, which is what circling is
 * betting against.
 *
 * Two drivers arrive at the same moment in identical car parks:
 *
 *   row     turns into the aisle in front of the door, looks down it, and
 *           drives to the open stall nearest the store, taking any open stall
 *           it passes if that one has gone by the time it gets there
 *   circle  only takes a stall within NEAR stalls of the store, and loops the
 *           aisles until one is open as it drives past
 *
 * Then both walk to the door. The time that counts is arriving to the door.
 */

export const AISLES = 2;
export const STALLS = 20;
export const STALL_W = 2.7;
export const STALL_D = 5.5;
export const AISLE_W = 7;
export const LANE = 7;
export const BLOCK = 2 * STALL_D + AISLE_W;
export const LOT_W = AISLES * BLOCK;
export const LOT_L = LANE + STALLS * STALL_W + LANE;
export const DOOR_X = LOT_W / 2;

export type Settings = {
  /** Metres a second, driving and walking. */
  readonly drive: number;
  readonly walk: number;
  /** Seconds to pull into a stall. */
  readonly park: number;
  /** Stalls from the store the circler will accept. */
  readonly near: number;
  /** Mean seconds a parked car stays. */
  readonly dwell: number;
  /** Mean seconds between other cars arriving. */
  readonly gap: number;
  /** Chance a stall starts full, nearest the store and furthest from it. */
  readonly fullNear: number;
  readonly fullFar: number;
};

export const DEFAULTS: Settings = {
  drive: 3,
  walk: 1.4,
  park: 6,
  near: 6,
  dwell: 1800,
  gap: 15,
  fullNear: 0.97,
  fullFar: 0.45,
};

/**
 * The trip the reel shows. Not the first seed: chosen by `RANK=1` in the
 * script as the seed whose row time sits nearest the row median (55 s) and
 * whose circle time sits nearest the circle 90th percentile (276 s), so it is
 * an ordinary row trip beside the circling trip one driver in ten has.
 */
export const SEED = 179;
export const HORIZON = 600;

export const aisleX = (a: number) => BLOCK / 2 + BLOCK * a;

export type Stall = {
  readonly a: number;
  /** -1 left of the aisle, 1 right. */
  readonly side: number;
  /** 0 is the row nearest the store. */
  readonly j: number;
  readonly x: number;
  readonly y: number;
};

export const STALL_LIST: readonly Stall[] = (() => {
  const out: Stall[] = [];
  for (let a = 0; a < AISLES; a++) {
    for (const side of [-1, 1]) {
      for (let j = 0; j < STALLS; j++) {
        out.push({
          a,
          side,
          j,
          x: aisleX(a) + side * (AISLE_W / 2 + STALL_D / 2),
          y: LANE + STALL_W * (j + 0.5),
        });
      }
    }
  }
  return out;
})();

/** Walking route from a stall to the door: out to the aisle, up it, across. */
export const walkPath = (st: Stall) => [
  { x: st.x, y: st.y },
  { x: aisleX(st.a), y: st.y },
  { x: aisleX(st.a), y: LANE / 2 },
  { x: DOOR_X, y: LANE / 2 },
  { x: DOOR_X, y: -1 },
];

const pathLength = (pts: readonly { x: number; y: number }[]) => {
  let d = 0;
  for (let i = 1; i < pts.length; i++) {
    d += Math.abs(pts[i].x - pts[i - 1].x) + Math.abs(pts[i].y - pts[i - 1].y);
  }
  return d;
};

export const walkMetres = (st: Stall) => pathLength(walkPath(st));

const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
};

type World = {
  readonly start: boolean[];
  readonly leaves: number[][];
  readonly arrives: boolean[];
};

const makeWorld = (seed: number, s: Settings): World => {
  const random = rng(seed);
  const start = STALL_LIST.map((st) => {
    const p = s.fullNear + ((s.fullFar - s.fullNear) * st.j) / (STALLS - 1);
    return random() < p;
  });
  const leaves: number[][] = [];
  const arrives: boolean[] = [];
  for (let t = 0; t < HORIZON; t++) {
    const out: number[] = [];
    for (let i = 0; i < STALL_LIST.length; i++) {
      if (random() < 1 / s.dwell) out.push(i);
    }
    leaves.push(out);
    arrives.push(random() < 1 / s.gap);
  }
  return { start, leaves, arrives };
};

export type DriverKey = "row" | "circle";

export type Trip = {
  /** Hero position per tick, metres, and what they were doing. */
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly mode: Uint8Array;
  /** Stall occupancy per tick, 1 full, for drawing the other cars. */
  readonly full: Uint8Array;
  readonly stall: number;
  readonly parkedAt: number;
  /** Seconds from arriving at the car park to reaching the door. */
  readonly seconds: number;
  readonly drivenMetres: number;
};

export const DRIVING = 0;
export const PARKING = 1;
export const WALKING = 2;
export const INSIDE = 3;

export const trip = (
  driver: DriverKey,
  seed: number = SEED,
  settings: Settings = DEFAULTS,
  /** Record every stall on every tick, which only the reel needs. */
  frames = false,
): Trip => {
  const world = makeWorld(seed, settings);
  const full = [...world.start];
  const n = STALL_LIST.length;
  const X: number[] = [];
  const Y: number[] = [];
  const M: number[] = [];
  const F: number[] = [];
  let t = 0;
  let x = 4;
  let y = LOT_L - LANE / 2;
  let driven = 0;

  const record = (mode: number) => {
    X.push(x);
    Y.push(y);
    M.push(mode);
    if (frames) for (let i = 0; i < n; i++) F.push(full[i] ? 1 : 0);
  };

  const tick = (mode: number) => {
    record(mode);
    if (t < HORIZON) {
      for (const i of world.leaves[t]) full[i] = false;
      if (world.arrives[t]) {
        let best = -1;
        let bestWalk = Infinity;
        for (let i = 0; i < n; i++) {
          if (full[i]) continue;
          const w = walkMetres(STALL_LIST[i]);
          if (w < bestWalk) {
            bestWalk = w;
            best = i;
          }
        }
        if (best >= 0) full[best] = true;
      }
    }
    t++;
  };

  /** Stall beside the car right now in aisle a, open, within `upTo` rows. */
  const beside = (a: number, upTo: number) => {
    for (let i = 0; i < n; i++) {
      const st = STALL_LIST[i];
      if (st.a !== a || full[i] || st.j > upTo) continue;
      if (Math.abs(st.y - y) <= settings.drive / 2) return i;
    }
    return -1;
  };

  /** Drive in a straight line, a tick at a time, stopping if `look` finds a stall. */
  const driveTo = (nx: number, ny: number, look?: () => number) => {
    const d = Math.abs(nx - x) + Math.abs(ny - y);
    const steps = Math.max(1, Math.round(d / settings.drive));
    const sx = x;
    const sy = y;
    for (let k = 1; k <= steps; k++) {
      tick(DRIVING);
      x = sx + ((nx - sx) * k) / steps;
      y = sy + ((ny - sy) * k) / steps;
      driven += d / steps;
      if (look) {
        const got = look();
        if (got >= 0) return got;
      }
    }
    return -1;
  };

  const back = LOT_L - LANE / 2;
  const front = LANE / 2;
  const doorAisle = Math.floor(AISLES / 2);
  let stall = -1;

  if (driver === "row") {
    driveTo(aisleX(doorAisle), back);
    let target = -1;
    for (let i = 0; i < n; i++) {
      const st = STALL_LIST[i];
      if (st.a !== doorAisle || full[i]) continue;
      if (target < 0 || st.j < STALL_LIST[target].j) target = i;
    }
    if (target >= 0) {
      driveTo(aisleX(doorAisle), STALL_LIST[target].y);
      stall = full[target] ? -1 : target;
    }
    if (stall < 0)
      stall = driveTo(aisleX(doorAisle), front, () =>
        beside(doorAisle, STALLS),
      );
    for (let k = 1; stall < 0 && k < AISLES; k++) {
      const a = (doorAisle + k) % AISLES;
      driveTo(aisleX(a), front);
      stall = driveTo(aisleX(a), back, () => beside(a, STALLS));
    }
  } else {
    // Up the door aisle, across, down the next, across, up the next: every
    // aisle in turn, alternating direction, for as long as it takes.
    driveTo(aisleX(doorAisle), back);
    for (let k = 0; stall < 0 && t < HORIZON - 120; k++) {
      const a = (doorAisle + k) % AISLES;
      const up = k % 2 === 0;
      driveTo(aisleX(a), up ? back : front);
      stall = driveTo(aisleX(a), up ? front : back, () =>
        beside(a, settings.near),
      );
    }
  }

  if (stall < 0) {
    return {
      x: new Float32Array(X),
      y: new Float32Array(Y),
      mode: new Uint8Array(M),
      full: new Uint8Array(F),
      stall: -1,
      parkedAt: -1,
      seconds: Infinity,
      drivenMetres: driven,
    };
  }

  full[stall] = true;
  const st = STALL_LIST[stall];
  const ax = x;
  for (let k = 1; k <= settings.park; k++) {
    tick(PARKING);
    x = ax + ((st.x - ax) * k) / settings.park;
  }
  const parkedAt = t;
  const route = walkPath(st);
  for (let leg = 1; leg < route.length; leg++) {
    const from = { x, y };
    const to = route[leg];
    const d = Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
    const steps = Math.max(1, Math.round(d / settings.walk));
    for (let k = 1; k <= steps; k++) {
      tick(WALKING);
      x = from.x + ((to.x - from.x) * k) / steps;
      y = from.y + ((to.y - from.y) * k) / steps;
    }
  }
  const seconds = t;
  for (let k = 0; k < 4; k++) tick(INSIDE);
  return {
    x: new Float32Array(X),
    y: new Float32Array(Y),
    mode: new Uint8Array(M),
    full: new Uint8Array(F),
    stall,
    parkedAt,
    seconds,
    drivenMetres: driven,
  };
};
