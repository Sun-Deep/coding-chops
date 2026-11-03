#!/usr/bin/env node
/* global console, process, performance */

// A delivery down Manhattan, measured on the real street map.
//
// Reads the OpenStreetMap streets downloaded into third_party/osm-nyc/
// (see third_party/README.md), turns them into a graph of intersections,
// and finds the shortest ride from Harlem to Wall Street twice: once with
// Dijkstra, which checks every intersection closer than the customer, and
// once with A*, which also knows the straight-line distance to the customer.
// Both find a route of the same length; the count that differs is how many
// intersections each had to check first.
//
// One-way tags are respected, so the rider follows the streets a bike may
// legally ride. Lengths are great-circle metres between OSM points.
//
// Writes the summary (committed) and, when given, the order every
// intersection was checked in, for the Blender scene (not committed).
//
// Usage: node scripts/measure-delivery-route.mjs <summary.json> [search.json]

import { readFileSync, writeFileSync } from "node:fs";

const STREETS = "third_party/osm-nyc/streets.json";
const START = {
  name: "Harlem, W 125th St and Adam Clayton Powell Jr Blvd",
  lat: 40.8095,
  lon: -73.948,
};
const GOAL = {
  name: "Financial District, Wall St and Broadway",
  lat: 40.7074,
  lon: -74.0113,
};
// The box the streets were downloaded in. Dijkstra only checks intersections
// nearer than the customer by road, and road distance is never shorter than
// straight-line distance, so if every edge of the box is further away in a
// straight line than the route is long, the box cut nothing off.
const BOX = { south: 40.685, west: -74.115, north: 40.94, east: -73.78 };

const [summaryPath, searchPath] = process.argv.slice(2);
if (!summaryPath) {
  console.error(
    "usage: measure-delivery-route.mjs <summary.json> [search.json]",
  );
  process.exit(1);
}

const osm = JSON.parse(readFileSync(STREETS, "utf8"));
const ways = osm.elements.filter((e) => e.type === "way" && e.geometry);

