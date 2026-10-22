#!/usr/bin/env node --experimental-strip-types --no-warnings

// Holding the lift door. The morning rush in an office lobby, one lift, run
// twice on the same people: once with the doors held for anyone coming who
// is up to 15 seconds away, once with nobody holding them. Who gets to their
// floor sooner, and who pays for it?
//
// The model is imported from the reel's own module,
// src/vertical/38-elevator-door/simulation.ts. Seeded, so the machine cannot
// move a figure.
//
// Printed: the person the reel follows and the trips around them, then 100
// mornings at the defaults and at each other setting. How far away people
// can be and still be held for, how busy the lobby is, how tall the
// building is and how long a stop takes are assumptions the model cannot
// take from data, so the result has to be read across them.
//
// Usage: node --experimental-strip-types scripts/measure-elevator-door.mjs

import {
  BOARD_S,
  CAPACITY,
  COUNT_FROM,
  COUNT_TO,
  FLOORS,
  FLOOR_S,
  HOLD_FOR,
  RATE,
  SEED,
  SEEDS,
  STOP_S,
  TIMER,
  averages,
  hero,
  people,
  run,
  tripOf,
  tripTime,
} from "../src/vertical/38-elevator-door/simulation.ts";

const s1 = (x) => x.toFixed(1);
const mmss = (s) => {
  const r = Math.round(s);
  return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, "0")}`;
};

console.log(
  `One lift, ${FLOORS} floors, ${RATE} people a minute, ${FLOOR_S} s a floor, ` +
    `${STOP_S} s a stop, ${BOARD_S} s to step in, doors close ${TIMER} s after ` +
    `the last person in, ${CAPACITY} people at most. Hold: for anyone up to ` +
    `${HOLD_FOR} s away. ${SEEDS} mornings; people arriving from ${COUNT_FROM} s ` +
    `to ${COUNT_TO} s counted.`,
);

const avg = averages();
const line = (label, a) =>
  console.log(
    `${label.padEnd(18)} door to floor ${s1(a.trip.close)} s let close, ` +
      `${s1(a.trip.hold)} s held (${a.trip.hold > a.trip.close ? "+" : ""}` +
      `${s1(((a.trip.hold - a.trip.close) / a.trip.close) * 100)}%); held for ` +
      `${s1(a.held * 100)}% of people, ${s1(a.heldGain)} s sooner; everyone ` +
      `else ${s1(a.restLoss)} s later, ${s1(a.restLater * 100)}% of them later; ` +
      `first one into a held car ${s1(a.firstLoss)} s later`,
  );

console.log("\nDefaults");
line("defaults", avg);

const you = hero(avg.firstLoss);
const ps = people(SEED);
const morning = { close: run("close", ps), hold: run("hold", ps) };
const p = ps[you];
console.log(
  `\nFollowed: person #${you} of seed ${SEED}, the first one into a held car ` +
    `whose extra time is closest to the average for first ones in; reaches the doors at ${s1(p.at)} s, ` +
    `floor ${p.to}. Door to floor: ${s1(tripTime(morning.close, p))} s let close, ` +
    `${s1(tripTime(morning.hold, p))} s held ` +
    `(${s1(tripTime(morning.hold, p) - tripTime(morning.close, p))} s later). ` +
    `Out at ${mmss(morning.close.out[you])} and ${mmss(morning.hold.out[you])}.`,
);
for (const rule of ["close", "hold"]) {
  const m = morning[rule];
  const k = tripOf(m, you);
  console.log(`  ${rule}:`);
  for (let j = Math.max(0, k - 1); j <= k + 1; j++) {
    const t = m.trips[j];
    const who = t.riders
      .map(
        (id) =>
          `#${id}${m.heldFor.has(id) ? "*" : ""}>${ps[id].to}@${s1(ps[id].at)}`,
      )
      .join(" ");
    console.log(
      `    trip ${j}: open ${s1(t.open)} would shut ${s1(t.shut)} shut ${s1(t.close)} ` +
        `back ${s1(t.back)}; ${who}; stops ${t.stops.map((x) => `${x.floor}@${s1(x.at)}`).join(" ")}`,
    );
  }
}
console.log("  (* got in only because the doors were held)");

console.log("\nHow far away people can be and still be held for");
for (const holdFor of [2, 5, 10, 15, 20, 30])
  line(`up to ${holdFor} s`, averages({ holdFor }));

console.log("\nPeople a minute");
for (const rate of [2, 3, 5, 6]) line(`${rate} a minute`, averages({ rate }));

console.log("\nFloors");
for (const floors of [5, 20]) line(`${floors} floors`, averages({ floors }));

console.log("\nSeconds a stop");
for (const stop of [5, 12]) line(`${stop} s a stop`, averages({ stop }));

console.log("\nDoor timer");
for (const timer of [2, 5])
  line(`closes after ${timer} s`, averages({ timer }));

console.log("\nCar size");
for (const capacity of [8, 16])
  line(`${capacity} people`, averages({ capacity }));
