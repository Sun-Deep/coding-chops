import { STEPS } from "./measurements";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * One field pinned at a time.
 *
 * The first step is the opening state rather than a change, so it lands almost
 * immediately: frame zero has to carry the expression and the full grid
 * together, because that is the thing being taken away.
 */
export const STEP_AT: readonly number[] = [16, 110, 200, 290];

/** Frames a step takes to settle: the slot, the grid and the number. */
export const SETTLE = 22;

const clamp = (v: number) => Math.min(1, Math.max(0, v));

/** Which step is current at a frame. */
export const stepAt = (frame: number) => {
  let index = 0;
  for (let i = 0; i < STEP_AT.length; i++) if (frame >= STEP_AT[i]) index = i;
  return index;
};

/** How far the current step has settled, 0 to 1. */
export const settledAt = (frame: number) =>
  clamp((frame - STEP_AT[stepAt(frame)]) / SETTLE);

/**
 * The count, eased between the step before and the step now.
 *
 * Logarithmic, because the numbers span four orders of magnitude and a linear
 * roll from 525,600 to 8,760 spends almost all of its time in the last hundred.
 * On a log scale every step reads as the same size of fall, which is what the
 * sequence is actually saying.
 */
export const countAt = (frame: number) => {
  const index = stepAt(frame);
  if (index === 0) return STEPS[0].fires;
  const from = STEPS[index - 1].fires;
  const to = STEPS[index].fires;
  const t = clamp((frame - STEP_AT[index]) / SETTLE);
  const eased = 1 - (1 - t) ** 3;
  return Math.round(
    Math.exp(Math.log(from) + (Math.log(to) - Math.log(from)) * eased),
  );
};

/** A row of the reference lands as its step settles. */
export const rowsShown = (frame: number) => {
  let rows = 0;
  for (let i = 0; i < STEP_AT.length; i++) {
    if (frame >= STEP_AT[i] + SETTLE - 6) rows = i + 1;
  }
  return rows;
};

export const rowAt = (index: number, frame: number) =>
  clamp((frame - (STEP_AT[index] + SETTLE - 6)) / 12);

/**
 * The closer: what each of those four numbers is a year of.
 *
 * Minutes, hours, days and weeks. Naming them is what turns a list of counts
 * into the point of the cut, and it carries the last two seconds, which would
 * otherwise hold still from the final step to the end.
 */
export const UNITS_FROM = 332;
export const UNITS_STEP = 15;

export const unitAt = (index: number, frame: number) =>
  clamp((frame - (UNITS_FROM + index * UNITS_STEP)) / 12);

/**
 * A playhead sweeping the week.
 *
 * Without it the cut held still between steps: four changes of 22 frames each
 * across 420 leaves about eighty frames of nothing per step, which the
 * frozen-frame check reads as a stall and the silence check agrees with.
 *
 * It is also the only honest way to draw what cron is. A schedule is not a
 * picture, it is a thing that happens as time passes, so time passes on screen:
 * an hour marker crosses the week and every live cell it touches fires.
 *
 * The collapse then becomes audible as well as visible. At `* * * * *` the
 * marker sets off all 24 columns a sweep; by `0 9 * * 1` it sets off one.
 */
export const SWEEP = 84;

/** Which hour column the marker is on. */
export const headAt = (frame: number, hours: number) =>
  Math.floor(((frame % SWEEP) / SWEEP) * hours);

/** How far through that column it is, for drawing the marker between cells. */
export const headFrac = (frame: number, hours: number) => {
  const exact = ((frame % SWEEP) / SWEEP) * hours;
  return exact - Math.floor(exact);
};
