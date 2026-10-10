#!/usr/bin/env node --experimental-strip-types --no-warnings

// A two-lane road loses a lane at a row of cones. Move over as soon as you
// see the sign, or use both lanes to the cones and take turns there, the
// zipper merge?
//
// The model is imported from the reel's own module,
// src/vertical/31-zipper/simulation.ts. Seeded, so the machine cannot move a
// figure.
//
// Printed: the car the reel follows, then 20 seeds at the defaults and at
// each other setting. The share of drivers who stay in the ending lane when
// everyone else moves over is not something the model can take from data,
// so the result has to hold across it.
//
// Usage: node --experimental-strip-types scripts/measure-zipper.mjs

import {
  BALANCE,
  DEMAND,
  FREE,
  HEADWAY,
  HERO_AFTER,
  SEED,
  STAY,
  delay,
  hero,
  passedBy,
  queueAt,
  schedule,
  simulate,
} from "../src/vertical/31-zipper/simulation.ts";

const mmss = (s) =>
  `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

console.log(
  `${Math.round(DEMAND * 3600)} cars an hour arrive, half in each lane; one through the cones every ${HEADWAY} s (${Math.round(3600 / HEADWAY)} an hour); ${STAY * 100}% of the ending lane stay in it when the rest move over early; zipper drivers switch lanes if the other is ${BALANCE} cars shorter\n`,
);

const early = schedule("early", SEED, 900);
const zipper = schedule("zipper", SEED, 900);
const { you, them } = hero(early);
console.log(
  `seed ${SEED}, the car the reel follows: #${you}, the first to arrive in the ending lane after ${HERO_AFTER} s who moves over early; and #${them}, the first after it who stays`,
);
for (const [rule, cars] of [
  ["early", early],
  ["zipper", zipper],
]) {
  console.log(
    `  ${rule.padEnd(6)} you: queue lane ${cars[you].lane}, lost ${delay(cars[you]).toFixed(1)} s, through at ${cars[you].through.toFixed(1)} s; cars that arrived after you and got through first ${passedBy(cars, you)}; #${them}: lost ${delay(cars[them]).toFixed(1)} s, through at ${cars[them].through.toFixed(1)} s`,
  );
}
const mE = simulate("early", SEED, 400);
const mZ = simulate("zipper", SEED, 400);
for (const t of [180, 240, 300])
  console.log(
    `  queue at ${t} s: early ${queueAt(mE, t).toFixed(0)} m, zipper ${queueAt(mZ, t).toFixed(0)} m`,
  );

const stats = (opts = {}) => {
  const out = {
    polite: [],
    stayers: [],
    zipper: [],
    zipperSame: [],
    earlyAll: [],
    through: [0, 0],
    passedE: [],
    passedZ: [],
  };
  for (let seed = 1; seed <= 20; seed++) {
    const E = schedule("early", seed, 900, opts);
    const Z = schedule("zipper", seed, 900, opts);
    for (const c of E) {
      if (c.arrive < 120 || c.arrive > 600) continue;
      const stayer = c.from === 1 && c.stays;
      (stayer ? out.stayers : out.polite).push(delay(c));
      if (!stayer) out.zipperSame.push(delay(Z[c.id]));
      out.earlyAll.push(delay(c));
      out.zipper.push(delay(Z[c.id]));
      if (!stayer && c.id % 5 === 0) {
        out.passedE.push(passedBy(E, c.id));
        out.passedZ.push(passedBy(Z, c.id));
      }
    }
    out.through[0] += E.filter((c) => c.through <= 600).length;
    out.through[1] += Z.filter((c) => c.through <= 600).length;
  }
  const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
  return {
    polite: mean(out.polite),
    stayers: out.stayers.length ? mean(out.stayers) : NaN,
    zipperSame: mean(out.zipperSame),
    earlyAll: mean(out.earlyAll),
    zipper: mean(out.zipper),
    through: out.through.map((x) => x / 20),
    passedE: mean(out.passedE),
    passedZ: mean(out.passedZ),
  };
};
const line = (label, opts) => {
  const s = stats(opts);
  return `${label.padEnd(26)} lost per car: polite early ${s.polite.toFixed(1)} s, the same drivers zipper ${s.zipperSame.toFixed(1)} s, stayers ${Number.isNaN(s.stayers) ? "-" : s.stayers.toFixed(1)} s; everyone ${s.earlyAll.toFixed(1)} -> ${s.zipper.toFixed(1)} s; passed by later cars ${s.passedE.toFixed(1)} -> ${s.passedZ.toFixed(1)}; through in 10 min ${s.through[0]} -> ${s.through[1]}`;
};

console.log(
  "\n20 seeds each, cars arriving from 2 to 10 minutes, early -> zipper",
);
console.log(line("defaults", {}));
for (const stay of [0, 0.1, 0.4, 0.5])
  console.log(line(`${stay * 100}% stay`, { stay }));
for (const demand of [1800, 2400])
  console.log(line(`${demand} cars an hour`, { demand: demand / 3600 }));
for (const headway of [2.0, 2.6])
  console.log(line(`one every ${headway} s`, { headway }));
for (const balance of [1, 4])
  console.log(line(`switch if ${balance} shorter`, { balance }));
console.log(
  `\n(free run from appearing to the cones: ${FREE} s; "lost" is time past that)`,
);
