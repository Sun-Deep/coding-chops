#!/usr/bin/env node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs
/* global process, console */

// Writes the Manhattan reel's timeline for Blender: every beat, and the frame
// each checked intersection lights for both searches, from the same beats.ts
// the reel's counters read. Refuses to run if measurements.ts has drifted
// from the committed run.
//
// Usage: node --experimental-strip-types --no-warnings \
//          --import ./scripts/ts-register.mjs scripts/blender/manhattan/export.mjs \
//          <search.json> <out.json>

import { readFileSync, writeFileSync } from "node:fs";
import * as B from "../../../src/vertical/59-manhattan-route/beats.ts";
import { RUN } from "../../../src/vertical/59-manhattan-route/measurements.ts";

const [searchPath, out] = process.argv.slice(2);
const run = JSON.parse(
  readFileSync(
    "curriculum/vertical/59-manhattan-route/runs/route.json",
    "utf8",
  ),
);
for (const [mine, theirs] of [
  [RUN.dijkstra, run.dijkstra.checked],
  [RUN.astar, run.astar.checked],
  [RUN.routeMetres, run.astar.routeMetres],
  [RUN.intersections, run.intersections],
  [RUN.osmSnapshot, run.osmSnapshot],
]) {
  if (mine !== theirs) {
    console.error(`measurements.ts says ${mine}, the run says ${theirs}`);
    process.exit(1);
  }
}
const search = JSON.parse(readFileSync(searchPath, "utf8"));
// Step i is the (i + 2)th intersection checked: the first is Harlem itself.
const lit = (steps, total) => {
  if (steps.length + 1 !== total) {
    console.error(
      `search.json has ${steps.length + 1} checks, the run ${total}`,
    );
    process.exit(1);
  }
  return steps.map((_, i) => +B.litAt(i + 2).toFixed(3));
};

writeFileSync(
  out,
  JSON.stringify({
    duration: B.DURATION,
    beats: {
      START: B.START,
      ASTAR_DONE: B.ASTAR_DONE,
      DIJKSTRA_DONE: B.DIJKSTRA_DONE,
      TRACE: B.TRACE,
      VERDICT: B.VERDICT,
    },
    dijkstraLit: lit(search.dijkstra, RUN.dijkstra),
    astarLit: lit(search.astar, RUN.astar),
  }),
);
console.log(
  `wrote ${out}: A* lit by frame ${B.litAt(RUN.astar).toFixed(1)}, Dijkstra by ${B.litAt(RUN.dijkstra).toFixed(1)}`,
);
