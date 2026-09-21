import type { NarrationLine } from "../../shared/vertical/Narration";
import { STEPS } from "./measurements";

const n = (v: number) => v.toLocaleString("en-US");

/**
 * Twenty-eight words, cut to the four steps.
 *
 * Each line names the field being pinned and the number it lands on, so the
 * narration and the counter are saying the same thing at the same moment. The
 * last line is the only one that is not a count: it is what the four counts
 * were for.
 *
 * One unit throughout. Every number is a fire count for 2026, and no line mixes
 * it with the 168 hours of the grid, which is a different thing drawn for a
 * different reason.
 */
export const narration: readonly NarrationLine[] = [
  { from: 6, to: 74, text: `Five stars. Every minute of a year.` },
  { from: 92, to: 166, text: `Pin the minute. ${n(STEPS[1].fires)} hours.` },
  { from: 184, to: 258, text: `Pin the hour. ${n(STEPS[2].fires)} days.` },
  {
    from: 276,
    to: 348,
    text: `Pin the weekday. ${n(STEPS[3].fires)} Mondays.`,
  },
  {
    from: 356,
    to: 412,
    emphasis: true,
    text: "Five fields, five units of time.",
  },
];
