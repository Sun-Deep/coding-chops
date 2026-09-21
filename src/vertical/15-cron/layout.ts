import { RAIL_EDGE, WIDTH } from "../../shared/vertical/geometry";
import { DAYS, HOURS, STEPS } from "./measurements";

/**
 * The expression, the week it selects, and the count.
 *
 * The five slots are the lesson, so they get the largest type in the frame
 * after the headline, with their names underneath. That pairing is the whole
 * decoding key: after fourteen seconds a viewer knows which position is which,
 * the same way chmod leaves them able to read any mode.
 */
export const COLUMN_LEFT = 210;
export const COLUMN_WIDTH = 660;

/** The five fields, evenly spaced across the column. */
export const SLOT_WIDTH = COLUMN_WIDTH / 5;
export const SLOT_TOP = 408;
export const SLOT_SIZE = 60;
export const LABEL_TOP = 484;

/**
 * A week, as 24 hours across by 7 days down.
 *
 * A year has 525,600 minutes and no grid can draw them, so the reel draws the
 * week the expression repeats and puts the year in the counter. Days read down
 * the way a calendar does, and the day names sit in the left margin rather than
 * inside the grid, so all 24 columns stay the same width.
 */
export const GRID_TOP = 528;
export const CELL_W = COLUMN_WIDTH / HOURS;
export const CELL_H = 40;
export const GRID_HEIGHT = DAYS.length * CELL_H;
export const GRID_BOTTOM = GRID_TOP + GRID_HEIGHT;

/** The day names, in the margin to the left of the grid. */
export const DAY_LABEL_RIGHT = COLUMN_LEFT - 14;

/** The number that falls. */
export const COUNT_TOP = GRID_BOTTOM + 34;
export const COUNT_SIZE = 76;

/** The reference the cut leaves behind, one row per step. */
export const LIST_TOP = COUNT_TOP + COUNT_SIZE + 46;
export const LIST_ROW = 52;
export const LIST_HEIGHT = STEPS.length * LIST_ROW;

export const PROVENANCE_TOP = LIST_TOP + LIST_HEIGHT + 26;

if (COLUMN_LEFT + COLUMN_WIDTH > RAIL_EDGE) {
  throw new Error("the column runs under the platform action rail");
}
if (COLUMN_LEFT !== (WIDTH - COLUMN_WIDTH) / 2) {
  throw new Error("the column is not centred");
}
