/**
 * One city block and the four junctions round it. One module, imported by
 * both the reel and `scripts/measure-gridlock.mjs`, so the frames and the
 * committed run are the same code.
 *
 * Four one-way streets, one lane each: across the top running west, down the
 * left running south, across the bottom running east, up the right running
 * north. So all four run anticlockwise round the block, the way a one-way
 * grid rings every other block, and the four junctions can lock into a loop.
 * The block is long and narrow, about the shape of a Manhattan one.
 *
 * Drivers follow the Intelligent Driver Model (Treiber, Hennecke and Helbing
 * 2000) toward whichever is nearer: the car ahead, or a stop line they may not
 * cross. A stop line holds a driver when the light is not green, or when a
 * car from the cross street is in the junction. Under the second rule, "room",
 * it also holds them until there is space past the junction for the whole
 * car. Under "green" there is no such check, so a driver who goes on green
 * behind a queue stops inside the junction, and the cross street waits for
 * them.
 *
 * Cars arrive at each street's far end at random, seeded, and leave at the
 * other. Fixed 0.1 s steps, so every run is identical.
 */

export const CAR_L = 4.5;
/** Road width, and so the size of a junction. */
export const ROAD = 7;
/** Kerb to kerb between junctions, along the rows and down the columns. */
export const BLOCK_X = 14;
export const BLOCK_Y = 54;
/** Visible road past the outer junctions. */
export const STUB = 4;
/** Road off screen, before cars come into view and after they leave it. */
export const RUN_IN = 80;
export const RUN_OUT = 30;
export const DT = 0.1;
export const RECORD = 0.2;
/** The run the reel shows. The script prints how often a seed locks. */
export const SEED = 1;

export const COL_X = [0, 1].map((j) => STUB + ROAD / 2 + j * (ROAD + BLOCK_X));
export const ROW_Y = [0, 1].map((i) => STUB + ROAD / 2 + i * (ROAD + BLOCK_Y));
export const MAP_W = 2 * STUB + 2 * ROAD + BLOCK_X;
export const MAP_H = 2 * STUB + 2 * ROAD + BLOCK_Y;

export type Dir = "E" | "W" | "N" | "S";
export type Axis = "row" | "col";
export type Street = {
  readonly axis: Axis;
  /** Row or column index. */
  readonly index: number;
  readonly dir: Dir;
  readonly length: number;
};

export const STREETS: readonly Street[] = [
  { axis: "row", index: 0, dir: "W", length: MAP_W + RUN_IN + RUN_OUT },
  { axis: "row", index: 1, dir: "E", length: MAP_W + RUN_IN + RUN_OUT },
  { axis: "col", index: 0, dir: "S", length: MAP_H + RUN_IN + RUN_OUT },
  { axis: "col", index: 1, dir: "N", length: MAP_H + RUN_IN + RUN_OUT },
];

/** Junction index for row i, column j. */
export const node = (i: number, j: number) => i * 2 + j;
export const NODES = 4;

/** Map metres for a point `s` metres along a street from where it starts. */
export const pointAt = (st: Street, s: number) => {
  switch (st.dir) {
    case "E":
      return { x: s - RUN_IN, y: ROW_Y[st.index] };
    case "W":
      return { x: MAP_W + RUN_IN - s, y: ROW_Y[st.index] };
    case "S":
      return { x: COL_X[st.index], y: s - RUN_IN };
    case "N":
      return { x: COL_X[st.index], y: MAP_H + RUN_IN - s };
  }
};

/** Heading in degrees, 0 = up the screen, for the car drawing. */
export const HEADING: Record<Dir, number> = { N: 0, E: 90, S: 180, W: 270 };

export type Box = {
  readonly node: number;
  readonly sIn: number;
  readonly sOut: number;
};

/** The junctions a street crosses, in the order its cars reach them. */
export const boxesOf = (st: Street): Box[] => {
  const out: Box[] = [];
  if (st.axis === "row") {
    for (let j = 0; j < 2; j++) {
      const x = COL_X[j];
      const sIn =
        st.dir === "E"
          ? x - ROAD / 2 + RUN_IN
          : MAP_W + RUN_IN - (x + ROAD / 2);
      out.push({ node: node(st.index, j), sIn, sOut: sIn + ROAD });
    }
  } else {
    for (let i = 0; i < 2; i++) {
      const y = ROW_Y[i];
      const sIn =
        st.dir === "S"
          ? y - ROAD / 2 + RUN_IN
          : MAP_H + RUN_IN - (y + ROAD / 2);
      out.push({ node: node(i, st.index), sIn, sOut: sIn + ROAD });
    }
  }
  return out.sort((a, b) => a.sIn - b.sIn);
};
const BOXES = STREETS.map(boxesOf);

/** Signal timing: rows green, all red, columns green, all red. */
export const GREEN = 12;
export const ALL_RED = 2;
export const CYCLE = 2 * GREEN + 2 * ALL_RED;

