/** Recorded by scripts/measure-buffet.mjs. Seconds are model time. */
export const MEASURED = {
  seed: 13,
  people: 60,
  dishes: 8,
  runs: 100,
  average: {
    line: 139.1830040590271,
    skip: 51.34717072569376,
    ratio: 2.710626546544675,
    worse: 3.433333333333332,
    extra: 10.384708737864083,
  },
  dessert: {
    id: 4,
    line: 69.0155489185432,
    skip: 23.26554891854321,
  },
  shown: {
    line: 192.73692533913749,
    skip: 50.936925339137545,
    end: 680.5,
    worse: [],
  },
} as const;
export const CONDITIONS = "simulated · same 60 people · 8 dishes · sped up";
