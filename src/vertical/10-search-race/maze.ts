import {
  HEIGHT,
  LOOPS,
  MUD_COST,
  OPEN_COST,
  RUNS,
  SEED,
  WIDTH,
  type Run,
  type SearchKey,
} from "./measurements";

/**
 * The maze and the six searches, instrumented.
 *
 * A port of `scripts/measure-pathfinding-race.mjs`. Nothing in a shot searches
 * anything and nothing in a shot invents a count: a panel reads the expansion
 * order and the route out of here, and the totals are asserted against
 * `measurements.ts` at module load, so a port that drifted from the script
 * cannot reach a render.
 *
 * Ground charges to be entered, which makes the graph asymmetric: walking from
 * c to n pays for n, and walking back pays for c. That is not a detail. The
 * search that runs backwards from the exit is not the forward search with its
 * ends swapped, and charging it the wrong cell returned routes that were close
 * to cheapest rather than cheapest.
 */

export const WALL = 0;
export const OPEN = 1;
export const MUD = 2;

const COST = [0, OPEN_COST, MUD_COST];

const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => (s = (s * 1_664_525 + 1_013_904_223) >>> 0) / 4_294_967_296;
};

export const index = (x: number, y: number) => y * WIDTH + x;
export const xOf = (i: number) => i % WIDTH;
export const yOf = (i: number) => Math.floor(i / WIDTH);

const STEPS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

const neighbours = (cells: Uint8Array, c: number) => {
  const x = xOf(c);
  const y = yOf(c);
  const out: number[] = [];
  for (const [dx, dy] of STEPS) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= WIDTH || ny >= HEIGHT) continue;
    const n = index(nx, ny);
    if (cells[n] === WALL) continue;
    out.push(n);
  }
  return out;
};

const carve = () => {
  const random = rng(SEED);
  const cells = new Uint8Array(WIDTH * HEIGHT);
  const mw = (WIDTH - 1) >> 1;
  const mh = (HEIGHT - 1) >> 1;
  const at = (cx: number, cy: number) => index(cx * 2 + 1, cy * 2 + 1);

  const seen = new Uint8Array(mw * mh);
  const stack: [number, number][] = [[0, 0]];
  seen[0] = 1;
  cells[at(0, 0)] = OPEN;

  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const options: [number, number, number, number][] = [];
    for (const [dx, dy] of STEPS) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= mw || ny >= mh) continue;
      if (seen[ny * mw + nx]) continue;
      options.push([nx, ny, dx, dy]);
    }
    if (!options.length) {
      stack.pop();
      continue;
    }
    const [nx, ny, dx, dy] = options[Math.floor(random() * options.length)];
    seen[ny * mw + nx] = 1;
    cells[at(nx, ny)] = OPEN;
    cells[index(cx * 2 + 1 + dx, cy * 2 + 1 + dy)] = OPEN;
    stack.push([nx, ny]);
  }

  const candidates: number[] = [];
  for (let y = 1; y < HEIGHT - 1; y++) {
    for (let x = 1; x < WIDTH - 1; x++) {
      if (cells[index(x, y)] !== WALL) continue;
      const horizontal =
        cells[index(x - 1, y)] !== WALL && cells[index(x + 1, y)] !== WALL;
      const vertical =
        cells[index(x, y - 1)] !== WALL && cells[index(x, y + 1)] !== WALL;
      if (horizontal !== vertical) candidates.push(index(x, y));
    }
  }
  for (const c of candidates) if (random() < LOOPS) cells[c] = OPEN;

  const open: number[] = [];
  for (let i = 0; i < cells.length; i++) if (cells[i] === OPEN) open.push(i);
  const wanted = Math.round(open.length * 0.22);
  let mud = 0;
  while (mud < wanted) {
    let c = open[Math.floor(random() * open.length)];
    const run = 2 + Math.floor(random() * 4);
    for (let k = 0; k < run && mud < wanted; k++) {
      if (cells[c] === OPEN) {
        cells[c] = MUD;
        mud++;
      }
      const next = neighbours(cells, c);
      if (!next.length) break;
      c = next[Math.floor(random() * next.length)];
    }
  }

  return cells;
};

export const CELLS = carve();
export const START = index(1, 1);
export const GOAL = index(WIDTH - 2, HEIGHT - 2);
CELLS[START] = OPEN;
CELLS[GOAL] = OPEN;

const manhattan = (a: number, b: number) =>
  Math.abs(xOf(a) - xOf(b)) + Math.abs(yOf(a) - yOf(b));

const costOf = (path: readonly number[]) =>
  path.slice(1).reduce((total, c) => total + COST[CELLS[c]], 0);

