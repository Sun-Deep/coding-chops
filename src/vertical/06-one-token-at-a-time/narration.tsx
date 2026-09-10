import type { NarrationLine } from "../../shared/vertical/Narration";
import { SHOTS } from "./beats";
import { CACHE, MODEL, PROMPT, commas } from "./measurements";

/**
 * The narration, burned in. Eleven lines, 54 words, 2.1 words a second.
 *
 * Every line opens at least four frames after its shot starts and closes at
 * least eight before it ends, written against `SHOTS` rather than as loose
 * numbers, so a payoff cannot fade over the opening frame of the next shot.
 *
 * No line runs above 2.9 words a second, which is the cap rather than a target.
 * Each payoff comes up only after the thing it describes has finished happening
 * on screen.
 *
 * Two things the measurement run forced into the wording.
 *
 * "Only the new token climbs" rather than "it reads the whole conversation
 * again". The KV cache means earlier tokens are never recomputed, and the first
 * draft of this plan had that wrong.
 *
 * The end card leads with memory, not milliseconds. Per-token time does grow
 * with the conversation, monotonically across both runs, but only about 1.3
 * times over a 90 times longer chat, because at these lengths the weights
 * dominate and attention does not. 36 KB a token is the figure that lands.
 */
export const narration: readonly NarrationLine[] = [
  {
    from: SHOTS.tokens.from + 4,
    to: SHOTS.tokens.from + 70,
    text: `Your question is ${PROMPT.rawTokens} tokens.`,
  },
  {
    from: SHOTS.tokens.from + 76,
    to: SHOTS.tokens.from + 138,
    text: "The template wraps it first.",
  },
  {
    from: SHOTS.tokens.from + 146,
    to: SHOTS.tokens.to - 8,
    text: `${PROMPT.rawTokens} became ${PROMPT.templatedTokens}.`,
    emphasis: true,
  },

  {
    from: SHOTS.stack.from + 4,
    to: SHOTS.stack.from + 80,
    text: `All ${PROMPT.templatedTokens} go up through ${MODEL.layers} layers.`,
  },
  {
    from: SHOTS.stack.from + 88,
    to: SHOTS.stack.from + 152,
    text: "Only the last one produces anything.",
  },
  {
    from: SHOTS.stack.from + 160,
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
    from: SHOTS.loop.from + 140,
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
