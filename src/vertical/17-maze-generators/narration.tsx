import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import { PASSAGES, RUNS } from "./measurements";

/**
 * Thirty words, cut to what the frame is doing.
 *
 * One unit for the whole claim, and it is rooms walked. Dead ends are measured
 * too and differ more between the six than anything else, but a cut that says
 * "fewest dead ends" and then "longest route" is VR10's steps against cost
 * again, two axes in fourteen seconds, and the route is the one the frame can
 * show as a line.
 *
 * Line two is there because it is what makes the six comparable: none of them
 * knocks down more walls than another, so the only thing left to differ is
 * which walls. The panels count it in every corner and the line says it once.
 */
export const narration: readonly NarrationLine[] = [
  { from: 6, to: 88, text: "Six ways to build a maze." },
  { from: 100, to: 196, text: `Each one knocks down ${PASSAGES} walls.` },
  { from: 206, to: 270, text: "The walls it picks decide the route." },
  {
    from: 286,
    to: 340,
    text: `Depth-first winds through ${RUNS.depthFirst.route} rooms.`,
  },
  {
    from: 350,
    to: 414,
    emphasis: true,
    text: (
      <>
        Binary tree: top row, right side.{" "}
        <span style={{ color: ACCENT }}>Every time.</span>
      </>
    ),
  },
];
