/**
 * One junction of two single-lane roads, built twice: once with traffic
 * lights, once as a roundabout. The same cars arrive at the same seconds,
 * from the same directions, going the same ways.
 *
 * Cars drive by the Intelligent Driver Model (Treiber, Hennecke and Helbing
 * 2000) along lanes made of segments. At the lights, each road gets green in
 * turn; the lights are actuated, so a green is held while cars keep coming
 * and given up when they stop, between a minimum and a maximum, the way
 * most junctions with detectors run. Turning left on green waits for a gap
 * in the oncoming traffic, in the middle of the junction, as people do. At
 * the roundabout, a car at the give-way line goes when the next car coming
 * round is at least TC seconds away, the critical headway the Highway
 * Capacity Manual (6th edition) gives for single-lane roundabouts, and
 * queued cars follow each other in at the follow-up headway the car model
 * produces by itself.
 *
 * Delay is how much longer a car takes from arriving to leaving than it
 * would have on its own with the road clear: the time the junction cost it.
 *
 * Everything is seeded. Nothing in it depends on a value the reel does not
 * print or the script does not sweep.
 */

export type Rule = "lights" | "roundabout";
export type Turn = "left" | "straight" | "right";

/** Arms in counter-clockwise order: south, east, north, west. */
export const ARMS = ["south", "east", "north", "west"] as const;
const PHI = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];

export const LANE = 3.5;
/** Metres from the middle of the junction to where cars appear and leave. */
export const ARM_LENGTH = 150;
/** Lights: the stop line, metres from the middle. */
export const STOP_LINE = 9.5;
/** Roundabout: radius of the circulating lane's centre, and the give-way line. */
export const RING = 12;
export const GIVE_WAY = 17;
/** Where entries join the ring and exits leave it, either side of each arm. */
const RING_SPLAY = (30 * Math.PI) / 180;

export const CAR_LENGTH = 4.5;
/** Speed limits, metres a second. 13.4 is 30 mph. */
export const ROAD_V = 13.4;
const RING_V = 7.5;
const ENTRY_V = 8;
const LEFT_V = 7.5;
const RIGHT_V = 5.5;

/** Intelligent Driver Model, city driving. */
const IDM = { a: 2.0, b: 2.0, s0: 2.0, T: 1.1, delta: 4 };

/**
 * Roundabout: a driver at the line goes when the next car coming round
 * will reach the merge no sooner than TC seconds from now, and no sooner
 * than MARGIN seconds after the driver can get there themselves. Calibrated,
 * not looked up: with these values the model's entry capacity, measured
 * against the flow actually going round, is within a few per cent of the
 * Highway Capacity Manual (6th edition) single-lane curve,
 * 1380 x exp(-0.00102 x circulating), at moderate flows, and below it on a
 * busy ring, so if anything it is hard on the roundabout. The script sweeps
 * the margin.
 */
export const MARGIN = 1.5;
export const TC = 3.25;
/** Turning left across oncoming traffic on a green: the gap people take. */
export const LEFT_GAP = 4.5;

export type Signals = {
  minGreen: number;
  maxGreen: number;
  /** Green ends once no car is within this many metres of the line. */
  gapOut: number;
  amber: number;
  allRed: number;
  /** Fixed time instead: each green this long, every cycle. */
  fixedGreen?: number;
};
export const SIGNALS: Signals = {
  minGreen: 8,
  maxGreen: 32,
  gapOut: 30,
  amber: 3.5,
  allRed: 1.5,
};

export type Options = {
  /** Cars an hour arriving on each arm: south, east, north, west. */
  flows?: readonly number[];
  /** Share of cars turning left and right; the rest go straight. */
  left?: number;
  right?: number;
  tc?: number;
  margin?: number;
  signals?: Partial<Signals>;
  /** Seconds of warm-up before the hour that is measured. */
  warm?: number;
  /** Seconds of arrivals measured. */
  hour?: number;
};

export const FLOWS = [450, 450, 450, 450] as const;
export const LEFT = 0.2;
export const RIGHT = 0.15;
export const WARM = 300;
export const HOUR = 3600;

const settings = (o: Options = {}) => ({
  flows: o.flows ?? FLOWS,
  left: o.left ?? LEFT,
  right: o.right ?? RIGHT,
  tc: o.tc ?? TC,
  margin: o.margin ?? MARGIN,
  signals: { ...SIGNALS, ...(o.signals ?? {}) },
  warm: o.warm ?? WARM,
  hour: o.hour ?? HOUR,
});

// ------------------------------------------------------------- geometry

export type Pt = { x: number; y: number };

type Segment = {
  id: number;
  pts: Pt[];
  cum: number[];
  length: number;
  vmax: number;
  start: number;
  end: number;
  kind: "feeder" | "approach" | "exit" | "inner" | "entry" | "ring";
  arm: number;
  turn?: Turn;
};

