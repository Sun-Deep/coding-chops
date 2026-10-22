/**
 * Holding the lift door for people running. One module, imported by both
 * the reel and `scripts/measure-elevator-door.mjs`, so the frames and the
 * committed run are the same code.
 *
 * The morning rush in an office lobby: one lift, FLOORS floors above the
 * lobby, everyone going up. People reach the lift doors at random, RATE a
 * minute on average, each bound for a random floor. The car waits at the
 * lobby with its doors open. Everyone there gets in, a second each, and the
 * doors close TIMER seconds after the last person stepped in, unless the car
 * is full. It then stops at each floor someone wants, lowest first, and
 * comes straight back down. FLOOR_S a floor and STOP_S a stop, as in VR21.
 * The same people arrive at the same seconds under both rules:
 *
 *   close   nobody holds the doors.
 *   hold    when the doors are about to close and someone is coming who
 *           will reach them within HOLD_FOR seconds, the people inside hold
 *           the doors until they get there. Then the same again, for as
 *           long as someone else is coming.
 *
 * Holding is batching: waiting so that more goes in one trip. A network
 * that holds a small packet back, hoping to send it with the next one, is
 * making the same bet, and it has the same catch: everything already in the
 * batch waits too.
 */

export type Rule = "hold" | "close";

export const FLOORS = 10;
export const FLOOR_S = 2;
export const STOP_S = 8;
export const BOARD_S = 1;
export const TIMER = 3;
export const CAPACITY = 12;
/** People reaching the lift doors a minute, on average. */
export const RATE = 4;
/** Seconds away someone can be and still be held for: anyone you can see coming. */
export const HOLD_FOR = 15;
export const SPAN = 3600;
/** Only people arriving between these seconds are counted, away from the ends. */
export const COUNT_FROM = 300;
export const COUNT_TO = SPAN - 300;
export const SEED = 1;
export const SEEDS = 100;

export type Options = {
  readonly rate?: number;
  readonly floors?: number;
  readonly capacity?: number;
  readonly timer?: number;
  readonly stop?: number;
  readonly floor?: number;
  readonly holdFor?: number;
};

export type Person = {
  readonly id: number;
  /** Second they reach the lift doors. */
  readonly at: number;
  /** Floor they work on, 1 to FLOORS. */
  readonly to: number;
};

const rng = (seed: number) => {
  let s = seed >>> 0;
  const next = () =>
    (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 8; i++) next();
  return next;
};

/** One morning's people, in the order they reach the doors. */
export const people = (seed: number = SEED, opts: Options = {}): Person[] => {
  const rate = opts.rate ?? RATE;
  const floors = opts.floors ?? FLOORS;
  const r = rng(seed * 7919 + 3);
  const out: Person[] = [];
  let t = 0;
  for (;;) {
    t += (-Math.log(1 - r()) * 60) / rate;
    if (t > SPAN) break;
    out.push({ id: out.length, at: t, to: 1 + Math.floor(r() * floors) });
  }
  return out;
};

/** One trip of the car, from its doors opening at the lobby. */
export type Trip = {
  readonly open: number;
  /** When the doors would have closed if nobody had held them. */
  readonly shut: number;
  /** Each moment the doors were about to close and were held instead. */
  readonly holds: readonly number[];
  readonly close: number;
  /** Ids in the order they stepped in, and the second each was in. */
  readonly riders: readonly number[];
  readonly boarded: readonly number[];
  /** Arrival at each floor, before the STOP_S stop. */
  readonly stops: readonly { floor: number; at: number }[];
  /** Back at the lobby. */
  readonly back: number;
};

export type Morning = {
  readonly trips: readonly Trip[];
  /** Second each person steps out at their floor, by id. */
  readonly out: readonly number[];
  /** Who got in only because the doors were held for them. */
  readonly heldFor: ReadonlySet<number>;
};

