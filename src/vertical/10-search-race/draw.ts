import { HEIGHT, WIDTH } from "./measurements";
import { CELLS, MUD, WALL, xOf, yOf } from "./maze";

/**
 * Cells as one path, not one element each.
 *
 * Six panels of 1,275 cells is 7,650 rectangles a frame if each one is its own
 * element, which Chrome will draw and will not enjoy. Everything of the same
 * colour goes into a single `<path>` instead, so a panel costs about five
 * elements however much of it is filled.
 */
export const cellsPath = (
  cells: readonly number[] | Int32Array,
  cell: number,
  inset = 0,
) => {
  let d = "";
  const size = cell - inset * 2;
  for (const c of cells) {
    const x = xOf(c) * cell + inset;
    const y = yOf(c) * cell + inset;
    d += `M${x.toFixed(2)} ${y.toFixed(2)}h${size.toFixed(2)}v${size.toFixed(2)}h-${size.toFixed(2)}z`;
  }
  return d;
};

const collect = (kind: number) => {
  const out: number[] = [];
  for (let i = 0; i < WIDTH * HEIGHT; i++) if (CELLS[i] === kind) out.push(i);
  return out;
};

export const WALL_CELLS = collect(WALL);
export const MUD_CELLS = collect(MUD);

/** The static layers, built once per cell size rather than once per frame. */
const staticCache = new Map<number, { walls: string; mud: string }>();

export const staticLayers = (cell: number) => {
  const hit = staticCache.get(cell);
  if (hit) return hit;
  const built = {
    walls: cellsPath(WALL_CELLS, cell),
    mud: cellsPath(MUD_CELLS, cell),
  };
  staticCache.set(cell, built);
  return built;
};

/** A route as a line through cell centres, for stroking rather than filling. */
export const routePoints = (path: Int32Array, cell: number) => {
  let out = "";
  for (const c of path) {
    out += `${(xOf(c) * cell + cell / 2).toFixed(2)},${(yOf(c) * cell + cell / 2).toFixed(2)} `;
  }
  return out.trim();
};
