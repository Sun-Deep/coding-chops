#!/usr/bin/env node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs
/* global process, console */

// Writes the birthday reel's timeline for Blender: every beat, the frame
// each of the 253 strings appears, each room's cell and the frame it lights,
// from the same beats.ts the reel's counters read. Refuses to run if
// measurements.ts has drifted from the committed run.
//
// Usage: node --experimental-strip-types --no-warnings \
//          --import ./scripts/ts-register.mjs scripts/blender/birthdays/export.mjs <out.json>

import { readFileSync, writeFileSync } from "node:fs";
import * as B from "../../../src/vertical/60-birthdays/beats.ts";
import { RUN } from "../../../src/vertical/60-birthdays/measurements.ts";

const run = JSON.parse(
  readFileSync("curriculum/vertical/60-birthdays/runs/birthdays.json", "utf8"),
);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const checks = [
  [RUN.pairs, run.pairs],
  [RUN.trialsWithShared, run.trialsWithShared],
  [RUN.exactShare, run.exactShare],
  [RUN.heroRoom, run.hero.room],
  [RUN.heroPair, run.hero.pair],
  [RUN.sharedDay, run.hero.sharedDay],
  [RUN.birthdays, run.hero.birthdays],
  [RUN.roomsShared, run.rooms.pairs.map((p) => (p.length ? 1 : 0)).join("")],
  [RUN.roomsWithShared, run.rooms.withShared],
];
for (const [mine, theirs] of checks) {
  if (!same(mine, theirs)) {
    console.error(`measurements.ts says ${mine}, the run says ${theirs}`);
    process.exit(1);
  }
}

// The strings in the order they are drawn: student 0 to everyone after,
// then student 1, and so on.
const pairs = [];
for (let i = 0; i < RUN.classSize; i++)
  for (let j = i + 1; j < RUN.classSize; j++) pairs.push([i, j]);

writeFileSync(
  process.argv[2],
  JSON.stringify({
    duration: B.DURATION,
    beats: {
      START: B.START,
      THREADS_DONE: B.THREADS_DONE,
      MATCH: B.MATCH,
      RISE: B.RISE,
      RISEN: B.RISEN,
      ROOMS_START: B.ROOMS_START,
      ROOMS_END: B.ROOMS_END,
      VERDICT: B.VERDICT,
    },
    cols: B.COLS,
    heroRoom: RUN.heroRoom,
    heroPair: RUN.heroPair,
    pairs,
    pairLit: pairs.map((_, k) => +B.threadAt(k + 1).toFixed(3)),
    rooms: run.rooms.pairs.map((p, room) => ({
      cell: B.cellOf(room),
      pairs: p,
      lit: B.roomLitAt(room),
    })),
  }),
);
console.log(`wrote ${process.argv[2]}`);
