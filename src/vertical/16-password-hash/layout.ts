import { LEFT, RAIL_EDGE, RIGHT, WIDTH } from "../../shared/vertical/geometry";
import { HEX_DIGITS } from "./measurements";

/**
 * A password field, and the row a site keeps instead of the password.
 *
 * The field is drawn rather than labelled because it is the thing the viewer
 * already owns. VR11 shipped six panels of a text search with the searched
 * phrase nowhere in the frame; the fix that worked was drawing a find bar, and
 * this is the same move. A login box is recognised before it is read.
 *
 * The row underneath is the largest object in the frame after the headline,
 * because watching all sixty-four characters change on a single keystroke is
 * the whole argument and it has to be legible on a phone. Sixteen columns is
 * the widest split that keeps a glyph above the size chmod's switches ran at,
 * which is the size that cut earned its comments with.
 */

/** Sixteen columns of the digest, four rows of it, across the full column. */
export const COLS = 16;
export const ROWS = HEX_DIGITS / COLS;

export const GRID_LEFT = LEFT;
export const GRID_WIDTH = RIGHT - LEFT;
export const CELL_W = GRID_WIDTH / COLS;
export const CELL_H = 66;
export const GLYPH_SIZE = 44;

export const GRID_TOP = 582;
export const GRID_HEIGHT = ROWS * CELL_H;
export const GRID_BOTTOM = GRID_TOP + GRID_HEIGHT;

/** The field, centred above the row it feeds. */
export const FIELD_WIDTH = 560;
export const FIELD_LEFT = (WIDTH - FIELD_WIDTH) / 2;
export const FIELD_TOP = 428;
export const FIELD_HEIGHT = 84;
export const FIELD_TEXT = 40;

/** What the field is, and what the row under it is. The mechanism sits on
 * the right of the same line rather than taking one of its own: a lone SHA-256
 * tag between the two cost a line of vertical budget and collided with the row
 * label at every width. */
export const FIELD_LABEL_TOP = 414;
export const ROW_LABEL_TOP = 560;

/** How many of the sixty-four came back. Live, and the largest number in frame. */
export const COUNT_TOP = GRID_BOTTOM + 34;
export const COUNT_SIZE = 88;
export const COUNT_UNIT_SIZE = 28;

/**
 * The verdict, in the band the platform's action rail runs through.
 *
 * Below `RAIL_FROM` a centred block has to lose the same width on the left as
 * the buttons take on the right, so this is 700 rather than the 888 the grid
 * gets. Sitting it at the full width would put the chip's right edge under the
 * share button on every platform.
 */
export const CHIP_TOP = 1032;
export const CHIP_HEIGHT = 86;
export const CHIP_WIDTH = 700;
export const CHIP_LEFT = (WIDTH - CHIP_WIDTH) / 2;

/** The line the viewer keeps, and where the numbers came from. */
export const KEEPER_TOP = CHIP_TOP + CHIP_HEIGHT + 40;
export const PROVENANCE_TOP = KEEPER_TOP + 98;

if (GRID_LEFT + GRID_WIDTH > RIGHT) {
  throw new Error("VR16: the row is wider than the column it sits in");
}
if (CHIP_LEFT + CHIP_WIDTH > RAIL_EDGE) {
  throw new Error("VR16: the verdict chip runs under the platform action rail");
}
if (ROWS * COLS !== HEX_DIGITS) {
  throw new Error(`VR16: ${ROWS} by ${COLS} does not lay out ${HEX_DIGITS} characters`);
}
