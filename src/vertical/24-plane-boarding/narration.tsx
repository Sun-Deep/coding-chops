import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import { VERDICT_FROM } from "./beats";

/**
 * Twenty-three words.
 *
 * Line two says what the red means, once, while the first passengers pile up
 * behind somebody's bag, so nothing else on screen needs a key. Line three is
 * the cause, said while back to front is visibly jammed into its last rows
 * and the other two cabins are filling everywhere at once. The payoff waits
 * until random has finished and back to front has not, so the frame proves it.
 */
export const narration: readonly NarrationLine[] = [
  { from: 4, to: 58, text: "Same plane. Same 72 people." },
  { from: 64, to: 150, text: "Red: stuck behind someone's bag." },
  {
    from: 156,
    to: VERDICT_FROM - 8,
    text: "Back to front sends everyone to one end.",
  },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        Even random seating
        <br />
        <span style={{ color: ACCENT }}>beat back to front.</span>
      </>
    ),
  },
];
