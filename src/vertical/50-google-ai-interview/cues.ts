import { B } from "./clock";

/**
 * Effects under the creator's voice, from the recorded CC0 set in
 * `public/sfx/kenney/`, low enough to sit under it:
 *
 * - the "not even close" turn, a soft hit;
 * - the question typed to the AI, key clicks, and its reply, a soft ping;
 * - the suggested fix landing in the code, a click;
 * - the first test passing, a tick; the second failing, the error buzz;
 * - the real fix passing every case, a confirmation;
 * - the pilot caveat, a low hit.
 */

export type Cue = {
  readonly id: string;
  readonly name: string;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
};

const dB = (target: number) =>
  Math.round(10 ** ((target + 1) / 20) * 1000) / 1000;
const cue = (
  id: string,
  name: string,
  frame: number,
  level: number,
  rate = 1,
): Cue => ({
  id,
  name: `kenney/${name}`,
  frame: Math.round(frame),
  rate,
  gain: dB(level),
});

export const CUES: readonly Cue[] = [
  cue("turn", "impactSoft_heavy_000", B.notReally, -16),
  ...Array.from({ length: 10 }, (_, k) =>
    cue(
      `key-${k}`,
      k % 2 ? "click_002" : "click_004",
      B.gemini - 8 + k * 2.2,
      -22,
      1.2 + (k % 3) * 0.1,
    ),
  ),
  cue("reply", "glass_003", B.gemini + 18, -18),
  cue("apply", "click_003", B.grade + 2, -18),
  cue("pass-1", "tick_001", B.catchIt, -18, 1.2),
  cue("fail", "error_004", B.wrong, -15),
  cue("fixed", "confirmation_001", B.understand + 4, -15),
  cue("pilot", "impactSoft_heavy_000", B.pilot, -18, 0.9),
];
