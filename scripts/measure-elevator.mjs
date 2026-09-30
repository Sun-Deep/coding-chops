#!/usr/bin/env node

// One elevator, one building, the same people, two ways of deciding where to
// go next.
//
//   in order  serves calls in the order the buttons were pressed. It fetches
//             the first caller, takes them to their floor, then fetches the
//             next. It does not stop for anybody else on the way.
//   sweep     keeps going the way it is going while anybody inside wants a
//             floor that way or anybody waiting is that way, stops for every
//             rider getting off and every caller going its way, and turns round
//             only when there is nothing left ahead. This is directional
//             collective control, the rule real lifts run, and the disk
//             scheduling algorithm named after them (SCAN, in its LOOK form).
//
// Time is simulated, not timed. A floor takes FLOOR_S seconds and a stop, doors
// open, people on and off, doors closed, takes STOP_S. Those two are the only
// assumptions, they are stated on screen, and SWEEP re-runs the comparison over
// a range of both to show the direction of the result does not depend on them.
//
// What is counted, per rider: when they pressed, when the car picked them up,
// when they got out. Per car: floors travelled and stops made.
//
// Usage: node scripts/measure-elevator.mjs
//   SEED=n       the scenario shown (1, the first one generated)
//   YOU=n        the rider the cut follows (4)
//   RANK=1       rank seeds by how clearly they tell the story (see below)
//   TIMELINE=1   print the car keyframes the animation is built from

const FLOORS = Number(process.env.FLOORS ?? 10);
const RIDERS = Number(process.env.RIDERS ?? 7);
const CALL_WINDOW = Number(process.env.CALL_WINDOW ?? 24);
const FLOOR_S = Number(process.env.FLOOR_S ?? 2);
const STOP_S = Number(process.env.STOP_S ?? 8);
const SEED = Number(process.env.SEED ?? 1);
const YOU = Number(process.env.YOU ?? 4);
const SWEEP = Number(process.env.SWEEP ?? 1000);
const START_FLOOR = 1;

const rng = (seed) => {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
};

/**
 * Riders in the order they press. Whole seconds, whole floors, never the same
 * floor in and out, and every call inside the first CALL_WINDOW seconds so the
 * whole queue exists while the car is still busy with the first of it.
 */
const scenario = (seed) => {
  const random = rng(seed);
  const out = [];
  for (let i = 0; i < RIDERS; i++) {
    const at = Math.floor(random() * CALL_WINDOW);
    const from = 1 + Math.floor(random() * FLOORS);
    let to = from;
    while (to === from) to = 1 + Math.floor(random() * FLOORS);
    out.push({ at, from, to });
  }
  out.sort((a, b) => a.at - b.at);
  return out.map((r, id) => ({ id, ...r }));
};

/**
 * A car that is told where to go by `next`. Keyframes record every change of
 * motion: [time, floor, "move" | "stop" | "idle"], so the animation can place
 * the car at any time by interpolating between them.
 */
const car = (riders, choose, floorS, stopS) => {
  let t = 0;
  let floor = START_FLOOR;
  let dir = 0;
  const waiting = [];
  const inside = [];
  const pickedAt = new Array(riders.length).fill(null);
  const droppedAt = new Array(riders.length).fill(null);
  const keys = [[0, floor, "idle"]];
  let floors = 0;
  let stops = 0;
  let pending = [...riders];

  const arrive = () => {
    while (pending.length && pending[0].at <= t) waiting.push(pending.shift());
  };

  const stop = (board) => {
    stops++;
    keys.push([t, floor, "stop"]);
    for (let k = inside.length - 1; k >= 0; k--) {
      if (inside[k].to === floor) {
        droppedAt[inside[k].id] = t + stopS / 2;
        inside.splice(k, 1);
      }
    }
    for (const r of board) {
      waiting.splice(waiting.indexOf(r), 1);
      inside.push(r);
      pickedAt[r.id] = t + stopS / 2;
    }
    t += stopS;
    keys.push([t, floor, "stop"]);
  };

  arrive();
  while (waiting.length || inside.length || pending.length) {
    if (!waiting.length && !inside.length) {
      t = pending[0].at;
      keys.push([t, floor, "idle"]);
      arrive();
      continue;
    }
    const step = choose({ floor, dir, waiting, inside });
    if (step.stop) {
      stop(step.board);
      dir = step.dir ?? dir;
      arrive();
      continue;
    }
    dir = step.dir;
    keys.push([t, floor, "move"]);
    floor += dir;
    floors++;
    t += floorS;
    keys.push([t, floor, "move"]);
    arrive();
  }
  return { keys, pickedAt, droppedAt, floors, stops, end: t };
};

