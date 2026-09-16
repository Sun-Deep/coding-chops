import type { NarrationLine } from "../../shared/vertical/Narration";
import { LENGTH, RUNS } from "./measurements";

/**
 * Thirty words, cut to what the panels are doing.
 *
 * Lines two and three name the split the grid is drawing before the numbers
 * arrive, because at panel size the two columns are the argument. The phrase
 * itself is not in the narration: it is in the find bar from frame zero, which
 * is where somebody looks for it. The last line
 * is the only place a figure is said out loud and it comes from
 * `measurements.ts`.
 */
export const narration: readonly NarrationLine[] = [
  { from: 6, to: 84, text: "Six ways to find one phrase." },
  { from: 96, to: 166, text: "Three read every character." },
  { from: 178, to: 248, text: "Three skip most of the page." },
  { from: 260, to: 330, text: "Boyer-Moore skips what it can rule out." },
  {
    from: 342,
    to: 412,
    emphasis: true,
    text: `It never looked at ${RUNS.boyermoore.skipped.toLocaleString()} of ${LENGTH.toLocaleString()}.`,
  },
];
