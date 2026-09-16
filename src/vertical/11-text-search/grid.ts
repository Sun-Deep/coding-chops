import {
  RAIL_EDGE,
  WIDTH as FRAME_WIDTH,
} from "../../shared/vertical/geometry";
import { COLS, ROWS } from "./measurements";

/**
 * Two columns and three rows, all one size, built to the width the platform's
 * action rail allows rather than only the bottom row that has to be.
 */
export const PANEL_WIDTH = 378;
export const PANEL_HEIGHT = 296;

const GUTTER = 24;
const GRID_WIDTH = PANEL_WIDTH * 2 + GUTTER;

export const COLUMN_X = [
  (FRAME_WIDTH - GRID_WIDTH) / 2,
  (FRAME_WIDTH - GRID_WIDTH) / 2 + PANEL_WIDTH + GUTTER,
] as const;

/**
 * Pushed down to make room for the find bar and the two column headings.
 *
 * Frame zero has to say what is being searched for and what the two columns
 * are, or six unfamiliar names sit over six grey pages and a viewer has no way
 * in. The grid gives up 52 pixels for that and still clears the narration.
 */
export const ROW_Y = [452, 760, 1_068] as const;

if (COLUMN_X[1] + PANEL_WIDTH > RAIL_EDGE) {
  throw new Error("the right column runs under the platform action rail");
}

export const panelAt = (index: number) => ({
  left: COLUMN_X[index % 2],
  top: ROW_Y[Math.floor(index / 2)],
});

export const PAD = 14;
export const FIELD_TOP = 44;
export const FIELD_WIDTH = PANEL_WIDTH - PAD * 2;
export const FIELD_HEIGHT = 216;

/** Monospace advance is 0.6em, so the column width sets the size. */
export const ADVANCE = FIELD_WIDTH / COLS;
export const FONT_SIZE = ADVANCE / 0.6;
export const LINE_HEIGHT = FIELD_HEIGHT / ROWS;

/** The single page the verdict walks Boyer-Moore across. */
export const BIG_LEFT = COLUMN_X[0];
export const BIG_WIDTH = GRID_WIDTH;
export const BIG_TOP = 470;
export const BIG_ADVANCE = BIG_WIDTH / COLS;
export const BIG_FONT = BIG_ADVANCE / 0.6;
export const BIG_LINE = BIG_ADVANCE * 1.62;
export const BIG_HEIGHT = BIG_LINE * ROWS;

/** The find bar, which is the only thing in frame zero naming the query. */
export const FIND_TOP = 360;
export const FIND_HEIGHT = 48;

/** The two column headings, sitting directly over the grid. */
export const HEADING_TOP = 426;
