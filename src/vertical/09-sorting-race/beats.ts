import { MAX_OPS } from "./measurements";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * The frame bubble sort, the slowest of the six, spends its last operation.
 *
 * Everything after it is the verdict, which needs about three seconds: long
 * enough to dim four panels, draw the span between the two extremes and let
 * somebody read the ratio off it.
 */
export const RACE_END = 320;

/**
 * Operations already spent before frame zero.
 *
 * A ramp that starts at zero puts an empty array on the first frame of the
 * cut, which is the opening a scrolling thumb decides on. The clock starts
 * behind the frame instead, so frame zero opens with forty-odd operations
 * already applied to all six panels and every one of them visibly underway.
 */
export const PRE_ROLL = 20;

/**
 * The shared clock, as a fraction of bubble sort's total.
 *
 * Mostly cubic, with a linear floor. Pure acceleration would leave the first
 * second at well under one operation a frame, which reads as a still frame;
 * a linear clock would finish quicksort a third of the way in and then hold
 * five panels frozen for eight seconds. The mix opens at roughly two
 * operations a frame and ends at about seventeen, so the cut starts legible,
 * one comparison at a time, and finishes as a blur.
 */
const curve = (u: number) => 0.3 * u + 0.7 * u * u * u;

/** Operations every panel has been given by `frame`, capped at its own total. */
export const budgetAt = (frame: number) => {
  const span = RACE_END + PRE_ROLL;
  const u = Math.min(1, Math.max(0, (frame + PRE_ROLL) / span));
  return Math.round(MAX_OPS * curve(u));
};

/** Frame the verdict starts dimming the four panels between the extremes. */
export const VERDICT_FROM = 328;

/**
 * Frame the two survivors start their run again, on the verdict's own clock.
 *
 * Linear, unlike the race's, and it spends bubble sort's whole total across the
 * window, so a panel's operation index maps straight onto a frame. Both the
 * replay and the cues fired under it read that mapping from here rather than
 * each keeping their own copy, which is how VR07 shipped a sound track still
 * firing at events that had been deleted.
 */
export const REPLAY_FROM = 338;

/** Frame the verdict's replay spends bubble sort's last operation. */
export const VERDICT_LAND = 402;
