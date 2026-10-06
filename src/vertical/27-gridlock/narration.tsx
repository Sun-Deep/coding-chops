import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import { LOCK_FRAME, VERDICT_FROM } from "./beats";

/**
 * Thirty-one words.
 *
 * Line one is said over the close-up while both grids' bottom row has a green
 * light and no room past the junction: the left car drives in and stops in
 * the box, the right car stops at the line. Line two lands as the cross
 * street gets its green: on the left it cannot move, on the right it flows.
 * Line three lands on the loop being drawn. The payoff names the computer
 * science idea once the left grid has stood still long enough to check.
 */
export const narration: readonly NarrationLine[] = [
  {
    from: 4,
    to: 62,
    text: "Green light, but no room past the junction.",
  },
  {
    from: 68,
    to: LOCK_FRAME - 6,
    text: (
      <>
        Left drives in anyway,
        <br />
        and blocks the cross street.
      </>
    ),
  },
  {
    from: LOCK_FRAME,
    to: VERDICT_FROM - 8,
    text: "Four stuck cars, each waiting on the next.",
  },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        Programs freeze like this too.
        <br />
        It's called <span style={{ color: ACCENT }}>deadlock.</span>
      </>
    ),
  },
];
