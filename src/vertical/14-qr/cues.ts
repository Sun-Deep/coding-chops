import {
  CHIPS_FROM,
  CHIP_EVERY,
  CHIP_FLIGHT,
  HOLE_STEP,
  HOLE_TO,
  LADDER_FROM,
  LADDER_STEP,
  REBUILD_FROM,
  REBUILD_TO,
  SCANS_FROM,
  SPLIT_FROM,
  TYPED_EVERY,
  TYPED_FROM,
  ringAt,
} from "./beats";
import { HERO, LEVELS, TEXT } from "./measurements";

/**
 * The damage, made audible.
 *
 * A bite as each ring of the hole opens, falling in pitch as the square grows,
 * so eleven steps are eleven sounds and the number on screen is something the
 * ear has counted too. Then the scan, then the pieces filling in, then the
 * backup putting the code back together on a rising line.
 *
 * The shape of the track is the shape of the argument: something is taken
 * apart, and then it is put back.
 */

export type Pulse = {
  readonly id: string;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
};

/** The code landing, so the first half second is not silent. */
export const OPENING_AT = 3;

/** The hole finished, just before the scan crosses it. */
export const HOLE_DONE_AT = HOLE_TO;

/** Each ring of the hole opening, plus a softer tick between them. */
export const BITES: readonly Pulse[] = Array.from({
  length: HERO.hole,
}).flatMap((_, i) => {
  const at = ringAt(i + 1);
  const through = i / Math.max(1, HERO.hole - 1);
  return [
    {
      id: `bite-${i}`,
      frame: at,
      rate: 1.18 - through * 0.42,
      gain: 6.8 + through * 1.9,
    },
    {
      id: `bite-half-${i}`,
      frame: at + Math.round(HOLE_STEP / 2),
      rate: 1.5 - through * 0.3,
      gain: 2.43,
    },
  ];
});

/** The sweep, and the code reading anyway. */
export const SCAN_AT = SCANS_FROM - 6;
export const SCANNED_AT = SCANS_FROM;

/**
 * The seventy pieces landing.
 *
 * Strided, because seventy chips inside three seconds is one every frame and a
 * half and that is a buzz rather than a count.
 */
const CHIP_STRIDE = 3;

export const CHIPS: readonly Pulse[] = Array.from({ length: HERO.codewords })
  .map((_, i) => i)
  .filter((i) => i % CHIP_STRIDE === 0)
  .map((i) => ({
    id: `chip-${i}`,
    frame: Math.round(CHIPS_FROM + i * CHIP_EVERY + CHIP_FLIGHT),
    // Your link rings high, the backup sits under it.
    rate: i < HERO.data ? 1.34 : 0.96,
    gain: i < HERO.data ? 4.05 : 2.84,
  }));

/** The decoded link arriving a character at a time. */
const TYPE_STRIDE = 2;

export const TYPED: readonly Pulse[] = Array.from({ length: TEXT.length })
  .map((_, i) => i)
  .filter((i) => i % TYPE_STRIDE === 0)
  .map((i) => ({
    id: `typed-${i}`,
    frame: Math.round(TYPED_FROM + i * TYPED_EVERY),
    rate: 1.42,
    gain: 2.56,
  }));

export const SPLIT_AT = SPLIT_FROM + 6;

/** The sum under the chips assembling: your link, the backup, the total. */
export const SUM: readonly Pulse[] = [0, 1, 2].map((i) => ({
  id: `sum-${i}`,
  frame: SPLIT_FROM + 14 + i * 12,
  rate: 1.0 + i * 0.22,
  gain: 4.05,
}));

/** A row of the reference arriving. */
export const LADDER: readonly Pulse[] = LEVELS.map((level, i) => ({
  id: `ladder-${level.level}`,
  frame: LADDER_FROM + i * LADDER_STEP,
  rate: 0.92 + i * 0.16,
  gain: 4.59,
}));

/**
 * The rebuild.
 *
 * Rising, where the bites fell, because this is the same square being put back.
 * Spread across the whole heal so the last seconds are not silent, which is the
 * defect VR13 shipped twice before it was caught.
 */
const REBUILD_CUES = 14;

export const REBUILD: readonly Pulse[] = Array.from({
  length: REBUILD_CUES,
}).map((_, i) => {
  const through = i / (REBUILD_CUES - 1);
  return {
    id: `rebuild-${i}`,
    frame: Math.round(REBUILD_FROM + through * (REBUILD_TO - REBUILD_FROM - 4)),
    rate: 0.9 + through * 0.75,
    gain: 4.74 + through * 2.16,
  };
});

/** The code whole again. */
export const HEALED_AT = REBUILD_TO;
