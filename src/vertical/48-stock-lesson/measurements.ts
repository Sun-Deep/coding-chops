/**
 * What this machine did, from `scripts/measure-stock.mjs`.
 *
 * Apple M5 Pro, Node 22.14.0. The example is LeetCode 121's own. The big
 * input is 100,000 seeded prices from 0 to 10,000, the problem's limits.
 * Every pair checks each buy day against each later sell day; one pass
 * carries the cheapest price so far. Each is timed five times and the
 * median kept; three runs of the script are recorded. The script checks
 * every count exactly and the times against this band, and exits 1 if
 * either disagrees.
 */

export const RUN = {
  example: { prices: [7, 1, 5, 3, 6, 4], answer: 5, pairs: 15 },
  big: {
    n: 100_000,
    pairs: 4_999_950_000,
    steps: 99_999,
    answer: 10_000,
    /** Median milliseconds for every pair, lowest and highest of three runs. */
    pairMs: [2644, 2663],
    /** One pass stayed under this many milliseconds in every run. */
    passMsUnder: 0.1,
  },
} as const;

export const CONDITIONS = "Apple M5 Pro · Node 22.14 · median of 5 runs";
