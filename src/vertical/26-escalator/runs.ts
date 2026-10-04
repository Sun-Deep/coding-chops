import {
  SEED,
  STEADY_FROM,
  STEADY_TO,
  perMinute,
  runEscalator,
} from "./escalator";
import { PER_MINUTE } from "./measurements";

/** The two escalators the reel draws, checked on load against `measurements.ts`. */
export const RUNS = {
  walkLeft: runEscalator("walkLeft", SEED),
  standBoth: runEscalator("standBoth", SEED),
};

for (const key of ["walkLeft", "standBoth"] as const) {
  const got =
    Math.round(
      (perMinute(RUNS[key].lanes[0], STEADY_FROM, STEADY_TO) +
        perMinute(RUNS[key].lanes[1], STEADY_FROM, STEADY_TO)) *
        10,
    ) / 10;
  if (got !== PER_MINUTE[key]) {
    throw new Error(
      `runs.ts: ${key} carries ${got}/min, measurements.ts says ${PER_MINUTE[key]}`,
    );
  }
}

/** People who have stepped off at the top between simulated seconds `from` and t. */
export const upBy = (key: "walkLeft" | "standBoth", from: number, t: number) =>
  RUNS[key].lanes[0].filter((r) => r.off >= from && r.off < t).length +
  RUNS[key].lanes[1].filter((r) => r.off >= from && r.off < t).length;
