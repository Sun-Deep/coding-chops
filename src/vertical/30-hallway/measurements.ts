/**
 * The figures the frames use, from `scripts/measure-hallway.mjs`, which
 * imports the same `simulation.ts` the reel draws from.
 */

/**
 * Seed 1, from its first pair who would dance three or more times stepping
 * at once: dodges by that pair, and people past by 14 seconds.
 */
export const HERO = {
  instant: { dodges: 4, passed: 6 },
  random: { dodges: 2, passed: 6 },
} as const;

/** 20,000 encounters at the defaults: share of pairs dancing 3+ times. */
export const LONG_DANCE = { instant: 12.4, random: 1.9 } as const;

export const CONDITIONS = "simulated · same people both times · real time";
