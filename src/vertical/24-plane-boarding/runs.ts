import { METHODS, board, type Boarding, type MethodKey } from "./boarding";
import { SECONDS } from "./measurements";

/**
 * The three boardings the reel draws, and a check on load that they are the
 * ones `measurements.ts` was copied from.
 */
export const RUNS = Object.fromEntries(
  METHODS.map((m) => [m, board(m)]),
) as Record<MethodKey, Boarding>;

for (const m of METHODS) {
  if (RUNS[m].seconds !== SECONDS[m]) {
    throw new Error(
      `runs.ts: ${m} took ${RUNS[m].seconds} s, measurements.ts says ${SECONDS[m]}`,
    );
  }
}
