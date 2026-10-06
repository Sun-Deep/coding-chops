import type { NarrationLine } from "../../shared/vertical/Narration";
import { VERDICT_FROM } from "./beats";

/**
 * Twenty-five words.
 *
 * Lines one and two say the two rules in the first six seconds, the elevator
 * reel's lesson, while the orange 3:00 lunch goes straight in on top and is
 * walked past by the quick ones below. Line three
 * runs while both kitchens work through the long ones and the counts pull
 * apart. The payoff names the computer science idea as the averages come up
 * and the bottom label becomes the name.
 */
export const narration: readonly NarrationLine[] = [
  { from: 4, to: 84, text: "Top: in the order they arrived." },
  {
    from: 90,
    to: 190,
    text: "Below: the quickest one goes next.",
  },
  {
    from: 196,
    to: VERDICT_FROM - 8,
    text: "Same microwave, same 14 minutes of work.",
  },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        Computers do this too.
        <br />
        It's called shortest job first.
      </>
    ),
  },
];