const dir = (k: number): Pt => ({ x: Math.cos(PHI[k]), y: Math.sin(PHI[k]) });
const add = (a: Pt, b: Pt, k = 1): Pt => ({
  x: a.x + b.x * k,
  y: a.y + b.y * k,
});
/** Inbound lane: on the right of a car driving in. */
const inOff = (k: number): Pt => {
  const d = dir(k);
  return { x: -d.y * (LANE / 2), y: d.x * (LANE / 2) };
};
const outOff = (k: number): Pt => {
  const d = dir(k);
  return { x: d.y * (LANE / 2), y: -d.x * (LANE / 2) };
};
/** A point `m` metres to the right of a car driving in on arm k. */
const lat = (k: number, m: number): Pt => {
  const d = dir(k);
  return { x: -d.y * m, y: d.x * m };
};
/** Lights: the road widens to three lanes this far out, over TAPER metres. */
export const POCKET = 50;
const TAPER = 18;

const bezier = (a: Pt, b: Pt, c: Pt, d: Pt, n = 24): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push({
      x:
        u * u * u * a.x +
        3 * u * u * t * b.x +
        3 * u * t * t * c.x +
        t * t * t * d.x,
      y:
        u * u * u * a.y +
        3 * u * u * t * b.y +
        3 * u * t * t * c.y +
        t * t * t * d.y,
    });
  }
  return out;
};

const intersect = (p: Pt, r: Pt, q: Pt, s: Pt): Pt => {
  const cross = r.x * s.y - r.y * s.x;
  if (Math.abs(cross) < 1e-9) return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
  const t = ((q.x - p.x) * s.y - (q.y - p.y) * s.x) / cross;
  return { x: p.x + r.x * t, y: p.y + r.y * t };
};

const turnTo = (arm: number, turn: Turn) =>
  (arm + (turn === "right" ? 1 : turn === "straight" ? 2 : 3)) % 4;

export type Network = {
  rule: Rule;
  segments: Segment[];
  routes: number[][][];
  /** Segments starting at each node. */
  from: Map<number, number[]>;
  /** Where cars appear on each arm. */
  approach: number[];
  /** The lanes that end at the stop or give-way line on each arm: lights,
   *  through-and-right then the left-turn lane; roundabout, the one lane. */
  stopLanes: number[][];
  /** Roundabout: the ring segment that starts at each arm's entry node. */
  ringAfterEntry: number[];
  ringBefore: Map<number, number>;
};

