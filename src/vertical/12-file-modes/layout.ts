import { RAIL_EDGE, WIDTH } from "../../shared/vertical/geometry";

/**
 * The lock.
 *
 * Three dials across the column the platform's action rail allows, which is
 * also the widest a digit can be drawn and still leave the tumblers under it
 * room to be read at feed size.
 */
export const COLUMN_LEFT = 150;
export const COLUMN_WIDTH = 780;

export const DIAL_WIDTH = 200;
export const DIAL_HEIGHT = 190;
export const DIAL_X = [
  COLUMN_LEFT,
  COLUMN_LEFT + (COLUMN_WIDTH - DIAL_WIDTH) / 2,
  COLUMN_LEFT + COLUMN_WIDTH - DIAL_WIDTH,
] as const;

export const LABEL_TOP = 384;
export const DIAL_TOP = 418;
export const TUMBLER_TOP = 626;
export const TUMBLER_SIZE = 56;
export const TUMBLER_GAP = 10;
export const WEIGHTS_TOP = 700;
export const SUM_TOP = 742;

/** The reference the cut leaves behind. */
export const LIST_TOP = 818;
export const LIST_ROW = 92;
export const TOTAL_TOP = LIST_TOP + LIST_ROW * 4 + 18;

if (COLUMN_LEFT + COLUMN_WIDTH > RAIL_EDGE) {
  throw new Error("the lock runs under the platform action rail");
}
if (COLUMN_LEFT !== (WIDTH - COLUMN_WIDTH) / 2) {
  throw new Error("the lock is not centred");
}
