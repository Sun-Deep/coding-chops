import type { NarrationLine } from "../../shared/vertical/Narration";
import {
  EXECUTE,
  READ,
  TOP_FOUR_SHARE,
  TOTAL_MODES,
  WRITE,
} from "./measurements";

/**
 * Twenty-seven words, cut to the lock.
 *
 * Line one names the thing the viewer has typed themselves, which is the whole
 * reason the topic was picked. Lines two to four are the mechanism, arriving
 * with the switches, their values and the sum. The last line is the reference
 * they keep.
 */
export const narration: readonly NarrationLine[] = [
  { from: 6, to: 68, text: "chmod 755. You have typed it." },
  { from: 80, to: 142, text: "Each digit is three switches." },
  {
    from: 154,
    to: 216,
    text: `Read ${READ}. Write ${WRITE}. Run ${EXECUTE}.`,
  },
  { from: 228, to: 300, text: "Throw one. Watch the number." },
  {
    from: 312,
    to: 412,
    emphasis: true,
    text: `${TOTAL_MODES} combinations. Four do ${TOP_FOUR_SHARE}%.`,
  },
];