export const network = (rule: Rule): Network => {
  const segments: Segment[] = [];
  let node = 0;
  const seg = (
    pts: Pt[],
    vmax: number,
    start: number,
    end: number,
    kind: Segment["kind"],
    arm: number,
    turn?: Turn,
  ) => {
    const cum = [0];
    for (let i = 1; i < pts.length; i++)
      cum.push(
        cum[i - 1] +
          Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y),
      );
    const s: Segment = {
      id: segments.length,
      pts,
      cum,
      length: cum[cum.length - 1],
      vmax,
      start,
      end,
      kind,
      arm,
      turn,
    };
    segments.push(s);
    return s.id;
  };
  const inner = rule === "lights" ? STOP_LINE : GIVE_WAY;
  const approachEnd = ARMS.map(() => node++);
  const exitStart = ARMS.map(() => node++);
  const routes: number[][][] = ARMS.map(() => []);
  const ringAfterEntry: number[] = [];
  const ringBefore = new Map<number, number>();
  let approach: number[];
  let stopLanes: number[][];
  let exit: number[];
  const along = (k: number, r: number, m: number) => add(lat(k, m), dir(k), r);
  if (rule === "lights") {
    const split = ARMS.map(() => node++);
    const pocketEnd = ARMS.map(() => node++);
    approach = ARMS.map((_, k) =>
      seg(
        [along(k, ARM_LENGTH, LANE / 2), along(k, POCKET, LANE / 2)],
        ROAD_V,
        node++,
        split[k],
        "feeder",
        k,
      ),
    );
    const throughLane = ARMS.map((_, k) =>
      seg(
        [
          along(k, POCKET, LANE / 2),
          along(k, POCKET - TAPER, LANE),
          along(k, STOP_LINE, LANE),
        ],
        ROAD_V,
        split[k],
        approachEnd[k],
        "approach",
        k,
      ),
    );
    const pocket = ARMS.map((_, k) =>
      seg(
        [
          along(k, POCKET, LANE / 2),
          along(k, POCKET - TAPER, 0),
          along(k, STOP_LINE, 0),
        ],
        ROAD_V,
        split[k],
        pocketEnd[k],
        "approach",
        k,
      ),
    );
    stopLanes = ARMS.map((_, k) => [throughLane[k], pocket[k]]);
    exit = ARMS.map((_, k) =>
      seg(
        [
          along(k, STOP_LINE, -LANE),
          along(k, POCKET - TAPER, -LANE),
          along(k, POCKET, -LANE / 2),
          along(k, ARM_LENGTH, -LANE / 2),
        ],
        ROAD_V,
        exitStart[k],
        node++,
        "exit",
        k,
      ),
    );
    for (let k = 0; k < 4; k++) {
      for (const turn of ["left", "straight", "right"] as Turn[]) {
        const o = turnTo(k, turn);
        const a = along(k, STOP_LINE, turn === "left" ? 0 : LANE);
        const b = along(o, STOP_LINE, -LANE);
        const din = { x: -dir(k).x, y: -dir(k).y };
        let pts: Pt[];
        if (turn === "straight") pts = [a, b];
        else {
          const c = intersect(a, din, b, dir(o));
          pts = bezier(
            a,
            add(a, add(c, a, -1), 0.55),
            add(b, add(c, b, -1), 0.55),
            b,
          );
        }
        const v =
          turn === "straight" ? ROAD_V : turn === "left" ? LEFT_V : RIGHT_V;
        const id = seg(
          pts,
          v,
          turn === "left" ? pocketEnd[k] : approachEnd[k],
          exitStart[o],
          "inner",
          k,
          turn,
        );
        routes[k][["left", "straight", "right"].indexOf(turn)] = [
          approach[k],
          turn === "left" ? pocket[k] : throughLane[k],
          id,
          exit[o],
        ];
      }
    }
  } else {
    approach = ARMS.map((_, k) =>
      seg(
        [add(inOff(k), dir(k), ARM_LENGTH), add(inOff(k), dir(k), inner)],
        ROAD_V,
        node++,
        approachEnd[k],
        "approach",
        k,
      ),
    );
    stopLanes = approach.map((a) => [a]);
    exit = ARMS.map((_, k) =>
      seg(
        [add(outOff(k), dir(k), inner), add(outOff(k), dir(k), ARM_LENGTH)],
        ROAD_V,
        exitStart[k],
        node++,
        "exit",
        k,
      ),
    );
    // Ring nodes counter-clockwise: each arm's exit, then its entry.
    const nodes: {
      angle: number;
      arm: number;
      kind: "exit" | "entry";
      id: number;
    }[] = [];
    for (let k = 0; k < 4; k++) {
      nodes.push({
        angle: PHI[k] - RING_SPLAY,
        arm: k,
        kind: "exit",
        id: node++,
      });
      nodes.push({
        angle: PHI[k] + RING_SPLAY,
        arm: k,
        kind: "entry",
        id: node++,
      });
    }
    const at = (a: number): Pt => ({
      x: RING * Math.cos(a),
      y: RING * Math.sin(a),
    });
    const tangent = (a: number): Pt => ({ x: -Math.sin(a), y: Math.cos(a) });
    const ringSeg: number[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const n0 = nodes[i];
      const n1 = nodes[(i + 1) % nodes.length];
      let a1 = n1.angle;
      while (a1 <= n0.angle) a1 += 2 * Math.PI;
      const steps = 12;
      const pts: Pt[] = [];
      for (let j = 0; j <= steps; j++)
        pts.push(at(n0.angle + ((a1 - n0.angle) * j) / steps));
      ringSeg.push(seg(pts, RING_V, n0.id, n1.id, "ring", n0.arm));
    }
    for (let i = 0; i < ringSeg.length; i++)
      ringBefore.set(ringSeg[(i + 1) % ringSeg.length], ringSeg[i]);
    const entry: number[] = [];
    const exitPath: number[] = [];
    for (let k = 0; k < 4; k++) {
      const ni = nodes.findIndex((n) => n.arm === k && n.kind === "entry");
      const ne = nodes.findIndex((n) => n.arm === k && n.kind === "exit");
      const y = add(inOff(k), dir(k), GIVE_WAY);
      const r = at(nodes[ni].angle);
      const din = { x: -dir(k).x, y: -dir(k).y };
      entry.push(
        seg(
          bezier(y, add(y, din, 3), add(r, tangent(nodes[ni].angle), -3), r),
          ENTRY_V,
          approachEnd[k],
          nodes[ni].id,
          "entry",
          k,
        ),
      );
      const x = add(outOff(k), dir(k), GIVE_WAY);
      const e = at(nodes[ne].angle);
      exitPath.push(
        seg(
          bezier(e, add(e, tangent(nodes[ne].angle), 3), add(x, dir(k), -3), x),
          ENTRY_V,
          nodes[ne].id,
          exitStart[k],
          "inner",
          k,
        ),
      );
      ringAfterEntry.push(ringSeg[ni]);
    }
    for (let k = 0; k < 4; k++) {
      for (const turn of ["left", "straight", "right"] as Turn[]) {
        const o = turnTo(k, turn);
        const ni = nodes.findIndex((n) => n.arm === k && n.kind === "entry");
        const ne = nodes.findIndex((n) => n.arm === o && n.kind === "exit");
        const path: number[] = [];
        let i = ni;
        while (i !== ne) {
          path.push(ringSeg[i]);
          i = (i + 1) % nodes.length;
        }
        routes[k][["left", "straight", "right"].indexOf(turn)] = [
          approach[k],
          entry[k],
          ...path,
          exitPath[o],
          exit[o],
        ];
      }
    }
  }
  const from = new Map<number, number[]>();
  for (const s of segments)
    from.set(s.start, [...(from.get(s.start) ?? []), s.id]);
  return {
    rule,
    segments,
    routes,
    from,
    approach,
    stopLanes,
    ringAfterEntry,
    ringBefore,
  };
};