/**
 * In order. The head of the queue is the only rider it knows about: if they
 * are inside, go to their floor, otherwise go and fetch them.
 */
const inOrder = ({ floor, waiting, inside }) => {
  const rider = inside[0] ?? waiting[0];
  const target = inside[0] ? rider.to : rider.from;
  if (target === floor) {
    // Dropping the head of the queue where the next caller is standing lets
    // them in on the same door opening rather than closing and reopening.
    const next = inside[0] ? waiting[0] : rider;
    return { stop: true, board: next && next.from === floor ? [next] : [] };
  }
  return { dir: Math.sign(target - floor) };
};

/**
 * Sweep. Stop here for anybody getting off, and for any caller going the way
 * the car is going. Keep going while there is anything ahead, turn round when
 * there is not.
 */
const sweep = ({ floor, dir, waiting, inside }) => {
  const heading = (r) => Math.sign(r.to - r.from);
  const targets = [...inside.map((r) => r.to), ...waiting.map((r) => r.from)];
  const ahead = (d) => targets.some((f) => Math.sign(f - floor) === d);

  let d = dir !== 0 && ahead(dir) ? dir : 0;
  if (d === 0) {
    const here = waiting.find((r) => r.from === floor);
    if (here) d = heading(here);
    else {
      const nearest = targets.reduce((a, b) =>
        Math.abs(b - floor) < Math.abs(a - floor) ? b : a,
      );
      d = Math.sign(nearest - floor);
    }
  }

  const off = inside.some((r) => r.to === floor);
  const board = waiting.filter((r) => r.from === floor && heading(r) === d);
  if (off || board.length) return { stop: true, board, dir: d };
  return { dir: d };
};

const run = (riders, floorS = FLOOR_S, stopS = STOP_S) => ({
  order: car(riders, inOrder, floorS, stopS),
  sweep: car(riders, sweep, floorS, stopS),
});

const trip = (riders, c) => riders.map((r) => c.droppedAt[r.id] - r.at);
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

const check = (riders, c, name) => {
  for (const r of riders) {
    if (c.pickedAt[r.id] === null || c.droppedAt[r.id] === null) {
      throw new Error(`${name}: rider ${r.id} never delivered`);
    }
    if (c.pickedAt[r.id] < r.at) throw new Error(`${name}: picked before call`);
  }
};

// ---- ranking ---------------------------------------------------------------

// A scenario tells the story when "you" wait a long time in order and are
// picked up on the way by the sweep, and when the in-order car visibly passes
// your floor without stopping while you wait.
const passes = (c, r) => {
  let n = 0;
  for (let k = 1; k < c.keys.length; k++) {
    const [t0, f0, m0] = c.keys[k - 1];
    const [, f1] = c.keys[k];
    if (m0 !== "move" || f0 === f1) continue;
    if (t0 < r.at || t0 >= c.pickedAt[r.id]) continue;
    const lo = Math.min(f0, f1);
    const hi = Math.max(f0, f1);
    if (r.from > lo && r.from < hi) n++;
    if (f1 === r.from && c.keys[k + 1]?.[2] === "move") n++;
  }
  return n;
};

if (process.env.RANK) {
  const rows = [];
  for (let seed = 1; seed <= 400; seed++) {
    const riders = scenario(seed);
    const { order, sweep: sw } = run(riders);
    for (const r of riders) {
      const o = order.droppedAt[r.id] - r.at;
      const s = sw.droppedAt[r.id] - r.at;
      rows.push({
        seed,
        you: r.id,
        o,
        s,
        ratio: o / s,
        passes: passes(order, r),
        endO: order.end,
        endS: sw.end,
        floorsO: order.floors,
        floorsS: sw.floors,
      });
    }
  }
  rows.sort((a, b) => b.passes - a.passes || b.ratio - a.ratio);
  console.log("seed you  order sweep ratio passes  endO endS floorsO floorsS");
  for (const r of rows.slice(0, 25)) {
    console.log(
      [
        r.seed,
        r.you,
        r.o,
        r.s,
        r.ratio.toFixed(2),
        r.passes,
        r.endO,
        r.endS,
        r.floorsO,
        r.floorsS,
      ]
        .map((v) => String(v).padStart(5))
        .join(" "),
    );
  }
  process.exit(0);
}

