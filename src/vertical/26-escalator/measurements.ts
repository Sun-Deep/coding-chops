/**
 * The figures the frames use, from `scripts/measure-escalator.mjs`, which
 * imports the same `escalator.ts` the reel draws from. People reaching the
 * top a minute, measured from 70 to 150 s once the escalator is full.
 */
export const PER_MINUTE = { walkLeft: 114.8, standBoth: 145.5 } as const;
export const GAIN_PERCENT = 27;

/** Transport for London's Holborn trial, cited, not simulated. */
export const HOLBORN = {
  walkLeft: 115,
  standBothLow: 141,
  standBothHigh: 151,
} as const;
