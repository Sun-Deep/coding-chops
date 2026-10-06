/**
 * The figures the frames use, from `scripts/measure-gridlock.mjs`, which
 * imports the same `simulation.ts` the reel draws from.
 */

/** Seed 1, go on green: the second the block's loop locked. */
export const LOCKED_AT = 107.1;

/** 200 seeds at the default traffic, five minutes each. */
export const SWEEP = { runs: 200, greenLocked: 161, roomLocked: 0 } as const;

export const CONDITIONS = "simulated · 4 junctions · 3 to 5x real time";