export const pointAt = (s: Segment, d: number) => {
  const x = Math.max(0, Math.min(s.length, d));
  let i = 1;
  while (i < s.cum.length - 1 && s.cum[i] < x) i++;
  const a = s.pts[i - 1];
  const b = s.pts[i];
  const span = s.cum[i] - s.cum[i - 1] || 1;
  const u = (x - s.cum[i - 1]) / span;
  return {
    x: a.x + (b.x - a.x) * u,
    y: a.y + (b.y - a.y) * u,
    heading: Math.atan2(b.y - a.y, b.x - a.x),
  };
};

// ------------------------------------------------------------- traffic

/** A small seeded generator (mulberry32). */
export const random = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export type Arrival = { id: number; at: number; arm: number; turn: Turn };

/** The cars, Poisson on each arm, the same for both junctions. */
export const arrivals = (seed: number, o: Options = {}): Arrival[] => {
  const s = settings(o);
  const out: Arrival[] = [];
  const end = s.warm + s.hour;
  for (let k = 0; k < 4; k++) {
    const rng = random(seed * 977 + k * 131 + 7);
    const rate = s.flows[k] / 3600;
    if (rate <= 0) continue;
    let t = -Math.log(1 - rng()) / rate;
    while (t < end) {
      const r = rng();
      const turn: Turn =
        r < s.left ? "left" : r < s.left + s.right ? "right" : "straight";
      out.push({ id: 0, at: t, arm: k, turn });
      // Random arrivals; cars that would appear on top of the one before
      // wait off the edge of the map until there is room.
      t += -Math.log(1 - rng()) / rate;
    }
  }
  out.sort((a, b) => a.at - b.at);
  out.forEach((c, i) => (c.id = i));
  return out;
};

type Car = {
  id: number;
  arm: number;
  turn: Turn;
  route: number[];
  idx: number;
  s: number;
  v: number;
  at: number;
  entered: number;
  out: number;
  stops: number;
  wasMoving: boolean;
  /** Roundabout: has judged the gap at the line and gone for it. */
  committed: boolean;
  /** Seconds spent standing still. */
  still: number;
};

export type Trip = {
  id: number;
  arm: number;
  turn: Turn;
  at: number;
  out: number;
  delay: number;
  stops: number;
  /** Seconds from appearing to leaving, the same 300 m either way. */
  time: number;
  /** Seconds standing still, including waiting off the map to appear. */
  still: number;
};

export type Frame = {
  t: number;
  cars: { id: number; x: number; y: number; h: number; v: number }[];
  /** Lights: which arms have green, amber or red. */
  lamps?: ("green" | "amber" | "red")[];
};

export type Result = {
  rule: Rule;
  trips: Trip[];
  frames: Frame[];
  /** Every car crossing the stop or give-way line: when, from which lane,
   *  and whether it had stopped in the queue first. For calibration. */
  discharges: { t: number; lane: number; arm: number; queued: boolean }[];
};

const DT = 0.1;
const ZONE = 7;

/**
 * Seconds each route takes on its own with the road clear and the lights
 * green: the yardstick delay is measured against.
 */
export const freeTimes = (rule: Rule): number[][] => {
  const net = network(rule);
  return ARMS.map((_, k) =>
    (["left", "straight", "right"] as Turn[]).map((turn) => {
      const r = simulate(
        rule,
        1,
        {
          flows: [0, 0, 0, 0],
          warm: 0,
          hour: 0,
        },
        [{ id: 0, at: 0, arm: k, turn }],
        net,
        true,
      );
      return r.trips[0].out - r.trips[0].at;
    }),
  );
};

