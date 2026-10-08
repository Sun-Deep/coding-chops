/**
 * A string of Christmas lights with one bad bulb. One module, imported by
 * both the reel and `scripts/measure-lights.mjs`, so the frames and the
 * committed run are the same code.
 *
 * BULBS bulbs in series, BULB_GAP metres apart, plugged in at bulb 1. One bad
 * bulb breaks the circuit, so the whole string is dark. A non-contact voltage
 * tester held to the wire just past bulb k says whether power gets that far:
 * it does if and only if the bad bulb is further along than k.
 *
 * Two ways to use the same tester:
 *
 *   linear  test just past bulb 1, then 2, then 3, until power stops
 *   binary  test the middle of the bulbs still in doubt; power there clears
 *           the first half, none clears the second; repeat until one is left
 *
 * The second is binary search. Each check takes CHECK seconds to hold the
 * tester and read it, plus MOVE seconds for every metre the hand travels
 * along the string from the last check, so a jump to the middle of the tree
 * costs more than stepping to the next bulb.
 */

export const BULBS = 100;
export const BULB_GAP = 0.1;
export const CHECK = 1.5;
export const MOVE = 0.4;
/** Swapping the bad bulb for a good one. */
export const SWAP = 5;
export const SEED = 1;

export type Method = "linear" | "binary";

export type Check = {
  /** The tester is held just past this bulb, 1 to BULBS. */
  readonly at: number;
  /** Whether power reached it. */
  readonly power: boolean;
  /** Second the reading is taken. */
  readonly t: number;
  /** Bulbs still in doubt after this check, inclusive range. */
  readonly lo: number;
  readonly hi: number;
};

export type Search = {
  readonly method: Method;
  readonly bad: number;
  readonly checks: readonly Check[];
  /** Second the bad bulb is known, and the second the string lights up. */
  readonly found: number;
  readonly lit: number;
};

const rng = (seed: number) => {
  let s = seed >>> 0;
  const next = () =>
    (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 8; i++) next();
  return next;
};

/** The bad bulb for a seed, 1 to BULBS, every position equally likely. */
export const badBulb = (seed: number = SEED) =>
  1 + Math.floor(rng(seed * 17 + 5)() * BULBS);

export const search = (
  method: Method,
  bad: number,
  { bulbs = BULBS, move = MOVE }: { bulbs?: number; move?: number } = {},
): Search => {
  const checks: Check[] = [];
  let lo = 1;
  let hi = bulbs;
  let at = 0;
  let t = 0;
  const test = (k: number) => {
    t += CHECK + move * Math.abs(k - at) * BULB_GAP;
    at = k;
    const power = bad > k;
    if (power) lo = k + 1;
    else hi = Math.min(hi, k);
    checks.push({ at: k, power, t, lo, hi });
  };
  if (method === "linear") {
    for (let k = 1; lo < hi || checks.length === 0; k++) {
      test(k);
      if (!checks[checks.length - 1].power) {
        lo = k;
        hi = k;
      }
    }
  } else {
    while (lo < hi) test(Math.floor((lo + hi) / 2));
  }
  return { method, bad, checks, found: t, lit: t + SWAP };
};
