import {
  MH,
  MW,
  PASSAGES,
  ROOMS,
  RUNS,
  SEED,
  SHORTEST,
  type GeneratorKey,
} from "./measurements";

/**
 * The six generators, instrumented.
 *
 * A port of `scripts/measure-maze-generators.mjs`. Nothing in a shot invents a
 * maze: a panel reads the order walls came down in and the route out of here,
 * and every figure is checked against `measurements.ts` at module load, so a
 * port that drifted from the script cannot reach a render.
 *
 * Two grids. Rooms are the maze's own cells, 25 by 12. The drawing grid is 51
 * by 25: every room, every wall between two rooms, and the outer border each
 * get a square of their own, which is how a maze is drawn on squared paper and
 * why a knocked-down wall can be shown as one square going from dark to open.
 */

export const CW = MW * 2 + 1;
export const CH = MH * 2 + 1;

const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => (s = (s * 1_664_525 + 1_013_904_223) >>> 0) / 4_294_967_296;
};

type Random = () => number;
type Passage = readonly [number, number];

const room = (x: number, y: number) => y * MW + x;
export const roomX = (r: number) => r % MW;
export const roomY = (r: number) => Math.floor(r / MW);

export const START = 0;
export const EXIT = ROOMS - 1;

/** Rooms sharing a wall with r, in the order the script uses. */
const around = (r: number) => {
  const x = roomX(r);
  const y = roomY(r);
  const out: number[] = [];
  if (y > 0) out.push(room(x, y - 1));
  if (x < MW - 1) out.push(room(x + 1, y));
  if (y < MH - 1) out.push(room(x, y + 1));
  if (x > 0) out.push(room(x - 1, y));
  return out;
};

const pick = <T>(random: Random, list: readonly T[]) =>
  list[Math.floor(random() * list.length)];

const depthFirst = (random: Random): Passage[] => {
  const seen = new Uint8Array(ROOMS);
  const stack = [START];
  seen[START] = 1;
  const carved: Passage[] = [];
  while (stack.length) {
    const r = stack[stack.length - 1];
    const options = around(r).filter((n) => !seen[n]);
    if (!options.length) {
      stack.pop();
      continue;
    }
    const n = pick(random, options);
    seen[n] = 1;
    carved.push([r, n]);
    stack.push(n);
  }
  return carved;
};

const prim = (random: Random): Passage[] => {
  const inMaze = new Uint8Array(ROOMS);
  const onFrontier = new Uint8Array(ROOMS);
  const frontier: number[] = [];
  const add = (r: number) => {
    inMaze[r] = 1;
    for (const n of around(r)) {
      if (!inMaze[n] && !onFrontier[n]) {
        onFrontier[n] = 1;
        frontier.push(n);
      }
    }
  };
  add(START);
  const carved: Passage[] = [];
  while (frontier.length) {
    const i = Math.floor(random() * frontier.length);
    const r = frontier[i];
    frontier[i] = frontier[frontier.length - 1];
    frontier.pop();
    const n = pick(
      random,
      around(r).filter((m) => inMaze[m]),
    );
    carved.push([n, r]);
    add(r);
  }
  return carved;
};

const kruskal = (random: Random): Passage[] => {
  const walls: [number, number][] = [];
  for (let r = 0; r < ROOMS; r++) {
    if (roomX(r) < MW - 1) walls.push([r, r + 1]);
    if (roomY(r) < MH - 1) walls.push([r, r + MW]);
  }
  for (let i = walls.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [walls[i], walls[j]] = [walls[j], walls[i]];
  }
  const parent = Int32Array.from({ length: ROOMS }, (_, i) => i);
  const find = (a: number) => {
    while (parent[a] !== a) {
      parent[a] = parent[parent[a]];
      a = parent[a];
    }
    return a;
  };
  const carved: Passage[] = [];
  for (const [a, b] of walls) {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) continue;
    parent[ra] = rb;
    carved.push([a, b]);
    if (carved.length === PASSAGES) break;
  }
  return carved;
};

