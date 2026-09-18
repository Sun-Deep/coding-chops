import { BYTES } from "./measurements";
import { COPIES } from "./lz77";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * The clock is position in the file, not work done.
 *
 * VR11's lesson, and it applies harder here. Copies are not spread evenly
 * through the file -- the first is 48 bytes long and lands in the second line --
 * so a clock counting tokens would crawl through the top of the sheet and then
 * fire twenty of them in the last second. Running the head along the bytes
 * makes the sweep even, and what varies is how much lights up as it goes, which
 * is the thing worth watching.
 */
export const READ_FROM = 0;
export const READ_TO = 300;

/**
 * Accelerating, gently.
 *
 * The opening seconds are where a stranger decides, and they need long enough
 * on the first two lines to see that line two is line one again. After that the
 * file is understood and the sweep can run.
 */
const curve = (u: number) => 0.45 * u + 0.55 * u * u;

/** Which byte the reading head has reached. */
export const headAt = (frame: number) => {
  const u = Math.min(
    1,
    Math.max(0, (frame - READ_FROM) / (READ_TO - READ_FROM)),
  );
  return curve(u) * BYTES;
};

/** The frame the head reaches a byte, which is `headAt` inverted. */
export const frameOfByte = (byte: number) => {
  const target = Math.min(1, Math.max(0, byte / BYTES));
  // curve is 0.55u^2 + 0.45u - target, solved for the root in [0, 1].
  const u = (-0.45 + Math.sqrt(0.45 ** 2 + 4 * 0.55 * target)) / (2 * 0.55);
  return READ_FROM + u * (READ_TO - READ_FROM);
};

/** Frames a copy takes to light up and throw its arc back. */
export const FIRE = 9;

/** Every copy with the frame it fires on, which the picture and the sound share. */
export const FIRINGS = COPIES.map((copy) => ({
  ...copy,
  frame: frameOfByte(copy.at),
}));

/**
 * The collapse.
 *
 * The hero of the last shot, and the reason the cut is not just a highlighter
 * running over a log. Every copied span contracts into the pointer that
 * replaces it, so the sheet visibly loses most of itself. Until this moment the
 * viewer has been told the repeats are redundant; here they watch them go.
 */
export const COLLAPSE_FROM = 306;
export const COLLAPSE_TO = 352;

export const collapsedAt = (frame: number) =>
  Math.min(
    1,
    Math.max(0, (frame - COLLAPSE_FROM) / (COLLAPSE_TO - COLLAPSE_FROM)),
  );

/** The running count of bytes found to be copies, under the sheet. */
export const TALLY_FROM = 40;

/**
 * The readout under the card swaps from the reason to the result.
 *
 * One slot, two states, rather than two lines stacked. A strip of counts under
 * a diagram turns the bottom of the frame into a dashboard reporting on the
 * picture above it, which is the note in section 4 of the playbook.
 */
/**
 * The drain: what survived the collapse goes into the zip.
 *
 * The last beat has to be the data arriving in the file the cut is named after,
 * and it also has to move. The first version of this section counted the
 * source's header down from 1,035 to 177, which was motion but was also a lie:
 * zipping a file does not shrink it, it writes a second one. Taking the
 * odometer out left two flat seconds on the frozen-frame check, which is well
 * over the threshold in section 7 of the playbook.
 *
 * So the stubs and the leftover characters fall out of the sheet and converge
 * on the zip bar, staggered down the page, and the bar brightens as they land.
 * It is the same fix as VR12's drum spins: on a cut with few moving parts, an
 * event has to be given size.
 */
export const DRAIN_FROM = 352;
export const DRAIN_TO = 398;
export const DRAIN_SPAN = 26;

/** Stagger down the sheet, so it empties from the top rather than all at once. */
export const drainAt = (frame: number, line: number, lines: number) => {
  const stagger =
    (line / Math.max(1, lines - 1)) * (DRAIN_TO - DRAIN_FROM - DRAIN_SPAN);
  return Math.min(1, Math.max(0, (frame - DRAIN_FROM - stagger) / DRAIN_SPAN));
};

export const RATIO_FROM = 396;

/**
 * Bytes the head has passed that were a copy of something earlier.
 *
 * Counted against the head rather than against whole copies, so the tally rises
 * as the head crosses a stretch instead of jumping forty-eight when it enters
 * one. A counter that leaps is read as a cut; a counter that climbs is read as
 * a measurement being taken.
 */
export const coveredBy = (byte: number) => {
  let covered = 0;
  for (const copy of COPIES) {
    const to = Math.min(byte, copy.at + copy.length);
    if (to > copy.at) covered += to - copy.at;
  }
  return covered;
};