const freeCache = new Map<Rule, number[][]>();
const free = (rule: Rule) => {
  if (!freeCache.has(rule)) freeCache.set(rule, freeTimes(rule));
  return freeCache.get(rule)!;
};

/**
 * Run one junction. `record` asks for every car's position every `every`
 * seconds between two times, for drawing.
 */
export const simulate = (
  rule: Rule,
  seed: number,
  o: Options = {},
  given?: Arrival[],
  net: Network = network(rule),
  alwaysGreen = false,
  record?: { from: number; to: number; every: number },
): Result => {
  const s = settings(o);
  const cars0 = given ?? arrivals(seed, o);
  const segs = net.segments;
  const on: Car[][] = segs.map(() => []);
  const waiting: Car[][] = [[], [], [], []];
  const trips: Trip[] = [];
  const frames: Frame[] = [];
  const discharges: Result["discharges"] = [];
  let next = 0;
  const end = s.warm + s.hour;
  // Lights: phase 0 is south and north, phase 1 east and west.
  let phase = 0;
  let stage: "green" | "amber" | "allred" = "green";
  let clock = 0;
  const green = (arm: number) =>
    alwaysGreen || (stage === "green" && arm % 2 === phase);
  const amber = (arm: number) =>
    !alwaysGreen && stage === "amber" && arm % 2 === phase;
  const turnIndex = (t: Turn) => ["left", "straight", "right"].indexOf(t);

  const spawn = (c: Car) => {
    const seg0 = net.approach[c.arm];
    const last = on[seg0].reduce((m, x) => (x.s < m ? x.s : m), Infinity);
    if (last < CAR_LENGTH + IDM.s0 + 4) return false;
    c.s = 0;
    c.v = Math.min(ROAD_V, last === Infinity ? ROAD_V : ROAD_V * 0.8);
    c.idx = 0;
    on[seg0].push(c);
    return true;
  };

  /** Distance from car c's front to its leader's rear, and the leader's speed. */
  const leader = (c: Car): { gap: number; v: number } => {
    let best = { gap: Infinity, v: 0 };
    const segId = c.route[c.idx];
    for (const o2 of on[segId])
      if (o2 !== c && o2.s > c.s && o2.s - CAR_LENGTH - c.s < best.gap)
        best = { gap: o2.s - CAR_LENGTH - c.s, v: o2.v };
    if (best.gap < Infinity) return best;
    let ahead = segs[segId].length - c.s;
    for (let j = c.idx + 1; j < Math.min(c.route.length, c.idx + 3); j++) {
      // Everyone just past the node ahead, on any branch, is still in the
      // way: a car turning off, a car waiting to turn left in the box.
      const node = segs[c.route[j - 1]].end;
      for (const sid of net.from.get(node) ?? []) {
        for (const o2 of on[sid]) {
          if (o2 === c) continue;
          const own = sid === c.route[j];
          if (!own && o2.s > ZONE) continue;
          const g = ahead + o2.s - CAR_LENGTH;
          if (g < best.gap) best = { gap: g, v: o2.v };
        }
      }
      // On the ring: a car finishing its merge just ahead is in the way too.
      if (segs[c.route[c.idx]].kind === "ring") {
        const k = net.ringAfterEntry.indexOf(c.route[j]);
        if (k >= 0) {
          const e = net.routes[k][1][1];
          for (const o2 of on[e]) {
            const left = segs[e].length - o2.s;
            if (left > 5) continue;
            const g = ahead - left - CAR_LENGTH + 2;
            if (g < best.gap) best = { gap: Math.max(0.5, g), v: o2.v };
          }
        }
      }
      if (best.gap < Infinity) return best;
      ahead += segs[c.route[j]].length;
    }
    return best;
  };

  /** The fastest the car should be going, from the limits ahead of it. */
  const desired = (c: Car) => {
    let v = segs[c.route[c.idx]].vmax;
    let d = segs[c.route[c.idx]].length - c.s;
    for (let j = c.idx + 1; j < Math.min(c.route.length, c.idx + 3); j++) {
      const lim = segs[c.route[j]].vmax;
      v = Math.min(v, Math.sqrt(lim * lim + 2 * IDM.b * Math.max(0, d)));
      d += segs[c.route[j]].length;
    }
    return v;
  };

  /**
   * Roundabout: is the circulating stream clear for car c at the line? The
   * next car coming round must be at least TC seconds from the merge, and
   * far enough that c gets there first with a second to spare.
   */
  const ringClear = (c: Car) => {
    const k = c.arm;
    const entryLen = segs[net.routes[k][1][1]].length;
    const reach = segs[c.route[c.idx]].length - c.s + entryLen;
    const a = IDM.a;
    const mine = (-c.v + Math.sqrt(c.v * c.v + 2 * a * reach)) / a;
    const need = Math.max(s.tc, mine + s.margin);
    const target = net.ringAfterEntry[k];
    let seg = net.ringBefore.get(target)!;
    let dist = 0;
    // Far enough back to cover TC seconds at full circulating speed.
    for (let n = 0; n < 7 && dist < s.tc * RING_V * 1.2; n++) {
      // Cars on this stretch of ring, and cars on the entry that joins at
      // its start: both will reach this entry soon.
      const feeder = net.ringAfterEntry.indexOf(seg);
      const lists: [Car[], number][] = [[on[seg], dist + segs[seg].length]];
      if (feeder >= 0) {
        const e = net.routes[feeder][1][1];
        const a = net.routes[feeder][1][0];
        lists.push([on[e], dist + segs[seg].length + segs[e].length]);
        // And cars still driving up to that entry without slowing for it.
        lists.push([
          on[a].filter((x) => x.committed || x.v > 6),
          dist + segs[seg].length + segs[e].length + segs[a].length,
        ]);
      }
      for (const [list, base] of lists)
        for (const o2 of list) {
          // Only cars that will carry on past this entry.
          if (o2.route.indexOf(target) < 0) continue;
          // When it will get here: no faster than cars go round the ring.
          const d = base - o2.s;
          if (d / Math.min(Math.max(o2.v, 3), RING_V) < need) return false;
        }
      dist += segs[seg].length;
      seg = net.ringBefore.get(seg)!;
    }
    return true;
  };

  /** Lights: is oncoming traffic clear for a left turn from arm k? */
  const leftClear = (k: number) => {
    const opp = (k + 2) % 4;
    const lane = net.stopLanes[opp][0];
    const feeder = net.approach[opp];
    if (green(opp) || amber(opp)) {
      // Oncoming cars still on their way in, on the lane to the line or
      // further out where the road has not yet widened: seconds until they
      // reach the line, plus the few metres on to where the paths cross.
      const coming: [Car, number][] = [
        ...on[lane].map((o2): [Car, number] => [o2, segs[lane].length - o2.s]),
        ...on[feeder].map((o2): [Car, number] => [
          o2,
          segs[feeder].length - o2.s + segs[lane].length,
        ]),
      ];
      for (const [o2, rest] of coming) {
        if (o2.turn === "left") continue;
        if (o2.v > 1 && (rest + 8) / o2.v < LEFT_GAP) return false;
        // Stopped at the line on green: about to pull away.
        if (rest < 6 && o2.v <= 1 && green(opp)) return false;
      }
    }
    for (const t of ["straight", "right"] as Turn[]) {
      const sid = net.routes[opp][turnIndex(t)][2];
      for (const o2 of on[sid]) if (o2.s < segs[sid].length * 0.8) return false;
    }
    return true;
  };

  /** Lights: is a car from the other phase still in the middle? */
  const boxBusy = (k: number) => {
    for (const a of [(k + 1) % 4, (k + 3) % 4])
      for (const r of net.routes[a]) {
        const sid = r[2];
        for (const o2 of on[sid])
          if (o2.s < segs[sid].length * 0.85) return true;
      }
    return false;
  };

  const barrier = (c: Car): number => {
    // Distance from the car's front to where it has to stop, or Infinity.
    const sid = c.route[c.idx];
    const sg = segs[sid];
    const rest = sg.length - c.s;
    if (sg.kind === "approach") {
      if (net.rule === "lights") {
        // On green, still let anyone finishing a turn clear the box first.
        if (green(c.arm)) return boxBusy(c.arm) && rest < 25 ? rest : Infinity;
        if (amber(c.arm) && rest < (c.v * c.v) / (2 * 4)) return Infinity;
        return rest;
      }
      // Judge the gap at the line, then go and do not hesitate.
      if (c.committed || rest > 25) return Infinity;
      const clear = ringClear(c);
      if (clear && rest < 4) c.committed = true;
      return clear ? Infinity : rest;
    }
    if (sg.kind === "inner" && net.rule === "lights" && c.turn === "left") {
      const wait = 7;
      if (c.s < wait && !leftClear(c.arm)) return wait - c.s;
    }
    return Infinity;
  };

  /** The middle of a car, back along its route if it straddles two segments. */
  const centreOf = (c: Car) => {
    let back = c.s - CAR_LENGTH / 2;
    let i = c.idx;
    while (back < 0 && i > 0) {
      i--;
      back += segs[c.route[i]].length;
    }
    return pointAt(segs[c.route[i]], back);
  };

  const all: Car[] = [];
  const steps = Math.ceil((end + 900) / DT);
  for (let step = 0; step <= steps; step++) {
    const t = step * DT;
    // Signals.
    if (net.rule === "lights" && !alwaysGreen) {
      clock += DT;
      // A car within `reach` metres of the line on any lane of the arm.
      const demand = (arm: number, reach: number) =>
        net.stopLanes[arm].some((l) =>
          on[l].some((c) => segs[l].length - c.s < reach),
        ) ||
        on[net.approach[arm]].some(
          (c) =>
            segs[net.approach[arm]].length - c.s + POCKET - STOP_LINE < reach,
        ) ||
        waiting[arm].length > 0;
      if (stage === "green") {
        const mine = [phase, phase + 2];
        const theirs = [1 - phase, 3 - phase];
        const want = theirs.some((a) => demand(a, 120));
        const busy = mine.some((a) => demand(a, s.signals.gapOut));
        const fixed = s.signals.fixedGreen;
        const done = fixed
          ? clock >= fixed
          : want &&
            clock >= s.signals.minGreen &&
            (!busy || clock >= s.signals.maxGreen);
        if (done) {
          stage = "amber";
          clock = 0;
        }
      } else if (stage === "amber" && clock >= s.signals.amber) {
        stage = "allred";
        clock = 0;
      } else if (stage === "allred" && clock >= s.signals.allRed) {
        stage = "green";
        phase = 1 - phase;
        clock = 0;
      }
    }
    // Arrivals.
    while (next < cars0.length && cars0[next].at <= t) {
      const a = cars0[next++];
      const c: Car = {
        id: a.id,
        arm: a.arm,
        turn: a.turn,
        route: net.routes[a.arm][turnIndex(a.turn)],
        idx: 0,
        s: 0,
        v: 0,
        at: a.at,
        entered: -1,
        out: -1,
        stops: 0,
        wasMoving: true,
        committed: false,
        still: 0,
      };
      all.push(c);
      waiting[a.arm].push(c);
    }
    for (let k = 0; k < 4; k++) {
      while (waiting[k].length && spawn(waiting[k][0])) waiting[k].shift();
    }
    // Accelerations.
    const moving: [Car, number][] = [];
    for (const list of on)
      for (const c of list) {
        const v0 = desired(c);
        const lead = leader(c);
        const wall = barrier(c);
        let gap = lead.gap;
        let dv = c.v - lead.v;
        // A line to stop at: the car stops its own standstill gap short
        // of anything, so put the obstacle that far past the line.
        if (wall + IDM.s0 - 0.3 < gap) {
          gap = Math.max(0.01, wall + IDM.s0 - 0.3);
          dv = c.v;
        }
        const free = 1 - Math.pow(c.v / Math.max(v0, 0.1), IDM.delta);
        let acc = IDM.a * free;
        if (gap < Infinity) {
          const star =
            IDM.s0 +
            Math.max(
              0,
              c.v * IDM.T + (c.v * dv) / (2 * Math.sqrt(IDM.a * IDM.b)),
            );
          acc = IDM.a * (free - (star / Math.max(gap, 0.01)) ** 2);
        }
        moving.push([c, Math.max(-9, acc)]);
      }
    // Moves.
    for (const [c, acc] of moving) {
      const v1 = Math.max(0, c.v + acc * DT);
      let d = ((c.v + v1) / 2) * DT;
      c.v = v1;
      if (c.v < 0.5) c.still += DT;
      if (c.v < 0.3 && c.wasMoving) {
        c.stops++;
        c.wasMoving = false;
      } else if (c.v > 3) c.wasMoving = true;
      while (d > 0) {
        const sid = c.route[c.idx];
        const rest = segs[sid].length - c.s;
        if (d < rest) {
          c.s += d;
          d = 0;
          break;
        }
        d -= rest;
        on[sid].splice(on[sid].indexOf(c), 1);
        if (segs[sid].kind === "approach")
          discharges.push({ t, lane: sid, arm: c.arm, queued: c.stops > 0 });
        c.idx++;
        if (c.idx >= c.route.length) {
          c.out = t;
          break;
        }
        c.s = 0;
        on[c.route[c.idx]].push(c);
      }
    }
    // Drawing.
    if (record && t >= record.from - 1e-9 && t <= record.to + 1e-9) {
      const k = Math.round((t - record.from) / DT);
      const every = Math.max(1, Math.round(record.every / DT));
      if (k % every === 0) {
        const cars: Frame["cars"] = [];
        for (const list of on)
          for (const c of list) {
            const p = centreOf(c);
            cars.push({ id: c.id, x: p.x, y: p.y, h: p.heading, v: c.v });
          }
        frames.push({
          t,
          cars,
          lamps:
            net.rule === "lights"
              ? ARMS.map((_, a) =>
                  green(a) ? "green" : amber(a) ? "amber" : "red",
                )
              : undefined,
        });
      }
    }
    if (next >= cars0.length && all.every((c) => c.out >= 0)) break;
  }
  const ff = alwaysGreen && given ? null : free(rule);
  for (const c of all) {
    if (c.out < 0) continue;
    const base = ff ? ff[c.arm][turnIndex(c.turn)] : c.out - c.at;
    trips.push({
      id: c.id,
      arm: c.arm,
      turn: c.turn,
      at: c.at,
      out: c.out,
      delay: c.out - c.at - base,
      stops: c.stops,
      time: c.out - c.at,
      still: c.still + (c.entered >= 0 ? 0 : 0),
    });
  }
  return { rule, trips, frames, discharges };
};

