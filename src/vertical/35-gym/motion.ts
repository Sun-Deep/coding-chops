import { DURATION, frameAt, simAt } from "./beats";
import { RUNS } from "./runs";
import type { Lifter, Rule } from "./simulation";

/**
 * Where everyone is and how their body is set, frame by frame, in each gym.
 *
 * The gym is seen from the side. Metres: X runs left to right with the bench
 * along it, its foot at the left and the rack at the right; Z is depth, from
 * the camera to the mirror wall; heights are above the floor.
 *
 * Each person is a jointed figure in profile. The model says what they are
 * doing; this file turns that into a place to be and a pose to hold, and then
 * moves both there smoothly: people walk at a person's pace whatever the
 * clock, turn by narrowing through side-on, and sit, lie back and stand up by
 * bending at the joints. Nothing fades from one drawing to another.
 */

/** The bench: depth of its centre line, and its two ends. */
export const BZ = 2.6;
export const FOOT_X = -0.62;
export const HEAD_X = 0.62;
export const PAD_H = 0.52;
/** The rack: uprights either side of the bench at its head. */
export const RACK_X = 0.64;
export const RACK_DZ = 0.55;
/** The bar on the hooks, and over the chest during a set. */
export const RACKED = { X: 0.5, h: 1.15 };
export const PRESS_X = 0.33;
/** Plates sit this far either side of the bench, on the bar's sleeves. */
export const PLATE_DZ = 0.95;

type Spot = { X: number; Z: number; facing: -1 | 1 };
const SIT: Spot = { X: -0.36, Z: BZ, facing: -1 };
const LIE: Spot = { X: -0.12, Z: BZ, facing: -1 };
/** Beside the near plate, changing it. */
const PLATES: Spot = { X: 1.0, Z: BZ - 1.1, facing: -1 };
/** Where a lifter taking turns rests while the other one lifts. */
const ASIDE: Spot[] = [
  { X: -1.5, Z: BZ - 0.35, facing: 1 },
  { X: -2.0, Z: BZ - 0.8, facing: 1 },
];
/** Where people waiting for the bench stand, first in turn first. */
const WAITING: Spot[] = [
  { X: -1.05, Z: BZ - 1.05, facing: 1 },
  { X: 1.55, Z: BZ + 1.3, facing: -1 },
  { X: -1.6, Z: BZ + 1.25, facing: 1 },
  { X: 2.45, Z: BZ + 1.65, facing: -1 },
  { X: -2.45, Z: BZ + 1.65, facing: 1 },
  { X: 0.9, Z: BZ + 2.2, facing: -1 },
];
export const DOOR_IN = { X: -3.05, Z: 6.05 };
export const DOOR_OUT = { X: 3.05, Z: 6.05 };

export type Kind = "walk" | "wait" | "phone" | "plates" | "sit" | "lie";

/**
 * A body in its own frame: x forward, h up, measured from the hip joint.
 * Angles in degrees, 0 forward and 90 up. Hands are where they are relative
 * to the hip; the arms bend to reach them.
 */
export type Rig = {
  hipH: number;
  torso: number;
  head: number;
  thighN: number;
  shinN: number;
  thighF: number;
  shinF: number;
  handN: [number, number];
  handF: [number, number];
};

const STAND: Rig = {
  hipH: 0.92,
  torso: 90,
  head: 0,
  thighN: -90,
  shinN: -90,
  thighF: -90,
  shinF: -90,
  handN: [0.04, -0.06],
  handF: [-0.02, -0.06],
};
const POSES: Record<Exclude<Kind, "walk">, Rig> = {
  wait: { ...STAND, handN: [0.16, 0.3], handF: [0.15, 0.36], head: 4 },
  phone: { ...STAND, handN: [0.24, 0.36], handF: [0.22, 0.32], head: -28 },
  plates: {
    ...STAND,
    hipH: 0.86,
    torso: 64,
    thighN: -78,
    shinN: -96,
    thighF: -102,
    shinF: -90,
    handN: [0.46, 0.28],
    handF: [0.44, 0.2],
    head: -18,
  },
  sit: {
    hipH: 0.6,
    torso: 78,
    head: -30,
    thighN: -10,
    shinN: -100,
    thighF: -14,
    shinF: -96,
    handN: [0.34, 0.24],
    handF: [0.32, 0.2],
  },
  lie: {
    hipH: 0.66,
    torso: 180,
    head: 0,
    thighN: -8,
    shinN: -96,
    thighF: -12,
    shinF: -92,
    handN: [-0.62, 0.49],
    handF: [-0.62, 0.49],
  },
};