const wilson = (random: Random): Passage[] => {
  const inMaze = new Uint8Array(ROOMS);
  inMaze[
    pick(
      random,
      Array.from({ length: ROOMS }, (_, i) => i),
    )
  ] = 1;
  const next = new Int32Array(ROOMS).fill(-1);
  const carved: Passage[] = [];
  for (let s = 0; s < ROOMS; s++) {
    if (inMaze[s]) continue;
    let r = s;
    while (!inMaze[r]) {
      const n = pick(random, around(r));
      next[r] = n;
      r = n;
    }
    r = s;
    while (!inMaze[r]) {
      inMaze[r] = 1;
      carved.push([r, next[r]]);
      r = next[r];
    }
  }
  return carved;
};

const binaryTree = (random: Random): Passage[] => {
  const carved: Passage[] = [];
  for (let y = 0; y < MH; y++) {
    for (let x = 0; x < MW; x++) {
      const r = room(x, y);
      const options: number[] = [];
      if (y > 0) options.push(room(x, y - 1));
      if (x < MW - 1) options.push(room(x + 1, y));
      if (!options.length) continue;
      carved.push([r, pick(random, options)]);
    }
  }
  return carved;
};

const sidewinder = (random: Random): Passage[] => {
  const carved: Passage[] = [];
  for (let y = 0; y < MH; y++) {
    let run: number[] = [];
    for (let x = 0; x < MW; x++) {
      const r = room(x, y);
      run.push(r);
      const atEast = x === MW - 1;
      const atTop = y === 0;
      const close = atEast || (!atTop && random() < 0.5);
      if (close) {
        if (!atTop) {
          const door = pick(random, run);
          carved.push([door, door - MW]);
        }
        run = [];
      } else {
        carved.push([r, r + 1]);
      }
    }
  }
  return carved;
};

const GENERATE: Record<GeneratorKey, (random: Random) => Passage[]> = {
  depthFirst,
  prim,
  kruskal,
  wilson,
  binaryTree,
  sidewinder,
};

/** Drawing-grid index of a room, and of the wall between two rooms. */
export const roomCell = (r: number) =>
  (roomY(r) * 2 + 1) * CW + roomX(r) * 2 + 1;
const wallCell = (a: number, b: number) =>
  (roomY(a) + roomY(b) + 1) * CW + roomX(a) + roomX(b) + 1;

/** The gaps in the outer border: in beside the first room, out beside the last. */
export const ENTRANCE_CELL = 1 * CW + 0;
export const EXIT_CELL = (CH - 2) * CW + (CW - 1);

const linksOf = (carved: readonly Passage[]) => {
  const links: number[][] = Array.from({ length: ROOMS }, () => []);
  for (const [a, b] of carved) {
    const dx = Math.abs(roomX(a) - roomX(b));
    const dy = Math.abs(roomY(a) - roomY(b));
    if (dx + dy !== 1)
      throw new Error(`passage ${a}-${b} joins rooms that do not touch`);
    if (links[a].includes(b)) throw new Error(`passage ${a}-${b} opened twice`);
    links[a].push(b);
    links[b].push(a);
  }
  return links;
};

const routeOf = (links: readonly number[][]) => {
  const from = new Int32Array(ROOMS).fill(-1);
  from[START] = START;
  const queue = [START];
  for (let i = 0; i < queue.length; i++) {
    for (const n of links[queue[i]]) {
      if (from[n] !== -1) continue;
      from[n] = queue[i];
      queue.push(n);
    }
  }
  if (queue.length !== ROOMS) {
    throw new Error(`only ${queue.length} of ${ROOMS} rooms are reachable`);
  }
  const path = [EXIT];
  while (path[path.length - 1] !== START)
    path.push(from[path[path.length - 1]]);
  return path.reverse();
};

