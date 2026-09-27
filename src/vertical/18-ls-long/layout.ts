import { RAIL_EDGE, WIDTH } from "../../shared/vertical/geometry";
import { FILE_LINE, FOLDER_LINE, INSIDE_LINE } from "./measurements";

/**
 * Three bands under the headline.
 *
 * The terminal, holding the real line for the whole cut. The key, seven rows,
 * one per column, which is the thing a viewer keeps. And a band under the key
 * that changes per beat: chmod's digits, then the folder count, then the
 * proof. The key never moves, so the cut reads as one object being explained
 * rather than three cards.
 */

/** Monospace advance, as a fraction of the font size. */
export const ADVANCE = 0.6;

export const STRIP_LEFT = 96;
export const STRIP_WIDTH = WIDTH - 96 * 2;
export const STRIP_TOP = 402;
export const STRIP_HEIGHT = 88;
export const STRIP_PAD = 20;

/** Sized so the longer of the two lines fills the strip. */
export const LINE_FONT = Math.floor(
  (STRIP_WIDTH - STRIP_PAD * 2) /
    Math.max(FILE_LINE.length, FOLDER_LINE.length) /
    ADVANCE,
);
export const LINE_TOP = STRIP_TOP + 42;

/** The key. */
export const COLUMN_LEFT = 150;
export const COLUMN_WIDTH = 780;
export const ROWS_TOP = 508;
export const ROW_HEIGHT = 76;
export const TOKEN_FONT = 46;
export const MEANING_LEFT = 512;

export const rowTop = (i: number) => ROWS_TOP + i * ROW_HEIGHT;

/** The band that changes per beat. */
export const BAND_TOP = 1_062;
export const BAND_BOTTOM = 1_288;

/** The proof strip: the folder's contents, listed. */
export const PROOF_FONT = Math.floor(
  (COLUMN_WIDTH - STRIP_PAD * 2) / INSIDE_LINE.length / ADVANCE,
);

/** The count: one square per folder in /usr. */
export const GRID_COLUMNS = 41;
export const GRID_CELL = 16;
export const GRID_GAP = 3;

if (COLUMN_LEFT + COLUMN_WIDTH > RAIL_EDGE) {
  throw new Error("the key runs under the platform action rail");
}
if (rowTop(7) > BAND_TOP) {
  throw new Error("the key runs into the band under it");
}
if (BAND_BOTTOM > 1_300) {
  throw new Error("the band runs into the narration");
}
