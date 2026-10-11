/**
 * The figures the frames use, from `scripts/measure-cinema.mjs`, which
 * imports the same `simulation.ts` the reel draws from.
 */

/**
 * Seed 1. The followed group is #16, the first group of four that cannot sit
 * together when people keep a gap. Free seats and the longest free run in
 * any row as it arrives, and whether it sits together.
 */
export const HERO = {
  you: 16,
  spread: { free: 23, longest: 3, together: false },
  pack: { free: 23, longest: 10, together: true },
} as const;

/** Seed 1 filled to a full house: groups split up, and people beside a stranger. */
export const FULL = {
  groups: 24,
  people: 57,
  split: { spread: 3, pack: 0 },
  besideStranger: { spread: 36, pack: 33 },
} as const;

/** 200 full houses at the defaults. */
export const AVERAGE = {
  freeAtFirstSplit: { spread: 18.6, pack: 0.7 },
  besideStranger: { spread: 42.0, pack: 36.5 },
} as const;

export const CONDITIONS = "simulated · same groups in the same order";
