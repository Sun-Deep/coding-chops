/**
 * Every number this reel puts on screen, and where it came from.
 *
 * All of them were measured on 2026-09-10 rather than recalled. The full run is
 * in `curriculum/vertical/06-one-token-at-a-time/measurements.md`. Nothing in
 * the shots hardcodes a figure, so correcting a measurement corrects the frame.
 *
 *   Apple M5 Pro, macOS 26.5.1, llama.cpp on Metal
 *   qwen2.5-3b-instruct-q4_k_m.gguf, server context 16384
 *   prompt: "Why is the sky blue?" at temperature 0
 *
 * An open model on purpose. The cut needs figures somebody can check, and no
 * commercial model publishes its vocabulary size, block count or logits. The
 * mechanism is identical across transformers; only the badge would differ, and
 * the badge is the part that would have been false.
 */

export const MODEL = {
  name: "qwen2.5-3b-instruct",
  quant: "q4_k_m",
  arch: "qwen2",
  params: "3.40 B",
  /** The number the whole cut turns on: how many candidates every step scores. */
  vocab: 151_936,
  layers: 36,
  heads: 16,
  /** Grouped-query attention: sixteen query heads share two key/value heads. */
  headsKv: 2,
  embd: 2_048,
  ff: 11_008,
  ctxTrain: 32_768,
} as const;

/**
 * Shot 1. What the chat template does before the model sees anything.
 *
 * Six tokens in, twenty-five out. The server confirms the twenty-five
 * independently as `prompt_n`, so the figure is measured twice by two different
 * pieces of the stack.
 */
export const PROMPT = {
  text: "Will AI replace programmers?",
  rawTokens: 5,
  rawIds: [9945, 15235, 8290, 54846, 30],
  rawPieces: ["Will", " AI", " replace", " programmers", "?"],
  templatedTokens: 24,
} as const;

/**
 * The twenty-five tokens the model actually receives, in order, from the run.
 *
 * `own` marks the six that came from the question. The other nineteen are the
 * template: the system message and the role markers. Shot 1 is the difference
 * between those two groups, so the flag is a measurement and not a styling
 * choice.
 *
 * Newlines are written as "\\n" because a chip has to show something. The token
 * is a real newline, id 198, and it appears four times.
 */
export const TEMPLATED = [
  { text: "<|im_start|>", id: 151644, own: false },
  { text: "system", id: 8948, own: false },
  { text: "\\\\n", id: 198, own: false },
  { text: "You", id: 2610, own: false },
  { text: " are", id: 525, own: false },
  { text: " a", id: 264, own: false },
  { text: " helpful", id: 10950, own: false },
  { text: " assistant", id: 17847, own: false },
  { text: ".", id: 13, own: false },
  { text: "<|im_end|>", id: 151645, own: false },
  { text: "\\\\n", id: 198, own: false },
  { text: "<|im_start|>", id: 151644, own: false },
  { text: "user", id: 872, own: false },
  { text: "\\\\n", id: 198, own: false },
  { text: "Will", id: 9945, own: true },
  { text: " AI", id: 15235, own: true },
  { text: " replace", id: 8290, own: true },
  { text: " programmers", id: 54846, own: true },
  { text: "?", id: 30, own: true },
  { text: "<|im_end|>", id: 151645, own: false },
  { text: "\\\\n", id: 198, own: false },
  { text: "<|im_start|>", id: 151644, own: false },
  { text: "assistant", id: 77091, own: false },
  { text: "\\\\n", id: 198, own: false },
] as const;

/** The words of the answer, for the chat frame filling in shot 3. */
export const ANSWER_PIECES = [
  "It",
  "'s",
  " unlikely",
  " that",
  " AI",
  " will",
  " completely",
  " replace",
  " programmers",
  ",",
  " but",
  " it",
  " will",
] as const;

/** 25 over 6, for the shot 1 payoff. */
export const TEMPLATE_GROWTH = +(
  PROMPT.templatedTokens / PROMPT.rawTokens
).toFixed(1);

