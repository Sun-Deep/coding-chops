/**
 * The figures the frames use, from `scripts/measure-phantom-jam.mjs`, which
 * imports the same `physics.ts` the reel draws from.
 *
 * Measured over t = 50 to 100 s, long after the tap, because the question is
 * whether a jam is still there. The first wave always stops a few cars on both
 * rings: the cars between the tap and the smoothing car are human.
 */

/** Most cars stopped at once, and the ring's mean speed, t = 50 to 100 s. */
export const LATER = {
  human: { mostStopped: 9, meanKmh: 13.6 },
  smoothed: { mostStopped: 0, meanKmh: 23.5 },
} as const;

/** Settled speed before the tap, every gap equal. */
export const SETTLED_KMH = 26.0;

/** The sweep: 54 driver settings x 20 seeds. */
export const SWEEP = {
  runs: 1080,
  jams: 1020,
  clearedBySmoother: 355,
  fasterWithSmoother: 898,
} as const;

export const CONDITIONS = "simulated · 22 cars · 230 m ring · 12x real time";