export type Light = "rows" | "cols" | "none";
export const lightAt = (offset: number, t: number): Light => {
  const p = (((t + offset) % CYCLE) + CYCLE) % CYCLE;
  if (p < GREEN) return "rows";
  if (p < GREEN + ALL_RED) return "none";
  if (p < 2 * GREEN + ALL_RED) return "cols";
  return "none";
};

export const DRIVER = { v0: 12.5, T: 1.2, a: 1.5, b: 2.0, s0: 2.0 } as const;
const idm = (v: number, dv: number, gap: number) => {
  const d = DRIVER;
  const want =
    d.s0 + Math.max(0, v * d.T + (v * dv) / (2 * Math.sqrt(d.a * d.b)));
  return d.a * (1 - (v / d.v0) ** 4 - (want / Math.max(gap, 0.1)) ** 2);
};

/** How far ahead a "room" driver judges where the car in front will be, s. */
export const ANTICIPATE = 2;

/** How close to a stop line a driver commits to crossing it. */
const commitZone = (v: number) => (v * v) / (2 * DRIVER.b) + 3;

export type Rule = "green" | "room";

export type Options = {
  /** Cars arriving per minute on each street. */
  readonly perMinute?: number;
  readonly seconds?: number;
  /** Share of drivers who go on green without checking for room. */
  readonly blockShare?: number;
  /** Light offsets in seconds per junction; seeded at random if absent. */
  readonly offsets?: readonly number[];
};

/**
 * Ten cars a minute on every street: about what one lane gets through a light
 * that is green 12 seconds in 28, so a rush hour, not a jam on arrival.
 */
export const DEFAULTS = { perMinute: 10, seconds: 300 } as const;

export type CarTrack = {
  readonly id: number;
  readonly street: number;
  /** Second it appeared at the start of its street. */
  readonly on: number;
  /** Metres along its street, and speed, every RECORD seconds from `on`. */
  readonly s: Float32Array;
  readonly v: Float32Array;
  /** Whether this driver goes on green without checking for room. */
  readonly blocker: boolean;
};

export type Run = {
  readonly rule: Rule;
  readonly offsets: readonly number[];
  readonly cars: readonly CarTrack[];
  /** Seconds at which a car's tail cleared a junction. */
  readonly crossings: readonly number[];
  /** Seconds at which a car left the map. */
  readonly exits: readonly number[];
  /** First second the block's loop was locked, or Infinity. */
  readonly lockedAt: number;
  /** Last second any car crossed a junction, if nothing crossed for 60 s after it. */
  readonly frozenAt: number;
};

const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
};

type Live = {
  id: number;
  on: number;
  s: number;
  v: number;
  blocker: boolean;
  /** Indexes into the street's boxes of junctions committed to and not yet cleared. */
  held: number[];
  logS: number[];
  logV: number[];
};

/**
 * The loop round the block, as the junction each car in it holds and the
 * street that car is on: west along the top holds the top right junction,
 * south down the left holds the top left, east along the bottom holds the
 * bottom left, north up the right holds the bottom right.
 */
export const LOOP: readonly { node: number; street: number }[] = [
  { node: node(0, 1), street: 0 },
  { node: node(0, 0), street: 2 },
  { node: node(1, 0), street: 1 },
  { node: node(1, 1), street: 3 },
];