/**
 * Shot 2. One step, and the five best of 151,936.
 *
 * Step 5 is the one worth drawing. Most steps are not close, and a cut that
 * showed step 1 would be claiming every token is a real contest when 'The'
 * came back at 100 percent. This one has four live candidates and it is where
 * the search space visibly collapses.
 */
export const STEP = {
  index: 3,
  context: "It's",
  chosen: " unlikely",
  candidates: [
    { token: " unlikely", id: 17367, percent: 64.9 },
    { token: " a", id: 264, percent: 12.6 },
    { token: " important", id: 2989, percent: 6.7 },
    { token: " highly", id: 7548, percent: 4.1 },
    { token: " possible", id: 3204, percent: 3.8 },
  ],
} as const;

/** The backup, if shot 2 needs a shorter list. Measured in the same run. */
export const STEP_ALT = {
  index: 7,
  context: "It's unlikely that AI will",
  chosen: " completely",
  candidates: [
    { token: " completely", id: 6587, percent: 59.4 },
    { token: " fully", id: 7225, percent: 29.0 },
    { token: " entirely", id: 11368, percent: 9.4 },
  ],
} as const;

/**
 * Shot 3. The loop.
 *
 * Forty tokens produced, so forty forward passes after the prompt's single one.
 * Prefill is about 4.5 times cheaper per token because the prompt's tokens go
 * through the stack together and generated ones cannot: each has to exist
 * before the next can be computed.
 *
 * The millisecond figures are means of three sessions. Decode is tight across
 * them, 9.28 / 9.21 / 9.27. Prefill is not, 2.07 / 2.09 / 1.92, which moves the
 * ratio between 4.4 and 4.8. None of these reach a frame; the cut puts only
 * counts on screen.
 */
export const GENERATION = {
  tokens: 40,
  forwardPasses: 40,
  prefillMsPerToken: 2.03,
  decodeMsPerToken: 9.25,
  /** 9.28 over 2.07, rounded. Both move a few percent between runs. */
  decodeVsPrefill: 4.5,
  answer:
    "It's unlikely that AI will completely replace programmers, but it will certainly transform the role and responsibilities of programmers.",
} as const;

/**
 * Shot 4. The catch, as a count rather than a clock.
 *
 * A millisecond is a property of this laptop. Bytes per token are a property of
 * the model, and the arithmetic checks against the server's own allocation
 * exactly: 36,864 x 16,384 is 576 MiB and the log reports 576.00 MiB.
 *
 * `kGqa` is 256 rather than 2,048 because of grouped-query attention. Without
 * it the cache would be eight times larger.
 */
export const CACHE = {
  kGqa: 256,
  vGqa: 256,
  bytesPerToken: 36 * (256 + 256) * 2,
  atTokens: [
    { tokens: 1_000, mb: 35 },
    { tokens: 8_192, mb: 288 },
    { tokens: 32_768, mb: 1_152 },
  ],
} as const;

/**
 * The catch as a time, three runs per length across two sessions.
 *
 * Monotonic in both, tight within a length, and about 1.3 times slower per
 * token across a 90 times longer conversation. The ratio goes on screen and the
 * milliseconds do not.
 *
 * Worth being honest in the script: 1.3x is modest. At these lengths the
 * weights dominate and attention does not. The dramatic figure here is the
 * memory, not the clock, and the cut should lead with the memory.
 *
 * An earlier sweep ran once per length and gave 9.2, 9.5, 16.2 and 11.2, which
 * looked like no trend and nearly got the catch cut. One run per point was the
 * bug, not the mechanism.
 */
export const DECODE_BY_CONTEXT = [
  { promptTokens: 130, msRun1: 8.79, msRun2: 8.78 },
  { promptTokens: 858, msRun1: 8.82, msRun2: 8.93 },
  { promptTokens: 2_522, msRun1: 9.3, msRun2: 9.42 },
  { promptTokens: 5_850, msRun1: 10.17, msRun2: 10.45 },
  { promptTokens: 11_674, msRun1: 11.64, msRun2: 11.79 },
] as const;

/** 11.64 over 8.79. The slowdown across a 90x longer conversation. */
export const DECODE_SLOWDOWN = 1.3;

export const commas = (value: number) => value.toLocaleString("en-US");
