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
 *
 * Retimed on 2026-09-11. `tokens` ran 200 frames and spent its first 34 on a
 * static chat card, so nothing moved until 1.1 seconds in and the surprise the
 * shot exists for did not land until 4.9. Section 10 of the standard is explicit
 * that frame zero should have something in motion and something changing, and
 * "no hook card" was being read as licence for a slow open rather than as the
 * reason not to have one.
 *
 * It is 140 now, the first token lifts on frame zero, and the payoff lands at
 * 2.9 seconds rather than 4.9. A reel is decided inside the first two, so a
 * surprise arriving in the fifth is a surprise most of the audience never sees.
 *
 * The frames it gave up went to `loop`, not to `stack`. `stack` at 260 ended
 * 1.8 seconds after its last real movement, because the only thing still
 * happening there was a line of 30 pixel text fading in, which reads as a
 * stalled video however it is timed. Each shot now ends near its last
 * perceptible motion, and `loop` uses the surplus by spreading its forty passes
 * over 144 frames instead of 122.
 */
export const SHOTS = {
  /** The message is already coming apart at frame zero. */
  tokens: { from: 0, to: 140 },
  /** Every token reads every token before it, then one fires. */
  stack: { from: 140, to: 380 },
  /** The context grows and is swept once per token. */
  loop: { from: 380, to: 640 },
  /** The catch, which is memory rather than milliseconds. */
  endCard: { from: 640, to: 780 },
} as const;

export const DURATION = SHOTS.endCard.to;

export const length = (shot: { from: number; to: number }) =>
  shot.to - shot.from;

/** Sanity: the cut is inside the twenty to thirty second band the format asks for. */
export const RUNTIME_SECONDS = DURATION / seconds(1);
