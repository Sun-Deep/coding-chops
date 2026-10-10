import { DURATION, simAt } from "./beats";
import { RUNS } from "./runs";
import { KIOSKS, WALK_IN, type Customer, type Rule } from "./simulation";

/**
 * Where everyone stands, frame by frame, on the floor of each restaurant.
 * Metres: X runs left to right across the room, Z from the front of the
 * floor (0) back to the counter (4.4). The model decides who is where; this
 * file only walks people there at a steady pace, so a fast clock reads as a
 * time-lapse instead of a jump cut.
 */

export const COUNTER_Z = 4.4;
/** The till, and where the customer ordering at it stands. */
export const TILL_X = 5.6;
const AT_TILL = { X: TILL_X, Z: 3.75 };
/** The kiosks, side by side, screens facing the front of the room. */
export const KIOSK_X = (k: number) => 0.95 + k * 0.92;
export const KIOSK_Z = 3.15;
const AT_KIOSK = (k: number) => ({ X: KIOSK_X(k), Z: 2.55 });
/** The pass where trays come up, and where a tray is collected. */
export const PASS_X = [9.2, 13.4] as const;
const DOOR = { X: -1.2, Z: 1.4 };
const EXIT = { X: 15.4, Z: 0.9 };

/** The line for the till: along the counter side, then a second row. */
const lineSlot = (j: number) =>
  j < 7
    ? { X: TILL_X - 0.75 - 0.72 * j, Z: 2.95 }
    : { X: TILL_X - 0.75 - 0.72 * (13 - j), Z: 1.85 };
/** A short line behind the kiosks, used only when every screen is busy. */
const kioskLine = (j: number) => ({ X: 3.2 - 0.72 * j, Z: 1.5 });

/** The crowd at the pickup counter: nearest the counter first. */
const CROWD: { X: number; Z: number }[] = [];
for (const [row, Z] of [3.55, 2.75, 1.95, 1.15].entries())
  for (let i = 0; i < 6; i++)
    CROWD.push({ X: 8.7 + i * 0.9 + (row % 2) * 0.45, Z });

export type Pose = {
  readonly X: number;
  readonly Z: number;
  /** Metres walked so far, which drives the stride. */
  readonly walked: number;
  /** 0 standing to 1 at full walking pace. */
  readonly speed: number;
  /** At a till or screen, waiting for food, or carrying a tray. */
  readonly doing: "walk" | "line" | "order" | "wait" | "tray";
  /** Each pose eased in and out over a few frames, 0 to 1. */
  readonly ordering: number;
  readonly waiting: number;
  readonly carrying: number;
};

type Target = {
  X: number;
  Z: number;
  doing: Pose["doing"];
  /** Place in a line, so people further back react later. */
  rank: number;
} | null;

/** Pickup crowd places, held from the moment someone gets there. */
const crowdPlaces = (people: readonly Customer[]) => {
  const place = new Map<number, number>();
  const events = people
    .flatMap((c) => [
      { t: c.orderEnd, id: c.id, on: true },
      { t: c.served, id: c.id, on: false },
    ])
    .sort((a, b) => a.t - b.t || Number(a.on) - Number(b.on));
  const taken = new Set<number>();
  const at = new Map<number, number>();
  for (const e of events) {
    if (e.on) {
      let k = 0;
      while (taken.has(k)) k++;
      taken.add(k);
      at.set(e.id, k);
      place.set(e.id, k);
    } else {
      const k = at.get(e.id);
      if (k !== undefined) taken.delete(k);
    }
  }
  return place;
};

