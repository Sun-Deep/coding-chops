/**
 * The figures the frames use, from `scripts/measure-parking.mjs`, which
 * imports the same `parking.ts` the reel draws from.
 */

/** Seed 179: seconds from arriving to reaching the door. */
export const SECONDS = { row: 56, circle: 271 } as const;
export const DRIVEN_M = { row: 60, circle: 740 } as const;
/** Rows from the store each one parked in. */
export const STALL_ROW = { row: 7, circle: 1 } as const;

/** 400 seeds at the default settings. */
export const OVER_400 = {
  seeds: 400,
  circlingSlower: 310,
  rowMedian: 55,
  circleMedian: 57,
  rowNinetieth: 86,
  circleNinetieth: 276,
} as const;

/** Across eight other settings: fewest and most trips circling lost. */
export const ACROSS_SETTINGS = { fewest: 259, most: 368 } as const;

/** m:ss. */
export const clock = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
