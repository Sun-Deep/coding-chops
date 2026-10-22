/**
 * The figures the frames use, from `scripts/measure-roadster-roll.mjs`, which
 * imports the same `simulation.ts` the reel draws from. Tesla published no
 * height, size, weight or thrust; the script sweeps each assumption.
 */

/**
 * At the defaults, to a hundredth of a second: when the roof hits with no
 * thrusters and how fast in km/h to a tenth, when the roll has to be done
 * because the braking has to start, and when the wheels touch.
 */
export const FALL = {
  hit: 1.01,
  hitKmh: 35.7,
  rollBy: 0.72,
  land: 1.33,
} as const;

/**
 * What an accelerometer in the car reads at the hardest moment of each
 * landing, in g to a tenth: the roof crushing 0.2 m with no thrusters; the
 * jets braking, and the suspension giving 0.1 m, with them.
 */
export const FORCE = { roofG: 26.0, brakeG: 2.0, landG: 1.5 } as const;

/** How many times the twist a backflip in the same time needs, to a tenth. */
export const FLIP = { box: 3.9, floor: 4.8 } as const;

export const CONDITIONS =
  "simulated · 5 m drop · 2x-weight jets · 0.2 m roof crush · slowed";
