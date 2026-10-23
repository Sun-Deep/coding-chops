#!/usr/bin/env node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs
/* global process, console */

// Writes the PHP2Shell reel's beats for Blender, from the reel's own
// module, so the render and the overlays run on one clock.
//
// Usage: node --experimental-strip-types --no-warnings \
//          --import ./scripts/ts-register.mjs scripts/blender/php/export.mjs <out.json>

import { writeFileSync } from "node:fs";
import * as B from "../../../src/vertical/46-php2shell/beats.ts";

const out = process.argv[2];
writeFileSync(
  out,
  JSON.stringify({
    duration: B.DURATION,
    off: B.OFF,
    dive: B.DIVE,
    arrive: B.ARRIVE,
    unpack: B.UNPACK,
    lands: B.LANDS,
    oom: B.OOM,
    clean: B.CLEAN,
    hold: B.HOLD,
    takeover: B.TAKEOVER,
    pull: B.PULL,
    patch: B.PATCH,
  }),
);
console.log(`wrote ${out}`);
