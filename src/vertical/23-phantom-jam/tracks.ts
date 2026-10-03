import { REPLAY_FROM, simAt } from "./beats";
import { LATER } from "./measurements";
import { meanKmhAt, simulate, summarise } from "./physics";

/**
 * The two runs the reel draws, and a check on load that they are the runs
 * `measurements.ts` was copied from. Editing a constant in `physics.ts` without
 * re-running the script throws here instead of shipping a frame that disagrees
 * with the committed numbers.
 */
export const HUMAN = simulate();
export const SMOOTHED = simulate({ smoother: true });

/** The human ring's average, pinned under the replay's live one. */
export const HUMAN_PINNED_KMH = Math.round(LATER.human.meanKmh);

const check = (label: string, got: number, want: number) => {
  if (got !== want) {
    throw new Error(
      `tracks.ts: ${label} is ${got}, measurements.ts says ${want}`,
    );
  }
};

const human = summarise(HUMAN, 50);
const smoothed = summarise(SMOOTHED, 50);
check("human most stopped", human.mostStopped, LATER.human.mostStopped);
check(
  "smoothed most stopped",
  smoothed.mostStopped,
  LATER.smoothed.mostStopped,
);
check("human mean", Math.round(human.meanKmh * 10) / 10, LATER.human.meanKmh);
check(
  "smoothed mean",
  Math.round(smoothed.meanKmh * 10) / 10,
  LATER.smoothed.meanKmh,
);
check(
  "human readout as the replay starts",
  Math.round(meanKmhAt(HUMAN, simAt(REPLAY_FROM - 1))),
  HUMAN_PINNED_KMH,
);
