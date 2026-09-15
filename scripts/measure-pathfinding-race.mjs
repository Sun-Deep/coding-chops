#!/usr/bin/env node

// Six searches, one map, one shared unit of work.
//
// The reel puts all six on screen at once and expands the same number of cells
// per frame in every panel, so the order they reach the goal in is the claim.
// That only means anything if "one unit of work" is the same thing in all six,
// which is what this script exists to pin down.
//
// A cell is expanded when it comes off the frontier and its neighbours are
// looked at. That is the standard unit for comparing search algorithms and it
// is the one thing all six of these do identically. Pushes onto the frontier
// are not counted, and neither is anything about wall-clock speed: an
// expansion is a property of the algorithm and a millisecond is a property of
// the laptop.
//
// The map is weighted. Open ground costs 1 to enter and rough ground costs 4,
// which is the whole reason Dijkstra is worth drawing next to breadth-first
// search: on a map where every step costs the same they expand in the same
// order and the panels would be the same picture twice.

const WIDTH = Number(process.env.W ?? 51);
const HEIGHT = Number(process.env.H ?? 25);
/**
 * The map.
 *
 * Chosen from a sweep rather than picked at random: most seeds produce a maze
 * where the cheapest route and the shortest route are nearly the same, and
 * there is then nothing to see. This one forces a real detour. The map is a
 * fixture, and the behaviour it shows is not a property of it. Run this script
 * with SWEEP=1 for the distribution across two hundred maps.
 */
const SEED = Number(process.env.SEED ?? 21);
/** Interior walls knocked out after carving, as a fraction of those standing. */
const LOOPS = Number(process.env.LOOPS ?? 0.18);
/** Share of open cells that are rough ground. */
const ROUGH_SHARE = Number(process.env.ROUGH_SHARE ?? 0.22);
const QUIET = process.env.QUIET === "1";

const WALL = 0;
const OPEN = 1;
const ROUGH = 2;

const ROUGH_COST = Number(process.env.ROUGH_COST ?? 9);
const COST = { [OPEN]: 1, [ROUGH]: ROUGH_COST };

const rng = (seed) => {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
};

/**
 * Recursive backtracker, then loops.
 *
 * A cave generator was tried first and every setting of it converged on one
 * open cavern: the shortest route came out at 62 steps against a Manhattan
 * distance of 60, so nothing was forced to detour and greedy best-first walked
 * a straight line to the goal in 61 expansions. A search cut needs a map that
 * can punish a wrong guess.
 *
 * Walls are knocked out afterwards to put loops in. A perfect maze has exactly
 * one route between any two cells, which makes every optimal search agree by
 * construction and leaves the rough ground with nothing to change. Loops give
 * the weighted searches a real choice to get right.
 */
const carveMaze = (random) => {
  const cells = new Uint8Array(WIDTH * HEIGHT); // 0 = wall
  const mw = (WIDTH - 1) >> 1;
  const mh = (HEIGHT - 1) >> 1;
  const at = (cx, cy) => index(cx * 2 + 1, cy * 2 + 1);

  const seen = new Uint8Array(mw * mh);
  const stack = [[0, 0]];
  seen[0] = 1;
  cells[at(0, 0)] = OPEN;

  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const options = [];
    for (const [dx, dy] of NEIGHBOURS) {
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

  // Loops. Only interior walls with open ground on exactly two opposite sides
  // qualify, so knocking one out joins two corridors rather than opening a room.
  const candidates = [];
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
  for (const c of candidates) {
    if (random() < LOOPS) cells[c] = OPEN;
  }

  // Rough ground, in short runs rather than single cells, so it reads as
  // terrain at the size a panel draws it.
  const open = [];
  for (let i = 0; i < cells.length; i++) if (cells[i] === OPEN) open.push(i);
  const wanted = Math.round(open.length * ROUGH_SHARE);
  let rough = 0;
  while (rough < wanted) {
    let c = open[Math.floor(random() * open.length)];
    const run = 2 + Math.floor(random() * 4);
    for (let k = 0; k < run && rough < wanted; k++) {
      if (cells[c] === OPEN) {
        cells[c] = ROUGH;
        rough++;
      }
      const next = neighboursOf(cells, c);
      if (!next.length) break;
      c = next[Math.floor(random() * next.length)];
    }
  }

  return cells;
};

const index = (x, y) => y * WIDTH + x;
const NEIGHBOURS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const buildMap = (seed) => {
  const random = rng(seed);
  const cells = carveMaze(random);

  const start = index(1, 1);
  const goal = index(WIDTH - 2, HEIGHT - 2);
  cells[start] = OPEN;
  cells[goal] = OPEN;

  let open = 0;
  for (let i = 0; i < cells.length; i++) if (cells[i] !== WALL) open++;
  return { cells, start, goal, open };
};

const xy = (i) => [i % WIDTH, Math.floor(i / WIDTH)];

const manhattan = (a, b) => {
  const [ax, ay] = xy(a);
  const [bx, by] = xy(b);
  return Math.abs(ax - bx) + Math.abs(ay - by);
};

const neighboursOf = (cells, c) => {
  const [x, y] = xy(c);
  const out = [];
  for (const [dx, dy] of NEIGHBOURS) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= WIDTH || ny >= HEIGHT) continue;
    const n = index(nx, ny);
    if (cells[n] === WALL) continue;
    out.push(n);
  }
  return out;
};

