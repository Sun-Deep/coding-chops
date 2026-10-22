import { DURATION, START, simAt } from "./beats";
import { HERO } from "./measurements";
import { simulate, type Rule } from "./simulation";

/**
 * Your car on every frame, at each junction, from the same run the
 * renders were made from: how fast you are going, how many seconds you
 * have stood still so far, and the frame you leave the picture.
 */
export type Hero = {
  still: number[];
  v: number[];
  /** Lights: the frames the signals change. */
  changes: number[];
};

const track = (rule: Rule): Hero => {
  const run = simulate(rule, 1, {}, undefined, undefined, false, {
    from: START - 1,
    to: simAt(DURATION) + 1,
    every: 0.1,
  });
  const v: number[] = [];
  const still: number[] = [];
  const changes: number[] = [];
  let lamps = "";
  let acc = 0;
  let last = START;
  // Seconds stood still before the reel starts count too.
  const before = run.frames.filter((f) => f.t < START);
  for (const f of before) {
    const c = f.cars.find((x) => x.id === HERO.id);
    if (c && c.v < 0.5) acc += 0.1;
  }
  for (let frame = 0; frame < DURATION; frame++) {
    const t = simAt(frame);
    for (const f of run.frames) {
      if (f.t <= last || f.t > t) continue;
      const c = f.cars.find((x) => x.id === HERO.id);
      if (c && c.v < 0.5) acc += 0.1;
    }
    last = t;
    const k = Math.max(
      0,
      Math.min(run.frames.length - 1, Math.round((t - run.frames[0].t) / 0.1)),
    );
    const c = run.frames[k].cars.find((x) => x.id === HERO.id);
    v.push(c ? c.v : 0);
    still.push(acc);
    const now = (run.frames[k].lamps ?? []).join();
    if (frame > 0 && now !== lamps) changes.push(frame);
    lamps = now;
  }
  return { still, v, changes };
};

export const HEROES: Record<Rule, Hero> = {
  lights: track("lights"),
  roundabout: track("roundabout"),
};

for (const rule of ["lights", "roundabout"] as const) {
  const got = Math.round(HEROES[rule].still[DURATION - 1] * 10) / 10;
  if (got !== HERO[rule].still)
    throw new Error(
      `hero.ts: you stood still ${got} s at the ${rule}, measurements.ts says ${HERO[rule].still}`,
    );
}