export const simulate = (
  rule: Rule,
  seed: number = SEED,
  opts: Options = {},
): Run => {
  const perMinute = opts.perMinute ?? DEFAULTS.perMinute;
  const seconds = opts.seconds ?? DEFAULTS.seconds;
  const blockShare = opts.blockShare ?? (rule === "green" ? 1 : 0);
  const lightsRng = rng(seed * 7 + 3);
  const offsets =
    opts.offsets ?? Array.from({ length: NODES }, () => lightsRng() * CYCLE);
  // Arrivals and drivers are drawn from their own generators per street, so
  // the two rules see exactly the same cars at exactly the same times.
  const arrive = STREETS.map((_, k) => rng(seed * 101 + k * 13 + 1));
  const kind = STREETS.map((_, k) => rng(seed * 211 + k * 17 + 5));
  const lanes: Live[][] = STREETS.map(() => []);
  const waiting = STREETS.map(() => 0);
  const holders: Set<Live>[][] = Array.from({ length: NODES }, () => [
    new Set<Live>(),
    new Set<Live>(),
  ]);
  const done: CarTrack[] = [];
  const crossings: number[] = [];
  const exits: number[] = [];
  let lockedAt = Infinity;
  let id = 0;
  const every = Math.round(RECORD / DT);
  const rate = (perMinute / 60) * DT;

  const finish = (st: number, c: Live) =>
    done.push({
      id: c.id,
      street: st,
      on: c.on,
      s: new Float32Array(c.logS),
      v: new Float32Array(c.logV),
      blocker: c.blocker,
    });

  for (let k = 0; k * DT < seconds; k++) {
    const t = k * DT;
    const light = offsets.map((o) => lightAt(o, t));

    // Accelerations first, from everyone's current state.
    const acc: number[][] = lanes.map(() => []);
    for (let st = 0; st < STREETS.length; st++) {
      const axis = STREETS[st].axis === "row" ? 0 : 1;
      const boxes = BOXES[st];
      const lane = lanes[st];
      for (let i = 0; i < lane.length; i++) {
        const c = lane[i];
        const lead = i > 0 ? lane[i - 1] : null;
        let gap = lead ? lead.s - CAR_L - c.s : Infinity;
        let dv = lead ? c.v - lead.v : 0;
        const nb = boxes.findIndex((b) => b.sIn > c.s - 0.01);
        if (nb >= 0 && !c.held.includes(nb)) {
          const b = boxes[nb];
          const green = light[b.node] === (axis === 0 ? "rows" : "cols");
          const crossBusy = holders[b.node][1 - axis].size > 0;
          // Room: where the car ahead will be in ANTICIPATE seconds leaves a
          // whole car length clear past the junction.
          const room =
            !lead || lead.s - CAR_L + lead.v * ANTICIPATE >= b.sOut + CAR_L + 1;
          const open = green && !crossBusy && (c.blocker || room);
          const toLine = b.sIn - 0.5 - c.s;
          if (open && toLine < commitZone(c.v)) {
            c.held.push(nb);
            holders[b.node][axis].add(c);
          } else if (!open && toLine < gap) {
            gap = Math.max(0, toLine);
            dv = c.v;
          }
        }
        acc[st][i] = Math.max(-9, idm(c.v, dv, gap));
      }
    }

    // Move, release junctions, record crossings and exits.
    for (let st = 0; st < STREETS.length; st++) {
      const axis = STREETS[st].axis === "row" ? 0 : 1;
      const boxes = BOXES[st];
      const lane = lanes[st];
      for (let i = 0; i < lane.length; i++) {
        const c = lane[i];
        const v = Math.max(0, c.v + acc[st][i] * DT);
        let s = c.s + ((c.v + v) / 2) * DT;
        if (i > 0) s = Math.min(s, lane[i - 1].s - CAR_L - 0.2);
        c.v = s > c.s ? v : 0;
        c.s = Math.max(c.s, s);
        while (c.held.length && c.s - CAR_L > boxes[c.held[0]].sOut) {
          holders[boxes[c.held[0]].node][axis].delete(c);
          crossings.push(t);
          c.held.shift();
        }
        if (Math.round((t - c.on) / DT) % every === 0) {
          c.logS.push(c.s);
          c.logV.push(c.v);
        }
      }
      while (lane.length && lane[0].s - CAR_L > STREETS[st].length) {
        const c = lane.shift() as Live;
        exits.push(t);
        finish(st, c);
      }
    }

    // Arrivals, queued off screen until the start of the street is clear.
    for (let st = 0; st < STREETS.length; st++) {
      if (arrive[st]() < rate) waiting[st]++;
      const lane = lanes[st];
      const last = lane[lane.length - 1];
      if (waiting[st] > 0 && (!last || last.s - CAR_L > DRIVER.s0 + 6)) {
        waiting[st]--;
        const v = last
          ? Math.min(DRIVER.v0 * 0.8, last.v + 1)
          : DRIVER.v0 * 0.8;
        lane.push({
          id: id++,
          on: t,
          s: 0,
          v,
          blocker: kind[st]() < blockShare,
          held: [],
          logS: [0],
          logV: [v],
        });
      }
    }

    if (lockedAt === Infinity) {
      const locked = LOOP.every(({ node: n, street }) => {
        const axis = STREETS[street].axis === "row" ? 0 : 1;
        for (const c of holders[n][axis]) {
          const b = BOXES[street].find((x) => x.node === n) as Box;
          if (c.v < 0.05 && c.s > b.sIn && lanes[street].includes(c))
            return true;
        }
        return false;
      });
      if (locked) lockedAt = t;
    }
  }
  for (let st = 0; st < STREETS.length; st++)
    for (const c of lanes[st]) finish(st, c);

  let frozenAt = Infinity;
  for (let i = 0; i < crossings.length; i++) {
    const next = i + 1 < crossings.length ? crossings[i + 1] : seconds;
    if (next - crossings[i] >= 60) {
      frozenAt = crossings[i];
      break;
    }
  }
  return { rule, offsets, cars: done, crossings, exits, lockedAt, frozenAt };
};

/** Cars that crossed a junction between `from` and `to` seconds. */
export const crossedBetween = (run: Run, from: number, to: number) =>
  run.crossings.filter((t) => t >= from && t < to).length;
