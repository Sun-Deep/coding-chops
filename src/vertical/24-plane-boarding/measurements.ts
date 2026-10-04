/**
 * The figures the frames use, from `scripts/measure-plane-boarding.mjs`, which
 * imports the same `boarding.ts` the reel draws from. Seconds until the last
 * passenger sat down, seed 1.
 */
export const SECONDS = {
  backToFront: 397,
  random: 316,
  windowFirst: 257,
} as const;

/** The same comparison over seeds 1 to 1,000. */
export const OVER_1000 = {
  median: { backToFront: 385, random: 341, windowFirst: 264 },
  randomBeatBackToFront: 916,
  windowFirstFastest: 999,
} as const;

export const CONDITIONS = "simulated · 12 rows · 72 passengers · same bags";

/** m:ss. */
export const clock = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
