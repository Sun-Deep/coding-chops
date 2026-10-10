import { AVERAGE, HERO } from "./measurements";
import {
  SEED,
  averages,
  forFood,
  hero,
  run,
  toFood,
  toOrder,
  type Customer,
  type Rule,
} from "./simulation";

/**
 * The two restaurants the reel draws, the same customers arriving at the
 * same moments at both, checked on load against `measurements.ts`. Editing a
 * constant in `simulation.ts` without re-running the script throws here
 * instead of shipping a frame that disagrees with the committed numbers.
 */
export const RUNS: Record<Rule, Customer[]> = {
  cashier: run("cashier", SEED),
  kiosks: run("kiosks", SEED),
};

const typical = averages("cashier").line;
if (Math.round(typical) !== AVERAGE.cashier.line)
  throw new Error(
    `runs.ts: average line ${typical.toFixed(1)} s, measurements.ts says ${AVERAGE.cashier.line}`,
  );
if (hero(RUNS.cashier, typical) !== HERO.id)
  throw new Error(`runs.ts: the followed customer is not #${HERO.id}`);
for (const rule of ["cashier", "kiosks"] as const) {
  const c = RUNS[rule][HERO.id];
  const got = {
    line: Math.round(toOrder(c)),
    food: Math.round(forFood(c)),
    total: Math.round(toFood(c)),
    number: c.number,
  };
  const want = HERO[rule];
  if (
    got.line !== want.line ||
    got.food !== want.food ||
    got.total !== want.total ||
    got.number !== want.number
  )
    throw new Error(
      `runs.ts: ${rule} gives ${JSON.stringify(got)}, measurements.ts says ${JSON.stringify(want)}`,
    );
}

export const YOU = HERO.id;
