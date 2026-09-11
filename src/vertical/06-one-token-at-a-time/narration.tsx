import type { NarrationLine } from "../../shared/vertical/Narration";
import { SHOTS } from "./beats";
import { CACHE, MODEL, PROMPT, commas } from "./measurements";

/**
 * The narration, burned in. Ten lines, 49 words, 1.9 words a second.
 *
 * Every line opens at least two frames after its shot starts and closes at
 * least eight before it ends, written against `SHOTS` rather than as loose
 * numbers, so a payoff cannot fade over the opening frame of the next shot.
 *
 * No line runs above 2.9 words a second, which is the cap rather than a target.
 * Each payoff comes up after the thing it describes has finished happening.
 *
 * Shot 1 lost a line on 2026-09-11. "The template wraps it first" was narrating
 * something the frame shows plainly, and cutting it is what let the shot's
 * payoff move from 4.9 seconds to 3.7. The first line now reads against the
 * picture on purpose: it says six while the counter climbs past six, which is
 * the tension the opening was missing.
 */
export const narration: readonly NarrationLine[] = [
  {
    from: SHOTS.tokens.from + 4,
    to: SHOTS.tokens.from + 48,
    text: `You typed ${PROMPT.rawTokens} tokens.`,
  },
  {
    from: SHOTS.tokens.from + 86,
    to: SHOTS.tokens.to - 8,
    text: `The model got ${PROMPT.templatedTokens}.`,
    emphasis: true,
  },

  {
    from: SHOTS.stack.from + 4,
    to: SHOTS.stack.from + 82,
    text: `All ${PROMPT.templatedTokens} go up through ${MODEL.layers} layers.`,
  },
  {
    from: SHOTS.stack.from + 90,
    to: SHOTS.stack.from + 162,
    text: "Only the last one produces anything.",
  },
  {
    from: SHOTS.stack.from + 170,
    to: SHOTS.stack.to - 8,
    text: `${commas(MODEL.vocab)} scored. One kept.`,
    emphasis: true,
  },

  {
    from: SHOTS.loop.from + 4,
    to: SHOTS.loop.from + 64,
    text: "It appends and runs again.",
  },
  {
    from: SHOTS.loop.from + 72,
    to: SHOTS.loop.from + 132,
    text: "Only the new token climbs.",
  },
  {
    from: SHOTS.loop.from + 184,
    to: SHOTS.loop.to - 8,
    text: "One pass per token.",
    emphasis: true,
  },

  {
    from: SHOTS.endCard.from + 4,
    to: SHOTS.endCard.from + 68,
    text: `Every token adds ${Math.round(CACHE.bytesPerToken / 1024)} KB.`,
  },
  {
    from: SHOTS.endCard.from + 76,
    to: SHOTS.endCard.to - 8,
    text: `${commas(CACHE.atTokens[1].tokens)} tokens is ${CACHE.atTokens[1].mb} MB.`,
    emphasis: true,
  },
];
