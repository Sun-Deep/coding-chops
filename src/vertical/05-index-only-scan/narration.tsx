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
 * The narration, burned in. Eleven lines, 63 words, 2.1 words a second.
 *
 * Every line opens at least six frames after its shot starts and closes at
 * least eight before it ends, written out against `SHOTS` rather than as loose
 * numbers, because a payoff fading over the opening frame of the next shot is
 * the mistake the rate limiting cut shipped with.
 *
 * No line claims anything the frame is not already showing at the moment it
 * says it. Each payoff comes up a few frames after its counter has finished
 * climbing, never before, so the sentence is a description and not a promise.
 *
 * The figures come out of `measurements.ts`, so a line cannot drift from the
 * run that produced it.
 */

const PLAIN = SCATTERED[1];
const COVERING = SCATTERED[2];

export const narration: readonly NarrationLine[] = [
  {
    from: SHOTS.fetch.from + 6,
    to: SHOTS.fetch.from + 90,
    text: `An index on ${LAYOUT.scattered.column}. ${commas(
      LAYOUT.scattered.matchingRows,
    )} rows match.`,
  },
  {
    from: SHOTS.fetch.from + 96,
    to: SHOTS.fetch.from + 154,
    text: "Scattered, so it fetches each one.",
  },
  {
    from: SHOTS.fetch.from + 160,
    to: SHOTS.fetch.to - 8,
    text: `${commas(PLAIN.pages)} pages. Half the table.`,
    emphasis: true,
  },

  {
    from: SHOTS.covering.from + 6,
    to: SHOTS.covering.from + 84,
    text: "Put amount in the index as well.",
  },
  {
    from: SHOTS.covering.from + 90,
    to: SHOTS.covering.to - 8,
    text: `${commas(COVERING.pages)} pages. The table is never opened.`,
    emphasis: true,
  },

  {
    from: SHOTS.stale.from + 6,
    to: SHOTS.stale.from + 94,
    text: "Update one percent. Skip VACUUM.",
  },
  {
    from: SHOTS.stale.from + 100,
    to: SHOTS.stale.to - 8,
    text: `${commas(STALE_VISIBILITY_MAP.stalePages)} pages. Back to the table.`,
    emphasis: true,
  },

  {
    from: SHOTS.verdict.from + 6,
    to: SHOTS.verdict.from + 74,
    text: "Same query. Same ten million rows.",
  },
  {
    from: SHOTS.verdict.from + 80,
    to: SHOTS.verdict.to - 8,
    text: `${PAGE_RATIO} times fewer pages.`,
    emphasis: true,
  },

  {
    from: SHOTS.endCard.from + 6,
    to: SHOTS.endCard.from + 64,
    text: "Not free, and not automatic.",
  },
  {
    from: SHOTS.endCard.from + 70,
    to: SHOTS.endCard.to - 8,
    text: "Bigger index. Only after VACUUM.",
    emphasis: true,
  },
];
