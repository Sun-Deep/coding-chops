import { seconds } from "../../shared/video/timing";

/**
 * The shot map, in frames.
 *
 * A reel has no narration, so nothing here is anchored to a spoken word the way
 * an episode scene is. The timings come from reading each shot out loud at the
 * pace a stranger scrolling past would read it, then leaving the hardest frame
 * up for a beat longer than felt necessary. The two long shots get nearly ten
 * seconds each because both are asking the viewer to watch a number change.
 *
 * There was a hook shot in front of this: eyebrow, the claim in two lines, the
 * query. It was cut. It said the same thing the cover says, so anybody who
 * arrived through the cover read it twice, and it was 2.8 seconds of a frame
 * with nothing moving in it at the one moment a scroll is decided. The scan now
 * opens the cut, which puts a filling table and a climbing counter in frame
 * zero, and the claim the hook was making is the payoff at the end of that same
 * shot rather than a promise in front of it.
 *
 * Cutting it left 27.2 seconds, which is not a length so much as thirty minus
 * something. The end card's trailing hold gives back the odd 0.2 and the cut
 * runs 27 flat.
 */
export const DURATION = seconds(27);

export const SHOTS = {
  scan: { from: 0, to: 288 },
  descent: { from: 288, to: 576 },
  verdict: { from: 576, to: 684 },
  endCard: { from: 684, to: DURATION },
} as const;

/** Frames each shot runs for. */
export const length = (shot: { from: number; to: number }) =>
  shot.to - shot.from;
