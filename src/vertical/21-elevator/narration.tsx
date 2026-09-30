import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import { VERDICT_FROM, YOU_IN, YOU_OUT, YOU_PRESS } from "./beats";
import { RIDERS, YOU } from "./measurements";

/**
 * Twenty-three words.
 *
 * The rules are on the two labels, so the narration can follow you instead of
 * explaining them. Line two lands as the right car stops at your floor and the
 * left one goes straight past it; line three runs while the left one makes you
 * watch everyone else go first. The payoff is the one thing the frame can
 * prove at that moment: the right building is already empty, all seven
 * delivered, while the left one is only now letting you out.
 */
export const narration: readonly NarrationLine[] = [
  {
    from: YOU_PRESS,
    to: YOU_IN.sweep - 14,
    text: `You're on ${RIDERS[YOU].from}, going down.`,
  },
  {
    from: YOU_IN.sweep - 8,
    to: YOU_OUT.sweep + 4,
    text: "Right stops for you.",
  },
  {
    from: YOU_OUT.sweep + 12,
    to: VERDICT_FROM - 8,
    text: "Left makes you wait your turn.",
  },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        Right dropped off all {RIDERS.length}
        <br />
        <span style={{ color: ACCENT }}>before left dropped you off.</span>
      </>
    ),
  },
];
