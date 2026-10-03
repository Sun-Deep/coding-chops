import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import { REPLAY_FROM, VERDICT_FROM } from "./beats";

/**
 * Twenty-six words.
 *
 * Line one lands on the close-up while the brake lights come on. Line two runs
 * while the red travels backwards round the ring and the average sinks to 14.
 * Line three opens the replay on the same tap. The payoff is said once the
 * smoothing ring's average is back above 20 with the human figure pinned
 * underneath, so the frame proves it while it is up.
 */
export const narration: readonly NarrationLine[] = [
  { from: 4, to: 62, text: "One driver taps the brakes." },
  {
    from: 70,
    to: REPLAY_FROM - 8,
    text: "Every car behind brakes a bit harder.",
  },
  {
    from: REPLAY_FROM + 6,
    to: VERDICT_FROM - 8,
    text: "Same tap. One car keeps a gap.",
  },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        One car leaving room
        <br />
        <span style={{ color: ACCENT }}>cleared the whole jam.</span>
      </>
    ),
  },
];
