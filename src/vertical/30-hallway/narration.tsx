import type { NarrationLine } from "../../shared/vertical/Narration";
import { VERDICT_FROM } from "./beats";

/**
 * Thirty-one words.
 *
 * Lines one and two say both rules in the first six seconds, while pairs
 * bump and step at all three spots. Line three is the cause, said while the
 * left corridor's pairs keep mirroring each other. The payoff names the
 * computer idea everyone owns, Wi-Fi, as the right label becomes the name.
 */
export const narration: readonly NarrationLine[] = [
  { from: 4, to: 80, text: "Left: after a bump, step again at once." },
  { from: 86, to: 170, text: "Right: after a bump, wait a random beat." },
  {
    from: 176,
    to: VERDICT_FROM - 8,
    text: "Move together, and you mirror each other.",
  },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        Wi-Fi does this too.
        <br />
        It's called random backoff.
      </>
    ),
  },
];