export type Maze = {
  /**
   * The passage each drawing cell was opened by, or -1 for a wall that stays.
   * A room opens with the first passage that touches it.
   */
  readonly openedAt: Int32Array;
  /** The only route, room by room, entrance to exit. */
  readonly route: Int32Array;
  readonly deadEnds: number;
};

const build = (carved: readonly Passage[]): Maze => {
  if (carved.length !== PASSAGES) {
    throw new Error(
      `${carved.length} passages, a perfect maze here has ${PASSAGES}`,
    );
  }
  const links = linksOf(carved);
  const openedAt = new Int32Array(CW * CH).fill(-1);
  carved.forEach(([a, b], i) => {
    for (const c of [roomCell(a), roomCell(b)]) {
      if (openedAt[c] < 0) openedAt[c] = i;
    }
    openedAt[wallCell(a, b)] = i;
  });
  openedAt[ENTRANCE_CELL] = 0;
  openedAt[EXIT_CELL] = 0;
  return {
    openedAt,
    route: Int32Array.from(routeOf(links)),
    deadEnds: links.filter((l) => l.length === 1).length,
  };
};

/**
 * The claim the last beat makes, checked rather than argued.
 *
 * The top row of a binary tree maze can only open east, so it is one straight
 * corridor, and the right column can only open north, so it is another. The
 * route is along the top and down the side, the shortest the grid allows.
 */
const isTopThenSide = (route: Int32Array) => {
  if (route.length !== SHORTEST) return false;
  for (let i = 0; i < route.length; i++) {
    const expected = i < MW ? room(i, 0) : room(MW - 1, i - MW + 1);
    if (route[i] !== expected) return false;
  }
  return true;
};

export type Generator = {
  readonly key: GeneratorKey;
  readonly name: string;
  /** What it does, in words somebody who has never heard the name can use. */
  readonly note: string;
  readonly maze: Maze;
};

/**
 * Grid order.
 *
 * Left column top to bottom, then right: depth-first, whose route is longest,
 * sits top left where the eye starts, and binary tree, whose route is shortest,
 * sits in the left column too, so the verdict can grow both out of the same
 * side of the frame without either crossing the other.
 */
export const GENERATORS: readonly Generator[] = (
  [
    ["depthFirst", "Depth-first", "walks till stuck"],
    ["prim", "Prim's", "grows outward"],
    ["kruskal", "Kruskal's", "joins scraps"],
    ["wilson", "Wilson's", "wanders"],
    ["binaryTree", "Binary tree", "up or right"],
    ["sidewinder", "Sidewinder", "runs, then up"],
  ] as const
).map(([key, name, note]) => {
  const maze = build(GENERATE[key](rng(SEED)));
  const expected = RUNS[key];
  const actual = { deadEnds: maze.deadEnds, route: maze.route.length };
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${key}: ${JSON.stringify(actual)} does not match the measured ${JSON.stringify(expected)}`,
    );
  }
  return { key, name, note, maze };
});

if (!isTopThenSide(GENERATORS[4].maze.route)) {
  throw new Error(
    "the binary tree route is not the top row and the right column",
  );
}

export const byKey = (key: GeneratorKey) => {
  const found = GENERATORS.find((g) => g.key === key);
  if (!found) throw new Error(`no generator ${key}`);
  return found;
};

/**
 * More binary tree mazes, for the last beat.
 *
 * Seeds after the fixture's, each rebuilt here and each checked. The beat
 * swaps the maze under a route that does not move, and a route that moved on
 * any of them would stop the render rather than reach the screen.
 */
export const reshuffled = (count: number): readonly Maze[] =>
  Array.from({ length: count }, (_, i) => {
    const maze = build(binaryTree(rng(SEED + 1 + i)));
    if (!isTopThenSide(maze.route)) {
      throw new Error(`binary tree seed ${SEED + 1 + i} has a different route`);
    }
    return maze;
  });