export const run = (
  rule: Rule,
  everyone: readonly Person[],
  opts: Options = {},
): Morning => {
  const cap = opts.capacity ?? CAPACITY;
  const timer = opts.timer ?? TIMER;
  const stopS = opts.stop ?? STOP_S;
  const floorS = opts.floor ?? FLOOR_S;
  const holdFor = rule === "hold" ? (opts.holdFor ?? HOLD_FOR) : 0;
  const out: number[] = new Array(everyone.length).fill(NaN);
  const heldFor = new Set<number>();
  const trips: Trip[] = [];
  let free = 0;
  let i = 0;
  while (i < everyone.length) {
    const open = Math.max(free, everyone[i].at);
    const riders: number[] = [];
    const boarded: number[] = [];
    let last = open;
    let until = -Infinity;
    let shut: number | null = null;
    const holds: number[] = [];
    for (;;) {
      while (
        i < everyone.length &&
        riders.length < cap &&
        everyone[i].at <= Math.max(last + timer, until)
      ) {
        const p = everyone[i++];
        if (p.at > last + timer) heldFor.add(p.id);
        last = Math.max(last, p.at) + BOARD_S;
        riders.push(p.id);
        boarded.push(last);
      }
      const natural = riders.length >= cap ? last : last + timer;
      shut ??= natural;
      const next = everyone[i];
      if (
        next &&
        riders.length < cap &&
        next.at > natural &&
        next.at - natural <= holdFor
      ) {
        until = next.at;
        holds.push(natural);
        continue;
      }
      break;
    }
    const close = riders.length >= cap ? last : last + timer;
    const floors = [...new Set(riders.map((id) => everyone[id].to))].sort(
      (a, b) => a - b,
    );
    let t = close;
    let f = 0;
    const stops: { floor: number; at: number }[] = [];
    for (const fl of floors) {
      t += (fl - f) * floorS;
      f = fl;
      stops.push({ floor: fl, at: t });
      t += stopS;
      for (const id of riders) if (everyone[id].to === fl) out[id] = t;
    }
    free = t + f * floorS;
    trips.push({
      open,
      shut,
      close,
      holds,
      riders,
      boarded,
      stops,
      back: free,
    });
  }
  return { trips, out, heldFor };
};

/** Seconds from reaching the doors to stepping out at your floor. */
export const tripTime = (m: Morning, p: Person) => m.out[p.id] - p.at;

/** The trip a person rode. */
export const tripOf = (m: Morning, id: number) =>
  m.trips.findIndex((t) => t.riders.includes(id));

/**
 * Whoever got into a held car first, unless they were held for themselves:
 * the person who stands inside the whole time the doors are held.
 */
const firstIn = (m: Morning, everyone: readonly Person[]) =>
  m.trips
    .filter((t) => t.holds.length > 0)
    .map((t) => everyone[t.riders[0]])
    .filter(
      (p) => p.at >= COUNT_FROM && p.at <= COUNT_TO && !m.heldFor.has(p.id),
    );

/**
 * Over SEEDS mornings, the same people under both rules: the average door
 * to floor time, the share of people who got in only because the doors were
 * held, how much sooner they got there, how much later everyone else did,
 * with the share of everyone else who got there later, and how much later
 * the first one into each held car got there.
 */
export const averages = (opts: Options = {}, seeds: number = SEEDS) => {
  let n = 0;
  let close = 0;
  let hold = 0;
  let held = 0;
  let heldGain = 0;
  let rest = 0;
  let restLoss = 0;
  let restLater = 0;
  let first = 0;
  let firstLoss = 0;
  for (let seed = 1; seed <= seeds; seed++) {
    const ps = people(seed, opts);
    const a = run("close", ps, opts);
    const b = run("hold", ps, opts);
    for (const p of ps) {
      if (p.at < COUNT_FROM || p.at > COUNT_TO) continue;
      const ta = tripTime(a, p);
      const tb = tripTime(b, p);
      n++;
      close += ta;
      hold += tb;
      if (b.heldFor.has(p.id)) {
        held++;
        heldGain += ta - tb;
      } else {
        rest++;
        restLoss += tb - ta;
        if (tb > ta) restLater++;
      }
    }
    for (const p of firstIn(b, ps)) {
      first++;
      firstLoss += tripTime(b, p) - tripTime(a, p);
    }
  }
  return {
    people: n,
    trip: { close: close / n, hold: hold / n },
    held: held / n,
    heldGain: heldGain / held,
    restLoss: restLoss / rest,
    restLater: restLater / rest,
    firstLoss: firstLoss / first,
  };
};

/**
 * The person the reel follows: in the SEED morning, the first one into a
 * held car whose extra time is closest to the 100-morning average for
 * first ones in. The earliest such person on a tie.
 */
export const hero = (firstLoss: number) => {
  const ps = people(SEED);
  const a = run("close", ps);
  const b = run("hold", ps);
  let best = -1;
  let bestDiff = Infinity;
  for (const p of firstIn(b, ps)) {
    const diff = Math.abs(tripTime(b, p) - tripTime(a, p) - firstLoss);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = p.id;
    }
  }
  return best;
};
