/**
 * The figures the frames use, from `scripts/measure-lights.mjs`, which
 * imports the same `simulation.ts` the reel draws from.
 */

/** Seed 1: the bad bulb, and each way's checks and seconds to light. */
export const BAD = 70;
export const RESULT = {
  linear: { checks: 70, lit: 112.8 },
  binary: { checks: 7, lit: 19.4 },
} as const;

/** Every position of the bad bulb, 100 bulbs. */
export const ALL = {
  linearMeanChecks: 50.5,
  binaryMaxChecks: 7,
  binaryFaster: 91,
} as const;

export const CONDITIONS = "simulated · 100 bulbs · 1 bad";
