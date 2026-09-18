import { RAIL_EDGE, WIDTH } from "../../shared/vertical/geometry";
import { MOST_LINES, WIDEST_LINE } from "./lz77";

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

export const SHEET_TOP = 464;
export const SHEET_HEIGHT = MOST_LINES * LINE_H;
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

/**
 * The two files, drawn to the same scale.
 *
 * This is the part that says a zip is being made rather than a file being
 * marked up. The source fills as the head reads it and the zip fills as the
 * encoder writes it, both measured against the same track, so the gap between
 * the two bars is the compression and the empty end of the lower bar is the
 * space that was saved.
 *
 * It replaced a single readout counting copied bytes. The bars carry that and
 * the narration says the number, and a count under a diagram was the dashboard
 * section 4 of the playbook warns about anyway.
 */
export const BAR_HEIGHT = 24;

/** The name sits clear above its track, not on it. */
const LABEL_TO_BAR = 30;

export const BAR_LABEL_ONE = CARD_BOTTOM + 28;
export const BAR_ONE_TOP = BAR_LABEL_ONE + LABEL_TO_BAR;
export const BAR_LABEL_TWO = BAR_ONE_TOP + BAR_HEIGHT + 22;
export const BAR_TWO_TOP = BAR_LABEL_TWO + LABEL_TO_BAR;

export const PROVENANCE_TOP = BAR_TWO_TOP + BAR_HEIGHT + 24;

if (COLUMN_LEFT + COLUMN_WIDTH + PAD > RAIL_EDGE) {
  throw new Error("the card runs under the platform action rail");
}
