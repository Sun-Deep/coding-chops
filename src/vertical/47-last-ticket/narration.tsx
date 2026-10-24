import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import * as B from "./beats";
import { RUN } from "./measurements";

/**
 * Thirty-five words. Take 1 says what both transactions see while they
 * see it; take 2 says what FOR UPDATE changes while the lock is on screen;
 * the payoff is the measured rate, rounded from five runs of 1,000.
 */
const mean = RUN.plainTwice.reduce((a, b) => a + b, 0) / RUN.plainTwice.length;
const oneIn = Math.round(RUN.races / mean);

export const narration: readonly NarrationLine[] = [
  { from: 4, to: B.READ_1 + 30, text: `Two taps, ${RUN.hero.gapMs} ms apart.` },
  {
    from: B.READ_1 + 36,
    to: B.WALK_1 + 30,
    text: (
      <>
        Both read 1 left.
        <br />
        Both get seat F12.
      </>
    ),
  },
  { from: B.WALK_1 + 36, to: B.TAKE_2 - 6, text: "One seat, sold twice." },
  {
    from: B.TAKE_2 + 6,
    to: B.RELEASE_2 - 4,
    text: (
      <>
        FOR UPDATE locks the row.
        <br />
        The second buyer waits.
      </>
    ),
  },
  {
    from: B.RELEASE_2 + 2,
    to: B.VERDICT_FROM - 8,
    text: (
      <>
        Then reads 0 left:
        <br />
        sold out, not sold twice.
      </>
    ),
  },
  {
    from: B.VERDICT_FROM,
    to: 414,
    emphasis: true,
    text: (
      <>
        No lock: 1 in {oneIn} sold twice.
        <br />
        <span style={{ color: ACCENT }}>FOR UPDATE: {RUN.lockedTwice}.</span>
      </>
    ),
  },
];
