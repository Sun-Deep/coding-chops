import { AVERAGE_WAIT, DONE_AT, LONGEST_JOB_WAIT } from "./measurements";
import {
  SEED,
  crowd,
  longestJobWait,
  meanWait,
  serve,
  type Rule,
  type Served,
} from "./simulation";

/**
 * The two lines the reel draws, checked on load against `measurements.ts`.
 * Editing the menu or the seed without re-running the script throws here
 * instead of shipping a frame that disagrees with the committed numbers.
 */
export const LINE = crowd(SEED);
export const RUNS: Record<Rule, Served[]> = {
  fifo: serve(LINE, "fifo"),
  sjf: serve(LINE, "sjf"),
};

for (const rule of ["fifo", "sjf"] as const) {
  const got = {
    average: Math.round(meanWait(RUNS[rule])),
    longest: longestJobWait(RUNS[rule]),
    done: RUNS[rule][RUNS[rule].length - 1].end,
  };
  if (
    got.average !== AVERAGE_WAIT[rule] ||
    got.longest !== LONGEST_JOB_WAIT[rule] ||
    got.done !== DONE_AT
  ) {
    throw new Error(
      `runs.ts: ${rule} gives ${JSON.stringify(got)}, measurements.ts disagrees`,
    );
  }
}

/** The person with the longest heating time: the 3:00 lunch. */
export const LONGEST = LINE.reduce((a, p) => (p.cook > a.cook ? p : a)).id;

export const clock = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
