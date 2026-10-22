import { AVERAGE, HERO, NIGHT } from "./measurements";
import { average, simulate, type Result, type Rule } from "./simulation";

/**
 * The two junctions the reel draws, the same cars through both, checked
 * on load against `measurements.ts`. Editing a constant in `simulation.ts`
 * without re-running the script throws here instead of shipping a frame
 * that disagrees with the committed numbers.
 */
const tenth = (x: number) => Math.round(x * 10) / 10;
const avg = {
  lights: average("lights", 20),
  roundabout: average("roundabout", 20),
};
const got = {
  lights: { time: tenth(avg.lights.time), still: tenth(avg.lights.still) },
  roundabout: {
    time: tenth(avg.roundabout.time),
    still: tenth(avg.roundabout.still),
  },
};
if (JSON.stringify(got) !== JSON.stringify(AVERAGE))
  throw new Error(
    `runs.ts: averages ${JSON.stringify(got)}, measurements.ts says ${JSON.stringify(AVERAGE)}`,
  );

export const RUNS: Record<Rule, Result> = {
  lights: simulate("lights", 1),
  roundabout: simulate("roundabout", 1),
};

/** The followed car, by the rule in `measurements.ts`. */
const pick = () => {
  const r = new Map(RUNS.roundabout.trips.map((t) => [t.id, t]));
  let best = { id: -1, score: Infinity };
  for (const t of RUNS.lights.trips) {
    if (t.arm !== 3 || t.turn !== "straight" || t.at < 300 || t.at >= 3900)
      continue;
    const u = r.get(t.id)!;
    const score =
      Math.abs(t.time - AVERAGE.lights.time) +
      Math.abs(u.time - AVERAGE.roundabout.time) +
      Math.abs(t.still - AVERAGE.lights.still) +
      Math.abs(u.still - AVERAGE.roundabout.still);
    if (score < best.score) best = { id: t.id, score };
  }
  return best.id;
};
if (pick() !== HERO.id)
  throw new Error(`runs.ts: the followed car is #${pick()}, not #${HERO.id}`);
for (const rule of ["lights", "roundabout"] as const) {
  const t = RUNS[rule].trips.find((x) => x.id === HERO.id)!;
  const g = { time: tenth(t.time), still: tenth(t.still) };
  if (
    tenth(t.at) !== HERO.at ||
    JSON.stringify(g) !== JSON.stringify(HERO[rule])
  )
    throw new Error(
      `runs.ts: #${HERO.id} at the ${rule} is ${JSON.stringify(g)}, measurements.ts says ${JSON.stringify(HERO[rule])}`,
    );
}
// The late-night figure is the script's; it is in the caption, not drawn.
void NIGHT;
