import { seconds } from "../../shared/video/timing";

/**
 * The shot map, in frames. Twenty-six seconds, four shots, no title card.
 *
 * Nine things happen between the send button and the first character of the
 * answer. Nine shots would be a hundred frames and seven words each, which is a
 * caption rather than an explanation, so they group into four. Embedding does
 * not get its own beat; it is shown as the tokens entering the stack.
 *
 * Twenty-six rather than twenty, because forty words could not carry both the
 * chat template surprise and the cache. Not thirty either: VR05 was cut from
 * thirty for feeling long and the best performing cut on the page is
 * twenty-seven.
 *
 * The failure mode of a cut like this is not length, it is becoming a tour. The
 * claim stays "one token at a time, against a growing cache". If `stack` starts
 * explaining what a residual is, the cut is gone.
 */
export const SHOTS = {
  /** The message is wrapped by the template, then shatters into tokens. */
  tokens: { from: 0, to: 200 },
  /** All 25 rise through 36 layers; the last one scores the whole vocabulary. */
  stack: { from: 200, to: 420 },
  /** The token is appended and only it climbs again. The cache widens. */
  loop: { from: 420, to: 640 },
  /** The catch, which is memory rather than milliseconds. */
  endCard: { from: 640, to: 780 },
} as const;

export const DURATION = SHOTS.endCard.to;

export const length = (shot: { from: number; to: number }) =>
  shot.to - shot.from;

/** Sanity: the cut is inside the twenty to thirty second band the format asks for. */
export const RUNTIME_SECONDS = DURATION / seconds(1);
