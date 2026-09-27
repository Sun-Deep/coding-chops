import { CH, CW, roomCell, type Maze } from "./maze";

/**
 * Cells as one path per colour, not one element each.
 *
 * Six panels of 1,275 cells is 7,650 rectangles a frame if each is its own
 * element. Everything of one colour goes into a single `<path>`, so a panel
 * costs a handful of elements however much of it is open.
 */
export const cellsPath = (cells: Iterable<number>, cell: number) => {
  let d = "";
  const size = cell.toFixed(2);
  for (const c of cells) {
    const x = (c % CW) * cell;
    const y = Math.floor(c / CW) * cell;
    d += `M${x.toFixed(2)} ${y.toFixed(2)}h${size}v${size}h-${size}z`;
  }
  return d;
};

/** Every room on the grid, open or not, so the grid shows before it is dug. */
const ROOM_CELLS: number[] = [];
for (let y = 1; y < CH; y += 2) {
  for (let x = 1; x < CW; x += 2) ROOM_CELLS.push(y * CW + x);
}

const roomCache = new Map<number, string>();
export const roomsPath = (cell: number) => {
  const hit = roomCache.get(cell);
  if (hit) return hit;
  const built = cellsPath(ROOM_CELLS, cell);
  roomCache.set(cell, built);
  return built;
};

const openCache = new WeakMap<Maze, Map<number, string>>();

/** A finished maze's open cells, built once per maze and size. */
export const openPath = (maze: Maze, cell: number) => {
  let bySize = openCache.get(maze);
  if (!bySize) {
    bySize = new Map();
    openCache.set(maze, bySize);
  }
  const hit = bySize.get(cell);
  if (hit) return hit;
  const cells: number[] = [];
  maze.openedAt.forEach((at, c) => {
    if (at >= 0) cells.push(c);
  });
  const built = cellsPath(cells, cell);
  bySize.set(cell, built);
  return built;
};

/** A route as a line through room centres, entrance gap to exit gap. */
export const routePoints = (
  route: Int32Array,
  cell: number,
  rooms = route.length,
) => {
  const centre = (c: number) =>
    `${((c % CW) * cell + cell / 2).toFixed(2)},${(Math.floor(c / CW) * cell + cell / 2).toFixed(2)}`;
  let out = `${(0).toFixed(2)},${(cell * 1.5).toFixed(2)} `;
  for (let i = 0; i < Math.min(rooms, route.length); i++) {
    out += `${centre(roomCell(route[i]))} `;
  }
  if (rooms >= route.length) {
    out += `${(CW * cell).toFixed(2)},${((CH - 1.5) * cell).toFixed(2)}`;
  }
  return out.trim();
};

/** The length of that line: two cells a room, and a cell and a half at each gap. */
export const routeLength = (route: Int32Array, cell: number) =>
  (route.length - 1) * 2 * cell + 3 * cell;
