import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import { BUCKET, LIMIT, SLIDING, commas } from "./measurements";

/**
 * What a narrator would be saying, written to be read instead.
 *
 * Nine lines, 47 words, twenty-five seconds. Under two words a second.
 *
 * The first line opens on frame two, over a counter that is already moving.
 * There is no title card for it to sit on.
 *
 * Every line opens at least four frames after its shot starts and closes at
 * least six before it ends, checked against `beats.ts`. The first cut of this
 * let a payoff line run past the cut it belonged to, so it was still fading
 * over the top of the next shot's opening frame.
 */
export const narration: readonly NarrationLine[] = [
  // Fixed window, 0 to 236. The cut opens here; there is no title card.
  { from: 2, to: 58, text: `A limit of ${LIMIT} requests a minute.` },
  { from: 68, to: 128, text: "Fixed window resets on the clock." },
  {
    from: 138,
    to: 178,
    emphasis: true,
    text: (
      <>
        <span style={{ color: ACCENT }}>200 through.</span> Nothing rejected.
      </>
    ),
  },

  // Sliding window, 236 to 416.
  { from: 192, to: 248, text: "A sliding window never resets." },
  {
    from: 256,
    to: 346,
    emphasis: true,
    text: (
      <>
        Exact, and {commas(SLIDING.bytes)} bytes
        <br />
        per user.
      </>
    ),
  },

  // Token bucket, 416 to 566.
  { from: 360, to: 412, text: "A token bucket refills as it drains." },
  {
    from: 420,
    to: 496,
    emphasis: true,
    text: (
      <>
        <span style={{ color: ACCENT }}>{BUCKET.count} through.</span>{" "}
        {BUCKET.bytes} bytes.
      </>
    ),
  },

  // Verdict, 566 to 664.
  {
    from: 510,
    to: 594,
    emphasis: true,
    text: "One of these is not a rate limit.",
  },

  // End card, 664 to 750.
  {
    from: 606,
    to: 682,
    emphasis: true,
    text: (
      <>
        Exact costs memory.
        <br />
        <span style={{ color: ACCENT }}>Cheap costs correctness.</span>
      </>
    ),
  },
];
