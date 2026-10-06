import { COL_X, ROW_Y } from "./simulation";
import { LOCKED_AT } from "./measurements";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * Both grids on one clock. The reel opens at simulated second 75.3, close on
 * the bottom left junction of both grids, at three times real time: the left
 * grid's car is rolling into the junction on green and stops there, while
 * the right grid's car has stopped at the same green line because there is
 * no room past it. From frame 36 the camera pulls back, and by frame 60, two
 * seconds in, the whole block is on screen. The cross street gets its green
 * during the pull: blocked on the left, moving on the right.
 *
 * After that the clock runs at four and a half times real time, so the loop
 * locks a little past the middle and the end is the left grid standing still
 * while the right keeps moving.
 */
export const SIM_FROM = 75.3;

/** Simulated seconds per real second, keyed by frame, linear between. */
const SPEED: readonly (readonly [number, number])[] = [
  [0, 3],
  [30, 3],
  [38, 5],
  [60, 5],
  [80, 4.5],
  [DURATION, 4.5],
];

const speedAt = (frame: number) => {
  for (let i = 1; i < SPEED.length; i++) {
    const [f1, v1] = SPEED[i];
    const [f0, v0] = SPEED[i - 1];
    if (frame <= f1) return v0 + ((v1 - v0) * (frame - f0)) / (f1 - f0);
  }
  return SPEED[SPEED.length - 1][1];
};

/** Simulated second at each whole frame, integrated in tenths of a frame. */
const TABLE: number[] = [SIM_FROM];
for (let f = 0; f < DURATION + 30; f++) {
  let sim = TABLE[f];
  for (let k = 0; k < 10; k++) sim += speedAt(f + (k + 0.5) / 10) / 300;
  TABLE.push(sim);
}

export const simAt = (frame: number) => {
  const f = Math.max(0, Math.min(TABLE.length - 2, frame));
  const k = Math.floor(f);
  return TABLE[k] + (TABLE[k + 1] - TABLE[k]) * (f - k);
};

/** The frame a simulated second is on screen, the inverse of `simAt`. */
export const frameAt = (sim: number) => {
  if (sim <= SIM_FROM) return ((sim - SIM_FROM) / SPEED[0][1]) * 30;
  let lo = 0;
  let hi = TABLE.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (TABLE[mid] <= sim) lo = mid;
    else hi = mid;
  }
  return lo + (sim - TABLE[lo]) / (TABLE[hi] - TABLE[lo]);
};

/** Camera: close on the bottom left junction, then back to the whole block. */
export const ZOOM = 1.75;
export const FOCUS = { x: COL_X[0] - 1.5, y: ROW_Y[1] - 4 };
export const PULL_FROM = 36;
export const PULL_TO = 60;

/** The loop drawn round the locked block. */
export const LOCK_FRAME = Math.round(frameAt(LOCKED_AT));

export const VERDICT_FROM = 324;