type Target = Spot & { kind: Kind; rank: number };

/** Places beside the bench under `share`, held from joining to leaving. */
const asideSlots = (people: readonly Lifter[]) => {
  const slot = new Map<number, number>();
  const events = people
    .flatMap((l) => [
      { t: l.join, id: l.id, on: true },
      { t: l.done, id: l.id, on: false },
    ])
    .sort((a, b) => a.t - b.t || Number(a.on) - Number(b.on));
  const taken = new Set<number>();
  for (const e of events) {
    if (e.on) {
      let k = 0;
      while (taken.has(k)) k++;
      taken.add(k);
      slot.set(e.id, k);
    } else taken.delete(slot.get(e.id) ?? -1);
  }
  return slot;
};

/** Seconds of the model before a lift that lying down starts. */
const LIE_LEAD = 7;
/** Seconds before a lift with no plate change that a resting sharer walks back. */
const BACK_LEAD = 34;
/** Seconds before a plate change that the lifter steps up to the bar. */
const STEP_UP = 18;
/** Seconds after a set spent sitting up before standing and moving off. */
const SIT_UP = 6;

const targetAt = (
  rule: Rule,
  people: readonly Lifter[],
  slots: Map<number, number>,
  l: Lifter,
  t: number,
): Target | null => {
  if (t < l.arrive) return null;
  const at = (spot: Spot, kind: Kind, rank = 0): Target => ({
    ...spot,
    kind,
    rank,
  });
  if (t >= l.done + SIT_UP) return at({ ...DOOR_OUT, facing: 1 }, "walk");
  if (t >= l.done) return at(SIT, "sit");
  // Next to change the plates: step up to the bar a little early and wait
  // there, so the change itself is seen rather than the walk to it.
  const next = l.sets.find((s) => s.swap > t && s.lift > s.swap);
  if (next && t >= next.swap - STEP_UP) return at(PLATES, "wait");
  if (t < l.join) {
    let ahead = 0;
    for (const o of people)
      if (o.id !== l.id && o.arrive < l.arrive && o.join > t) ahead++;
    const spot = WAITING[Math.min(WAITING.length - 1, ahead)];
    return at(spot, t < l.arrive + 8 ? "walk" : "wait", ahead);
  }
  const aside = ASIDE[(slots.get(l.id) ?? 0) % ASIDE.length];
  for (let i = 0; i < l.sets.length; i++) {
    const s = l.sets[i];
    const prev = i > 0 ? l.sets[i - 1] : null;
    if (t >= s.end) continue;
    // During the set, and just before it, on the bench.
    if (t >= s.lift - LIE_LEAD) return at(LIE, "lie");
    // Changing the plates, then over to the foot of the bench to sit.
    if (s.lift > s.swap && t >= s.swap) {
      const u = (t - s.swap) / (s.lift - s.swap);
      return u < 0.42 ? at(PLATES, "plates") : at(SIT, "sit");
    }
    // Just finished the set before: sit up first.
    if (prev && t < prev.end + SIT_UP) return at(SIT, "sit");
    if (rule === "keep") return at(SIT, "sit");
    // Resting beside the bench, until it is nearly time to go back.
    if (s.lift === s.swap && t >= s.lift - BACK_LEAD) return at(SIT, "sit");
    return at(aside, prev ? "phone" : "wait");
  }
  return at(SIT, "sit");
};

/* -------------------------------------------------------------- routes */

type Pt = { X: number; Z: number };
/** What people walk around: the rack with the bar and plates, and the bench. */
const RACK_AREA = { x0: 0.2, x1: 0.97, z0: BZ - 1.04, z1: BZ + 1.06 };
const BENCH_AREA = { x0: -0.7, x1: 0.2, z0: BZ - 0.24, z1: BZ + 0.24 };
/** Corners of the way round, in front of and behind the bench. */
const NODES: Pt[] = [
  { X: 0.0, Z: BZ - 1.2 },
  { X: 1.15, Z: BZ - 1.2 },
  { X: 1.15, Z: BZ + 1.22 },
  { X: 0.0, Z: BZ + 1.22 },
  { X: -0.9, Z: BZ - 0.42 },
  { X: -0.9, Z: BZ + 0.42 },
];
type Area = typeof RACK_AREA;
const inside = (p: Pt, a: Area) =>
  p.X > a.x0 && p.X < a.x1 && p.Z > a.z0 && p.Z < a.z1;
