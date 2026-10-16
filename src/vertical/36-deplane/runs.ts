import { AVERAGE, HERO } from "./measurements";
import { SEED, averages, hero, run, type Rule, type Trace } from "./simulation";

/**
 * The two cabins the reel draws, the same passengers in both, checked on
 * load against `measurements.ts`. Editing a constant in `simulation.ts`
 * without re-running the script throws here instead of shipping a frame that
 * disagrees with the committed numbers.
 */
export const RUNS: Record<Rule, Trace[]> = {
  stand: run("stand", SEED),
  sit: run("sit", SEED),
};

const typical = averages();
const got = {
  off: {
    stand: Math.round(typical.off.stand),
    sit: Math.round(typical.off.sit),
  },
  feet: {
    stand: Math.round(typical.feet.stand),
    sit: Math.round(typical.feet.sit),
  },
  gain: Math.round(typical.gain),
  sooner: Math.round(typical.sooner * 1000) / 1000,
};
if (JSON.stringify(got) !== JSON.stringify(AVERAGE))
  throw new Error(
    `runs.ts: averages ${JSON.stringify(got)}, measurements.ts says ${JSON.stringify(AVERAGE)}`,
  );
if (hero(RUNS.stand, RUNS.sit, typical.gain) !== HERO.id)
  throw new Error(`runs.ts: the followed passenger is not #${HERO.id}`);
for (const rule of ["stand", "sit"] as const) {
  const x = RUNS[rule][HERO.id];
  if (x.up !== HERO[rule].up || x.off !== HERO[rule].off)
    throw new Error(
      `runs.ts: ${rule} gives up ${x.up} off ${x.off}, measurements.ts says ${JSON.stringify(HERO[rule])}`,
    );
}

export const YOU = HERO.id;
