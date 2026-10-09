import { HERO } from "./measurements";
import { SEED, corridor, tally, type Placed, type Rule } from "./simulation";

/**
 * The two corridors the reel draws, the same people in the same order in
 * both, checked on load against `measurements.ts`. Editing a constant in
 * `simulation.ts` without re-running the script throws here instead of
 * shipping a frame that disagrees with the committed numbers.
 */
export const RUNS: Record<Rule, Placed[]> = {
  instant: corridor("instant", SEED, 16),
  random: corridor("random", SEED, 16),
};

for (const rule of ["instant", "random"] as const) {
  const got = {
    dodges: RUNS[rule][0].dodges,
    passed: tally(RUNS[rule], 14).passed,
  };
  if (got.dodges !== HERO[rule].dodges || got.passed !== HERO[rule].passed) {
    throw new Error(
      `runs.ts: ${rule} gives ${JSON.stringify(got)}, measurements.ts says ${JSON.stringify(HERO[rule])}`,
    );
  }
}
