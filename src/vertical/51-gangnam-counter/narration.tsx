import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import * as B from "./beats";
import { fmt } from "./count";
import { RUN } from "./measurements";

/**
 * Twenty-nine words, under three a second, each line over the thing it
 * says. The numbers are
 * the measured ones from `measurements.ts`.
 */
export const narration: readonly NarrationLine[] = [
  {
    from: 4,
    to: B.CEILING_LINE + 6,
    text: "YouTube counted views in 32 bits.",
  },
  {
    from: B.CEILING_LINE + 10,
    to: B.PLUS_ONE - 6,
    text: `Its ceiling: ${fmt(RUN.max)}.`,
  },
  {
    from: B.PLUS_ONE - 2,
    to: B.SIGN_AT - 2,
    text: "One more view flips every bit.",
  },
  {
    from: B.SIGN_AT + 2,
    to: B.LONG_FROM - 4,
    emphasis: true,
    text: <span style={{ color: ACCENT }}>{fmt(RUN.wrapped)} views.</span>,
  },
  {
    from: B.LONG_FROM - 2,
    to: B.RACE_FROM - 2,
    text: "So YouTube went 64-bit in 2014.",
  },
  {
    from: B.RACE_FROM,
    to: 416,
    text: "It's past 6 billion views now.",
  },
];
