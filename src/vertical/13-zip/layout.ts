import { RAIL_EDGE, WIDTH } from "../../shared/vertical/geometry";
import { LINES } from "./measurements";
import { WIDEST_LINE } from "./lz77";

/**
 * The sheet.
 *
 * The file is the object in this cut, so it gets the column and everything else
 * arranges on it rather than under it. The width is set by the platform's
 * action rail: the card runs to the rail's edge, and the character cell falls
 * out of what is left over the widest line in the file.
 *
 * That leaves a 23 point character. At feed size it is small, and it has to be,
 * because the argument of the cut is that a stranger can see the repetition for
 * themselves and that needs the whole file in one frame. VR11 put six panels of
 * four point text on screen and Facebook reported more viewers leaving at 0:01
 * than at any other moment; one panel at twenty-three is the correction, and
 * the headline above it does the work at scroll speed.
 */
export const PAD = 20;
export const COLUMN_WIDTH = 740;
export const COLUMN_LEFT = (WIDTH - COLUMN_WIDTH) / 2;

/** Exact, so a highlight rectangle lands on the characters it describes. */
export const CHAR_W = COLUMN_WIDTH / WIDEST_LINE;
export const CHAR_SIZE = 23;
export const LINE_H = 32;

export const SHEET_TOP = 492;
export const SHEET_HEIGHT = LINES.length * LINE_H;
export const SHEET_BOTTOM = SHEET_TOP + SHEET_HEIGHT;

/** Baseline of a line's text within its row. */
export const BASELINE = 24;

/**
 * The card, and the header strip across the top of it.
 *
 * The header is where the file's size is written, which is the whole reason it
 * exists. A byte count in a strip under the diagram would be a dashboard
 * reporting on the picture; a byte count in the file's own header is the file
 * saying how big it is, and watching it fall is the verdict of the cut rather
 * than a caption about it.
 */
export const HEADER_H = 58;
export const CARD_TOP = SHEET_TOP - HEADER_H - 14;
export const CARD_BOTTOM = SHEET_BOTTOM + 22;
export const HEADER_BASELINE = CARD_TOP + 39;

/** One line under the card, never three. */
export const READOUT_TOP = CARD_BOTTOM + 44;

if (COLUMN_LEFT + COLUMN_WIDTH + PAD > RAIL_EDGE) {
  throw new Error("the card runs under the platform action rail");
}
