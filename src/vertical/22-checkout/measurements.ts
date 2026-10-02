/**
 * One shop, three tills, forty shoppers, two ways of lining up, from
 * `scripts/measure-checkout.mjs`.
 *
 * Simulated, not timed. Most checkouts take 20 to 50 seconds; one in eight hits
 * a price check or a declined card and takes 120 to 180. Shoppers arrive at
 * random at a rate that keeps the tills 85 percent busy. Nobody switches lines.
 *
 * The scenario is seed 1. "You" is shopper 24, the one whose two waits differ
 * most in it, picked because the cut is about the bad draw and says so. What
 * the payoff claims does not rest on that pick: across 200,000 simulated
 * shoppers, 27.5 percent were overtaken in the shortest-line shop and none in
 * the shared-line one.
 *
 * `simulation.ts` reruns both rules on these shoppers when the module loads
 * and throws if any wait disagrees.
 */

export const TILLS = 3;
export const SEED = 1;

export type Shopper = {
  readonly id: number;
  /** Second they join a line. */
  readonly at: number;
  /** Seconds their checkout takes. */
  readonly s: number;
};

export const SHOPPERS: readonly Shopper[] = [
  { id: 0, at: 5, s: 35 },
  { id: 1, at: 29, s: 142 },
  { id: 2, at: 58, s: 20 },
  { id: 3, at: 78, s: 33 },
  { id: 4, at: 95, s: 27 },
  { id: 5, at: 172, s: 30 },
  { id: 6, at: 194, s: 26 },
  { id: 7, at: 196, s: 139 },
  { id: 8, at: 199, s: 38 },
  { id: 9, at: 208, s: 43 },
  { id: 10, at: 260, s: 30 },
  { id: 11, at: 339, s: 36 },
  { id: 12, at: 351, s: 47 },
  { id: 13, at: 375, s: 50 },
  { id: 14, at: 378, s: 41 },
  { id: 15, at: 381, s: 25 },
  { id: 16, at: 398, s: 30 },
  { id: 17, at: 399, s: 27 },
  { id: 18, at: 433, s: 143 },
  { id: 19, at: 434, s: 24 },
  { id: 20, at: 466, s: 24 },
  { id: 21, at: 484, s: 48 },
  { id: 22, at: 485, s: 180 },
  { id: 23, at: 517, s: 32 },
  { id: 24, at: 539, s: 42 },
  { id: 25, at: 552, s: 24 },
  { id: 26, at: 597, s: 39 },
  { id: 27, at: 614, s: 21 },
  { id: 28, at: 625, s: 49 },
  { id: 29, at: 633, s: 28 },
  { id: 30, at: 680, s: 33 },
  { id: 31, at: 691, s: 20 },
  { id: 32, at: 712, s: 33 },
  { id: 33, at: 725, s: 28 },
  { id: 34, at: 726, s: 40 },
  { id: 35, at: 728, s: 26 },
  { id: 36, at: 733, s: 35 },
  { id: 37, at: 751, s: 50 },
  { id: 38, at: 764, s: 50 },
  { id: 39, at: 789, s: 33 },
];

export const YOU = 24;

export type RuleKey = "shortest" | "shared";

/** Seconds each shopper waited to reach a till, by id. */
export const WAITS: Readonly<Record<RuleKey, readonly number[]>> = {
  shortest: [
    0, 0, 0, 0, 0, 0, 0, 0, 3, 32, 0, 0, 0, 0, 0, 44, 0, 29, 0, 16, 0, 0, 47, 0,
    173, 0, 0, 0, 11, 2, 0, 0, 0, 0, 28, 17, 20, 20, 30, 0,
  ],
  shared: [
    0, 0, 0, 0, 0, 0, 0, 0, 3, 12, 0, 0, 0, 0, 0, 17, 21, 24, 0, 15, 0, 0, 5,
    15, 25, 24, 3, 0, 10, 6, 0, 0, 0, 0, 0, 17, 20, 15, 7, 0,
  ],
};

/** Shoppers who joined after you and reached a till first, in the shortest-line shop. */
export const PASSED_YOU = 7;

/** Across seeds 100,001 to 101,000, 200 shoppers each. */
export const ACROSS = {
  shoppers: 200_000,
  meanWait: { shortest: 58.4, shared: 51.9 },
  lessOnAverage: 11,
  overtaken: { shortest: 27.5, shared: 0 },
  longerInShortest: 34.1,
  shorterInShortest: 31.6,
} as const;

/** m:ss. */
export const clock = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
