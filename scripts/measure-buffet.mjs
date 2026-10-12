#!/usr/bin/env node --experimental-strip-types --no-warnings
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import os from "node:os";
import {
  DISHES,
  DT,
  PEOPLE,
  SEED,
  SPACE,
  crowd,
  comparison,
  mean,
} from "../src/vertical/34-buffet/simulation.ts";

const summary = (opts = {}) => {
  let line = 0,
    skip = 0,
    worse = 0,
    extra = 0;
  for (let seed = 1; seed <= 100; seed++) {
    const people = crowd(seed, opts);
    const r = comparison(people);
    line += mean(r.line);
    skip += mean(r.skip);
    worse += r.worse.length / people.length;
    extra += r.worse.reduce(
      (n, p) => n + r.skip.finished[p.id] - r.line.finished[p.id],
      0,
    );
  }
  return {
    line: line / 100,
    skip: skip / 100,
    ratio: line / skip,
    worse: worse,
    extra: extra / (worse * (opts.people ?? PEOPLE)),
  };
};
const people = crowd(SEED);
const shown = comparison(people, true);
// Verify the mechanism as well as the totals. The top never passes, each
// dish serves one person, and every person gets exactly the wanted food.
for (const [rule, r] of Object.entries({
  line: shown.line,
  skip: shown.skip,
})) {
  for (const sample of r.samples) {
    const occupied = new Set();
    sample.forEach((p, i) => {
      if (p.state === "serve") {
        assert(
          !occupied.has(p.dish),
          `${rule}: two people serving at one dish`,
        );
        occupied.add(p.dish);
      }
      if (
        rule === "line" &&
        i &&
        !["away", "done"].includes(p.state) &&
        sample[i - 1].state !== "done"
      )
        assert(
          p.x <= sample[i - 1].x - SPACE + 1e-6,
          "Passing in the top line",
        );
    });
  }
  r.samples
    .at(-1)
    .forEach((p, i) => assert.equal(p.portions, people[i].wants.length));
}
const dessert = people.find(
  (p) => p.wants.length === 1 && p.wants[0] === DISHES - 1,
);
const batch = summary();
const figures = {
  seed: SEED,
  people: PEOPLE,
  dishes: DISHES,
  runs: 100,
  average: batch,
  dessert: {
    id: dessert.id,
    line: shown.line.finished[dessert.id] - dessert.arrive,
    skip: shown.skip.finished[dessert.id] - dessert.arrive,
  },
  shown: {
    line: mean(shown.line),
    skip: mean(shown.skip),
    end: shown.line.end,
    worse: shown.worse.map((p) => ({
      id: p.id,
      extra: shown.skip.finished[p.id] - shown.line.finished[p.id],
    })),
  },
};
console.log(
  `Machine: ${os.cpus()[0].model}; ${os.platform()} ${os.release()}; Node ${process.version}`,
);
console.log(
  `Model: ${DISHES} dishes, ${PEOPLE} people, 100 seeds; arrivals average 8 s; each dish wanted with probability 0.4; serving 3 to 7 s, 1 in 7 people take 5 times as long; walk 0.8 m/s; spacing ${SPACE} m; step ${DT} s.`,
);
console.log(JSON.stringify(figures, null, 2));
for (const gap of [2, 4, 8, 12, 20])
  console.log(`Arrival gap ${gap} s: ${JSON.stringify(summary({ gap }))}`);
for (const slowFactor of [2, 3, 7])
  console.log(
    `Slow factor ${slowFactor}: ${JSON.stringify(summary({ slowFactor }))}`,
  );
for (const choiceShare of [0.2, 0.6, 1])
  console.log(
    `Dish choice probability ${choiceShare}: ${JSON.stringify(summary({ choiceShare }))}`,
  );
console.log(
  "Mechanism checks passed: no passing in line, exclusive dish service, all requested portions served.",
);
if (process.argv.includes("--write")) {
  writeFileSync(
    new URL(
      "../curriculum/vertical/34-buffet/measurement-run.json",
      import.meta.url,
    ),
    JSON.stringify(figures, null, 2) + "\n",
  );
  writeFileSync(
    new URL("../src/vertical/34-buffet/measurements.ts", import.meta.url),
    `/** Recorded by scripts/measure-buffet.mjs. Seconds are model time. */\nexport const MEASURED = ${JSON.stringify(figures, null, 2)} as const;\nexport const CONDITIONS = "simulated · same 60 people · 8 dishes · sped up";\n`,
  );
}