const rebuild = (cameFrom: Map<number, number>, end: number) => {
  const path = [end];
  let c = end;
  for (;;) {
    const parent = cameFrom.get(c);
    if (parent === undefined) break;
    c = parent;
    path.push(c);
  }
  return path.reverse();
};

const heap = () => {
  const a: [number, number, number][] = [];
  let tick = 0;
  const less = (i: number, j: number) =>
    a[i][0] !== a[j][0] ? a[i][0] < a[j][0] : a[i][1] < a[j][1];
  return {
    get size() {
      return a.length;
    },
    peek: () => (a.length ? a[0][0] : Infinity),
    push(key: number, value: number) {
      a.push([key, tick++, value]);
      let i = a.length - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (!less(i, p)) break;
        [a[i], a[p]] = [a[p], a[i]];
        i = p;
      }
    },
    pop() {
      const top = a[0];
      const last = a.pop() as [number, number, number];
      if (a.length) {
        a[0] = last;
        let i = 0;
        for (;;) {
          const l = 2 * i + 1;
          const r = l + 1;
          let m = i;
          if (l < a.length && less(l, m)) m = l;
          if (r < a.length && less(r, m)) m = r;
          if (m === i) break;
          [a[i], a[m]] = [a[m], a[i]];
          i = m;
        }
      }
      return top[2];
    },
  };
};

type Result = { order: number[]; path: number[] };

const search = (mode: Exclude<SearchKey, "bidirectional">): Result => {
  const order: number[] = [];
  const cameFrom = new Map<number, number>();
  const g = new Map<number, number>([[START, 0]]);
  const seen = new Set<number>([START]);
  const done = new Set<number>();
  const h = (c: number) =>
    mode === "bfs" || mode === "dijkstra" ? 0 : manhattan(c, GOAL);
  const weighted = mode === "dijkstra" || mode === "astar";

  if (mode === "dfs") {
    const stack: [number, number][] = [[START, -1]];
    while (stack.length) {
      const [c, parent] = stack.pop() as [number, number];
      if (done.has(c)) continue;
      if (parent !== -1) cameFrom.set(c, parent);
      done.add(c);
      order.push(c);
      if (c === GOAL) break;
      for (const n of neighbours(CELLS, c)) {
        if (done.has(n)) continue;
        stack.push([n, c]);
      }
    }
  } else if (mode === "bfs") {
    let queue = [START];
    let stop = false;
    while (queue.length && !stop) {
      const next: number[] = [];
      for (const c of queue) {
        if (done.has(c)) continue;
        done.add(c);
        order.push(c);
        if (c === GOAL) {
          stop = true;
          break;
        }
        for (const n of neighbours(CELLS, c)) {
          if (seen.has(n)) continue;
          seen.add(n);
          cameFrom.set(n, c);
          next.push(n);
        }
      }
      queue = next;
    }
  } else {
    const open = heap();
    open.push(h(START), START);
    while (open.size) {
      const c = open.pop();
      if (done.has(c)) continue;
      done.add(c);
      order.push(c);
      if (c === GOAL) break;
      for (const n of neighbours(CELLS, c)) {
        if (done.has(n)) continue;
        const step = weighted ? COST[CELLS[n]] : 1;
        const tentative = (g.get(c) as number) + step;
        if (mode === "greedy") {
          if (seen.has(n)) continue;
          seen.add(n);
          cameFrom.set(n, c);
          open.push(h(n), n);
        } else if (!g.has(n) || tentative < (g.get(n) as number)) {
          g.set(n, tentative);
          cameFrom.set(n, c);
          open.push(tentative + h(n), n);
        }
      }
    }
  }

  return { order, path: done.has(GOAL) ? rebuild(cameFrom, GOAL) : [] };
};

