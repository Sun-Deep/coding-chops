import type { NarrationLine } from "../../shared/vertical/Narration";
import { N, QUICK, SELECTION, SELECTION_SORTED } from "./measurements";
import { SHOTS } from "./beats";

/**
 * The narration, burned in.
 *
 * Every line opens at least four frames after its shot starts and closes at
 * least six before it ends. Nothing enforces that, and a payoff fading over the
 * opening frame of the next shot is the mistake the rate limiting cut shipped
 * with, so the boundaries are written out here against `SHOTS` rather than as
 * loose numbers.
 *
 * No line claims anything a counter on screen is not already showing. The
 * figures come out of `measurements.ts`, so a line cannot drift from the run
 * that produced it.
 */
export const narration: readonly NarrationLine[] = [
  {
    from: SHOTS.race.from + 6,
    to: SHOTS.race.from + 36,
    text: `The same ${N} numbers, compared at the same rate.`,
  },
  {
    from: SHOTS.race.from + 44,
    to: SHOTS.race.from + 88,
    text: "One of them is already finished.",
    emphasis: true,
  },
  {
    from: SHOTS.race.from + 110,
    to: SHOTS.race.from + 190,
    text: "Quicksort keeps going. Fresh numbers, every time.",
  },
  {
    from: SHOTS.race.from + 210,
    to: SHOTS.race.to - 10,
    text: "Twelve sorts, in one pass of the other.",
    emphasis: true,
  },
  {
    from: SHOTS.cleave.from + 6,
    to: SHOTS.cleave.from + 60,
    text: "Every comparison splits the problem in half.",
  },
  {
    from: SHOTS.cleave.from + 68,
    to: SHOTS.cleave.to - 8,
    text: `${QUICK.comparisons.toLocaleString()} comparisons. Then it is done.`,
    emphasis: true,
  },
  {
    from: SHOTS.sorted.from + 6,
    to: SHOTS.sorted.from + 56,
    text: "Now give selection sort a list that is already sorted.",
  },
  {
    from: SHOTS.sorted.from + 64,
    to: SHOTS.sorted.to - 8,
    text: `${SELECTION_SORTED.comparisons.toLocaleString()} comparisons. Nothing moved.`,
    emphasis: true,
  },
  {
    from: SHOTS.writes.from + 6,
    to: SHOTS.writes.from + 58,
    text: "But count writes instead of comparisons.",
  },
  {
    from: SHOTS.writes.from + 66,
    to: SHOTS.writes.to - 8,
    text: `${SELECTION.writes} against ${QUICK.writes.toLocaleString()}.`,
    emphasis: true,
  },
  {
    from: SHOTS.verdict.from + 48,
    to: SHOTS.verdict.to - 8,
    text: "Slow on time. Cheap on memory.",
  },
];