/** Whether a straight walk from a to b passes through an area. */
const crosses = (a: Pt, b: Pt, r: Area) => {
  let t0 = 0;
  let t1 = 1;
  const dx = b.X - a.X;
  const dz = b.Z - a.Z;
  const edges: [number, number][] = [
    [-dx, a.X - r.x0],
    [dx, r.x1 - a.X],
    [-dz, a.Z - r.z0],
    [dz, r.z1 - a.Z],
  ];
  for (const [p, q] of edges) {
    if (Math.abs(p) < 1e-9) {
      if (q <= 0) return false;
    } else {
      const t = q / p;
      if (p < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
    }
  }
  return t1 - t0 > 1e-3;
};
/**
 * The next place to walk towards on the shortest way round. The bench may be
 * walked into only when sitting or lying on it is the point, or left when
 * already on it.
 */
const nextStep = (from: Pt, to: Pt, toBench: boolean): Pt => {
  const onBench = inside(from, BENCH_AREA);
  const pts = [from, ...NODES, to];
  const n = pts.length;
  const open = (i: number, j: number) => {
    if (crosses(pts[i], pts[j], RACK_AREA)) return false;
    const benchOk = (j === n - 1 && toBench) || (i === 0 && onBench);
    return benchOk || !crosses(pts[i], pts[j], BENCH_AREA);
  };
  if (open(0, n - 1)) return to;
  const dist = new Array<number>(n).fill(Infinity);
  const prev = new Array<number>(n).fill(-1);
  const done = new Array<boolean>(n).fill(false);
  dist[0] = 0;
  for (let k = 0; k < n; k++) {
    let u = -1;
    for (let i = 0; i < n; i++)
      if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i;
    if (u < 0 || dist[u] === Infinity) break;
    done[u] = true;
    for (let w = 0; w < n; w++) {
      if (done[w] || !open(u, w)) continue;
      const c = dist[u] + Math.hypot(pts[w].X - pts[u].X, pts[w].Z - pts[u].Z);
      if (c < dist[w]) {
        dist[w] = c;
        prev[w] = u;
      }
    }
  }
  if (prev[n - 1] < 0) return to;
  let step = n - 1;
  while (prev[step] !== 0) step = prev[step];
  return pts[step];
};

/** Walking pace on screen, per frame, and how fast it is reached. */
const VMAX = 0.08;
const ACCEL = 0.007;
/** Frames run before frame 0, so the room has settled when the reel opens. */
const SETTLE = 120;
/** How quickly the body moves towards its pose, per frame. */
const BEND = 0.2;
/** Frames before someone in line reacts, more for each place back. */
const lagFor = (id: number, rank: number) => 2 + (id % 3) + rank * 3;

export type State = {
  X: number;
  Z: number;
  /** -1 facing left to 1 facing right; near 0 while turning. */
  facing: number;
  speed: number;
  rig: Rig;
  /** 0 to 1: holding the bar, holding a phone, reaching for a plate. */
  onBar: number;
  phone: number;
  reach: number;
  kind: Kind;
};

const lerpAngle = (a: number, b: number, k: number) => {
  let d = b - a;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return a + d * k;
};
const towards = (a: Rig, b: Rig, k: number, kh: number): Rig => ({
  hipH: a.hipH + (b.hipH - a.hipH) * k,
  torso: lerpAngle(a.torso, b.torso, k),
  head: a.head + (b.head - a.head) * k,
  thighN: lerpAngle(a.thighN, b.thighN, k),
  shinN: lerpAngle(a.shinN, b.shinN, k),
  thighF: lerpAngle(a.thighF, b.thighF, k),
  shinF: lerpAngle(a.shinF, b.shinF, k),
  handN: [
    a.handN[0] + (b.handN[0] - a.handN[0]) * kh,
    a.handN[1] + (b.handN[1] - a.handN[1]) * kh,
  ],
  handF: [
    a.handF[0] + (b.handF[0] - a.handF[0]) * kh,
    a.handF[1] + (b.handF[1] - a.handF[1]) * kh,
  ],
});

/**
 * Small movements of someone keeping still: breathing, shifting weight, and
 * for people waiting, a glance up at the clock now and then. Seeded by who
 * they are, so no two move together.
 */
const idle = (rig: Rig, kind: Kind, f: number, id: number): Rig => {
  const p = id * 1.37;
  const breathe = 0.006 * Math.sin(f * 0.12 + p);
  if (kind === "wait") {
    const glance = Math.pow(Math.max(0, Math.sin(f * 0.035 + p * 2.1)), 6);
    const shift = Math.sin(f * 0.045 + p);
    return {
      ...rig,
      hipH: rig.hipH + breathe,
      torso: rig.torso + 1.5 * shift,
      head: rig.head + 22 * glance + 4 * Math.sin(f * 0.07 + p),
      thighN: rig.thighN + 2.5 * shift,
      thighF: rig.thighF - 2.5 * shift,
    };
  }
  if (kind === "phone" || kind === "sit") {
    const scroll = 0.012 * Math.sin(f * 0.4 + p);
    return {
      ...rig,
      hipH: rig.hipH + breathe * 0.5,
      head: rig.head + 3 * Math.sin(f * 0.05 + p),
      handN: [rig.handN[0], rig.handN[1] + scroll],
    };
  }
  return { ...rig, hipH: rig.hipH + breathe * 0.5 };
};

/** The walking cycle laid over a standing body. */
const walking = (rig: Rig, phase: number, w: number): Rig => {
  const swing = 24 * Math.sin(phase) * w;
  const bendN = 40 * Math.max(0, Math.cos(phase)) * w;
  const bendF = 40 * Math.max(0, -Math.cos(phase)) * w;
  const arm = 0.13 * Math.sin(phase) * w;
  return {
    ...rig,
    hipH: rig.hipH + 0.018 * Math.abs(Math.cos(phase)) * w,
    thighN: rig.thighN + swing,
    shinN: rig.shinN + swing - bendN,
    thighF: rig.thighF - swing,
    shinF: rig.shinF - swing - bendF,
    handN: [rig.handN[0] - arm, rig.handN[1]],
    handF: [rig.handF[0] + arm, rig.handF[1]],
  };
};

export type Track = (State | null)[];

const walk = (rule: Rule): Track[] => {
  const people = RUNS[rule];
  const slots = asideSlots(people);
  const target = (l: Lifter, f: number) =>
    targetAt(rule, people, slots, l, simAt(f));
  return people.map((l) => {
    const out: Track = [];
    let pos: { X: number; Z: number } | null = null;
    let v = 0;
    let walked = 0;
    let facing = 1;
    let rig: Rig = { ...STAND };
    let onBar = 0;
    let phone = 0;
    let reach = 0;
    let gone = false;
    for (let f = -SETTLE; f <= DURATION; f++) {
      const now = target(l, f);
      const lag = now && now.kind === "wait" ? lagFor(l.id, now.rank) : 0;
      const goal = now ? (target(l, f - lag) ?? now) : null;
      if (!goal || gone) {
        if (f >= 0) out.push(null);
        continue;
      }
      if (!pos) {
        const fresh = simAt(f) - l.arrive < 20;
        pos = fresh ? { ...DOOR_IN } : { X: goal.X, Z: goal.Z };
        if (!fresh) {
          facing = goal.facing;
          if (goal.kind !== "walk") rig = { ...POSES[goal.kind] };
        }
      }
      const bench = goal.kind === "sit" || goal.kind === "lie";
      const d = Math.hypot(goal.X - pos.X, goal.Z - pos.Z);
      // Walk around the rack, the bar and the bench, not through them.
      const via = nextStep(pos, goal, bench);
      const dx: number = via.X - pos.X;
      const dz: number = via.Z - pos.Z;
      const dv = Math.hypot(dx, dz);
      const last = via === goal;
      // Stand up before walking anywhere but along the bench.
      const mayWalk = rig.hipH > 0.84 || bench;
      const want = mayWalk
        ? last
          ? Math.min(VMAX, Math.sqrt(2 * ACCEL * dv))
          : VMAX
        : 0;
      v = v < want ? Math.min(want, v + ACCEL) : Math.max(want, v - ACCEL * 2);
      const step = Math.min(dv, v);
      if (dv > 1e-4 && step > 0) {
        pos = { X: pos.X + (dx / dv) * step, Z: pos.Z + (dz / dv) * step };
        walked += step;
      }
      const there = d < 0.08;
      // Face the way you walk; near the bench or once there, the way the
      // place faces.
      const aim =
        there || (bench && d < 0.45)
          ? goal.facing
          : Math.abs(dx) > 0.03 && v > 0.01
            ? Math.sign(dx)
            : facing > 0
              ? 1
              : -1;
      facing += Math.max(-0.32, Math.min(0.32, aim - facing));
      // Sit and lie as you reach the bench; other poses once there.
      const body: Rig =
        goal.kind === "walk"
          ? STAND
          : bench
            ? d < 0.35
              ? POSES[goal.kind]
              : STAND
            : there
              ? POSES[goal.kind]
              : STAND;
      const pressing = goal.kind === "lie" && there;
      rig = towards(rig, body, BEND, pressing ? 0.3 : BEND);
      const ease = (x: number, on: boolean) => x + ((on ? 1 : 0) - x) * BEND;
      onBar = ease(onBar, pressing);
      phone = ease(
        phone,
        there && (goal.kind === "phone" || goal.kind === "sit"),
      );
      reach = ease(reach, there && goal.kind === "plates");
      if (goal.kind === "walk" && goal.X === DOOR_OUT.X && d < 0.05)
        gone = true;
      const w = Math.min(1, v / VMAX);
      if (f >= 0)
        out.push({
          X: pos.X,
          Z: pos.Z,
          facing,
          speed: w,
          rig:
            w > 0.01 && !bench
              ? walking(rig, walked * 7, w)
              : there
                ? idle(rig, goal.kind, f, l.id)
                : rig,
          onBar,
          phone,
          reach,
          kind: goal.kind,
        });
    }
    return out;
  });
};

export const TRACKS: Record<Rule, Track[]> = {
  keep: walk("keep"),
  share: walk("share"),
};

export const stateAt = (rule: Rule, id: number, frame: number) =>
  TRACKS[rule][id][Math.max(0, Math.min(DURATION, Math.round(frame)))] ?? null;

/* ------------------------------------------------------------------ bar */

/** Plate size for a lifter's weight: a radius in metres. */
export const plateOf = (id: number) => [0.225, 0.165, 0.12][(id * 7 + 2) % 3];

export type Bar = {
  readonly X: number;
  readonly h: number;
  /** The plate radius, between two lifters' sizes while it is changed. */
  readonly plate: number;
};

type Turn = { id: number; swap: number; lift: number; end: number };
const turnsOf = (rule: Rule): Turn[] =>
  RUNS[rule]
    .flatMap((l) => l.sets.map((s) => ({ id: l.id, ...s })))
    .sort((a, b) => a.swap - b.swap);
const TURNS: Record<Rule, Turn[]> = {
  keep: turnsOf("keep"),
  share: turnsOf("share"),
};

const smooth = (x: number) => {
  const u = Math.min(1, Math.max(0, x));
  return u * u * (3 - 2 * u);
};

/** The bar at a frame: on the hooks or moving, and the plates on it. */
export const barAt = (rule: Rule, frame: number): Bar => {
  const t = simAt(frame);
  const turns = TURNS[rule];
  let cur = -1;
  for (let i = 0; i < turns.length; i++) if (turns[i].swap <= t) cur = i;
  if (cur < 0) return { ...RACKED, plate: 0.2 };
  const turn = turns[cur];
  let prevId = turn.id;
  for (let i = cur - 1; i >= 0; i--)
    if (turns[i].id !== turn.id) {
      prevId = turns[i].id;
      break;
    }
  let plate = plateOf(turn.id);
  if (t < turn.lift) {
    // The plates come off and go on in the first half of the change.
    const u = (t - turn.swap) / (turn.lift - turn.swap);
    plate =
      plateOf(prevId) +
      (plateOf(turn.id) - plateOf(prevId)) * smooth((u - 0.1) / 0.4);
  }
  if (t < turn.lift || t >= turn.end) return { ...RACKED, plate };
  // A set, timed in frames: lift off, reps, back on the hooks.
  const f0 = frameAt(turn.lift);
  const f1 = frameAt(turn.end);
  const u = (frame - f0) / Math.max(1, f1 - f0);
  const off = smooth(Math.min(u, 1 - u) / 0.12);
  const reps = Math.max(2, Math.round((f1 - f0) / 17));
  const v = Math.min(1, Math.max(0, (u - 0.12) / 0.76));
  const down = 0.5 - 0.5 * Math.cos(2 * Math.PI * reps * v);
  return {
    X: RACKED.X + (PRESS_X - RACKED.X) * off,
    h: RACKED.h + 0.04 * off - 0.34 * down * off,
    plate,
  };
};
