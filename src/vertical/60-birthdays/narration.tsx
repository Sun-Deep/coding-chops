import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import * as B from "./beats";
import { PERCENT, RUN } from "./measurements";

/** Eighteen words; the strings and the rooms carry the reason. */
export const narration: readonly NarrationLine[] = [
  { from: 6, to: B.THREADS_DONE - 2, text: "One string for every pair." },
  {
    from: B.MATCH,
    to: B.RISE - 4,
    emphasis: true,
    text: (
      <>
        {RUN.pairs} pairs. <span style={{ color: ACCENT }}>One matches.</span>
      </>
    ),
  },
  { from: B.RISE + 6, to: B.VERDICT - 4, text: "100 classes of 23." },
  {
    from: B.VERDICT,
    to: 416,
    emphasis: true,
    text: (
      <>
        Half have a match: <span style={{ color: ACCENT }}>{PERCENT}%</span>
      </>
    ),
  },
];