export type Summary = {
  cars: number;
  /** Mean delay, seconds. */
  mean: number;
  p95: number;
  /** Share of cars that stopped at least once. */
  stopped: number;
  /** Mean seconds from appearing to leaving. */
  time: number;
  /** Mean seconds standing still. */
  still: number;
  byArm: number[];
};

/** Delay over the cars that arrived in the measured hour. */
export const summary = (r: Result, o: Options = {}): Summary => {
  const s = settings(o);
  const hour = r.trips.filter((t) => t.at >= s.warm && t.at < s.warm + s.hour);
  const d = hour.map((t) => t.delay).sort((a, b) => a - b);
  const mean = d.reduce((a, b) => a + b, 0) / Math.max(1, d.length);
  const byArm = [0, 1, 2, 3].map((k) => {
    const x = hour.filter((t) => t.arm === k).map((t) => t.delay);
    return x.reduce((a, b) => a + b, 0) / Math.max(1, x.length);
  });
  return {
    cars: hour.length,
    mean,
    p95: d[Math.floor(d.length * 0.95)] ?? 0,
    stopped: hour.filter((t) => t.stops > 0).length / Math.max(1, hour.length),
    time: hour.reduce((a, t) => a + t.time, 0) / Math.max(1, hour.length),
    still: hour.reduce((a, t) => a + t.still, 0) / Math.max(1, hour.length),
    byArm,
  };
};

