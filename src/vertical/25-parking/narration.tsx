import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import { ROW_IN, VERDICT_FROM } from "./beats";
import { OVER_400 } from "./measurements";

/**
 * Twenty-two words.
 *
 * The two rules first, one line each, while both cars are still driving in.
 * Line three runs while the circler loops and the close stalls that open go
 * to the cars arriving behind it. The payoff is the frequency, not this trip:
 * the trip shown is a one-in-ten circler, and the line says how often
 * circling lost over all 400.
 */
export const narration: readonly NarrationLine[] = [
  { from: 4, to: 52, text: "Left: nearest open spot in its row." },
  { from: 58, to: ROW_IN - 6, text: "Right: only a spot by the door." },
  {
    from: ROW_IN + 2,
    to: VERDICT_FROM - 8,
    text: "Every close spot goes to someone else.",
  },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        Circling lost
        <br />
        <span style={{ color: ACCENT }}>
          {OVER_400.circlingSlower} of {OVER_400.seeds} trips.
        </span>
      </>
    ),
  },
];
