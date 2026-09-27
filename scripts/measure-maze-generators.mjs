#!/usr/bin/env node

// Six maze generators, one grid, one seed.
//
// Every generator here makes a perfect maze: one route between any two rooms,
// no loops, nothing walled off. On a grid of W by H rooms that is a spanning
// tree, so every one of them opens exactly W*H - 1 walls. The script asserts
// that for every maze it builds. It is what makes the six comparable: they all
// knock down the same number of walls, and the only thing that differs is
// which walls.
//
// What is counted, per maze:
//
//   dead ends   rooms with exactly one way in or out
//   junctions   rooms with three or four
//   route       rooms walked from the top left room to the bottom right one,
//               both ends included, on the only route there is
//   wrong turns junctions on that route where a solver has a choice
//
// Counts, never times. A dead end is a property of the maze and a millisecond is
// a property of the laptop, so nothing here is timed and the machine cannot
// move a single figure.
//
// Each generator gets its own random stream from the same seed, so the six are
// independent: one of them consuming more numbers does not change another.

const MW = Number(process.env.MW ?? 25);
const MH = Number(process.env.MH ?? 12);
const SEED = Number(process.env.SEED ?? 10);
const SWEEP = Number(process.env.SWEEP ?? 1000);

const ROOMS = MW * MH;
const START = 0;
const EXIT = ROOMS - 1;

const rng = (seed) => {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
};

const room = (x, y) => y * MW + x;
const xOf = (r) => r % MW;
const yOf = (r) => Math.floor(r / MW);

/** Rooms that share a wall with r, in a fixed order. */
const around = (r) => {
  const x = xOf(r);
  const y = yOf(r);
  const out = [];
  if (y > 0) out.push(room(x, y - 1));
  if (x < MW - 1) out.push(room(x + 1, y));
  if (y < MH - 1) out.push(room(x, y + 1));
  if (x > 0) out.push(room(x - 1, y));
  return out;
};

const pick = (random, list) => list[Math.floor(random() * list.length)];

// Each generator returns the passages it opened, in the order it opened them,
// as [from, to] pairs, plus how many steps of work it took to find them.

