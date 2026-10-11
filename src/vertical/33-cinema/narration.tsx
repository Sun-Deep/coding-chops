import type { NarrationLine } from "../../shared/vertical/Narration";
import { VERDICT_FROM } from "./beats";

/**
 * Thirty words.
 *
 * Lines one and two say both rules while both rooms fill, with the four
 * friends already waiting at the back. Line three lands as every free seat
 * lights up and the four go to their seats. Line four runs while the rest
 * arrive and more groups split up in the top room. The payoff names the
 * computer idea as the top label becomes its name.
 */
export const narration: readonly NarrationLine[] = [
  { from: 2, to: 52, text: "Top: keep a seat from strangers." },
  { from: 56, to: 104, text: "Below: sit right beside others." },
  { from: 110, to: 200, text: "23 seats free. Not four together." },
  {
    from: 206,
    to: VERDICT_FROM - 8,
    text: "More arrive. More groups get split up.",
  },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        Free seats, all in pieces.
        <br />
        It's called fragmentation.
      </>
    ),
  },
];
