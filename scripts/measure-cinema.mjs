#!/usr/bin/env node --experimental-strip-types --no-warnings

// A cinema with no assigned seats. Keep an empty seat between you and
// strangers, or sit right beside whoever is there? Which leaves room for a
// group to sit together?
//
// The model is imported from the reel's own module,
// src/vertical/33-cinema/simulation.ts. Seeded, so the machine cannot move a
// figure.
//
// Printed: the two rooms the reel shows, then 200 full houses at the
// defaults and at each other setting. How strongly people avoid strangers
// and the mix of group sizes are not taken from data, so the result has to
// hold across them.
//
// Usage: node --experimental-strip-types scripts/measure-cinema.mjs

import {
  MIX,
  ROWS,
  SEATS,
  SEED,
  arrivals,
  elbows,
  fill,
  rooms,
} from "../src/vertical/33-cinema/simulation.ts";

console.log(
  `${ROWS} rows of ${SEATS} seats; groups of 1 to 4 people in shares ${MIX.map((m) => `${m * 100}%`).join(", ")}\n`,
);

const { you, spread, pack } = rooms(SEED);
console.log(
  `seed ${SEED}, the group the reel follows: #${you}, the first group of four that cannot sit together when people keep a gap; ${you} groups before it`,
);
for (const [rule, room] of [
  ["spread", spread],
  ["pack", pack],
]) {
  const g = room[you];
  console.log(
    `  ${rule.padEnd(6)} free seats ${g.freeBefore}, longest free run ${g.longestBefore}; together: ${!g.split}; seats ${g.seats.map((s) => `row ${s.row + 1} seat ${s.seat + 1}`).join(", ")}`,
  );
  console.log(
    `         at the full house, ${room.length} groups of ${room.reduce((n, x) => n + x.size, 0)} people: groups split ${
      room
        .filter((x) => x.split)
        .map((x) => `#${x.id} of ${x.size}`)
        .join(", ") || "none"
    }; people beside a stranger ${elbows(room)}`,
  );
}
const grid = (room) => {
  const g = Array.from({ length: ROWS }, () => Array(SEATS).fill("."));
  room.forEach((x) =>
    x.seats.forEach(
      (s) => (g[s.row][s.seat] = x.id === you ? "Y" : String(x.size)),
    ),
  );
  return g.map((r) => `    ${r.join("")}`).join("\n");
};
console.log("  spread at the full house, front row first:\n" + grid(spread));
console.log("  pack at the full house, front row first:\n" + grid(pack));

const houses = (rule, opts = {}) => {
  let free = 0;
  let splits = 0;
  let elbow = 0;
  const n = 200;
  for (let seed = 1; seed <= n; seed++) {
    const sizes = arrivals(seed, 160, opts.mix);
    let total = 0;
    let k = 0;
    const capacity = (opts.rows ?? ROWS) * (opts.seats ?? SEATS);
    while (k < sizes.length && total + sizes[k] <= capacity)
      total += sizes[k++];
    const room = fill(rule, sizes.slice(0, k), opts, seed);
    const first = room.find((g) => g.split);
    free += first ? first.freeBefore : 0;
    splits += room.filter((g) => g.split).length;
    elbow += elbows(room);
  }
  return { free: free / n, splits: splits / n, elbow: elbow / n };
};
const line = (label, opts = {}) => {
  const a = houses("spread", opts);
  const b = houses("pack", opts);
  return `${label.padEnd(30)} seats free when the first group is split ${a.free.toFixed(1)} -> ${b.free.toFixed(1)}; groups split ${a.splits.toFixed(2)} -> ${b.splits.toFixed(2)}; people beside a stranger ${a.elbow.toFixed(1)} -> ${b.elbow.toFixed(1)}`;
};
console.log(
  "\n200 full houses each, groups arriving until the next would not fit, spread -> pack",
);
console.log(line("defaults"));
for (const keepGap of [0.5, 0.75])
  console.log(line(`${keepGap * 100}% keep a gap`, { keepGap }));
console.log(line("more pairs", { mix: [0.1, 0.6, 0.15, 0.15] }));
console.log(line("more people alone", { mix: [0.3, 0.4, 0.15, 0.15] }));
console.log(line("more groups of four", { mix: [0.15, 0.35, 0.15, 0.35] }));
console.log(line("8 rows of 14 seats", { rows: 8, seats: 14 }));