const targetAt = (
  rule: Rule,
  people: readonly Customer[],
  crowd: Map<number, number>,
  c: Customer,
  t: number,
): Target => {
  if (t < c.arrive) return null;
  if (t >= c.served) return { ...EXIT, doing: "tray", rank: 0 };
  if (t >= c.orderEnd) {
    const k = crowd.get(c.id) ?? 0;
    // The last moment before the tray: step up to the pass.
    if (t >= c.served - 3)
      return {
        X: Math.min(PASS_X[1], Math.max(PASS_X[0], CROWD[k % CROWD.length].X)),
        Z: 3.85,
        doing: "wait",
        rank: 0,
      };
    return { ...CROWD[k % CROWD.length], doing: "wait", rank: 0 };
  }
  if (t >= c.orderStart)
    return rule === "cashier"
      ? { ...AT_TILL, doing: "order", rank: 0 }
      : { ...AT_KIOSK(c.station), doing: "order", rank: 0 };
  // A free screen: walk straight to it.
  const queued = (o: Customer) => o.orderStart > o.arrive + WALK_IN + 0.5;
  if (rule === "kiosks" && !queued(c))
    return { ...AT_KIOSK(c.station), doing: "walk", rank: 0 };
  // Waiting to order: count who is ahead, in arrival order.
  let ahead = 0;
  for (const o of people)
    if (
      o.id !== c.id &&
      o.arrive < c.arrive &&
      o.orderStart > t &&
      (rule === "cashier" || queued(o))
    )
      ahead++;
  if (t < c.arrive + WALK_IN * 0.5) {
    const slot = rule === "cashier" ? lineSlot(ahead) : kioskLine(ahead);
    return { ...slot, doing: "walk", rank: ahead };
  }
  return rule === "cashier"
    ? { ...lineSlot(Math.min(13, ahead)), doing: "line", rank: ahead }
    : { ...kioskLine(Math.min(4, ahead)), doing: "line", rank: ahead };
};

/** Walking on screen, per frame: top speed and how fast it is reached. */
const VMAX = 0.15;
const ACCEL = 0.014;
/** Frames run before frame 0, so the room has settled when the reel opens. */
const SETTLE = 60;
/** Frames before someone reacts to a change, more for each place back in line. */
const lagFor = (id: number, rank: number) =>
  2 + (id % 3) + Math.min(14, rank * 2.2);
/** How quickly a pose eases in or out, per frame. */
const EASE = 0.16;

export type Track = (Pose | null)[];

const walk = (rule: Rule): Track[] => {
  const people = RUNS[rule];
  const crowd = crowdPlaces(people);
  const target = (c: Customer, f: number) =>
    targetAt(rule, people, crowd, c, simAt(f));
  return people.map((c) => {
    const out: Track = [];
    let pos: { X: number; Z: number } | null = null;
    let v = 0;
    let walked = 0;
    let gone = false;
    const w = { ordering: 0, waiting: 0, carrying: 0 };
    for (let f = -SETTLE; f <= DURATION; f++) {
      const now = target(c, f);
      // React a moment late, later the further back in line.
      const goal = now ? (target(c, f - lagFor(c.id, now.rank)) ?? now) : null;
      if (!goal || gone) {
        if (f >= 0) out.push(null);
        continue;
      }
      if (!pos) {
        const fresh = simAt(f) - c.arrive < WALK_IN * 3;
        pos = fresh ? { ...DOOR } : { X: goal.X, Z: goal.Z };
      }
      const dx: number = goal.X - pos.X;
      const dz: number = goal.Z - pos.Z;
      const d = Math.hypot(dx, dz);
      // Speed up, cruise, and slow to a stop at the place.
      const want = Math.min(VMAX, Math.sqrt(2 * ACCEL * d));
      v =
        v < want ? Math.min(want, v + ACCEL) : Math.max(want, v - ACCEL * 1.5);
      const step = Math.min(d, v);
      if (d > 1e-4) {
        pos = { X: pos.X + (dx / d) * step, Z: pos.Z + (dz / d) * step };
        walked += step;
      } else v = 0;
      for (const [key, doing] of [
        ["ordering", "order"],
        ["waiting", "wait"],
        ["carrying", "tray"],
      ] as const)
        w[key] += ((goal.doing === doing ? 1 : 0) - w[key]) * EASE;
      // Out of the door on the right: gone for good.
      if (goal.doing === "tray" && d < 0.05) gone = true;
      if (f >= 0)
        out.push({
          X: pos.X,
          Z: pos.Z,
          walked,
          speed: v / VMAX,
          doing: goal.doing,
          ordering: w.ordering,
          waiting: w.waiting,
          carrying: w.carrying,
        });
    }
    return out;
  });
};

export const TRACKS: Record<Rule, Track[]> = {
  cashier: walk("cashier"),
  kiosks: walk("kiosks"),
};

export const poseAt = (rule: Rule, id: number, frame: number) =>
  TRACKS[rule][id][Math.max(0, Math.min(DURATION, Math.round(frame)))] ?? null;

export { KIOSKS };
