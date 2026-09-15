import type { NarrationLine } from "../../shared/vertical/Narration";
import { MAX_OPS, MIN_OPS } from "./measurements";

/**
 * Twenty-five words, cut to the finishes.
 *
 * Every line but the first opens on a panel dropping out of the race, because
 * the frame is already showing it and the line's job is to name what just
 * happened rather than to explain it. The last line is the only place either
 * total is said out loud, and both numbers come out of `measurements.ts`.
 */
export const narration: readonly NarrationLine[] = [
  { from: 6, to: 92, text: "Six sorts. One array. One clock." },
  { from: 104, to: 170, text: "Quicksort is finished already." },
  { from: 182, to: 262, text: "Merge and heap drop out next." },
  { from: 276, to: 330, text: "Bubble is still swapping pairs." },
  {
    from: 342,
    to: 412,
    emphasis: true,
    text: `${MAX_OPS.toLocaleString()} ops against ${MIN_OPS}.`,
  },
];
