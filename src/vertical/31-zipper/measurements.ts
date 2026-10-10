/**
 * The figures the frames use, from `scripts/measure-zipper.mjs`, which
 * imports the same `simulation.ts` the reel draws from.
 */

/**
 * Seed 1. The followed car is #109, the first to arrive in the ending lane
 * after 3 minutes who moves over early; #111 is the first after it who
 * stays. Seconds lost to the queue, and how many cars that arrived after the
 * followed car got through the cones before it.
 */
export const HERO = {
  you: 109,
  them: 111,
  early: { lost: 77.0, passedBy: 5 },
  zipper: { lost: 63.5, passedBy: 0 },
  themLost: 2.2,
} as const;

/** 20 seeds, cars arriving from 2 to 10 minutes, at the defaults. */
export const AVERAGE = {
  politeEarly: 111.0,
  politeZipper: 95.0,
  stayers: 1.8,
  throughIn10Min: 245,
} as const;

export const CONDITIONS = "simulated · same cars on both roads · sped up";
