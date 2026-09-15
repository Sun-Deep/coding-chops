import {
  RAIL_EDGE,
  WIDTH as FRAME_WIDTH,
} from "../../shared/vertical/geometry";
import { HEIGHT as CELLS_Y, WIDTH as CELLS_X } from "./measurements";

/**
 * Where the six panels sit.
 *
 * Two columns and three rows, all one size, built to the width the platform's
 * action rail allows rather than only the bottom row that has to be. The right
 * column's outer edge lands exactly on `RAIL_EDGE`.
 */
export const PANEL_WIDTH = 378;
export const PANEL_HEIGHT = 272;

const GUTTER = 24;
const GRID_WIDTH = PANEL_WIDTH * 2 + GUTTER;

export const COLUMN_X = [
  (FRAME_WIDTH - GRID_WIDTH) / 2,
  (FRAME_WIDTH - GRID_WIDTH) / 2 + PANEL_WIDTH + GUTTER,
] as const;

export const ROW_Y = [410, 704, 998] as const;

if (COLUMN_X[1] + PANEL_WIDTH > RAIL_EDGE) {
  throw new Error("the right column runs under the platform action rail");
}

export const panelAt = (index: number) => ({
  left: COLUMN_X[index % 2],
  top: ROW_Y[Math.floor(index / 2)],
});

export const PAD = 14;
export const FIELD_TOP = 48;
export const FIELD_WIDTH = PANEL_WIDTH - PAD * 2;
export const CELL = FIELD_WIDTH / CELLS_X;
export const FIELD_HEIGHT = CELL * CELLS_Y;

/** The single map the verdict lays both routes on. */
export const BIG_LEFT = COLUMN_X[0];
export const BIG_WIDTH = GRID_WIDTH;
export const BIG_CELL = BIG_WIDTH / CELLS_X;
export const BIG_HEIGHT = BIG_CELL * CELLS_Y;
export const BIG_TOP = 470;
