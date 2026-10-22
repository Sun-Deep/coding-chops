/**
 * The figures the frames use, from `scripts/measure-elevator-door.mjs`, which
 * imports the same `simulation.ts` the reel draws from.
 */

/**
 * Seed 1. The followed person is #181, bound for floor 9: the first one
 * into a held car whose extra time is closest to the 100-morning average
 * for first ones in. Seconds from the start of the morning to reaching the
 * lift doors and to stepping out at floor 9, to a tenth.
 */
export const HERO = {
  id: 181,
  at: 3022.5,
  close: { out: 3171.6 },
  hold: { out: 3220.3 },
} as const;

/**
 * 100 mornings at the defaults. Mean seconds from the doors to your floor
 * under each rule, the share of people who got in only because the doors
 * were held, how much sooner they got there, how much later everyone else
 * did, and how much later the first one into each held car did, to a tenth.
 */
export const AVERAGE = {
  trip: { close: 72.6, hold: 79.7 },
  held: 0.234,
  heldGain: 17.1,
  restLoss: 14.5,
  firstLoss: 47.5,
} as const;

export const CONDITIONS =
  "simulated · one lift · same people both times · sped up";
