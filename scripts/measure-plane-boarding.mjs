#!/usr/bin/env node --experimental-strip-types --no-warnings

// Three ways to board the same plane with the same passengers and the same
// bags, and how long until the last one sits down.
//
// The cabin model is imported from the reel's own module,
// src/vertical/24-plane-boarding/boarding.ts, so the frames and this run are
// the same code. Simulated in one-second ticks with a seeded generator: no
// timing, so no machine can move a figure.
//
// What is printed: the cabin the reel shows (seed 1), then the same comparison
// over 1,000 seeds, then again at 30 rows, with passengers taking two rows of
// aisle, and with five zones, so the ranking is shown not to rest on the
// cabin chosen for the picture.
//
// Usage: node --experimental-strip-types scripts/measure-plane-boarding.mjs

import {
  BAG_SHARE,
  METHODS,
  NO_BAG_S,
  ROWS,
  SEED,
  SHUFFLE_S,
  STOW_MAX,
  STOW_MIN,
  ZONES,
  board,
} from "../src/vertical/24-plane-boarding/boarding.ts";

const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

console.log(
  `${ROWS} rows of 6, one aisle, one door. Walk 1 row/s. ${BAG_SHARE * 100}% carry a bag, ${STOW_MIN} to ${STOW_MAX} s to stow; the rest ${NO_BAG_S} s. ${SHUFFLE_S} s per seated passenger in the way. Back to front in ${ZONES} zones.\n`,
);

console.log(`seed ${SEED}, the cabin the reel shows`);
for (const m of METHODS) {
  const b = board(m);
  let stuckSeconds = 0;
  for (let k = 0; k < b.stuck.length; k++) stuckSeconds += b.stuck[k];
  console.log(
    `  ${m.padEnd(12)} ${clock(b.seconds)} (${b.seconds} s)   passenger-seconds stuck behind someone ${stuckSeconds}`,
  );
}

const compare = (label, opts, seeds) => {
  const times = Object.fromEntries(METHODS.map((m) => [m, []]));
  let randomBeatsBack = 0;
  let windowBeatsRandom = 0;
  let windowFastest = 0;
  for (let seed = 1; seed <= seeds; seed++) {
    const t = Object.fromEntries(
      METHODS.map((m) => [m, board(m, { ...opts, seed }).seconds]),
    );
    for (const m of METHODS) times[m].push(t[m]);
    if (t.random < t.backToFront) randomBeatsBack++;
    if (t.windowFirst < t.random) windowBeatsRandom++;
    if (t.windowFirst < t.random && t.windowFirst < t.backToFront)
      windowFastest++;
  }
  console.log(`\n${label}, ${seeds} seeds`);
  for (const m of METHODS) {
    console.log(
      `  ${m.padEnd(12)} median ${clock(median(times[m]))}  fastest ${clock(Math.min(...times[m]))}  slowest ${clock(Math.max(...times[m]))}`,
    );
  }
  console.log(
    `  random beat back to front in ${randomBeatsBack}; window first beat random in ${windowBeatsRandom}; window first fastest of the three in ${windowFastest}`,
  );
};

compare(`${ROWS} rows, as shown`, {}, 1000);
compare("30 rows", { rows: 30 }, 200);
compare(`${ROWS} rows, passengers take two rows of aisle`, { spacing: 2 }, 200);
compare(`${ROWS} rows, back to front in five zones`, { zones: 5 }, 200);
