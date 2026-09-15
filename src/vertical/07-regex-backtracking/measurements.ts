/**
 * Every number this reel puts on screen, and where it came from.
 *
 * All of them were measured on 2026-09-12 rather than recalled. The full run,
 * including both sessions and the raw table, is in
 * `curriculum/vertical/07-regex-backtracking/measurements.md`, and
 * `scripts/measure-regex-backtracking.mjs` reproduces it. Nothing in the shots
 * hardcodes a figure, so correcting a measurement corrects the frame.
 *
 *   Node v22.14.0 and Python 3.14.6, aarch64-apple-darwin
 *   pattern under test: /^(a+)+$/ against "a".repeat(n) + "X"
 *   control: /^a+$/, same input, same process
 *   3 runs per point, median reported, n from 20 to 30
 *   two sessions, back to back
 *
 * Read `SCREEN_SAFE` before putting any millisecond figure on a frame. The
 * ratio reproduced to two decimal places across both sessions and the absolute
 * times did not, which changes what each one is allowed to claim.
 */

export const SETUP = {
  /** The pattern that blows up. Two quantifiers, one nested in the other. */
  nested: "^(a+)+$",
  /** The same language, one quantifier. This is the whole fix. */
  linear: "^a+$",
  node: "22.14",
  python: "3.14.6",
  runsPerPoint: 3,
  /** The a's. The string on screen is this many, plus the X. */
  headlineRun: 30,
} as const;

/** 30 a's and one X. The figure the narration says out loud. */
export const HEADLINE_CHARACTERS = SETUP.headlineRun + 1;

/**
 * The curve, in milliseconds. Median of three runs, session one.
 *
 * Shot 2 draws this directly. Eleven points is what establishes the claim as
 * exponential rather than merely slow, which is the difference between this cut
 * and an assertion. The shape is what the shot is showing, and the shape is
 * identical in both sessions.
 *
 * `linear` reads 0.0136 at n=20 and 0.0002 everywhere after. That first value
 * is JIT warm-up on the first call in the process, not a property of n=20. It
 * is kept because discarding the inconvenient sample is how a measurement
 * becomes a story, and it is not used on screen.
 */
export const CURVE = [
  { n: 20, nested: 4.514, linear: 0.0136, python: 21.971 },
  { n: 21, nested: 8.312, linear: 0.0003, python: 38.515 },
  { n: 22, nested: 15.675, linear: 0.0001, python: 76.16 },
  { n: 23, nested: 31.487, linear: 0.0001, python: 147.623 },
  { n: 24, nested: 62.854, linear: 0.0002, python: 295.167 },
  { n: 25, nested: 126.123, linear: 0.0002, python: 602.518 },
  { n: 26, nested: 251.003, linear: 0.0002, python: 1197.337 },
  { n: 27, nested: 512.393, linear: 0.0002, python: 2514.97 },
  { n: 28, nested: 1019.309, linear: 0.0002, python: 4821.228 },
  { n: 29, nested: 2053.54, linear: 0.0002, python: 9704.969 },
  { n: 30, nested: 4159.65, linear: 0.0002, python: 19936.956 },
] as const;

/** The point the headline figures come off. */
export const HEADLINE = CURVE[CURVE.length - 1];

/**
 * Session two, for the reproducibility claim.
 *
 * Run back to back with session one. Included because the playbook requires two
 * runs and because the difference between the two is what decides which figures
 * may appear on a frame.
 */
export const CURVE_SESSION_TWO = [
  { n: 20, nested: 4.593, python: 19.189 },
  { n: 21, nested: 8.392, python: 38.539 },
  { n: 22, nested: 16.979, python: 76.675 },
  { n: 23, nested: 33.207, python: 151.629 },
  { n: 24, nested: 66.377, python: 306.225 },
  { n: 25, nested: 129.038, python: 618.293 },
  { n: 26, nested: 267.278, python: 1236.821 },
  { n: 27, nested: 521.261, python: 2521.541 },
  { n: 28, nested: 1081.101, python: 4951.735 },
  { n: 29, nested: 2145.959, python: 9912.163 },
  { n: 30, nested: 4322.488, python: 19788.68 },
] as const;

/**
 * The doubling, which is the claim, and the only number here that reproduced
 * exactly.
 *
 * Median of the ten point-to-point ratios: 2.01 in session one, 2.00 in session
 * two. The two low outliers at n=21 and n=22 are the smallest absolute times in
 * the set and therefore the noisiest.
 */
export const DOUBLING_RATIO = 2.0;

/**
 * What may go on a frame, and at what precision.
 *
 * The playbook's rule is that anything which moves between two runs does not
 * appear as an absolute. The absolute times moved: Node's n=30 figure went
 * 4159.65 to 4322.49, which is 3.9 percent, and Python's went 19936.96 to
 * 19788.68, which is 0.7 percent. Neither is stable at the precision the raw
 * numbers are printed to.
 *
 * Rounding until both sessions agree is what these are. Node is 4 seconds in
 * both and 4.2 against 4.3 at one decimal, so it goes up as a whole number.
 * Python is 20 seconds in both. The narration says twenty and the frame says
 * the same thing, so there is nothing for a comment thread to catch.
 *
 * The ratio carries the actual claim and it needs no hedging.
 */
export const SCREEN_SAFE = {
  /** Python at n=30, both sessions. Rounded down in words, same on the frame. */
  pythonSeconds: 20,
  /** Node at n=30, both sessions. */
  nodeSeconds: 4,
  /** Node at n=29, 2.05 and 2.15 seconds across the two sessions. */
  nodePreviousSeconds: 2,
  /** The control, identical at every n in both sessions past the warm-up. */
  rewriteMs: 0.0002,
  /**
   * Both sessions agree at one decimal and not at two: 2.01 against 2.00. The
   * frame shows one decimal for the same reason the times are whole seconds.
   */
  doubling: DOUBLING_RATIO,
} as const;

/**
 * What the rewrite is worth at n=30. Twenty to twenty five million, depending
 * on the session.
 *
 * Not on a frame and not in the narration. It swings by four million between
 * two runs taken minutes apart, a number this size stops meaning anything to a
 * reader anyway, and the two readouts side by side say it better.
 */
export const SPEEDUP = Math.round(HEADLINE.nested / HEADLINE.linear);

/**
 * Why Python is on screen.
 *
 * Two unrelated backtracking engines doubling at the same rate makes this a
 * property of backtracking rather than of V8. The roughly five times gap in
 * absolute terms is interpreter overhead per step and carries no lesson, so it
 * is never drawn as a comparison between the two.
 */
export const ENGINES = {
  backtracking: ["JavaScript", "Python", "Java", "PCRE", ".NET"],
  /** Linear time by construction. Not measured here; see `sources.md`. */
  linearTime: ["Go regexp", "Rust regex"],
  /** What the second group gives up to promise it. */
  cost: "no backreferences, no lookaround",
} as const;
