/**
 * Cue times live in `beats.ts`, beside the motion they mark. This file only
 * turns an intended peak into the gain needed by the shared effect files.
 */
/**
 * Peak level of each effect as it sits in `public/sfx`, in dBFS.
 *
 * Measured with `ffmpeg -af volumedetect`, not assumed. The set was levelled
 * to sit under narration in an episode and there is no narration here, so
 * per-use gains run well above one, but they do not run uniformly above one:
 * `scan` is twenty-two decibels quieter than `name`, and a gain that suits one
 * clips the other.
 *
 * This is the second time that has cost a render. VR06 copied gains onto
 * `code-step` without checking and came in fifteen decibels low. The first cut
 * of this reel copied a shape from VR04 and clipped at 0.0 dBFS.
 */
const PEAK_DBFS = {
  reject: -21.1,
  scan: -37.8,
  tick: -22.9,
  send: -27.0,
  name: -16.0,
  dissolve: -32.8,
  settle: -23.2,
  solved: -22.7,
} as const;

export type Effect = keyof typeof PEAK_DBFS;

/**
 * The gain that lands an effect on `target` dBFS.
 *
 * Section 11 of the standard: heaviest cues around -5, quiet ones between -14
 * and -19, sustained texture lower again. Ask for the level and let the
 * arithmetic find the multiplier, so a cue's intended loudness is legible in
 * the code instead of being encoded in a number nobody can check.
 *
 * Overlapping cues still sum, so the finished render is what settles it.
 */
export const gainFor = (effect: Effect, target: number) =>
  Number((10 ** ((target - PEAK_DBFS[effect]) / 20)).toFixed(3));
