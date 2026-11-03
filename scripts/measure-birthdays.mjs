#!/usr/bin/env node
/* global console, process */

// The birthday problem, measured for the birthday reel.
//
// Birthdays are drawn uniformly from 365 days (no 29 February, every day
// equally likely), from a seeded generator so every run gives the same
// classes. Measures, for a class of 23:
//   - the number of pairs, 23 x 22 / 2;
//   - the share of 1,000,000 classes with at least one shared birthday,
//     beside the exact value 1 - (365 x 364 x ... x 343) / 365^23;
//   - 100 classes, the rooms the camera rises to, and which of them have a
//     shared birthday and between whom;
//   - the room the reel opens in: the first of those 100 with exactly one
//     shared pair. It is picked after the 100 are drawn, so the count of
//     rooms with a match is not changed by the choice.
//
// Usage: node scripts/measure-birthdays.mjs <out.json>

import { writeFileSync } from "node:fs";

const N = 23;
const DAYS = 365;
const TRIALS = 1_000_000;
const ROOMS = 100;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const draw = (rand) =>
  Array.from({ length: N }, () => Math.floor(rand() * DAYS));

const sharedPairs = (days) => {
  const pairs = [];
  for (let i = 0; i < days.length; i++)
    for (let j = i + 1; j < days.length; j++)
      if (days[i] === days[j]) pairs.push([i, j]);
  return pairs;
};

const hasShared = (days) => new Set(days).size < days.length;

// A million classes.
const many = mulberry32(2026);
let matched = 0;
for (let t = 0; t < TRIALS; t++) if (hasShared(draw(many))) matched++;

let none = 1;
for (let k = 0; k < N; k++) none *= (DAYS - k) / DAYS;

// The hundred rooms, then the first with exactly one shared pair.
const roomRand = mulberry32(100);
const rooms = Array.from({ length: ROOMS }, () => {
  const days = draw(roomRand);
  return { days, pairs: sharedPairs(days) };
});
const heroRoom = rooms.findIndex((r) => r.pairs.length === 1);
const hero = rooms[heroRoom];

const MONTHS = "JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC".split(" ");
const LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const label = (day) => {
  let m = 0;
  while (day >= LENGTHS[m]) day -= LENGTHS[m++];
  return `${MONTHS[m]} ${day + 1}`;
};

const out = {
  measured: new Date().toISOString(),
  node: process.version,
  assumptions:
    "365 days, no 29 Feb, every day equally likely, seeded mulberry32",
  classSize: N,
  pairs: (N * (N - 1)) / 2,
  trials: TRIALS,
  trialsWithShared: matched,
  simulatedShare: matched / TRIALS,
  exactShare: 1 - none,
  hero: {
    room: heroRoom,
    birthdays: hero.days.map(label),
    pair: hero.pairs[0],
    sharedDay: label(hero.days[hero.pairs[0][0]]),
  },
  rooms: {
    seed: 100,
    count: ROOMS,
    withShared: rooms.filter((r) => r.pairs.length > 0).length,
    pairs: rooms.map((r) => r.pairs),
  },
};
writeFileSync(process.argv[2], JSON.stringify(out, null, 2) + "\n");
console.log(
  `${out.pairs} pairs; ${matched} of ${TRIALS} classes share (${(100 * out.simulatedShare).toFixed(2)}%, exact ${(100 * out.exactShare).toFixed(2)}%); hero room ${heroRoom}: ${out.hero.sharedDay}, students ${out.hero.pair}; rooms ${out.rooms.withShared}/${ROOMS}`,
);
