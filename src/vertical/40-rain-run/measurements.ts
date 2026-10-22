/**
 * The figures the frames use, from `scripts/measure-rain-run.mjs`, which
 * imports the same `simulation.ts` the reel draws from. Expected raindrops
 * on you over the whole trip, by the formula; the script's 1,000 showers
 * counted drop by drop agree to within 0.1%.
 */
export const DROPS = {
  walk: { front: 2172, top: 1492, total: 3665 },
  run: { front: 2172, top: 418, total: 2590 },
} as const;

/** Seconds out in the rain, to a tenth. */
export const OUT = { walk: 10.2, run: 2.9 } as const;

/** How many fewer drops running gets you, and how many fewer on top. */
export const FEWER = { total: 0.29, top: 3.6 } as const;

export const CONDITIONS =
  "simulated · 20 mm/h rain · 2 mm drops · still air · 14 m · real time";
