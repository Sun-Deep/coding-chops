import type { NarrationLine } from "../../shared/vertical/Narration";
import { VERDICT_FROM } from "./beats";

/**
 * Twenty-seven words.
 *
 * Lines one and two say both set-ups in the first six seconds, while the
 * followed customer joins the till line above and goes straight to a screen
 * below. Line three is the cause, said while the crowd at the pickup counter
 * below grows. The payoff names the computing law as the lower label becomes
 * its name.
 */
export const narration: readonly NarrationLine[] = [
  { from: 4, to: 80, text: "Top: one cashier takes every order." },
  { from: 86, to: 170, text: "Below: six kiosks. Same kitchen." },
  {
    from: 176,
    to: VERDICT_FROM - 8,
    text: "The line didn't vanish. It moved to pickup.",
  },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        The slowest step sets the pace.
        <br />
        It's called Amdahl's law.
      </>
    ),
  },
];
