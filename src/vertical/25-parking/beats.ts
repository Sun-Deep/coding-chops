import { SECONDS } from "./measurements";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * One clock for both car parks. Half a simulated second a frame until the row
 * parker is through the door, so that trip is watchable, then faster while
 * the circler loops, so it reaches the door at frame 330.
 */
const SLOW = 0.5;
export const ROW_IN = Math.round(SECONDS.row / SLOW);
export const CIRCLE_IN = 330;
const FAST = (SECONDS.circle - SECONDS.row) / (CIRCLE_IN - ROW_IN);

export const simAt = (frame: number) =>
  frame <= ROW_IN ? frame * SLOW : SECONDS.row + (frame - ROW_IN) * FAST;

export const frameAt = (sim: number) =>
  sim <= SECONDS.row ? sim / SLOW : ROW_IN + (sim - SECONDS.row) / FAST;

export const VERDICT_FROM = CIRCLE_IN + 6;
