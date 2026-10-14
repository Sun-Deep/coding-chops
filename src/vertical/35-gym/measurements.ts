/**
 * The figures the frames use, from `scripts/measure-gym.mjs`, which imports
 * the same `simulation.ts` the reel draws from. Seconds, rounded.
 */

/**
 * Seed 1. The followed lifter is #4, whose wait for the bench when people
 * keep it is closest to the 100-evening average. Seconds from walking in to
 * having the bench (starting the plate change), and to the end of the last set.
 */
export const HERO = {
  id: 4,
  keep: { wait: 702, done: 1033 },
  share: { wait: 123, done: 569 },
} as const;

/**
 * 100 evenings, lifters walking in from 10 to 80 minutes, at the defaults.
 * `later` is the share of lifters who finish later when people take turns,
 * and `laterBy` how much later, on average, for them.
 */
export const AVERAGE = {
  wait: { keep: 764, share: 163 },
  done: { keep: 1320, share: 810 },
  later: 0.151,
  laterBy: 96,
} as const;

export const CONDITIONS =
  "simulated · one bench · same lifters both times · sped up";
