import type { NarrationLine } from "../../shared/vertical/Narration";
import { VERDICT_FROM } from "./beats";

/**
 * Thirty words.
 *
 * Lines one and two say both rules while the roof comes off and the
 * seatbelt sign goes off. Line three is the cause, said while the people on
 * top stand bent in their rows and the rows below sit until the one in
 * front has gone. The payoff gives the averages over 100 flights and names
 * the computing idea.
 */
export const narration: readonly NarrationLine[] = [
  { from: 4, to: 70, text: "Top: everyone stands when the sign goes off." },
  {
    from: 76,
    to: 150,
    text: "Below: sit until the row ahead has left.",
  },
  {
    from: 156,
    to: VERDICT_FROM - 10,
    text: "Below, each row waits for the one in front.",
  },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        55 s sooner, stood 3 min more.
        <br />
        Computers call it busy waiting.
      </>
    ),
  },
];
