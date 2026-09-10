import type { NarrationLine } from "../../shared/vertical/Narration";
import { SHOTS } from "./beats";
import {
  LAYOUT,
  PAGE_RATIO,
  SCATTERED,
  STALE_VISIBILITY_MAP,
  commas,
} from "./measurements";

/**
 * The narration, burned in. Eight lines, 44 words, 2.0 words a second.
 *
 * Every line opens at least four frames after its shot starts and closes at
 * least eight before it ends, written out against `SHOTS` rather than as loose
 * numbers, because a payoff fading over the opening frame of the next shot is
 * the mistake the rate limiting cut shipped with.
 *
 * No line claims anything the frame is not already showing at the moment it
 * says it. Each payoff comes up after its counter has finished climbing, never
 * before, so the sentence describes rather than promises.
 *
 * No line runs above 2.9 words a second. That is the number that decided the
 * cut's length: at 22 seconds the old 63 words came to 2.9 with no gaps left
 * between lines, which is the cap and not a target.
 *
 * The last two shots carry a payoff and nothing else. Their plain lines were
 * repeating the label and the headline already on screen, and a line that could
 * be deleted without the viewer losing anything is a line the frame was already
 * carrying.
 *
 * The figures come out of `measurements.ts`, so a line cannot drift from the
 * run that produced it.
 */

const PLAIN = SCATTERED[1];
const COVERING = SCATTERED[2];

export const narration: readonly NarrationLine[] = [
  {
    from: SHOTS.fetch.from + 4,
    to: SHOTS.fetch.from + 108,
    text: `An index on ${LAYOUT.scattered.column}. The rows are scattered.`,
  },
  {
    from: SHOTS.fetch.from + 116,
    to: SHOTS.fetch.to - 8,
    text: `${commas(PLAIN.pages)} pages. Half the table.`,
    emphasis: true,
  },

  {
    from: SHOTS.covering.from + 4,
    to: SHOTS.covering.from + 72,
    text: "Now carry amount in the index.",
  },
  {
    from: SHOTS.covering.from + 80,
    to: SHOTS.covering.to - 8,
    text: `${commas(COVERING.pages)} pages. The table never opens.`,
    emphasis: true,
  },

  {
    from: SHOTS.stale.from + 4,
    to: SHOTS.stale.from + 64,
    text: "Update one percent. Skip VACUUM.",
  },
  {
    from: SHOTS.stale.from + 70,
    to: SHOTS.stale.to - 8,
    text: `${commas(STALE_VISIBILITY_MAP.stalePages)}. Back to the table.`,
    emphasis: true,
  },

  {
    from: SHOTS.verdict.from + 4,
    to: SHOTS.verdict.to - 8,
    text: `${PAGE_RATIO} times fewer pages.`,
    emphasis: true,
  },

  {
    from: SHOTS.endCard.from + 4,
    to: SHOTS.endCard.to - 8,
    text: "Bigger index. Only after VACUUM.",
    emphasis: true,
  },
];
