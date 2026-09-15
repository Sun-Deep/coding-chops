// Measure what a backtracking regex engine does to a nested quantifier.
//
// The claim the cut makes is that `(a+)+$` against a string of a's followed by
// one non-matching character costs time doubling with every character added,
// and that the same failure rewritten as `^a+$` costs nothing. Both run in the
// same engine on the same input, so the variable is the pattern and not the
// runtime.
//
// Node and Python are both measured. One engine blowing up is a quirk; two
// unrelated backtracking engines blowing up on the same input is the mechanism.
//
// Prefer the doubling ratio over any single millisecond figure. A millisecond
// is a property of this laptop. The ratio is a property of the algorithm, and
// it is what goes on screen as an absolute.

import { execFileSync } from "node:child_process";

const RUNS = 3;
const EXPLODING = /^(a+)+$/;
const LINEAR = /^a+$/;

/** Median of the runs, so one scheduler hiccup cannot set a figure. */
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

const time = (re, input) => {
  const runs = [];
  for (let i = 0; i < RUNS; i++) {
    const t = process.hrtime.bigint();
    re.test(input);
    runs.push(Number(process.hrtime.bigint() - t) / 1e6);
  }
  return median(runs);
};

const python = (n) => {
  const src = `
import re, time, statistics
s = "a"*${n} + "X"
runs = []
for _ in range(${RUNS}):
    t = time.perf_counter()
    re.match(r"^(a+)+$", s)
    runs.append((time.perf_counter() - t) * 1000)
print(statistics.median(runs))
`;
  return Number(
    execFileSync("python3", ["-c", src], { encoding: "utf8" }).trim(),
  );
};

console.log(`node ${process.version}`);
console.log(
  `python ${execFileSync("python3", ["-V"], { encoding: "utf8" }).trim()}`,
);
console.log(`${RUNS} runs per point, median reported\n`);
console.log("n\tnested ms\tlinear ms\tpython ms\tratio to n-1");

const rows = [];
let previous = null;

for (let n = 20; n <= 30; n++) {
  const input = "a".repeat(n) + "X";
  const nested = time(EXPLODING, input);
  const linear = time(LINEAR, input);
  const py = python(n);
  const ratio = previous === null ? null : nested / previous;
  previous = nested;

  rows.push({ n, nested, linear, python: py, ratio });
  console.log(
    [
      n,
      nested.toFixed(3),
      linear.toFixed(4),
      py.toFixed(3),
      ratio === null ? "-" : ratio.toFixed(2),
    ].join("\t"),
  );
}

const last = rows.at(-1);
const ratios = rows.slice(1).map((r) => r.ratio);

console.log("\nsummary");
console.log(`  steps a backtracking engine can take at n: 2^n`);
console.log(`  median doubling ratio: ${median(ratios).toFixed(2)}`);
console.log(
  `  at n=${last.n}: nested ${last.nested.toFixed(1)} ms, linear ${last.linear.toFixed(4)} ms`,
);
console.log(
  `  speedup at n=${last.n}: ${Math.round(last.nested / last.linear).toLocaleString()}x`,
);
console.log(`  python at n=${last.n}: ${last.python.toFixed(1)} ms`);
