import {
  RAIL_EDGE,
  WIDTH as FRAME_WIDTH,
} from "../../shared/vertical/geometry";
import { CH, CW } from "./maze";

/**
 * Where the six panels sit.
 *
 * VR10's grid, pushed down under a two line headline. Two columns and three
 * rows, all one size, built to the width the platform's action rail allows, so
 * the right column's outer edge lands exactly on `RAIL_EDGE` in every row
 * rather than only the one that has to.
 */
export const PANEL_WIDTH = 378;
export const PANEL_HEIGHT = 272;

const GUTTER = 24;
const ROW_GAP = 12;
const GRID_WIDTH = PANEL_WIDTH * 2 + GUTTER;

export const COLUMN_X = [
  (FRAME_WIDTH - GRID_WIDTH) / 2,
  (FRAME_WIDTH - GRID_WIDTH) / 2 + PANEL_WIDTH + GUTTER,
] as const;

export const ROW_Y = [
  440,
  440 + PANEL_HEIGHT + ROW_GAP,
  440 + (PANEL_HEIGHT + ROW_GAP) * 2,
] as const;

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
export const CELL = FIELD_WIDTH / CW;
export const FIELD_HEIGHT = CELL * CH;

/** Where a panel's maze sits in the frame, for growing it into a big one. */
export const fieldAt = (index: number) => ({
  left: panelAt(index).left + PAD,
  top: panelAt(index).top + FIELD_TOP,
});

/** The two maps the verdict puts one above the other. */
export const BIG_LEFT = COLUMN_X[0];
export const BIG_WIDTH = GRID_WIDTH;
export const BIG_CELL = BIG_WIDTH / CW;
export const BIG_HEIGHT = BIG_CELL * CH;
export const MAP_TOP = [446, 880] as const;
export const LABEL_OFFSET = 36;
export const PROVENANCE_TOP = MAP_TOP[1] + BIG_HEIGHT + 10;

if (PROVENANCE_TOP + 20 > 1300) {
  throw new Error("the second map runs into the band the narration owns");
}
