import { DROPS, FEWER, OUT } from "./measurements";
import { GAP, timeOut, trip, type Gait } from "./simulation";

/**
 * The trips the reel draws, checked on load against `measurements.ts`.
 * Editing a constant in `simulation.ts` without re-running the script throws
 * here instead of shipping a frame that disagrees with the committed numbers.
 */
const round = (c: { front: number; top: number; total: number }) => ({
  front: Math.round(c.front),
  top: Math.round(c.top),
  total: Math.round(c.total),
});
const tenth = (x: number) => Math.round(x * 10) / 10;
const walk = trip("walk");
const run = trip("run");
const got = {
  drops: { walk: round(walk), run: round(run) },
  out: { walk: tenth(timeOut("walk")), run: tenth(timeOut("run")) },
  fewer: {
    total: Math.round((1 - run.total / walk.total) * 100) / 100,
    top: tenth(walk.top / run.top),
  },
};
const want = { drops: DROPS, out: OUT, fewer: FEWER };
if (JSON.stringify(got) !== JSON.stringify(want))
  throw new Error(
    `runs.ts: model gives ${JSON.stringify(got)}, measurements.ts says ${JSON.stringify(want)}`,
  );
if (GAP !== 14)
  throw new Error(`runs.ts: the frames say 14 m, the model has ${GAP} m`);

export const GAITS: readonly Gait[] = ["walk", "run"];
