import type { Caption } from "@remotion/captions";
import { spokenLines } from "../../shared/vertical/spoken";

/**
 * The reel's clock, built from the creator's six recorded stems.
 *
 * The production standard puts locked narration first in the timing chain,
 * so nothing here is chosen: each stem is trimmed to its first and last
 * word, laid end to end with a short gap, and every visual beat is the
 * frame a word is spoken on. Remotion imports the caption JSON and calls
 * this; `scripts/blender/stock/export.mjs` reads the same JSON and calls it
 * too, so the render and the overlay cannot disagree.
 */

export const FPS = 30;
export const STEM_FILES = [
  "stem-01-enhanced-v2",
  "stem-02-enhanced-v2",
  "stem-03-enhanced-v2",
  "stem-04-enhanced-v2",
  "stem-05-enhanced-v2",
  "stem-06-enhanced-v2",
] as const;

/**
 * Breath kept before the voice starts and after it stops. The edges come
 * from `audio/stems.json`, measured from the audio by
 * `scripts/stem-bounds.mjs`, because whisper's times for a stem's first and
 * last word are loose: trimmed to them, "billion" lost its last syllable.
 */
const PAD_IN_MS = 120;
const PAD_OUT_MS = 220;

export type Bounds = Record<
  string,
  { startMs: number; endMs: number; durationMs: number }
>;
/** Frames between stems, and before the first one. */
const GAP = 9;
const LEAD = 6;
/** The last frame holds this long after the last word. */
const END_HOLD = 60;

export type Stem = {
  file: string;
  /** Where in the recording to start and stop. */
  fromMs: number;
  toMs: number;
  /** The reel frame it starts on, and how long it runs. */
  at: number;
  frames: number;
};

const bare = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9']/g, "");

export const buildTimeline = (
  caps: readonly (readonly Caption[])[],
  bounds: Bounds,
) => {
  let at = LEAD;
  const stems: Stem[] = caps.map((c, k) => {
    const b = bounds[STEM_FILES[k]];
    const fromMs = Math.max(0, b.startMs - PAD_IN_MS);
    const toMs = Math.min(
      b.durationMs,
      Math.max(b.endMs, c[c.length - 1].endMs) + PAD_OUT_MS,
    );
    const frames = Math.round(((toMs - fromMs) / 1000) * FPS);
    const stem = { file: STEM_FILES[k], fromMs, toMs, at, frames };
    at += frames + GAP;
    return stem;
  });
  const duration = at - GAP + END_HOLD;

  /** The reel frame a moment in stem k's recording plays on. */
  const frameOf = (k: number, ms: number) =>
    stems[k].at + Math.round(((ms - stems[k].fromMs) / 1000) * FPS);

  /** The frame a phrase in stem k starts on, or ends on. */
  const say = (
    k: number,
    phrase: string,
    {
      end = false,
      occurrence = 1,
    }: { end?: boolean; occurrence?: number } = {},
  ) => {
    const words = phrase.split(/\s+/).map(bare);
    const c = caps[k];
    let seen = 0;
    for (let i = 0; i <= c.length - words.length; i++) {
      if (words.some((w, j) => bare(c[i + j].text) !== w)) continue;
      if (++seen < occurrence) continue;
      const t = c[end ? i + words.length - 1 : i];
      return frameOf(k, end ? t.endMs : t.startMs);
    }
    throw new Error(`timeline: "${phrase}" is not in ${STEM_FILES[k]}`);
  };
  /** The frame the first word containing `text` starts on. */
  const token = (k: number, text: string) => {
    const t = caps[k].find((c) => c.text.includes(text));
    if (!t) throw new Error(`timeline: "${text}" is not in ${STEM_FILES[k]}`);
    return frameOf(k, t.startMs);
  };

  const beats = {
    // 1. The hook: six days of prices.
    sixDays: say(0, "six days"),
    bestBuy: say(0, "best day to buy"),
    // 2. The obvious way, and why every pair is slow.
    lowest: say(1, "lowest price"),
    highest: say(1, "highest price"),
    comesBefore: say(1, "highest comes before"),
    cannotSell: say(1, "cannot sell"),
    compare: say(1, "compare every day"),
    fifteen: say(1, "15 checks"),
    hundredK: say(1, "100000 days"),
    fiveB: say(1, "5 billion"),
    // 3. The one price that matters for a sell day.
    trick: stems[2].at,
    sellDay: say(2, "if you sell"),
    cheapestBefore: say(2, "cheapest day before"),
    remember: say(2, "remember the cheapest"),
    // 4. The walk, a day at a time.
    walk: stems[3].at,
    day: [
      say(3, "seven"),
      say(3, "then one"),
      say(3, "at five"),
      say(3, "at three"),
      say(3, "at six"),
      say(3, "at four"),
    ],
    profit: [
      0,
      0,
      say(3, "make four"),
      say(3, "only two"),
      say(3, "make five"),
      say(3, "only three"),
    ],
    newBest: say(3, "new best"),
    answer: say(3, "5"),
    // 5. Time and space.
    complexity: stems[4].at,
    nSquared: token(4, "O(n²)"),
    n: token(4, "O(n)"),
    one: token(4, "O(1)"),
    noMatter: say(4, "no matter"),
    twoNumbers: say(4, "two numbers"),
    // 6. What to keep.
    keep: stems[5].at,
  };

  /** The burned-in captions: the spoken words, a phrase at a time. */
  const lines = caps.flatMap((c, k) => spokenLines(c, (ms) => frameOf(k, ms)));

  return { stems, duration, beats, lines };
};

export type Timeline = ReturnType<typeof buildTimeline>;
