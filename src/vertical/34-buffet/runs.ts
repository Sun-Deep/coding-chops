import { MEASURED } from "./measurements";
import { DT, SEED, comparison, crowd, mean, type Rule } from "./simulation";

const both = comparison(crowd(SEED), true);
export const RUNS = { line: both.line, skip: both.skip };
export const DINERS = RUNS.line.people;
export const DESSERT = MEASURED.dessert.id;
for (const rule of ["line", "skip"] as const) {
  if (Math.abs(mean(RUNS[rule]) - MEASURED.shown[rule]) > 0.001)
    throw new Error(`Buffet ${rule} disagrees with the recorded run`);
}
export const sampleAt = (rule: Rule, t: number) => {
  const r = RUNS[rule];
  return r.samples[
    Math.max(0, Math.min(r.samples.length - 1, Math.floor(t / DT)))
  ];
};
