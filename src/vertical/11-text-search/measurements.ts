/**
 * The six runs, from `scripts/measure-text-search.mjs`.
 *
 * One page of text, one phrase, and one unit of work: a read is one access to
 * a character of the text. Comparing it to a character of the pattern is a
 * read, rolling a hash over it is a read, and looking at the character just
 * past the window to decide how far to jump is a read. Touching the same
 * position twice counts twice.
 *
 * Reads rather than comparisons, because comparisons flatter Rabin-Karp: it
 * compares hashes rather than characters and would come out looking as though
 * it barely touched the page when it touches all of it.
 */

/** 80 columns by 30 rows, which is what a panel draws. */
export const COLS = 80;
export const ROWS = 30;
export const LENGTH = COLS * ROWS;

export const PATTERN = "the machine";
export const SEED = 20_260_916;

/** The phrase is planted three times. Every matcher has to find all three. */
export const OCCURRENCES = 3;

export type MatcherKey =
  | "naive"
  | "kmp"
  | "rabinkarp"
  | "horspool"
  | "boyermoore"
  | "sunday";

export type Run = {
  /** Character accesses, repeats included. */
  readonly reads: number;
  /** Distinct positions the matcher looked at. */
  readonly distinct: number;
  /** Positions it never looked at. The whole claim. */
  readonly skipped: number;
};

export const RUNS: Readonly<Record<MatcherKey, Run>> = {
  naive: { reads: 2_705, distinct: 2_390, skipped: 10 },
  kmp: { reads: 2_400, distinct: 2_400, skipped: 0 },
  rabinkarp: { reads: 4_822, distinct: 2_400, skipped: 0 },
  horspool: { reads: 397, distinct: 389, skipped: 2_011 },
  boyermoore: { reads: 376, distinct: 371, skipped: 2_029 },
  sunday: { reads: 702, distinct: 649, skipped: 1_751 },
};

/**
 * One unit on screen, and it is `distinct`.
 *
 * The reel counts characters the matcher looked at, never accesses it made,
 * because that is exactly the set of cells the panel lights up: the number and
 * the picture are then the same fact and cannot contradict each other. `reads`
 * stays in the table above because it is what the script measured and because
 * Rabin-Karp's is worth knowing, but nothing in a frame reads it.
 */
export const LOOKED_AT_STRAIGHT = RUNS.naive.distinct;
export const LOOKED_AT_FEWEST = RUNS.boyermoore.distinct;
export const NEVER_READ = RUNS.boyermoore.skipped;

/**
 * The same comparison across a hundred fresh texts, from `SWEEP=1`.
 *
 * Unlike the maze cut's map, this fixture is not at the dramatic end of its
 * range. Boyer-Moore reads 15.5 percent of this page against a median of 15.9
 * across a hundred, so the number on screen is the ordinary case.
 */
export const SWEEP = {
  texts: 100,
  boyerMooreShareMin: 14.7,
  boyerMooreShareMedian: 15.9,
  boyerMooreShareMax: 17.5,
  naiveRatioMedian: 6.9,
} as const;