/** Cost of walking a path: what each cell charges to enter it. */
const costOf = (cells, path) =>
  path.slice(1).reduce((total, c) => total + COST[cells[c]], 0);

const rebuild = (cameFrom, goal) => {
  const path = [goal];
  let c = goal;
  while (cameFrom.get(c) !== undefined) {
    c = cameFrom.get(c);
    path.push(c);
  }
  return path.reverse();
};

/** Binary heap keyed on a number. Ties broken by insertion order, so a run
 *  reproduces exactly rather than depending on the sort's stability. */
const heap = () => {
  const a = [];
  let tick = 0;
  const less = (i, j) =>
    a[i][0] !== a[j][0] ? a[i][0] < a[j][0] : a[i][1] < a[j][1];
  return {
    get size() {
      return a.length;
    },
    peek() {
      return a.length ? a[0][0] : Infinity;
    },
    push(key, value) {
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
      const last = a.pop();
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

const search = (cells, start, goal, mode) => {
  const order = [];
  const cameFrom = new Map();
  const g = new Map([[start, 0]]);
  const seen = new Set([start]);
  const done = new Set();

  const h = (c) =>
    mode === "bfs" || mode === "dijkstra" ? 0 : manhattan(c, goal);
  const weighted = mode === "dijkstra" || mode === "astar";

  if (mode === "dfs") {
    // The parent travels on the stack with the cell and is recorded when the
    // cell is taken off it, not when it goes on. A cell is pushed once per
    // neighbour that sees it, so recording the parent at push time lets the
    // last writer win and leaves a `cameFrom` chain that does not join start to
    // goal. That is a wrong path on screen, and it only shows on some maps.
    const stack = [[start, -1]];
    while (stack.length) {
      const [c, parent] = stack.pop();
      if (done.has(c)) continue;
      if (parent !== -1) cameFrom.set(c, parent);
      done.add(c);
      order.push(c);
      if (c === goal) break;
      for (const n of neighboursOf(cells, c)) {
        if (done.has(n)) continue;
        stack.push([n, c]);
      }
    }
  } else if (mode === "bfs") {
    let queue = [start];
    while (queue.length) {
      const next = [];
      let stop = false;
      for (const c of queue) {
        if (done.has(c)) continue;
        done.add(c);
        order.push(c);
        if (c === goal) {
          stop = true;
          break;
        }
        for (const n of neighboursOf(cells, c)) {
          if (seen.has(n)) continue;
          seen.add(n);
          cameFrom.set(n, c);
          next.push(n);
        }
      }
      if (stop) break;
      queue = next;
    }
  } else {
    const open = heap();
    open.push(h(start), start);
    while (open.size) {
      const c = open.pop();
      if (done.has(c)) continue;
      done.add(c);
      order.push(c);
      if (c === goal) break;
      for (const n of neighboursOf(cells, c)) {
        if (done.has(n)) continue;
        const step = weighted ? COST[cells[n]] : 1;
        const tentative = g.get(c) + step;
        if (mode === "greedy") {
          if (seen.has(n)) continue;
          seen.add(n);
          cameFrom.set(n, c);
          open.push(h(n), n);
        } else if (!g.has(n) || tentative < g.get(n)) {
          g.set(n, tentative);
          cameFrom.set(n, c);
          open.push(tentative + h(n), n);
        }
      }
    }
  }

  const path = done.has(goal) ? rebuild(cameFrom, goal) : [];
  return {
    order,
    expansions: order.length,
    path,
    steps: path.length - 1,
    cost: costOf(cells, path),
  };
};

/**
 * Both ends at once.
 *
 * Dijkstra from each end rather than plain breadth-first search, so it agrees
 * with the other weighted searches about what "cheapest" means and the
 * optimality assertion at the bottom of this file is a real check rather than
 * a comparison of two different questions.
 *
 * The meeting is tracked as an edge, not a cell, and that is the whole
 * difficulty. A shortest path has to cross from the half one search has
 * settled to the half the other has, but the crossing is an edge, and its two
 * ends can be settled on opposite sides without either search ever settling a
 * cell the other has settled. Two earlier versions here checked only for a
 * cell settled by both, stopped as soon as the frontier keys could not beat
 * the best crossing they had seen, and returned 132 where Dijkstra returned
 * 129 on the map from seed 3. A near-optimal route is the one thing this
 * format cannot ship, and it is invisible unless something checks.
 *
 * Both ends of a counted crossing are settled, so both distances are final.
 */
const bidirectional = (cells, start, goal) => {
  const side = (from) => {
    const open = heap();
    open.push(0, from);
    return {
      open,
      g: new Map([[from, 0]]),
      cameFrom: new Map(),
      done: new Set(),
    };
  };
  const f = side(start);
  const b = side(goal);

  const order = [];
  let best = Infinity;
  let meetF = -1;
  let meetB = -1;

  const record = (near, far, total, forward) => {
    best = total;
    meetF = forward ? near : far;
    meetB = forward ? far : near;
  };

  const expand = (near, far, forward) => {
    const c = near.open.pop();
    if (near.done.has(c)) return;
    near.done.add(c);
    order.push(c);

    if (far.done.has(c)) {
      const total = near.g.get(c) + far.g.get(c);
      if (total < best) record(c, c, total, forward);
    }

    for (const n of neighboursOf(cells, c)) {
      // Ground charges to be entered, so the graph is not symmetric: walking
      // c to n pays for n, and walking n to c pays for c. The search running
      // backwards from the goal is therefore not the same search with the ends
      // swapped, and charging it `COST[n]` like the forward one makes every
      // distance it computes wrong. That is what returned a route costing 132
      // where the cheapest is 129.
      const step = forward ? COST[cells[n]] : COST[cells[c]];
      const tentative = near.g.get(c) + step;
      if (!near.done.has(n) && (!near.g.has(n) || tentative < near.g.get(n))) {
        near.g.set(n, tentative);
        near.cameFrom.set(n, c);
        near.open.push(tentative, n);
      }
      if (far.done.has(n)) {
        // The crossing, written as a forward step whichever side found it.
        const total = forward
          ? near.g.get(c) + COST[cells[n]] + far.g.get(n)
          : far.g.get(n) + COST[cells[c]] + near.g.get(c);
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
  const path =
    meetF === meetB ? [...head, ...tail.slice(1)] : [...head, ...tail];
  return {
    order,
    expansions: order.length,
    path,
    steps: path.length - 1,
    cost: costOf(cells, path),
  };
};

const map = buildMap(SEED);
const { cells, start, goal } = map;
void map;

const RUNS = [
  ["dfs", () => search(cells, start, goal, "dfs")],
  ["bfs", () => search(cells, start, goal, "bfs")],
  ["dijkstra", () => search(cells, start, goal, "dijkstra")],
  ["greedy", () => search(cells, start, goal, "greedy")],
  ["astar", () => search(cells, start, goal, "astar")],
  ["bidirectional", () => bidirectional(cells, start, goal)],
];

const results = RUNS.map(([name, run]) => {
  const r = run();
  return {
    name,
    ...r,
    // Where the cost actually is. A route's price is its clear steps plus nine
    // for every muddy one, and putting that split on screen is what turns two
    // lines on a map into an explanation.
    mudSteps: r.path.slice(1).filter((c) => cells[c] === ROUGH).length,
  };
});

for (const r of results) {
  if (r.path.length === 0) throw new Error(`${name} found no path`);
  if (r.path[0] !== start || r.path.at(-1) !== goal) {
    throw new Error(
      `${r.name} returned a path that does not join start to goal`,
    );
  }
  for (let i = 1; i < r.path.length; i++) {
    if (manhattan(r.path[i - 1], r.path[i]) !== 1) {
      throw new Error(`${r.name} path jumps between non-adjacent cells`);
    }
    if (cells[r.path[i]] === WALL) throw new Error(`${r.name} walks a wall`);
  }
}

const by = Object.fromEntries(results.map((r) => [r.name, r]));

// Dijkstra is the reference for cheapest. A* and bidirectional must agree.
for (const name of ["astar", "bidirectional"]) {
  if (by[name].cost !== by.dijkstra.cost) {
    throw new Error(
      `${name} cost ${by[name].cost} disagrees with dijkstra ${by.dijkstra.cost}`,
    );
  }
}
// Breadth-first is the reference for fewest steps.
if (by.dijkstra.steps < by.bfs.steps) {
  throw new Error("dijkstra found fewer steps than breadth-first search");
}

/**
 * The figures `src/vertical/10-search-race/measurements.ts` is built from.
 *
 * A change to the map, the seed, the rough cost or any implementation moves
 * these, and moving them silently would leave the reel stating numbers no run
 * produces.
 */
const EXPECTED = {
  dfs: { expansions: 586, steps: 364, cost: 1_044, mudSteps: 85 },
  bfs: { expansions: 658, steps: 74, cost: 234, mudSteps: 20 },
  dijkstra: { expansions: 583, steps: 98, cost: 114, mudSteps: 2 },
  greedy: { expansions: 99, steps: 78, cost: 254, mudSteps: 22 },
  astar: { expansions: 469, steps: 98, cost: 114, mudSteps: 2 },
  bidirectional: { expansions: 527, steps: 98, cost: 114, mudSteps: 2 },
};

if (
  WIDTH === 51 &&
  HEIGHT === 25 &&
  SEED === 21 &&
  ROUGH_COST === 9 &&
  LOOPS === 0.18
) {
  for (const r of results) {
    const actual = {
      expansions: r.expansions,
      steps: r.steps,
      cost: r.cost,
      mudSteps: r.mudSteps,
    };
    if (JSON.stringify(actual) !== JSON.stringify(EXPECTED[r.name])) {
      throw new Error(
        `${r.name} changed: ${JSON.stringify(actual)} is not ` +
          JSON.stringify(EXPECTED[r.name]),
      );
    }
  }
}

for (const r of results) {
  const clear = r.steps - r.mudSteps;
  if (clear * COST[OPEN] + r.mudSteps * COST[ROUGH] !== r.cost) {
    throw new Error(
      `${r.name}: ${clear} clear + ${r.mudSteps} mud does not make ${r.cost}`,
    );
  }
}

const open = [...cells].filter((c) => c !== WALL).length;
const rough = [...cells].filter((c) => c === ROUGH).length;

console.log(`map ${WIDTH}x${HEIGHT}, seed ${SEED}`);
console.log(
  `${open} open cells of ${WIDTH * HEIGHT}, ${rough} of them rough (cost ${ROUGH_COST})`,
);
console.log(`start ${xy(start)}, goal ${xy(goal)}\n`);

const w = Math.max(...results.map((r) => r.name.length));
for (const r of results) {
  console.log(
    `${r.name.padEnd(w)}  expanded=${String(r.expansions).padStart(4)}` +
      `  steps=${String(r.steps).padStart(3)}` +
      `  mud=${String(r.mudSteps).padStart(3)}` +
      `  cost=${String(r.cost).padStart(4)}`,
  );
}

if (!QUIET) {
  for (let y = 0; y < HEIGHT; y++) {
    let line = "";
    for (let x = 0; x < WIDTH; x++) {
      const i = index(x, y);
      line +=
        i === start
          ? "S"
          : i === goal
            ? "G"
            : cells[i] === WALL
              ? "#"
              : cells[i] === ROUGH
                ? ","
                : ".";
    }
    console.log(line);
  }
}

/**
 * The distribution, so the chosen map is illustrative rather than load-bearing.
 *
 * Every map is a fresh maze from a fresh seed. The three weighted searches are
 * asserted against each other on every one of them by the checks above, which
 * run per map, so this doubles as a correctness sweep.
 */
if (process.env.SWEEP === "1") {
  const ratios = [];
  const greedyRatios = [];
  let maps = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const m = buildMap(seed);
    const run = (mode) => search(m.cells, m.start, m.goal, mode);
    const d = run("dijkstra");
    const bf = run("bfs");
    const gr = run("greedy");
    const as = run("astar");
    const bi = bidirectional(m.cells, m.start, m.goal);
    if (as.cost !== d.cost || bi.cost !== d.cost) {
      throw new Error(`seed ${seed}: weighted searches disagree on cheapest`);
    }
    if (bf.cost < d.cost) throw new Error(`seed ${seed}: bfs beat dijkstra`);
    if (bf.steps > d.steps)
      throw new Error(`seed ${seed}: dijkstra took fewer steps`);
    ratios.push(bf.cost / d.cost);
    greedyRatios.push(gr.cost / d.cost);
    maps++;
  }
  const stat = (a) => {
    const v = [...a].sort((x, y) => x - y);
    return {
      min: v[0].toFixed(2),
      median: v[Math.floor(v.length / 2)].toFixed(2),
      max: v.at(-1).toFixed(2),
    };
  };
  const r = stat(ratios);
  const g = stat(greedyRatios);
  console.log(`\nsweep over ${maps} maps`);
  console.log(
    `  breadth-first route cost against cheapest: min ${r.min}, median ${r.median}, max ${r.max}`,
  );
  console.log(
    `  greedy route cost against cheapest:        min ${g.min}, median ${g.median}, max ${g.max}`,
  );
  console.log(
    "  A*, bidirectional and Dijkstra agreed on the cheapest route on every map",
  );
}