/** Walk until stuck, then back up to the last room with an unvisited neighbour. */
const depthFirst = (random) => {
  const seen = new Uint8Array(ROOMS);
  const stack = [START];
  seen[START] = 1;
  const carved = [];
  let work = 0;
  while (stack.length) {
    work++;
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
  return { carved, work };
};

/**
 * Randomised Prim's, the frontier version.
 *
 * Keep a list of rooms touching the maze. Take one at random and join it to a
 * random neighbour already in the maze.
 */
const prim = (random) => {
  const inMaze = new Uint8Array(ROOMS);
  const onFrontier = new Uint8Array(ROOMS);
  const frontier = [];
  const add = (r) => {
    inMaze[r] = 1;
    for (const n of around(r)) {
      if (!inMaze[n] && !onFrontier[n]) {
        onFrontier[n] = 1;
        frontier.push(n);
      }
    }
  };
  add(START);
  const carved = [];
  let work = 0;
  while (frontier.length) {
    work++;
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
  return { carved, work };
};

/** Every wall in a random order; knock it down if it separates two pieces. */
const kruskal = (random) => {
  const walls = [];
  for (let r = 0; r < ROOMS; r++) {
    if (xOf(r) < MW - 1) walls.push([r, r + 1]);
    if (yOf(r) < MH - 1) walls.push([r, r + MW]);
  }
  for (let i = walls.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [walls[i], walls[j]] = [walls[j], walls[i]];
  }
  const parent = Int32Array.from({ length: ROOMS }, (_, i) => i);
  const find = (a) => {
    while (parent[a] !== a) {
      parent[a] = parent[parent[a]];
      a = parent[a];
    }
    return a;
  };
  const carved = [];
  let work = 0;
  for (const [a, b] of walls) {
    work++;
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) continue;
    parent[ra] = rb;
    carved.push([a, b]);
    if (carved.length === ROOMS - 1) break;
  }
  return { carved, work, walls: walls.length };
};

/**
 * Wilson's.
 *
 * Start with one room in the maze. From a room not yet in it, wander at random
 * until the walk hits the maze, erasing any loop the walk makes in itself, then
 * add the walk. Every possible maze on the grid is equally likely to come out.
 */
const wilson = (random) => {
  const inMaze = new Uint8Array(ROOMS);
  inMaze[
    pick(
      random,
      Array.from({ length: ROOMS }, (_, i) => i),
    )
  ] = 1;
  const next = new Int32Array(ROOMS).fill(-1);
  const carved = [];
  let work = 0;
  let erased = 0;
  for (let s = 0; s < ROOMS; s++) {
    if (inMaze[s]) continue;
    // Walk, remembering only the last way out of each room. Overwriting it is
    // the loop erasure: a loop is forgotten the moment the walk leaves a room
    // by a different door.
    let r = s;
    let steps = 0;
    while (!inMaze[r]) {
      const n = pick(random, around(r));
      next[r] = n;
      r = n;
      steps++;
      work++;
    }
    let kept = 0;
    r = s;
    while (!inMaze[r]) {
      inMaze[r] = 1;
      carved.push([r, next[r]]);
      r = next[r];
      kept++;
    }
    erased += steps - kept;
  }
  return { carved, work, erased };
};

/** At every room, open north or east. The top row can only go east, the right column only north. */
const binaryTree = (random) => {
  const carved = [];
  let work = 0;
  for (let y = 0; y < MH; y++) {
    for (let x = 0; x < MW; x++) {
      work++;
      const r = room(x, y);
      const options = [];
      if (y > 0) options.push(room(x, y - 1));
      if (x < MW - 1) options.push(room(x + 1, y));
      if (!options.length) continue;
      carved.push([r, pick(random, options)]);
    }
  }
  return { carved, work };
};

/**
 * Sidewinder.
 *
 * Row by row. Carve east and grow a run, or close the run by opening one door
 * north from a random room in it. The top row cannot go north, so it is one run.
 */
const sidewinder = (random) => {
  const carved = [];
  let work = 0;
  for (let y = 0; y < MH; y++) {
    let run = [];
    for (let x = 0; x < MW; x++) {
      work++;
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
  return { carved, work };
};

const GENERATORS = [
  ["depthFirst", "Depth-first", depthFirst],
  ["prim", "Prim's", prim],
  ["kruskal", "Kruskal's", kruskal],
  ["wilson", "Wilson's", wilson],
  ["binaryTree", "Binary tree", binaryTree],
  ["sidewinder", "Sidewinder", sidewinder],
];

/** Openings per room, and an adjacency list. */
const graphOf = (carved) => {
  const links = Array.from({ length: ROOMS }, () => []);
  for (const [a, b] of carved) {
    const dx = Math.abs(xOf(a) - xOf(b));
    const dy = Math.abs(yOf(a) - yOf(b));
    if (dx + dy !== 1)
      throw new Error(`passage ${a}-${b} joins rooms that do not touch`);
    if (links[a].includes(b)) throw new Error(`passage ${a}-${b} opened twice`);
    links[a].push(b);
    links[b].push(a);
  }
  return links;
};

/** The only route from START to EXIT, by breadth-first search. */
const routeOf = (links) => {
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
  if (queue.length !== ROOMS)
    throw new Error(`only ${queue.length} of ${ROOMS} rooms are reachable`);
  const path = [EXIT];
  while (path[path.length - 1] !== START)
    path.push(from[path[path.length - 1]]);
  return path.reverse();
};

const measure = (carved) => {
  if (carved.length !== ROOMS - 1) {
    throw new Error(
      `${carved.length} passages, a perfect maze on ${ROOMS} rooms has ${ROOMS - 1}`,
    );
  }
  const links = graphOf(carved);
  const route = routeOf(links);
  const degree = links.map((l) => l.length);
  const deadEnds = degree.filter((d) => d === 1).length;
  const junctions = degree.filter((d) => d >= 3).length;
  // A choice on the route: any room on it, other than the start, with a door
  // the route does not use besides the one it came in by.
  let choices = 0;
  for (let i = 1; i < route.length - 1; i++)
    if (degree[route[i]] >= 3) choices++;
  if (degree[START] >= 2) choices++;
  const moves = route
    .slice(1)
    .map((r, i) => [xOf(r) - xOf(route[i]), yOf(r) - yOf(route[i])]);
  return {
    deadEnds,
    junctions,
    route: route.length,
    choices,
    upMoves: moves.filter(([, dy]) => dy < 0).length,
    leftMoves: moves.filter(([dx]) => dx < 0).length,
    path: route,
  };
};

/**
 * The claim the cut makes about a binary tree maze, checked rather than argued.
 *
 * The top row can only open east, so it is one straight corridor. The right
 * column can only open north, so it is another. The route from the top left
 * room to the bottom right one is therefore along the top and down the side,
 * the shortest a route across this grid can possibly be.
 */
const checkBinaryTree = (m) => {
  const expected = [];
  for (let x = 0; x < MW; x++) expected.push(room(x, 0));
  for (let y = 1; y < MH; y++) expected.push(room(MW - 1, y));
  if (m.path.join() !== expected.join()) {
    throw new Error(
      "binary tree route is not the top row and the right column",
    );
  }
};

const summary = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const median =
    sorted.length % 2
      ? sorted[(sorted.length - 1) / 2]
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  return { mean, median, min: sorted[0], max: sorted[sorted.length - 1] };
};

const pct = (n) => ((n / ROOMS) * 100).toFixed(1);

console.log(`grid ${MW}x${MH} rooms, ${ROOMS} rooms, seed ${SEED}`);
const walls = MW * (MH - 1) + MH * (MW - 1);
console.log(
  `${walls} interior walls, every perfect maze opens ${ROOMS - 1} of them and leaves ${walls - (ROOMS - 1)}`,
);
console.log(
  `shortest possible route: ${MW + MH - 1} rooms (${MW - 1} across, ${MH - 1} down, plus the start)\n`,
);

console.log(
  "generator      passages  dead ends       junctions  route  choices  up  left  work",
);
for (const [key, name, generate] of GENERATORS) {
  const { carved, work } = generate(rng(SEED));
  const m = measure(carved);
  if (key === "binaryTree") checkBinaryTree(m);
  console.log(
    `${name.padEnd(14)} ${String(carved.length).padStart(8)}  ` +
      `${String(m.deadEnds).padStart(4)} (${pct(m.deadEnds).padStart(4)}%)  ` +
      `${String(m.junctions).padStart(10)}  ${String(m.route).padStart(5)}  ` +
      `${String(m.choices).padStart(7)}  ${String(m.upMoves).padStart(2)}  ` +
      `${String(m.leftMoves).padStart(4)}  ${String(work).padStart(4)}`,
  );
}

if (SWEEP > 0) {
  console.log(`\nsweep over ${SWEEP} seeds, 1 to ${SWEEP}`);
  console.log(
    "generator      dead ends mean  median  min  max    route mean  median  min  max",
  );
  for (const [key, name, generate] of GENERATORS) {
    const dead = [];
    const route = [];
    for (let seed = 1; seed <= SWEEP; seed++) {
      const m = measure(generate(rng(seed)).carved);
      if (key === "binaryTree") checkBinaryTree(m);
      dead.push(m.deadEnds);
      route.push(m.route);
    }
    const d = summary(dead);
    const r = summary(route);
    console.log(
      `${name.padEnd(14)} ${d.mean.toFixed(1).padStart(14)}  ${String(d.median).padStart(6)}  ` +
        `${String(d.min).padStart(3)}  ${String(d.max).padStart(3)}    ` +
        `${r.mean.toFixed(1).padStart(10)}  ${String(r.median).padStart(6)}  ` +
        `${String(r.min).padStart(3)}  ${String(r.max).padStart(3)}`,
    );
  }
  console.log(
    `\nbinary tree route checked on all ${SWEEP} seeds: top row, then right column, ${MW + MH - 1} rooms`,
  );
}

// RANK=1 lists the seeds whose six mazes sit closest to the sweep medians, so
// the fixture on screen is the ordinary case rather than the dramatic end, and
// the choice is reproducible instead of picked by eye.
if (process.env.RANK === "1") {
  const rows = [];
  const all = GENERATORS.map(([key, , generate]) => {
    const per = [];
    for (let seed = 1; seed <= SWEEP; seed++)
      per.push(measure(generate(rng(seed)).carved));
    return { key, per };
  });
  const medians = all.map(({ per }) => ({
    route: summary(per.map((m) => m.route)).median,
    dead: summary(per.map((m) => m.deadEnds)).median,
    routeSpread:
      summary(per.map((m) => m.route)).max -
        summary(per.map((m) => m.route)).min || 1,
    deadSpread:
      summary(per.map((m) => m.deadEnds)).max -
        summary(per.map((m) => m.deadEnds)).min || 1,
  }));
  for (let seed = 1; seed <= SWEEP; seed++) {
    let distance = 0;
    all.forEach(({ per }, g) => {
      const m = per[seed - 1];
      distance += Math.abs(m.route - medians[g].route) / medians[g].routeSpread;
      distance +=
        Math.abs(m.deadEnds - medians[g].dead) / medians[g].deadSpread;
    });
    rows.push({
      seed,
      distance,
      routes: all.map(({ per }) => per[seed - 1].route),
    });
  }
  rows.sort((a, b) => a.distance - b.distance);
  console.log("\nseeds closest to the medians, routes in generator order");
  for (const row of rows.slice(0, 10)) {
    console.log(
      `seed ${String(row.seed).padStart(4)}  distance ${row.distance.toFixed(3)}  routes ${row.routes.join(" ")}`,
    );
  }
}
