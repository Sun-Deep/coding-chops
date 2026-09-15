import { RAIL_EDGE, WIDTH } from "../../shared/vertical/geometry";

/**
 * Where the six panels sit.
 *
 * Two columns and three rows, all one size. The bottom row crosses `RAIL_FROM`,
 * so every row is built to the width the rail allows rather than only the row
 * that has to be: a grid whose bottom row is narrower than the two above it
 * reads as a layout fault, and 56 pixels is not worth that. The right column's
 * outer edge lands exactly on `RAIL_EDGE`.
 */
export const PANEL_WIDTH = 378;
export const PANEL_HEIGHT = 276;

const GUTTER = 24;
const GRID_WIDTH = PANEL_WIDTH * 2 + GUTTER;

export const COLUMN_X = [
  (WIDTH - GRID_WIDTH) / 2,
  (WIDTH - GRID_WIDTH) / 2 + PANEL_WIDTH + GUTTER,
] as const;

export const ROW_Y = [410, 716, 1_022] as const;

if (COLUMN_X[1] + PANEL_WIDTH > RAIL_EDGE) {
  throw new Error("the right column runs under the platform action rail");
}

/** Top left of panel `index`, laid out in reading order. */
export const panelAt = (index: number) => ({
  left: COLUMN_X[index % 2],
  top: ROW_Y[Math.floor(index / 2)],
});

/** Panel interior. The bar field is everything between the two label rows. */
export const PAD = 16;
export const FIELD_TOP = 52;
export const FIELD_HEIGHT = 170;
export const FIELD_WIDTH = PANEL_WIDTH - PAD * 2;
export const COST_BAR_HEIGHT = 8;
