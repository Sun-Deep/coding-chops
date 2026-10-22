import { AVERAGE, HERO } from "./measurements";
import {
  averages,
  hero,
  people,
  run,
  type Morning,
  type Person,
  type Rule,
} from "./simulation";

/**
 * The two lobbies the reel draws, the same people in both, checked on load
 * against `measurements.ts`. Editing a constant in `simulation.ts` without
 * re-running the script throws here instead of shipping a frame that
 * disagrees with the committed numbers.
 */
export const PEOPLE: readonly Person[] = people();
export const RUNS: Record<Rule, Morning> = {
  hold: run("hold", PEOPLE),
  close: run("close", PEOPLE),
};

const tenth = (x: number) => Math.round(x * 10) / 10;
const typical = averages();
const got = {
  trip: { close: tenth(typical.trip.close), hold: tenth(typical.trip.hold) },
  held: Math.round(typical.held * 1000) / 1000,
  heldGain: tenth(typical.heldGain),
  restLoss: tenth(typical.restLoss),
  firstLoss: tenth(typical.firstLoss),
};
if (JSON.stringify(got) !== JSON.stringify(AVERAGE))
  throw new Error(
    `runs.ts: averages ${JSON.stringify(got)}, measurements.ts says ${JSON.stringify(AVERAGE)}`,
  );
if (hero(typical.firstLoss) !== HERO.id)
  throw new Error(`runs.ts: the followed person is not #${HERO.id}`);
if (tenth(PEOPLE[HERO.id].at) !== HERO.at)
  throw new Error(
    `runs.ts: #${HERO.id} reaches the doors at ${PEOPLE[HERO.id].at}`,
  );
for (const rule of ["hold", "close"] as const) {
  const out = tenth(RUNS[rule].out[HERO.id]);
  if (out !== HERO[rule].out)
    throw new Error(
      `runs.ts: ${rule} has #${HERO.id} out at ${out}, measurements.ts says ${HERO[rule].out}`,
    );
}

export const YOU = HERO.id;
