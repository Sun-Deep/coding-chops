import { RUN } from "./measurements";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;
export const FPS = 30;

/** `git bisect run` starts here, after the reveal of all 1,000 commits. */
export const RUN_FROM = 34;

/**
 * Frames per check. The first ones are slow enough to follow what one
 * check does; by the fifth the viewer has it and the halving speeds up.
 */
const LENGTHS = [42, 34, 28, 24, 22, 20, 20, 20, 20, 22];

export type Check = {
  /** Which check this is, from 1. */
  readonly k: number;
  /** The commit tested, counted from 1, and what the test said. */
  readonly n: number;
  readonly result: "good" | "bad";
  /** Git checks this commit out: the card lifts. */
  readonly pickAt: number;
  /** The test starts running. */
  readonly from: number;
  /** The test prints ok or FAIL, and the card turns. */
  readonly resultAt: number;
  /** Git rules out half and checks out the next commit. */
  readonly cutAt: number;
  readonly length: number;
  /** The last good and first bad commit once this check is in. */
  readonly good: number;
  readonly bad: number;
};

export const CHECKS: readonly Check[] = (() => {
  if (LENGTHS.length !== RUN.steps.length)
    throw new Error("beats.ts: one length per check");
  let from = RUN_FROM;
  let good = 1;
  let bad = RUN.commits;
  // `git bisect start` checks out the first commit to test; each check
  // after that checks out the next one as soon as it has ruled out half.
  let pickAt = 9;
  return RUN.steps.map((s, i) => {
    const length = LENGTHS[i];
    if (s.result === "good") good = s.n;
    else bad = s.n;
    const cutAt = from + Math.round(length * 0.58);
    const c: Check = {
      k: i + 1,
      n: s.n,
      result: s.result,
      pickAt,
      from,
      resultAt: from + Math.round(length * 0.4),
      cutAt,
      length,
      good,
      bad,
    };
    from += length;
    pickAt = cutAt + 3;
    return c;
  });
})();

/** Git names the first bad commit. */
export const FOUND_AT = CHECKS[CHECKS.length - 1].cutAt + 2;
/** `git show` of it replaces the run in the terminal. */
export const SHOW_FROM = FOUND_AT + 16;
export const VERDICT_FROM = 316;

if (
  CHECKS[CHECKS.length - 1].bad !== RUN.found ||
  CHECKS[CHECKS.length - 1].good !== RUN.found - 1
)
  throw new Error("beats.ts: the checks do not end on the first bad commit");

/**
 * Where the camera frames, as a range of commits, keyed by frame. It opens
 * close on HEAD, pulls back to all 1,000, then after each check moves in
 * on the half that is left. Blender eases between keys.
 */
export const CAMERA: readonly (readonly [number, number, number])[] = (() => {
  const keys: [number, number, number][] = [
    [0, RUN.commits - 15, RUN.commits],
    [RUN_FROM + 6, 1, RUN.commits],
  ];
  for (const c of CHECKS) keys.push([c.cutAt + 4, c.good, c.bad]);
  keys.push([FOUND_AT + 30, RUN.found, RUN.found]);
  keys.push([DURATION - 1, RUN.found, RUN.found]);
  return keys;
})();