/** Mean of `n` seeded hours. */
export const average = (rule: Rule, n: number, o: Options = {}) => {
  const net = network(rule);
  const acc = {
    cars: 0,
    mean: 0,
    p95: 0,
    stopped: 0,
    time: 0,
    still: 0,
    byArm: [0, 0, 0, 0],
  };
  for (let seed = 1; seed <= n; seed++) {
    const r = summary(simulate(rule, seed, o, undefined, net), o);
    acc.cars += r.cars / n;
    acc.mean += r.mean / n;
    acc.p95 += r.p95 / n;
    acc.stopped += r.stopped / n;
    acc.time += r.time / n;
    acc.still += r.still / n;
    r.byArm.forEach((x, k) => (acc.byArm[k] += x / n));
  }
  return acc;
};

/**
 * Saturation headway: seconds between cars crossing the line one after
 * another out of a standing queue, the median over every such pair.
 */
export const queueHeadway = (r: Result) => {
  const byLane = new Map<number, { t: number; queued: boolean }[]>();
  for (const d of r.discharges)
    byLane.set(d.lane, [...(byLane.get(d.lane) ?? []), d]);
  const h: number[] = [];
  for (const list of byLane.values())
    for (let i = 3; i < list.length; i++) {
      const g = list[i].t - list[i - 1].t;
      if (list[i].queued && list[i - 1].queued && list[i - 2].queued && g < 6)
        h.push(g);
    }
  h.sort((a, b) => a - b);
  return h[Math.floor(h.length / 2)] ?? NaN;
};

