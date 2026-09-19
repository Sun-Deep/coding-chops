import { HERO, LEVELS } from "./measurements";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * The hole opens a module at a time.
 *
 * Eleven steps rather than a smooth grow, because a countable thing should be
 * counted. Each step adds a ring and fires a cue, so the viewer hears eleven
 * bites and can watch the square reach 11 by 11, which is the number the band
 * under it is claiming.
 */
export const HOLE_FROM = 16;
export const HOLE_STEP = 7;
export const HOLE_TO = HOLE_FROM + HERO.hole * HOLE_STEP;

/** How many modules across the hole is, at a frame. */
export const holeAt = (frame: number) => {
  if (frame < HOLE_FROM) return 0;
  return Math.min(HERO.hole, Math.floor((frame - HOLE_FROM) / HOLE_STEP) + 1);
};

/** The frame a given ring opens, which the sound reads too. */
export const ringAt = (side: number) => HOLE_FROM + (side - 1) * HOLE_STEP;

/** The verdict on the hole: it still reads. */
export const SCANS_FROM = HOLE_TO + 8;

/**
 * What the symbol is made of.
 *
 * Seventy chips, filling in reading order, then the first 26 take the accent
 * and the rest go neutral. The split is the whole explanation: most of a QR
 * code is not the link, and that is why there was room to lose 121 modules.
 */
export const CHIPS_FROM = 158;
export const CHIP_EVERY = 0.55;
export const SPLIT_FROM = 226;

/**
 * Frames a piece takes to travel from the code to its slot.
 *
 * The chips used to appear where they belonged, and the frozen-frame check
 * called the whole beat a still: seventy small squares fading in change almost
 * no pixels in a 1080 by 1920 frame, so for 1.7 seconds the cut looked stopped
 * while it was busy.
 *
 * Flying them out of the symbol fixes the picture and says something truer at
 * the same time. These are not a chart about the code, they are what is in it.
 */
export const CHIP_FLIGHT = 16;

/** How far a given piece has travelled, 0 to 1. */
export const chipAt = (index: number, frame: number) =>
  Math.min(
    1,
    Math.max(0, (frame - (CHIPS_FROM + index * CHIP_EVERY)) / CHIP_FLIGHT),
  );

export const chipsShown = (frame: number) =>
  Math.max(
    0,
    Math.min(HERO.codewords, Math.ceil((frame - CHIPS_FROM) / CHIP_EVERY)),
  );

export const splitAt = (frame: number) =>
  Math.min(1, Math.max(0, (frame - SPLIT_FROM) / 20));

/** The reference the cut leaves behind. */
export const LADDER_FROM = 262;
export const LADDER_STEP = 13;

export const ladderShown = (frame: number) =>
  Math.max(
    0,
    Math.min(
      LEVELS.length,
      Math.floor((frame - LADDER_FROM) / LADDER_STEP) + 1,
    ),
  );

/** How far a row has slid in. Sliding moves pixels; fading does not. */
export const LADDER_SLIDE = 12;

export const ladderAt = (index: number, frame: number) =>
  Math.min(
    1,
    Math.max(0, (frame - (LADDER_FROM + index * LADDER_STEP)) / LADDER_SLIDE),
  );

/** Which of the three things the band is saying. */
export const bandStateAt = (frame: number) => {
  if (frame >= LADDER_FROM - 6) return "ladder" as const;
  if (frame >= CHIPS_FROM - 6) return "parts" as const;
  return "hole" as const;
};

/**
 * The hole healing.
 *
 * The last beat, and the one that makes the explanation land rather than just
 * finish. Having been told that 44 of the 70 pieces exist to rebuild the other
 * 26, the viewer watches exactly that happen: the blanked squares come back.
 *
 * What a decoder actually recovers is the codewords, not the picture. Redrawing
 * the modules is a fair depiction of that and not the literal operation, and
 * `script.md` says so rather than letting the frame imply otherwise.
 *
 * It also carries the closing seconds. Without it the cut held still from the
 * last ladder row to the end, which is over two seconds and well past what the
 * frozen-frame check allows.
 */
export const REBUILD_FROM = 318;
export const REBUILD_TO = 400;

/** How far the rebuild has got, 0 to 1. */
export const rebuiltAt = (frame: number) =>
  Math.min(
    1,
    Math.max(0, (frame - REBUILD_FROM) / (REBUILD_TO - REBUILD_FROM)),
  );

/**
 * Whether a module inside the hole has come back yet.
 *
 * In reading order across the hole, so it fills the way text does rather than
 * appearing all at once, and so the sound can follow it.
 */
export const rebuiltBy = (index: number, count: number, frame: number) =>
  rebuiltAt(frame) * count > index;

/**
 * The decoded text, typed out.
 *
 * What the scan actually returned, arriving a character at a time so the claim
 * is "here is the link it read" rather than a tick in the corner. It also
 * carries the second between the code reading and the pieces appearing, which
 * was a full second of silence before.
 */
export const TYPED_FROM = SCANS_FROM + 2;
export const TYPED_EVERY = 1.2;

export const typedBy = (frame: number, length: number) =>
  Math.max(0, Math.min(length, Math.round((frame - TYPED_FROM) / TYPED_EVERY)));
