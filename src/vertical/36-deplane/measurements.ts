/**
 * The figures the frames use, from `scripts/measure-deplane.mjs`, which
 * imports the same `simulation.ts` the reel draws from. Seconds, rounded.
 */

/**
 * Seed 1. The followed passenger is #32, seat 6C: row 6 is the row whose
 * time saved by standing at once is closest to the 100-flight average, and
 * 6C its left aisle seat. Seconds from the seatbelt sign going off to
 * getting up and to leaving by the door.
 */
export const HERO = {
  id: 32,
  stand: { up: 0, off: 208 },
  sit: { up: 245, off: 262 },
} as const;

/**
 * 100 flights at the defaults. Mean seconds to get off and on your feet, and
 * the mean time saved by standing at once.
 */
export const AVERAGE = {
  off: { stand: 231, sit: 286 },
  feet: { stand: 231, sit: 28 },
  gain: 55,
  sooner: 1,
} as const;

export const CONDITIONS =
  "simulated · 12 rows · same passengers both times · sped up";