// ---- the scenario shown ------------------------------------------------------

const riders = scenario(SEED);
const { order, sweep: sw } = run(riders);
check(riders, order, "in order");
check(riders, sw, "sweep");

console.log(
  `one car, ${FLOORS} floors, starts at floor ${START_FLOOR}, ${FLOOR_S}s a floor, ${STOP_S}s a stop`,
);
console.log(`seed ${SEED}, ${RIDERS} riders\n`);
console.log(
  "rider  pressed  from  to   in order: in  out  trip   sweep: in  out  trip",
);
for (const r of riders) {
  const cols = [
    r.id,
    r.at,
    r.from,
    r.to,
    order.pickedAt[r.id],
    order.droppedAt[r.id],
    order.droppedAt[r.id] - r.at,
    sw.pickedAt[r.id],
    sw.droppedAt[r.id],
    sw.droppedAt[r.id] - r.at,
  ];
  console.log(
    cols.map((v, i) => String(v).padStart(i === 0 ? 5 : 6)).join(" ") +
      (r.id === YOU ? "   <- you" : ""),
  );
}
console.log();
for (const [name, c] of [
  ["in order", order],
  ["sweep", sw],
]) {
  const t = trip(riders, c);
  console.log(
    `${name.padEnd(9)} floors ${c.floors}  stops ${c.stops}  last out ${c.end - STOP_S / 2}s  mean trip ${mean(t).toFixed(1)}s  longest trip ${Math.max(...t)}s`,
  );
}
if (YOU >= 0) {
  console.log(
    `\nyou (rider ${YOU}): in order passes your floor ${passes(order, riders[YOU])} times before picking you up`,
  );
}
const slower = riders.filter(
  (r) => sw.droppedAt[r.id] - r.at > order.droppedAt[r.id] - r.at,
);
console.log(
  `riders who got out later with the sweep: ${slower.length ? slower.map((r) => `${r.id} (+${sw.droppedAt[r.id] - order.droppedAt[r.id]}s)`).join(", ") : "none"}`,
);

if (process.env.TIMELINE) {
  for (const [name, c] of [
    ["in order", order],
    ["sweep", sw],
  ]) {
    console.log(`\n${name} keyframes`);
    console.log(JSON.stringify(c.keys));
  }
}

// ---- the direction of the result over many scenarios -------------------------

const sweepOver = (floorS, stopS) => {
  let fewerFloors = 0;
  let shorterMean = 0;
  let earlierEnd = 0;
  const ratios = [];
  const everyoneSooner = { n: 0 };
  for (let seed = 1; seed <= SWEEP; seed++) {
    const rs = scenario(seed + 100000);
    const { order: o, sweep: s } = run(rs, floorS, stopS);
    check(rs, o, "in order");
    check(rs, s, "sweep");
    if (s.floors < o.floors) fewerFloors++;
    const mo = mean(trip(rs, o));
    const ms = mean(trip(rs, s));
    if (ms < mo) shorterMean++;
    if (s.end < o.end) earlierEnd++;
    ratios.push(mo / ms);
    if (rs.every((r) => s.droppedAt[r.id] <= o.droppedAt[r.id]))
      everyoneSooner.n++;
  }
  ratios.sort((a, b) => a - b);
  return {
    fewerFloors,
    shorterMean,
    earlierEnd,
    median: ratios[Math.floor(ratios.length / 2)],
    min: ratios[0],
    everyoneSooner: everyoneSooner.n,
  };
};

console.log(
  `\nover ${SWEEP} other scenarios (seeds 100001 to ${100000 + SWEEP})`,
);
console.log(
  "floor_s stop_s  fewer floors  shorter mean trip  finished first  mean trip ratio (median, min)  every rider sooner",
);
for (const [f, s] of [
  [FLOOR_S, STOP_S],
  [1, 4],
  [2, 4],
  [2, 12],
  [3, 10],
]) {
  const r = sweepOver(f, s);
  console.log(
    `${String(f).padStart(7)} ${String(s).padStart(6)}  ${String(r.fewerFloors).padStart(12)}  ${String(r.shorterMean).padStart(17)}  ${String(r.earlierEnd).padStart(14)}  ${r.median.toFixed(2).padStart(14)}, ${r.min.toFixed(2)}  ${String(r.everyoneSooner).padStart(18)}`,
  );
}
