/**
 * The figures the frames use, from `scripts/measure-microwave.mjs`, which
 * imports the same `simulation.ts` the reel draws from. Seconds.
 */

/** Seed 1: the average wait under each rule. */
export const AVERAGE_WAIT = { fifo: 420, sjf: 246 } as const;
export const CUT_PERCENT = 42;

/** Seed 1: what the 3:00 lunch, first in line, waits under each rule. */
export const LONGEST_JOB_WAIT = { fifo: 0, sjf: 635 } as const;

/** Both lines are done at the same second: same microwave, same work. */
export const DONE_AT = 825;

export const CONDITIONS = "simulated · 8 people · 1 microwave";
