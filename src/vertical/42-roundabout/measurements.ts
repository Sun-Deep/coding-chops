/**
 * The figures the frames use, from `scripts/measure-roundabout.mjs`, which
 * imports the same `simulation.ts` the reel draws from.
 */

/**
 * 20 seeded hours at the defaults, 1,800 cars an hour. Mean seconds from
 * appearing 150 m out to leaving 150 m out the other side, and mean seconds
 * standing still, to a tenth.
 */
export const AVERAGE = {
  lights: { time: 37.4, still: 6.9 },
  roundabout: { time: 32.4, still: 1.0 },
} as const;

/** The same late at night, 30 cars an hour on each arm: the lights win. */
export const NIGHT = {
  flow: 30,
  lights: { time: 25.0 },
  roundabout: { time: 26.6 },
} as const;

/**
 * Seed 1. The followed car comes from the west and goes straight on: of
 * every such car in the measured hour, the one whose times and seconds
 * standing still are closest to the averages above. When it appears, and
 * its time through and seconds standing still at each junction, to a
 * tenth.
 */
export const HERO = {
  id: 167,
  at: 338.5,
  lights: { time: 37.3, still: 6.7 },
  roundabout: { time: 31.2, still: 0 },
} as const;

export const CONDITIONS =
  "simulated · 1,800 cars an hour · same cars both times · 2x speed";
