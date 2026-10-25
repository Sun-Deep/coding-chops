import type { Caption } from "@remotion/captions";
import { spokenLines } from "../../shared/vertical/spoken";

/**
 * The reel's clock, from the creator's one recorded take. The take is
 * trimmed to where the voice starts and stops (`audio/stems.json`, measured
 * by `scripts/stem-bounds.mjs`), and every beat is the frame a word is said
 * on. Remotion imports the caption JSON and calls this; the Blender export
 * reads the same JSON and calls it too.
 */

export const FPS = 30;
const PAD_IN_MS = 120;
const PAD_OUT_MS = 220;
const LEAD = 4;
const END_HOLD = 45;

export type Bounds = { startMs: number; endMs: number; durationMs: number };

const bare = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9']/g, "");

export const buildTimeline = (c: readonly Caption[], b: Bounds) => {
  const fromMs = Math.max(0, b.startMs - PAD_IN_MS);
  const toMs = Math.min(
    b.durationMs,
    Math.max(b.endMs, c[c.length - 1].endMs) + PAD_OUT_MS,
  );
  const frames = Math.round(((toMs - fromMs) / 1000) * FPS);
  const frameOf = (ms: number) =>
    LEAD + Math.round(((ms - fromMs) / 1000) * FPS);
  const say = (phrase: string) => {
    const words = phrase.split(/\s+/).map(bare);
    for (let i = 0; i <= c.length - words.length; i++)
      if (words.every((w, j) => bare(c[i + j].text) === w))
        return frameOf(c[i].startMs);
    throw new Error(`timeline: "${phrase}" is not in the take`);
  };

  const beats = {
    dead: say("dead"),
    interviews: say("interviews"),
    notReally: say("not really"),
    testing: say("google is testing"),
    fixCode: say("fix code"),
    gemini: say("gemini's help"),
    grade: say("they grade"),
    catchIt: say("catch it"),
    wrong: say("wrong"),
    understand: say("understand the code"),
    pilot: say("it's a pilot"),
    dropping: say("dropping"),
  };
  return {
    voice: { fromMs, frames, at: LEAD },
    duration: LEAD + frames + END_HOLD,
    beats,
    lines: spokenLines(c, frameOf),
  };
};
