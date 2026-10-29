#!/usr/bin/env node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs
/* global process, console */

// Writes the OFFSET reel's timeline for Blender: every beat, the wall's
// layout, and the frame each crate is read, from the same wall.ts the
// reel's counter reads.
//
// Usage: node --experimental-strip-types --no-warnings \
//          --import ./scripts/ts-register.mjs scripts/blender/offset/export.mjs <out.json>

import { writeFileSync } from "node:fs";
import * as beats from "../../../src/vertical/52-sql-offset/beats.ts";
import * as W from "../../../src/vertical/52-sql-offset/wall.ts";
import { PAGE } from "../../../src/vertical/52-sql-offset/measurements.ts";

const out = process.argv[2];
writeFileSync(
  out,
  JSON.stringify({
    duration: beats.DURATION,
    beats,
    cols: W.COLS,
    rows: W.ROWS,
    crateOrders: W.CRATE_ORDERS,
    page: PAGE,
    pageCrate: W.PAGE_CRATE,
    open: W.OPEN,
    reads: Array.from({ length: W.SKIPPED }, (_, i) => W.readAt(i)),
    drops: Array.from({ length: W.SKIPPED }, (_, i) => W.dropFrames(i)),
  }),
);
console.log(
  `wrote ${out}: ${beats.DURATION} frames, ${W.SKIPPED} crates read before the page`,
);
