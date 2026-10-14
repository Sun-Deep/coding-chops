import { DURATION, VERDICT_FROM as VERDICT, frameAt } from "./beats";
import { AVERAGE, HERO } from "./measurements";
import {
  SEED,
  averages,
  hero,
  run,
  toBench,
  toDone,
  type Lifter,
  type Rule,
} from "./simulation";

/**
 * The two gyms the reel draws, the same lifters arriving at the same moments
 * at both, checked on load against `measurements.ts`. Editing a constant in
 * `simulation.ts` without re-running the script throws here instead of
 * shipping a frame that disagrees with the committed numbers.
 */
export const RUNS: Record<Rule, Lifter[]> = {
  keep: run("keep", SEED),
  share: run("share", SEED),
};

const typical = averages();
const got = {
  wait: {
    keep: Math.round(typical.wait.keep),
    share: Math.round(typical.wait.share),
  },
  done: {
    keep: Math.round(typical.total.keep),
    share: Math.round(typical.total.share),
  },
  later: Math.round(typical.later * 1000) / 1000,
  laterBy: Math.round(typical.laterBy),
};
if (JSON.stringify(got) !== JSON.stringify(AVERAGE))
  throw new Error(
    `runs.ts: averages ${JSON.stringify(got)}, measurements.ts says ${JSON.stringify(AVERAGE)}`,
  );
if (hero(RUNS.keep, typical.wait.keep) !== HERO.id)
  throw new Error(`runs.ts: the followed lifter is not #${HERO.id}`);
for (const rule of ["keep", "share"] as const) {
  const l = RUNS[rule][HERO.id];
  const mine = { wait: Math.round(toBench(l)), done: Math.round(toDone(l)) };
  if (mine.wait !== HERO[rule].wait || mine.done !== HERO[rule].done)
    throw new Error(
      `runs.ts: ${rule} gives ${JSON.stringify(mine)}, measurements.ts says ${JSON.stringify(HERO[rule])}`,
    );
}
// The reel shows your turn coming below and not above.
if (
  !(
    frameAt(RUNS.share[HERO.id].sets[0].lift) < VERDICT &&
    frameAt(RUNS.keep[HERO.id].sets[0].swap) > DURATION
  )
)
  throw new Error("runs.ts: your turn does not land below only, in the reel");

export const YOU = HERO.id;
