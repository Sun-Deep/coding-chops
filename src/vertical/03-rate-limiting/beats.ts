import { seconds } from "../../shared/video/timing";

/**
 * The shot map, in frames.
 *
 * Twenty-five seconds and five shots. There is no title card. The first frame
 * of the cut is the first frame of the demonstration, with a counter already
 * climbing and the limit already on screen beside it as the denominator.
 *
 * A card stating the topic bought two and a bit seconds of a still frame at the
 * exact moment a scroll is decided, and stating a limit is not as clear as
 * watching a number run at one.
 *
 * Every narration line has to open at least four frames after its shot starts
 * and close at least six before it ends. `narration.tsx` holds the timings and
 * this file holds the boundaries; nothing enforces the gap, so check it.
 *
 * Each shot's counter starts moving on its second frame. It used to wait eight,
 * which is a third of a second of a zero on screen at every cut, four times over
 * in a cut this short.
 *
 * No shot holds a finished picture for more than about a second and a half. An
 * earlier version gave the fixed window shot 236 frames when its animation
 * finished at 158, which is two and a half seconds of a frozen frame starting
 * five seconds in. That reads as the video stalling, and it is why this runs
 * twenty-three seconds rather than twenty-five. The two seconds were not
 * carrying anything.
 */
export const DURATION = seconds(23);

export const SHOTS = {
  fixed: { from: 0, to: 186 },
  sliding: { from: 186, to: 354 },
  bucket: { from: 354, to: 504 },
  verdict: { from: 504, to: 600 },
  endCard: { from: 600, to: DURATION },
} as const;

export const length = (shot: { from: number; to: number }) =>
  shot.to - shot.from;

/** Beats inside the fixed window shot, where the counter reset is the event. */
export const FIXED_BEATS = {
  burstOne: [2, 64],
  hold: [64, 78],
  /** The clock rolls over and the counter goes back to zero. */
  reset: 78,
  burstTwo: [78, 140],
} as const;

export const SLIDING_BEATS = {
  burstOne: [2, 58],
  rollover: 66,
  burstTwo: [66, 122],
} as const;

export const BUCKET_BEATS = {
  burstOne: [2, 54],
  burstTwo: [54, 106],
} as const;
