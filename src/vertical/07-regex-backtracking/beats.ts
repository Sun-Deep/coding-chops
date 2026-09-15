import { seconds } from "../../shared/video/timing";

/**
 * Fifteen seconds, three shots, one input.
 *
 * The first implementation opened on a binary tree. The tree was accurate,
 * but it asked the viewer to understand backtracking before the reel had shown
 * one backtracking step. This cut starts with five visible `a` characters and
 * keeps regrouping those same characters until the retry is obvious. Only then
 * does it show the measured doubling.
 */
export const SHOTS = {
  /** The same five a's are grouped four different ways. Every try dies at X. */
  retry: { from: 0, to: 180 },
  /** One a is added and the measured retry time doubles. */
  double: { from: 180, to: 300 },
  /** The outer plus leaves and every failed grouping collapses to one scan. */
  fix: { from: 300, to: 450 },
} as const;

export const DURATION = SHOTS.fix.to;

export const length = (shot: { from: number; to: number }) =>
  shot.to - shot.from;

export const RUNTIME_SECONDS = DURATION / seconds(1);

/**
 * One concrete regrouping per entry. The first is already moving at frame zero
 * so the reel opens on the mechanism rather than a title card.
 */
export const RETRY_STARTS = [-8, 34, 76, 118] as const;
export const RETRY_TRAVEL = 28;
export const RETRY_FAIL = 30;

/** Shot two. The added character lands before the second timing resolves. */
export const EXTRA_A_IN = 18;
export const DOUBLE_LANDS = 72;

/** Shot three. The edit happens first, then the one remaining scan runs. */
export const REMOVE_IN = 10;
export const SCAN_FROM = 48;
export const SCAN_LANDS = 100;

/**
 * The last 0.9 seconds rebuild frame zero. Frame 449 and frame zero must match
 * exactly, and both sides of the audio boundary stay silent.
 */
export const LOOP_FROM = 122;
export const LOOP_TO = SHOTS.fix.to - SHOTS.fix.from - 1;
