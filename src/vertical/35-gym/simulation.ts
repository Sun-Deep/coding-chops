/**
 * One bench in a gym at the after-work peak. One module, imported by both the
 * reel and `scripts/measure-gym.mjs`, so the frames and the committed run are
 * the same code.
 *
 * Lifters arrive at random, seeded, each wanting the bench for a workout of
 * 3 to 5 sets with a rest between sets. Two ways to use it:
 *
 *   keep    whoever has the bench keeps it, resting on it between sets,
 *           until their last set is done. Everyone else waits in turn.
 *   share   up to SHARE lifters take turns: while one rests, the next one
 *           who is ready lifts. Newcomers join as a place opens, in turn.
 *
 * Every time a different lifter takes the bar, they first change the plates
 * and the seat to their own, which takes SWAP seconds on average. Under
 * `keep` that happens once per lifter; under `share` at every turn. A sharer
 * whose rest is over while someone else is lifting waits, so their own
 * workout takes longer.
 *
 * The same lifters, with the same sets, rests and plate changes, arrive at
 * both gyms at the same moments, so the only difference is the rule.
 *
 * A processor does the same thing: while one program waits on something
 * slow, another runs, and switching between them has a cost. The first is
 * multitasking, the cost is a context switch.
 */

export type Rule = "keep" | "share";

/** Mean seconds between lifters arriving for the bench. */
export const GAP = 600;
/** Arrivals stop after this many seconds; the line then drains. */
export const RUSH = 5400;
/** Mean seconds of one set, a rest between sets, and a plate change. */
export const LIFT = 40;
export const REST = 120;
export const SWAP = 30;
/** Lifters taking turns on the bench under `share`. */
export const SHARE = 2;
/** Walking from the door to the bench. */
export const WALK_IN = 10;
export const SEED = 1;

export type Options = {
  readonly gap?: number;
  readonly lift?: number;
  readonly rest?: number;
  readonly swap?: number;
  readonly share?: number;
};

export type Set = {
  /** Starts changing the plates; equals `lift` when no change is needed. */
  readonly swap: number;
  readonly lift: number;
  readonly end: number;
};

export type Lifter = {
  readonly id: number;
  readonly arrive: number;
  /** When they have the bench, or a turn on it. */
  readonly join: number;
  readonly sets: readonly Set[];
  /** End of the last set. */
  readonly done: number;
  /** The rest they planned after each set but the last. */
  readonly rests: readonly number[];
};

const rng = (seed: number) => {
  let s = seed >>> 0;
  const next = () =>
    (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 8; i++) next();
  return next;
};

/** Spread evenly around a mean: from (1 - by) to (1 + by) times it. */
const around = (random: () => number, by: number) => 1 - by + 2 * by * random();

type Plan = {
  arrive: number;
  lifts: number[];
  rests: number[];
  swap: number;
};

/** The lifters of one evening, the same whichever rule the gym uses. */
export const plans = (seed: number = SEED, opts: Options = {}): Plan[] => {
  const gap = opts.gap ?? GAP;
  const lift = opts.lift ?? LIFT;
  const rest = opts.rest ?? REST;
  const swap = opts.swap ?? SWAP;
  // One generator per quantity, so changing one setting moves nothing else.
  const gaps = rng(seed * 7919 + 1);
  const counts = rng(seed * 7919 + 2);
  const lifts = rng(seed * 7919 + 3);
  const rests = rng(seed * 7919 + 4);
  const swaps = rng(seed * 7919 + 5);
  const out: Plan[] = [];
  for (let t = -Math.log(1 - gaps()) * gap * 0.3; t < RUSH; ) {
    const sets = 3 + Math.floor(counts() * 3);
    out.push({
      arrive: t,
      lifts: Array.from({ length: sets }, () => lift * around(lifts, 0.25)),
      rests: Array.from({ length: sets - 1 }, () => rest * around(rests, 0.4)),
      swap: swap * around(swaps, 0.4),
    });
    t += -Math.log(1 - gaps()) * gap;
  }
  return out;
};