const R = 6371008.8;
const rad = Math.PI / 180;
function metres(a, b) {
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// An OSM node is an intersection when two ways share it, or a way ends there.
const uses = new Map();
const point = new Map();
for (const w of ways) {
  w.nodes.forEach((id, i) => {
    point.set(id, w.geometry[i]);
    const ends = i === 0 || i === w.nodes.length - 1 ? 2 : 1;
    uses.set(id, (uses.get(id) ?? 0) + ends);
  });
}
const isCorner = (id) => uses.get(id) >= 2;

// Edges run corner to corner and keep their shape points for drawing.
const out = new Map();
let edges = 0;
function link(a, b, len, shape) {
  if (!out.has(a)) out.set(a, []);
  out.get(a).push({ to: b, len, shape });
  edges++;
}
for (const w of ways) {
  const t = w.tags ?? {};
  const oneway =
    t.oneway === "yes" || t.oneway === "1" || t.oneway === "true"
      ? 1
      : t.oneway === "-1" || t.oneway === "reverse"
        ? -1
        : 0;
  let from = 0;
  let len = 0;
  for (let i = 1; i < w.nodes.length; i++) {
    len += metres(w.geometry[i - 1], w.geometry[i]);
    if (!isCorner(w.nodes[i]) && i < w.nodes.length - 1) continue;
    const a = w.nodes[from];
    const b = w.nodes[i];
    const shape = w.geometry.slice(from, i + 1).map((p) => [p.lat, p.lon]);
    if (oneway >= 0) link(a, b, len, shape);
    if (oneway <= 0) link(b, a, len, [...shape].reverse());
    from = i;
    len = 0;
  }
}

function nearest(target) {
  let best = null;
  let d = Infinity;
  for (const id of out.keys()) {
    const m = metres(point.get(id), target);
    if (m < d) {
      d = m;
      best = id;
    }
  }
  return { id: best, off: d };
}
const start = nearest(START);
const goal = nearest(GOAL);

// A binary heap keyed on priority.
class Heap {
  constructor() {
    this.a = [];
  }
  push(k, v) {
    const a = this.a;
    a.push([k, v]);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p][0] <= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
  get size() {
    return this.a.length;
  }
}

function search(guide) {
  const goalPoint = point.get(goal.id);
  const h = guide ? (id) => metres(point.get(id), goalPoint) : () => 0;
  const dist = new Map([[start.id, 0]]);
  const via = new Map();
  const done = new Set();
  const order = [];
  const heap = new Heap();
  heap.push(h(start.id), start.id);
  const t0 = performance.now();
  while (heap.size) {
    const [, id] = heap.pop();
    if (done.has(id)) continue;
    done.add(id);
    order.push(id);
    if (id === goal.id) break;
    for (const e of out.get(id) ?? []) {
      const d = dist.get(id) + e.len;
      if (d < (dist.get(e.to) ?? Infinity)) {
        dist.set(e.to, d);
        via.set(e.to, { from: id, shape: e.shape });
        heap.push(d + h(e.to), e.to);
      }
    }
  }
  const ms = performance.now() - t0;
  const route = [];
  for (let id = goal.id; id !== start.id; id = via.get(id).from)
    route.push(via.get(id).shape);
  route.reverse();
  return {
    checked: order.length,
    metres: dist.get(goal.id),
    ms,
    order,
    via,
    route,
  };
}

const dijkstra = search(false);
const astar = search(true);

const s0 = point.get(start.id);
const boxMargin = Math.min(
  metres(s0, { lat: BOX.south, lon: s0.lon }),
  metres(s0, { lat: BOX.north, lon: s0.lon }),
  metres(s0, { lat: s0.lat, lon: BOX.west }),
  metres(s0, { lat: s0.lat, lon: BOX.east }),
);
if (boxMargin <= dijkstra.metres) {
  console.error(
    `box edge ${boxMargin.toFixed(0)} m away, route ${dijkstra.metres.toFixed(0)} m: download a wider box`,
  );
  process.exit(1);
}
const sameRoute =
  JSON.stringify(dijkstra.route) === JSON.stringify(astar.route);

const summary = {
  measured: new Date().toISOString(),
  osmSnapshot: osm.osm3s.timestamp_osm_base,
  licence: "Map data (c) OpenStreetMap contributors, ODbL",
  node: process.version,
  streets: ways.length,
  intersections: out.size,
  edges,
  start: { ...START, snappedMetres: +start.off.toFixed(1) },
  goal: { ...GOAL, snappedMetres: +goal.off.toFixed(1) },
  straightLineMetres: +metres(point.get(start.id), point.get(goal.id)).toFixed(
    0,
  ),
  dijkstra: {
    checked: dijkstra.checked,
    routeMetres: +dijkstra.metres.toFixed(1),
    ms: +dijkstra.ms.toFixed(1),
  },
  astar: {
    checked: astar.checked,
    routeMetres: +astar.metres.toFixed(1),
    ms: +astar.ms.toFixed(1),
  },
  ratio: +(dijkstra.checked / astar.checked).toFixed(2),
  sameRoute,
  boxMarginMetres: +boxMargin.toFixed(0),
};
writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + "\n");
console.log(JSON.stringify(summary, null, 2));

if (searchPath) {
  // Each checked intersection with the street that reached it, in order.
  const steps = (s) =>
    s.order
      .slice(1)
      .map((id) =>
        s.via.get(id).shape.map(([la, lo]) => [+la.toFixed(6), +lo.toFixed(6)]),
      );
  writeFileSync(
    searchPath,
    JSON.stringify({
      start: point.get(start.id),
      goal: point.get(goal.id),
      dijkstra: steps(dijkstra),
      astar: steps(astar),
      route: astar.route,
    }),
  );
  console.log(`wrote ${searchPath}`);
}
