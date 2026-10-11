import { FULL, HERO } from "./measurements";
import { SEED, elbows, rooms, type Group, type Rule } from "./simulation";

/**
 * The two rooms the reel draws, the same groups arriving in the same order,
 * checked on load against `measurements.ts`. Editing a constant in
 * `simulation.ts` without re-running the script throws here instead of
 * shipping a frame that disagrees with the committed numbers.
 */
const both = rooms(SEED);
export const ROOMS: Record<Rule, readonly Group[]> = {
  spread: both.spread,
  pack: both.pack,
};
export const YOU = both.you;

if (YOU !== HERO.you)
  throw new Error(
    `runs.ts: the followed group is #${YOU}, measurements.ts says #${HERO.you}`,
  );
for (const rule of ["spread", "pack"] as const) {
  const g = ROOMS[rule][YOU];
  const got = {
    free: g.freeBefore,
    longest: g.longestBefore,
    together: !g.split,
  };
  const want = HERO[rule];
  if (
    got.free !== want.free ||
    got.longest !== want.longest ||
    got.together !== want.together
  )
    throw new Error(
      `runs.ts: ${rule} gives ${JSON.stringify(got)}, measurements.ts says ${JSON.stringify(want)}`,
    );
}

const people = ROOMS.spread.reduce((n, g) => n + g.size, 0);
if (ROOMS.spread.length !== FULL.groups || people !== FULL.people)
  throw new Error(
    `runs.ts: full house is ${ROOMS.spread.length} groups of ${people} people`,
  );
for (const rule of ["spread", "pack"] as const) {
  const split = ROOMS[rule].filter((g) => g.split).length;
  const beside = elbows(ROOMS[rule]);
  if (split !== FULL.split[rule] || beside !== FULL.besideStranger[rule])
    throw new Error(
      `runs.ts: ${rule} full house splits ${split}, ${beside} beside a stranger`,
    );
}
