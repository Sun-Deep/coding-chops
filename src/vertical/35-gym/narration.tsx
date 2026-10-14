import type { NarrationLine } from "../../shared/vertical/Narration";
import { VERDICT_FROM } from "./beats";

/**
 * Thirty-one words.
 *
 * Lines one and two say both rules in the first five seconds, while you walk
 * in and join the wait in both gyms. Line three is the cause, said while the
 * lifter on the bench above sits on it with a phone. The payoff lands while
 * you are lifting below and still waiting above, gives your two waits from
 * the model, and names the computing idea as the lower label becomes it.
 */
export const narration: readonly NarrationLine[] = [
  { from: 4, to: 70, text: "Top: keep the bench between sets." },
  { from: 76, to: 144, text: "Below: take turns while you rest." },
  {
    from: 150,
    to: VERDICT_FROM - 10,
    text: "Up top, the bench sits idle every rest.",
  },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        Your turn in 2 minutes, not 12.
        <br />
        Computers call it multitasking.
      </>
    ),
  },
];
