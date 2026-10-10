import { HERO } from "./measurements";
import {
  SEED,
  delay,
  hero,
  passedBy,
  simulate,
  type Motion,
  type Rule,
} from "./simulation";

/**
 * The two roads the reel draws, the same cars arriving at the same moments
 * on both, checked on load against `measurements.ts`. Editing a constant in
 * `simulation.ts` without re-running the script throws here instead of
 * shipping a frame that disagrees with the committed numbers.
 */
export const RUNS: Record<Rule, Motion> = {
  early: simulate("early", SEED, 380),
  zipper: simulate("zipper", SEED, 380),
};

const picked = hero(RUNS.early.cars);
if (picked.you !== HERO.you || picked.them !== HERO.them)
  throw new Error(
    `runs.ts: followed cars ${JSON.stringify(picked)}, measurements.ts says ${HERO.you} and ${HERO.them}`,
  );
for (const rule of ["early", "zipper"] as const) {
  const cars = RUNS[rule].cars;
  const got = {
    lost: Math.round(delay(cars[HERO.you]) * 10) / 10,
    passedBy: passedBy(cars, HERO.you),
  };
  if (got.lost !== HERO[rule].lost || got.passedBy !== HERO[rule].passedBy)
    throw new Error(
      `runs.ts: ${rule} gives ${JSON.stringify(got)}, measurements.ts says ${JSON.stringify(HERO[rule])}`,
    );
}
if (Math.round(delay(RUNS.early.cars[HERO.them]) * 10) / 10 !== HERO.themLost)
  throw new Error(
    "runs.ts: the stayer's lost time disagrees with measurements.ts",
  );

export const YOU = HERO.you;
export const THEM = HERO.them;

/** One car at simulated second t, interpolated between recorded steps. */
export const carAt = (run: Motion, i: number, t: number) => {
  const n = run.cars.length;
  const f = Math.max(0, t / 0.1);
  const k = Math.min(run.steps - 2, Math.floor(f));
  const u = f - k;
  const x0 = run.x[k * n + i];
  const x1 = run.x[(k + 1) * n + i];
  if (Number.isNaN(x0) || Number.isNaN(x1)) return null;
  const l0 = run.lane[k * n + i];
  const l1 = run.lane[(k + 1) * n + i];
  return {
    x: x0 + (x1 - x0) * u,
    lane: l0 + (l1 - l0) * u,
    v: run.v[k * n + i] * (1 - u) + run.v[(k + 1) * n + i] * u,
    a: run.a[k * n + i] * (1 - u) + run.a[(k + 1) * n + i] * u,
  };
};
