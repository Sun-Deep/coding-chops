import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import { VERDICT_FROM } from "./beats";
import { AVERAGE } from "./measurements";

/**
 * Thirty-five words.
 *
 * Line one sets the comparison while you drive up to both. Lines two and
 * three name the computing idea while the picture shows it: on top you
 * sit at a red while the other road goes; below, you take a gap and roll
 * on. The payoff is the hour's averages.
 */
const sooner = Math.round(AVERAGE.lights.time - AVERAGE.roundabout.time);

export const narration: readonly NarrationLine[] = [
  { from: 4, to: 70, text: "Same cars, same junction, built two ways." },
  {
    from: 76,
    to: 172,
    text: (
      <>
        Lights are a lock:
        <br />
        one road goes, the other waits.
      </>
    ),
  },
  {
    from: 178,
    to: VERDICT_FROM - 8,
    text: (
      <>
        A roundabout is lock-free:
        <br />
        everyone goes when there&apos;s a gap.
      </>
    ),
  },
  {
    from: VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        Lights: {AVERAGE.lights.still.toFixed(1)} s standing still.
        <br />
        <span style={{ color: ACCENT }}>
          Roundabout: {AVERAGE.roundabout.still.toFixed(1)} s, {sooner} s
          sooner.
        </span>
      </>
    ),
  },
];
