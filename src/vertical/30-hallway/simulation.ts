/**
 * The hallway dance. One module, imported by both the reel and
 * `scripts/measure-hallway.mjs`, so the frames and the committed run are the
 * same code.
 *
 * Two people walking at each other head on in a corridor. Each one, after a
 * reaction time, steps to one side. If one moves clearly first, at least
 * WINDOW seconds before the other, the other sees it and goes the other way,
 * and they pass. If they move within WINDOW of each other, neither sees the
 * other's choice in time:
 *
 *   - the first time, each steps to the side they happen to prefer, and they
 *     pass if those are opposite sides of the corridor and collide if not;
 *   - after a collision both are on the same side, and each steps back to
 *     the open side at once, so if they move together again they collide
 *     again. That repeat is the dance.
 *
 * Two ways to react:
 *
 *   instant  step as soon as you have reacted, every time
 *   random   the first time, the same; after a bump, wait a random moment up
 *            to BACKOFF seconds before stepping again
 *
 * The second is random backoff, which is what Ethernet and Wi-Fi do when two
 * devices talk at once: each waits a random time before trying again, so the
 * retries rarely line up. Nobody waits unless there has been a collision.
 *
 * Seeded, so every run is the same.
 */

export type Rule = "instant" | "random";

/** Mean and spread of a reaction, s. */
export const REACT = 0.25;
export const SPREAD = 0.1;
/** Two moves closer together than this are simultaneous: neither sees the other's. */
export const WINDOW = 0.12;
/** The longest random wait, s. */
export const BACKOFF = 0.8;
/** Time a sidestep takes, s. */
export const STEP = 0.5;
/** Share of people who step to their own right first. */
export const KEEP_RIGHT = 0.5;
export const SEED = 1;

export type Options = {
  readonly spread?: number;
  readonly window?: number;
  readonly backoff?: number;
  readonly keepRight?: number;
};

export type Round = {
  /** Seconds after the encounter began that each person starts to step. */
  readonly a: number;
  readonly b: number;
  /** Screen side each ends on: -1 left, 1 right, looking down the corridor. */
  readonly sideA: -1 | 1;
  readonly sideB: -1 | 1;
  readonly collided: boolean;
  /** Second this round's step is done. */
  readonly end: number;
};

export type Encounter = {
  readonly rounds: readonly Round[];
  readonly dodges: number;
  /** Seconds from noticing each other to passing. */
  readonly seconds: number;
};

const rng = (seed: number) => {
  let s = seed >>> 0;
  const next = () =>
    (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 8; i++) next();
  return next;
};

const normal = (random: () => number) =>
  Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());

/**
 * One encounter. A walks away from the camera, so A's right is the screen's
 * right; B walks towards it, so B's right is the screen's left.
 */
/**
 * Each encounter draws its reactions, its side choices and its random waits
 * from three generators of its own, seeded by the encounter's number. So the
 * same two people meet in both corridors: the same reactions and the same
 * first choices, and only the random wait after a bump differs.
 */
export const encounter = (
  rule: Rule,
  index: number,
  seed: number = SEED,
  opts: Options = {},
): Encounter => {
  const base = seed * 100003 + index * 7919;
  const reactions = rng(base + 1);
  const sides = rng(base + 2);
  const waits = rng(base + 3);
  const spread = opts.spread ?? SPREAD;
  const window = opts.window ?? WINDOW;
  const backoff = opts.backoff ?? BACKOFF;
  const keepRight = opts.keepRight ?? KEEP_RIGHT;
  // Random backoff, as Ethernet does it: the first try is immediate, and
  // only after a collision does each side wait a random moment.
  const react = (afterBump: boolean) => {
    const r = Math.max(0.1, REACT + spread * normal(reactions));
    const wait = backoff * waits();
    return rule === "random" && afterBump ? r + wait : r;
  };
  const rounds: Round[] = [];
  let t = 0;
  let side: -1 | 1 | 0 = 0;
  for (let k = 0; k < 50; k++) {
    const a = t + react(k > 0);
    const b = t + react(k > 0);
    const end = Math.max(a, b) + STEP;
    if (Math.abs(a - b) >= window) {
      // The later one sees the first move and takes the other side.
      const first: -1 | 1 =
        side === 0 ? (sides() < 0.5 ? 1 : -1) : side === 1 ? -1 : 1;
      const sideA = a < b ? first : (-first as -1 | 1);
      rounds.push({
        a,
        b,
        sideA,
        sideB: -sideA as -1 | 1,
        collided: false,
        end,
      });
      return { rounds, dodges: rounds.length - 1, seconds: end };
    }
    let sideA: -1 | 1;
    let sideB: -1 | 1;
    if (side === 0) {
      sideA = sides() < keepRight ? 1 : -1;
      sideB = sides() < keepRight ? -1 : 1;
    } else {
      sideA = side === 1 ? -1 : 1;
      sideB = sideA;
    }
    const collided = sideA === sideB;
    rounds.push({ a, b, sideA, sideB, collided, end });
    if (!collided) return { rounds, dodges: rounds.length - 1, seconds: end };
    side = sideA;
    t = end;
  }
  return { rounds, dodges: rounds.length, seconds: t };
};

/** Encounters 0 to count - 1. */
export const stream = (
  rule: Rule,
  seed: number = SEED,
  count = 12,
  opts: Options = {},
) => Array.from({ length: count }, (_, i) => encounter(rule, i, seed, opts));

/**
 * The corridor the reel draws: one meeting place, pairs arriving back to
 * back. It starts at the first encounter of the seed whose first step is a
 * bump, because an encounter that passes cleanly first time is the same in
 * both corridors and shows nothing.
 */
export const firstBump = (seed: number = SEED) => {
  for (let i = 0; i < 1000; i++)
    if (encounter("instant", i, seed).rounds[0].collided) return i;
  return 0;
};

export const WALK_IN = 1.2;
export const WALK_OUT = 1.2;
export const GAP = 0.3;
/** The reel opens this far into the first pair's walk in. */
export const LEAD = 0.5;

export type Placed = Encounter & {
  readonly index: number;
  /** Second the pair starts walking in. */
  readonly start: number;
  /** Second they notice each other, when the encounter's clock starts. */
  readonly meet: number;
  /** Second they have passed. */
  readonly passed: number;
};

export const corridor = (
  rule: Rule,
  seed: number = SEED,
  until = 16,
  opts: Options = {},
): Placed[] => {
  const out: Placed[] = [];
  let t = -LEAD;
  for (let i = firstBump(seed); t < until; i++) {
    const e = encounter(rule, i, seed, opts);
    const meet = t + WALK_IN;
    out.push({ ...e, index: i, start: t, meet, passed: meet + e.seconds });
    t = meet + e.seconds + WALK_OUT + GAP;
  }
  return out;
};

/** Dodges so far and people who have got past, at second t. */
export const tally = (run: readonly Placed[], t: number) => {
  let bumps = 0;
  let passed = 0;
  for (const e of run) {
    for (const r of e.rounds) if (r.collided && e.meet + r.end <= t) bumps++;
    if (e.passed <= t) passed += 2;
  }
  return { bumps, passed };
};
