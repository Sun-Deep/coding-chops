import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import { VERDICT_FROM, YOU_JOIN } from "./beats";

/**
 * Twenty-seven words.
 *
 * The two rules are said first, one line each, before you walk in. The elevator
 * cut left them on the lane labels and a viewer wrote "I'm so confused", so
 * here the labels repeat them rather than carry them alone.
 *
 * Line four gives no number. The counter under the left shop is still climbing
 * while it is up, and a line quoting the final count over a counter that has
 * not reached it is the mistake the elevator cut's first payoff made.
 */
export const narration: readonly NarrationLine[] = [
  { from: 2, to: 50, text: "Left: pick the shortest line." },
  { from: 58, to: YOU_JOIN - 8, text: "Right: one shared line." },
  {
    from: YOU_JOIN + 4,
    to: YOU_JOIN + 90,
    text: "A slow checkout blocks your line.",
  },
  {
    from: YOU_JOIN + 96,
    to: VERDICT_FROM - 8,
    text: "People who came after you go first.",
  },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        One line: nobody behind you
        <br />
        <span style={{ color: ACCENT }}>gets served before you.</span>
      </>
    ),
  },
];
