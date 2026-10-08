import { BAD, RESULT } from "./measurements";
import { SEED, badBulb, search } from "./simulation";

/**
 * The two searches the reel draws, checked on load against
 * `measurements.ts`. Editing a constant in `simulation.ts` without re-running
 * the script throws here instead of shipping a frame that disagrees with the
 * committed numbers.
 */
export const BAD_BULB = badBulb(SEED);
export const RUNS = {
  linear: search("linear", BAD_BULB),
  binary: search("binary", BAD_BULB),
};

for (const key of ["linear", "binary"] as const) {
  const got = {
    bad: BAD_BULB,
    checks: RUNS[key].checks.length,
    lit: Math.round(RUNS[key].lit * 10) / 10,
  };
  if (
    got.bad !== BAD ||
    got.checks !== RESULT[key].checks ||
    got.lit !== RESULT[key].lit
  ) {
    throw new Error(
      `runs.ts: ${key} gives ${JSON.stringify(got)}, measurements.ts disagrees`,
    );
  }
}