export const run = (
  rule: Rule,
  seed: number = SEED,
  opts: Options = {},
): Lifter[] => {
  const people = plans(seed, opts);
  const share = rule === "keep" ? 1 : (opts.share ?? SHARE);
  const sets: Set[][] = people.map(() => []);
  const join: number[] = people.map(() => 0);
  // Lifters with a place on the bench, and when each is ready to lift again.
  const on: { id: number; ready: number; since: number }[] = [];
  let next = 0;
  let free = 0;
  let last = -1;
  let opened = 0;
  let left = people.length;
  while (left > 0) {
    // Fill the places, in the order people arrived.
    while (on.length < share && next < people.length) {
      const at = Math.max(people[next].arrive + WALK_IN, opened);
      join[next] = at;
      on.push({ id: next, ready: at, since: at });
      next++;
    }
    // The next set goes to whoever can start soonest; on a tie, whoever has
    // been ready longest.
    let pick = 0;
    for (let k = 1; k < on.length; k++) {
      const a = Math.max(free, on[k].ready);
      const b = Math.max(free, on[pick].ready);
      if (a < b || (a === b && on[k].ready < on[pick].ready)) pick = k;
    }
    const m = on[pick];
    const p = people[m.id];
    const start = Math.max(free, m.ready);
    const lift = start + (last === m.id ? 0 : p.swap);
    const n = sets[m.id].length;
    const end = lift + p.lifts[n];
    sets[m.id].push({ swap: start, lift, end });
    free = end;
    last = m.id;
    if (n + 1 === p.lifts.length) {
      on.splice(pick, 1);
      opened = end;
      left--;
    } else m.ready = end + p.rests[n];
  }
  return people.map((p, id) => ({
    id,
    arrive: p.arrive,
    join: join[id],
    sets: sets[id],
    done: sets[id][sets[id].length - 1].end,
    rests: p.rests,
  }));
};

/** Seconds from walking in to having the bench, so starting the plate change. */
export const toBench = (l: Lifter) => l.sets[0].swap - l.arrive;
/** Seconds from walking in to the end of the last set. */
export const toDone = (l: Lifter) => l.done - l.arrive;

/** Seeds and the window of arrivals the averages are taken over. */
export const SEEDS = 100;
export const WINDOW = [600, 4800] as const;

const inWindow = (l: Lifter) => l.arrive > WINDOW[0] && l.arrive < WINDOW[1];

/**
 * Over SEEDS evenings: mean wait for the bench and mean time to finish, and
 * of the same lifters under `share`, the share who finish later than under
 * `keep` and how much later on average.
 */
export const averages = (opts: Options = {}) => {
  let n = 0;
  const wait = { keep: 0, share: 0 };
  const total = { keep: 0, share: 0 };
  let later = 0;
  let laterBy = 0;
  for (let seed = 1; seed <= SEEDS; seed++) {
    const keep = run("keep", seed, opts);
    const share = run("share", seed, opts);
    keep.forEach((k, i) => {
      if (!inWindow(k)) return;
      const s = share[i];
      n++;
      wait.keep += toBench(k);
      wait.share += toBench(s);
      total.keep += toDone(k);
      total.share += toDone(s);
      if (toDone(s) > toDone(k) + 1) {
        later++;
        laterBy += toDone(s) - toDone(k);
      }
    });
  }
  return {
    lifters: n,
    wait: { keep: wait.keep / n, share: wait.share / n },
    total: { keep: total.keep / n, share: total.share / n },
    later: later / n,
    laterBy: later ? laterBy / later : 0,
  };
};

/**
 * The lifter the reel follows: in seed 1 under `keep`, the one whose wait for
 * the bench is closest to the average wait over all seeds. A typical
 * evening's wait, not a lucky or an unlucky one.
 */
export const hero = (people: readonly Lifter[], typical: number) => {
  let best = people[0];
  for (const l of people)
    if (Math.abs(toBench(l) - typical) < Math.abs(toBench(best) - typical))
      best = l;
  return best.id;
};
