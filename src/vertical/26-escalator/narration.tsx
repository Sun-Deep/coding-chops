import type { NarrationLine } from "../../shared/vertical/Narration";
import { VERDICT_FROM } from "./beats";

/**
 * Twenty-five words.
 *
 * Lines one and two are the cause, said while it is on screen: the walking
 * lane on the left with its gaps, the packed lanes everywhere else. Line
 * three is the consequence while the counters pull apart. The payoff is the
 * real trial, cited, which the simulation was calibrated to and reproduces.
 * It is not in the accent: in this reel orange means a walker.
 */
export const narration: readonly NarrationLine[] = [
  { from: 4, to: 82, text: "Walkers need a big gap to climb." },
  { from: 90, to: 196, text: "Standers fit on every step and a half." },
  {
    from: 204,
    to: VERDICT_FROM - 8,
    text: "So the walking lane carries the fewest people.",
  },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        London tried standing only:
        <br />
        about 30% more people.
      </>
    ),
  },
];
