import type { NarrationLine } from "../../shared/vertical/Narration";
import { LOOP_FROM, SHOTS } from "./beats";

/**
 * Twenty-nine words in fifteen seconds. Each line names the action currently
 * on screen. A viewer does not need to decode the diagram before the copy helps.
 */
export const narration: readonly NarrationLine[] = [
  {
    from: SHOTS.retry.from + 6,
    to: SHOTS.retry.from + 74,
    text: "These two plus signs create many groupings.",
  },
  {
    from: SHOTS.retry.from + 82,
    to: SHOTS.retry.to - 8,
    text: "X fails, so regex tries another split.",
    emphasis: true,
  },
  {
    from: SHOTS.double.from + 8,
    to: SHOTS.double.to - 8,
    text: "Add one a. The retry time doubles.",
    emphasis: true,
  },
  {
    from: SHOTS.fix.from + 8,
    to: SHOTS.fix.from + 70,
    text: "Remove the outer plus.",
  },
  {
    from: SHOTS.fix.from + 78,
    to: SHOTS.fix.from + LOOP_FROM - 6,
    text: "Same result. Linear time.",
    emphasis: true,
  },
];
