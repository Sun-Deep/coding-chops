#!/usr/bin/env node --experimental-strip-types --no-warnings
import {
  BLOCK_FROM,
  BLOCK_TO,
  frameAt,
  simAt,
} from "../src/vertical/37-bus-bunching/beats.ts";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  SETTINGS,
  atTime,
  blockages,
  run,
} from "../src/vertical/37-bus-bunching/simulation.ts";

const result = run();
const repeats = run();
assert.deepEqual(result, repeats, "The seeded run must repeat exactly");
for (const snapshot of result.snapshots) {
  for (const [id, bus] of snapshot.buses.entries()) {
    if (snapshot.time > 0) {
      const previous =
        result.snapshots[Math.round(snapshot.time / SETTINGS.step) - 1].buses[
          id
        ];
      assert.ok(
        bus.position >= previous.position,
        "A bus cannot move backwards",
      );
      assert.ok(
        bus.position - previous.position <=
          SETTINGS.speed * SETTINGS.step + 1e-6,
        "A bus cannot exceed its driving speed",
      );
    }
  }
  const gap =
    (((snapshot.buses[0].position - snapshot.buses[1].position) %
      SETTINGS.route) +
      SETTINGS.route) %
    SETTINGS.route;
  assert.ok(
    gap >= SETTINGS.clearance - 1e-6 &&
      gap <= SETTINGS.route - SETTINGS.clearance + 1e-6,
    "Buses cannot overlap or overtake",
  );
}
const digest = createHash("sha256")
  .update(JSON.stringify(result))
  .digest("hex");
console.log(
  JSON.stringify(
    {
      recordedAt: new Date().toISOString(),
      node: process.version,
      platform: process.platform,
      settings: SETTINGS,
      sha256: digest,
    },
    null,
    2,
  ),
);
console.log(
  "\nVisits: bus, stop, arrival, departure, queue on arrival, boarded",
);
for (const v of result.visits)
  console.log(
    [v.bus, v.stop, v.arrival, v.departure, v.queueAtArrival, v.boarded].join(
      "\t",
    ),
  );
const noBoarding = run(SETTINGS.seed, 0, 0, 0);
const s = noBoarding.snapshots[800];
assert.equal(
  s.buses[0].position - s.buses[1].position,
  SETTINGS.route / 2,
  "Equal initial spacing stays equal without delay or passenger boarding time",
);
console.log(
  "\nChecks passed: repeatability, forward motion, equal speed limit, clearance, no-boarding control.",
);

const blocked = blockages(result)[0];
assert.deepEqual(blocked, { from: 226.75, to: 249.5, seconds: 22.75 });
for (const snapshot of result.snapshots.filter(
  (s) => s.time > blocked.from && s.time < blocked.to,
)) {
  assert.equal(
    snapshot.buses[1].position,
    582,
    "The following bus must stay stopped behind the first",
  );
  assert.equal(
    snapshot.buses[0].state,
    "board",
    "The first bus must still be boarding during the blockage",
  );
}
console.log("\nFollowing bus blocked behind the boarding bus:");
console.log(JSON.stringify(blockages(result), null, 2));

const pickup = result.visits.find((v) => v.bus === 1 && v.stop === 3);
assert.ok(
  pickup && frameAt(pickup.arrival) <= 60,
  "The following bus must reach its passenger stop within two seconds",
);
const earlier = atTime(result, simAt(70)).buses[1];
const later = atTime(result, simAt(110)).buses[1];
assert.equal(earlier.state, "board");
assert.equal(later.state, "board");
assert.ok(
  later.boarding > earlier.boarding,
  "The visible following bus must actually pick up passengers",
);
assert.equal(simAt(BLOCK_FROM), blocked.from);
assert.equal(simAt(BLOCK_TO), blocked.to);
console.log("\nOn-screen following-bus pickup:");
console.log(
  JSON.stringify(
    {
      arrivalFrame: frameAt(pickup.arrival),
      arrivalSeconds: frameAt(pickup.arrival) / 30,
      departureFrame: frameAt(pickup.departure),
      passengersPickedUp: pickup.boarded,
      visibleBoardedAtFrame70: earlier.boarding,
      visibleBoardedAtFrame110: later.boarding,
    },
    null,
    2,
  ),
);
