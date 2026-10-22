#!/usr/bin/env node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs
/* global process, console */

// Writes the lift-door model as a frame-by-frame timeline for Blender to
// animate: for each lobby, when the car's doors open, are held and close,
// which floor the car is at on every frame, and for each person on screen
// the frame they reach the doors, step in and step out at their floor.
// Everything comes from the reel's own modules, so the animation and the
// committed run are the same code.
//
// Usage: node --experimental-strip-types --no-warnings \
//          --import ./scripts/ts-register.mjs scripts/blender/elevator/export.mjs <out.json>

import { writeFileSync } from "node:fs";
import {
  DURATION,
  VERDICT_FROM,
  frameAt,
  simAt,
} from "../../../src/vertical/38-elevator-door/beats.ts";
import { HERO } from "../../../src/vertical/38-elevator-door/measurements.ts";
import { PEOPLE, RUNS } from "../../../src/vertical/38-elevator-door/runs.ts";
import {
  FLOOR_S,
  STOP_S,
} from "../../../src/vertical/38-elevator-door/simulation.ts";

const out = process.argv[2];
const round = (x) => Math.round(x * 1000) / 1000;
const first = simAt(-140);
const last = simAt(DURATION + 20);

/** Which floor the car is at, as a continuous number, at second t. */
const floorAt = (trips, t) => {
  for (const trip of trips) {
    if (t < trip.close || t > trip.back) continue;
    let s = trip.close;
    let f = 0;
    for (const stop of trip.stops) {
      if (t < stop.at) return f + ((t - s) / (stop.at - s)) * (stop.floor - f);
      if (t < stop.at + STOP_S) return stop.floor;
      s = stop.at + STOP_S;
      f = stop.floor;
    }
    return Math.max(0, f - (t - s) / FLOOR_S);
  }
  return 0;
};

const lobby = (rule) => {
  const m = RUNS[rule];
  const trips = m.trips
    .map((t, k) => ({ ...t, k }))
    .filter((t) => t.back >= first && t.open <= last);
  const floor = [];
  for (let f = 0; f < DURATION; f++)
    floor.push(round(floorAt(m.trips, simAt(f))));
  const who = new Set();
  for (const t of trips) for (const id of t.riders) who.add(id);
  for (const p of PEOPLE) if (p.at >= first && p.at <= last) who.add(p.id);
  const people = [...who]
    .sort((a, b) => a - b)
    .map((id) => {
      const k = m.trips.findIndex((t) => t.riders.includes(id));
      const t = m.trips[k];
      const slot = t.riders.indexOf(id);
      return {
        id,
        to: PEOPLE[id].to,
        at: round(frameAt(PEOPLE[id].at)),
        // Running for the lift: held for on top, so running in both lobbies.
        runner: RUNS.hold.heldFor.has(id),
        trip: k,
        slot,
        boarded: round(frameAt(t.boarded[slot])),
        out: round(frameAt(m.out[id])),
      };
    });
  return {
    trips: trips.map((t) => ({
      k: t.k,
      open: round(frameAt(t.open)),
      shut: round(frameAt(t.shut)),
      close: round(frameAt(t.close)),
      holds: t.holds.map((h) => round(frameAt(h))),
      riders: t.riders,
      boarded: t.boarded.map((b) => round(frameAt(b))),
      back: round(frameAt(t.back)),
    })),
    floor,
    people,
  };
};

const data = {
  frames: DURATION,
  verdict: VERDICT_FROM,
  you: HERO.id,
  sim: Array.from({ length: DURATION }, (_, f) => round(simAt(f))),
  hold: lobby("hold"),
  close: lobby("close"),
};
writeFileSync(out, JSON.stringify(data));
const you = (rule) => data[rule].people.find((p) => p.id === HERO.id);
console.log(
  `wrote ${out}: you reach the doors at frame ${you("hold").at.toFixed(1)}; ` +
    `out at ${you("close").out.toFixed(1)} below, ${you("hold").out.toFixed(1)} on top; ` +
    `${data.hold.people.length} and ${data.close.people.length} people`,
);
