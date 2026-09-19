import { RAIL_EDGE, WIDTH } from "../../shared/vertical/geometry";
import { SIZE } from "./measurements";

/**
 * The symbol.
 *
 * A QR code is the object, so it gets the frame and everything else arranges
 * under it. 660 across 29 modules is a hair under 23 points each, which at feed
 * size is about eight points: every module is a square you can see, and the
 * hole that opens in the middle is 250 points across.
 *
 * That is the lesson of VR13. Its mechanism was drawn at about one point and
 * nobody could have read it. Here the thing being damaged is the biggest object
 * in the frame by a wide margin.
 */
export const SYMBOL_WIDTH = 580;
export const MODULE = SYMBOL_WIDTH / SIZE;
export const SYMBOL_LEFT = (WIDTH - SYMBOL_WIDTH) / 2;
export const SYMBOL_TOP = 406;
export const SYMBOL_BOTTOM = SYMBOL_TOP + SYMBOL_WIDTH;

/** A quiet zone drawn around it, because a QR code without one is not one. */
export const QUIET = 18;

/**
 * One band under the symbol, three states.
 *
 * The count while the hole opens, then what the symbol is actually made of,
 * then the four levels as the thing worth keeping. One slot rather than three
 * stacked, because a strip of readouts under a diagram turns the bottom of the
 * frame into a dashboard reporting on the picture above it.
 */
/**
 * The scan result, on its own strip under the symbol.
 *
 * It started in the quiet zone above the code and ran straight through the
 * headline, and a badge inside the plate covered modules the cut later needs to
 * show healing. Below the code it collides with nothing and it reads as what it
 * is: the thing the decoder returned.
 */
export const RESULT_TOP = SYMBOL_BOTTOM + QUIET + 16;
export const RESULT_HEIGHT = 44;

export const BAND_TOP = 1080;
export const BAND_HEIGHT = 190;
export const BAND_LEFT = 210;
export const BAND_WIDTH = 660;

/**
 * The 134 codewords, as a grid you can read the proportion off.
 *
 * Twenty-three columns on purpose: 46 is exactly two rows of them, so the link
 * is the top two rows and the backup is the four underneath. The split is a
 * shape rather than a count, which is what survives at feed size.
 */
export const CHIP_COLS = 23;
export const CHIP_ROWS = 6;
export const CHIP_PITCH = 28;
export const CHIP_SIZE = 24;
export const CHIPS_WIDTH = CHIP_COLS * CHIP_PITCH - (CHIP_PITCH - CHIP_SIZE);
export const CHIPS_LEFT = (WIDTH - CHIPS_WIDTH) / 2;

/** The four levels, as rows. */
export const LADDER_ROW = 46;

/**
 * The sum under the chips, and then the provenance under that.
 *
 * Both are laid out from the chip grid rather than from a band height, because
 * the first version derived one from the other and put the sum straight through
 * the provenance line.
 */
export const SUM_TOP = BAND_TOP + CHIP_ROWS * CHIP_PITCH + 26;
export const PROVENANCE_TOP = SUM_TOP + 34;

if (SYMBOL_LEFT + SYMBOL_WIDTH > RAIL_EDGE) {
  throw new Error("the symbol runs under the platform action rail");
}
if (BAND_LEFT + BAND_WIDTH > RAIL_EDGE) {
  throw new Error("the band runs under the platform action rail");
}
