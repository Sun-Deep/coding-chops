import type { NarrationLine } from "../../shared/vertical/Narration";
import { VERDICT_FROM } from "./beats";

/**
 * Thirty-one words.
 *
 * Lines one and two say both rules in the first six seconds, while the
 * followed car moves over on the left and stays put on the right. Line three
 * is the cause, said while drivers in the empty lane go past on the left. The
 * payoff names the computer idea as the right label becomes the name, while
 * the right road's cars go through one from each lane.
 */
export const narration: readonly NarrationLine[] = [
  { from: 4, to: 80, text: "Left: move over as soon as you see the sign." },
  { from: 86, to: 170, text: "Right: use both lanes, then take turns." },
  {
    from: 176,
    to: VERDICT_FROM - 8,
    text: "Leave a lane empty, and someone uses it.",
  },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        One from each lane, in turn.
        <br />
        It's called round-robin.
      </>
    ),
  },
];
