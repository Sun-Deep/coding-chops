import type { NarrationLine } from "../../shared/vertical/Narration";
import { VERDICT_FROM } from "./beats";

/**
 * Twenty-eight words.
 *
 * Lines one and two say both rules while you walk in: on top the doors have
 * been held for a minute and shut just as you arrive, below the car has just
 * left. Line three is the cause and names the computing idea, said while
 * you stand first in a car whose doors are held again. The payoff gives the
 * averages over 100 mornings.
 */
export const narration: readonly NarrationLine[] = [
  { from: 4, to: 70, text: "Top: hold the doors for anyone running." },
  {
    from: 76,
    to: 150,
    text: "Below: let them close. The lift comes back.",
  },
  {
    from: 156,
    to: VERDICT_FROM - 10,
    text: "Holding is batching: everyone inside waits.",
  },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        Runners: 17 s sooner.
        <br />
        First one in: 48 s later.
      </>
    ),
  },
];
