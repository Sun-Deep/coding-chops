#!/usr/bin/env node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs
// Catch intersections and accidental answer clues across the entire reel.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  BEATS,
  DURATION,
  SHOTS,
} from "../src/vertical/41-coin-puzzle/beats.ts";
import {
  GEOMETRY,
  TRANSFERS,
  stateAt,
} from "../src/vertical/41-coin-puzzle/motion.ts";
import { COINS, HERO } from "../src/vertical/41-coin-puzzle/simulation.ts";

for (let frame = 0; frame < DURATION; frame++) {
  const state = stateAt(frame);
  assert.equal(new Set(state.coins.map((coin) => coin.id)).size, COINS);
  for (const coin of state.coins) {
    assert(coin.pos.every(Number.isFinite));
    assert(coin.pos[2] >= 0);
    if (frame < BEATS.keep[0]) assert.equal(coin.accent, 0);
    if (frame >= BEATS.reveal[0] && coin.id !== HERO)
      assert.equal(coin.accent, 0);
  }
  for (let i = 0; i < COINS; i++)
    for (let j = i + 1; j < COINS; j++) {
      const a = state.coins[i].pos;
      const b = state.coins[j].pos;
      const overlap =
        Math.abs(a[2] - b[2]) < GEOMETRY.thickness &&
        Math.hypot(a[0] - b[0], a[1] - b[1]) < GEOMETRY.radius * 2;
      assert(!overlap, `Coins ${i} and ${j} overlap at frame ${frame}.`);
    }
  for (const transfer of TRANSFERS.filter(
    (t) => frame >= t.from && frame <= t.to,
  )) {
    const tool = state.tools.find((t) => t.hand === transfer.hand);
    const coin = state.coins[transfer.id];
    tool.pos.forEach((v, axis) => assert(Math.abs(v - coin.pos[axis]) < 1e-10));
  }
}
for (const t of TRANSFERS) {
  stateAt(t.to).coins[t.id].pos.forEach((v, i) =>
    assert(Math.abs(v - t.end[i]) < 1e-10),
  );
}
const script = readFileSync(
  new URL("../src/vertical/41-coin-puzzle/narration.tsx", import.meta.url),
  "utf8",
);
const lines = [
  ...script.matchAll(
    /from: (\d+), to: (\d+), (?:emphasis: true, )?text: "([^"]+)"/g,
  ),
];
assert.equal(lines.length, 6);
for (const [, start, end, text] of lines) {
  const from = Number(start),
    to = Number(end);
  const shot = SHOTS.find((s) => from >= s.from && from < s.to);
  assert(text.split(/\s+/).length / ((to - from + 10) / 30) <= 3);
  assert(from - 5 >= shot.from + 4);
  assert(to + 5 <= shot.to - 6);
}
console.log(
  `${DURATION} frames passed: stable coin identities, no overlaps, supported transfers, no early answer highlight, and readable subtitle timing.`,
);
