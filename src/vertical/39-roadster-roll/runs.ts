import { FALL, FLIP, FORCE } from "./measurements";
import { DROP, flipTwist, plan } from "./simulation";

/**
 * The fall the reel draws, checked on load against `measurements.ts`.
 * Editing a constant in `simulation.ts` without re-running the script throws
 * here instead of shipping a frame that disagrees with the committed numbers.
 */
export const PLAN = plan();

const r2 = (x: number) => Math.round(x * 100) / 100;
const r1 = (x: number) => Math.round(x * 10) / 10;
const twist = flipTwist();
const got = {
  fall: {
    hit: r2(PLAN.hit),
    hitKmh: r1(PLAN.hitV * 3.6),
    rollBy: r2(PLAN.rollBy),
    land: r2(PLAN.land),
  },
  flip: { box: r1(twist.box), floor: r1(twist.floor) },
  force: {
    roofG: r1(PLAN.roofG),
    brakeG: r1(PLAN.brakeG),
    landG: r1(PLAN.landG),
  },
};
const want = { fall: FALL, flip: FLIP, force: FORCE };
if (JSON.stringify(got) !== JSON.stringify(want))
  throw new Error(
    `runs.ts: model gives ${JSON.stringify(got)}, measurements.ts says ${JSON.stringify(want)}`,
  );
if (DROP !== 5)
  throw new Error(`runs.ts: the frames say 5 m, the model drops ${DROP} m`);
