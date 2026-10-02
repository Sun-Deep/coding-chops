import {
  PASSED_YOU,
  SHOPPERS,
  TILLS,
  WAITS,
  YOU,
  type RuleKey,
} from "./measurements";

/**
 * Both rules, rerun on the measured shoppers so the picture is drawn from the
 * simulation rather than from typed keyframes. The logic is
 * `scripts/measure-checkout.mjs` line for line, and the module throws on load
 * if any shopper's wait differs from the committed run.
 */

export type Visit = {
  readonly till: number;
  readonly start: number;
  readonly end: number;
};

const shortest = (): Visit[] => {
  const ends: number[][] = Array.from({ length: TILLS }, () => []);
  const free = new Array<number>(TILLS).fill(0);
  return SHOPPERS.map((c) => {
    let till = 0;
    let fewest = Infinity;
    for (let k = 0; k < TILLS; k++) {
      const n = ends[k].filter((e) => e > c.at).length;
      if (n < fewest) {
        fewest = n;
        till = k;
      }
    }
    const start = Math.max(c.at, free[till]);
    free[till] = start + c.s;
    ends[till].push(start + c.s);
    return { till, start, end: start + c.s };
  });
};

const shared = (): Visit[] => {
  const free = new Array<number>(TILLS).fill(0);
  return SHOPPERS.map((c) => {
    let till = 0;
    for (let k = 1; k < TILLS; k++) if (free[k] < free[till]) till = k;
    const start = Math.max(c.at, free[till]);
    free[till] = start + c.s;
    return { till, start, end: start + c.s };
  });
};

export const VISITS: Readonly<Record<RuleKey, readonly Visit[]>> = {
  shortest: shortest(),
  shared: shared(),
};

/** Who joined after you and reached a till before you, in start order. */
export const passers = (key: RuleKey) =>
  SHOPPERS.filter(
    (c) =>
      c.at > SHOPPERS[YOU].at &&
      VISITS[key][c.id].start < VISITS[key][YOU].start,
  ).sort((a, b) => VISITS[key][a.id].start - VISITS[key][b.id].start);

for (const key of ["shortest", "shared"] as const) {
  VISITS[key].forEach((v, i) => {
    if (v.start - SHOPPERS[i].at !== WAITS[key][i]) {
      throw new Error(`simulation.ts: ${key} wait for shopper ${i} disagrees`);
    }
  });
}
if (passers("shortest").length !== PASSED_YOU || passers("shared").length) {
  throw new Error("simulation.ts: the overtaking count disagrees");
}