/**
 * Roundabout entry capacity with a given flow already going round: the
 * south entry is swamped with cars going straight on, the west arm sends
 * `circulating` cars an hour across in front of it, and the cars that got
 * in during the hour are counted. The Highway Capacity Manual's model for
 * the same thing is 1380 x exp(-0.00102 x circulating).
 */
export const entryCapacity = (circulating: number, o: Options = {}) => {
  const opts: Options = {
    ...o,
    flows: [2400, 0, 0, circulating],
    left: 0,
    right: 0,
    hour: 1800,
  };
  const s = settings(opts);
  let entered = 0;
  let round = 0;
  for (const seed of [1, 2]) {
    const r = simulate("roundabout", seed, opts);
    const inHour = (d: { t: number }) => d.t >= s.warm && d.t < s.warm + s.hour;
    entered += r.discharges.filter((d) => d.arm === 0 && inHour(d)).length;
    round += r.discharges.filter((d) => d.arm === 3 && inHour(d)).length;
  }
  // Two half-hours make an hour.
  return { entered, round };
};

/** HCM 6: critical headway 4.99 s, follow-up 2.609 s. */
export const hcmCapacity = (circulating: number) =>
  1380 * Math.exp(-((4.99 - 0.5 * 2.609) / 3600) * circulating);