const bidirectional = (): Result => {
  const side = (from: number) => {
    const open = heap();
    open.push(0, from);
    return {
      open,
      g: new Map<number, number>([[from, 0]]),
      cameFrom: new Map<number, number>(),
      done: new Set<number>(),
    };
  };
  const f = side(START);
  const b = side(GOAL);
  const order: number[] = [];
  let best = Infinity;
  let meetF = -1;
  let meetB = -1;

  const record = (
    near: number,
    far: number,
    total: number,
    forward: boolean,
  ) => {
    best = total;
    meetF = forward ? near : far;
    meetB = forward ? far : near;
  };

  const expand = (near: typeof f, far: typeof f, forward: boolean) => {
    const c = near.open.pop();
    if (near.done.has(c)) return;
    near.done.add(c);
    order.push(c);

    if (far.done.has(c)) {
      const total = (near.g.get(c) as number) + (far.g.get(c) as number);
      if (total < best) record(c, c, total, forward);
    }

    for (const n of neighbours(CELLS, c)) {
      const step = forward ? COST[CELLS[n]] : COST[CELLS[c]];
      const tentative = (near.g.get(c) as number) + step;
      if (
        !near.done.has(n) &&
        (!near.g.has(n) || tentative < (near.g.get(n) as number))
      ) {
        near.g.set(n, tentative);
        near.cameFrom.set(n, c);
        near.open.push(tentative, n);
      }
      if (far.done.has(n)) {
        const total = forward
          ? (near.g.get(c) as number) +
            COST[CELLS[n]] +
            (far.g.get(n) as number)
          : (far.g.get(n) as number) +
            COST[CELLS[c]] +
            (near.g.get(c) as number);
        if (total < best) record(c, n, total, forward);
      }
    }
  };

  while (f.open.size && b.open.size) {
    if (f.open.peek() + b.open.peek() >= best) break;
    if (f.open.peek() <= b.open.peek()) expand(f, b, true);
    else expand(b, f, false);
  }

  const head = rebuild(f.cameFrom, meetF);
  const tail = rebuild(b.cameFrom, meetB).reverse();
  return {
    order,
    path: meetF === meetB ? [...head, ...tail.slice(1)] : [...head, ...tail],
  };
};

export type Playback = {
  readonly key: SearchKey;
  readonly run: Run;
  /** Expansion index each cell was taken off the frontier at, or -1. */
  readonly visitedAt: Int32Array;
  /** The cells in the order they were expanded. */
  readonly order: Int32Array;
  /** The route it returned, start to exit. */
  readonly path: Int32Array;
  /** What the route has charged by each step along it. */
  readonly prefixCost: Int32Array;
  /** How many mud cells the route has entered by each step along it. */
  readonly prefixMud: Int32Array;
};

const build = (key: SearchKey, result: Result): Playback => {
  const expected = RUNS[key];
  const actual = {
    expansions: result.order.length,
    steps: result.path.length - 1,
    cost: costOf(result.path),
    mudSteps: result.path.slice(1).filter((c) => CELLS[c] === MUD).length,
  };
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${key}: ${JSON.stringify(actual)} does not match the measured ` +
        JSON.stringify(expected),
    );
  }
  for (let i = 1; i < result.path.length; i++) {
    if (manhattan(result.path[i - 1], result.path[i]) !== 1) {
      throw new Error(`${key} route jumps between cells that do not touch`);
    }
    if (CELLS[result.path[i]] === WALL) throw new Error(`${key} walks a wall`);
  }
  if (
    result.path[0] !== START ||
    result.path[result.path.length - 1] !== GOAL
  ) {
    throw new Error(`${key} route does not join the start to the exit`);
  }

  const visitedAt = new Int32Array(WIDTH * HEIGHT).fill(-1);
  result.order.forEach((c, i) => {
    visitedAt[c] = i;
  });

  return {
    key,
    run: expected,
    visitedAt,
    order: Int32Array.from(result.order),
    path: Int32Array.from(result.path),
    prefixCost: Int32Array.from(
      result.path.map((_, i) => costOf(result.path.slice(0, i + 1))),
    ),
    prefixMud: Int32Array.from(
      result.path.map(
        (_, i) =>
          result.path.slice(1, i + 1).filter((c) => CELLS[c] === MUD).length,
      ),
    ),
  };
};

export type Search = {
  readonly key: SearchKey;
  readonly name: string;
  readonly note: string;
  readonly playback: Playback;
};

/**
 * Grid order, and it is an argument rather than a list.
 *
 * The three that price the ground sit on the right and the three that do not
 * sit on the left, so the column a panel is in predicts whether its route is
 * the cheapest one before a single number has been read.
 */
export const SEARCHES: readonly Search[] = (
  [
    ["dfs", "Depth-first", "dives"],
    ["dijkstra", "Dijkstra", "prices every step"],
    ["bfs", "Breadth-first", "counts steps"],
    ["astar", "A*", "prices, and aims"],
    ["greedy", "Greedy", "aims only"],
    ["bidirectional", "Bidirectional", "both ends at once"],
  ] as const
).map(([key, name, note]) => ({
  key,
  name,
  note,
  playback: build(
    key,
    key === "bidirectional"
      ? bidirectional()
      : search(key as Exclude<SearchKey, "bidirectional">),
  ),
}));

export const byKey = (key: SearchKey) => {
  const found = SEARCHES.find((s) => s.key === key);
  if (!found) throw new Error(`no search ${key}`);
  return found;
};
