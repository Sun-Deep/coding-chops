import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { arch, cpus, platform, release } from "node:os";
import { performance } from "node:perf_hooks";

const root = new URL("../", import.meta.url);
const read = (name) =>
  readFileSync(new URL(`scripts/fixtures/wordle/${name}.txt`, root), "utf8");
const answerText = read("answers");
const guessText = read("guesses");
const words = (text) => text.trim().split(/\s+/).sort();
const answers = words(answerText);
const guesses = words(guessText);
for (const list of [answers, guesses]) {
  assert.equal(new Set(list).size, list.length);
  assert(list.every((word) => /^[a-z]{5}$/.test(word)));
}
assert(answers.every((word) => guesses.includes(word)));
const encode = (word) => Uint8Array.from(word, (c) => c.charCodeAt(0) - 97);
const encodedAnswers = answers.map(encode);

// Greens consume letters before yellows, including repeated letters.
const remaining = new Int8Array(26);
const digits = new Uint8Array(5);
const feedback = (guess, answer) => {
  remaining.fill(0);
  digits.fill(0);
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) digits[i] = 2;
    else remaining[answer[i]]++;
  }
  for (let i = 0; i < 5; i++) {
    if (digits[i] === 0 && remaining[guess[i]] > 0) {
      digits[i] = 1;
      remaining[guess[i]]--;
    }
  }
  return digits.reduce((sum, digit, i) => sum + digit * 3 ** i, 0);
};

// A separate string implementation checks the optimized scorer.
const reference = (guess, answer) => {
  const available = answer.split("");
  const pattern = Array(5).fill(0);
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      pattern[i] = 2;
      available[i] = null;
    }
  }
  for (let i = 0; i < 5; i++) {
    if (pattern[i] === 2) continue;
    const index = available.indexOf(guess[i]);
    if (index !== -1) {
      pattern[i] = 1;
      available[index] = null;
    }
  }
  return pattern.reduce((sum, digit, i) => sum + digit * 3 ** i, 0);
};
const probes = [
  "allee",
  "apple",
  "eerie",
  "level",
  "sassy",
  "civic",
  "roate",
  "adieu",
];
let checks = 0;
for (const guess of probes)
  for (const answer of answers) {
    assert.equal(
      feedback(encode(guess), encode(answer)),
      reference(guess, answer),
    );
    checks++;
  }
assert.equal(reference("allee", "apple"), 167);
assert.equal(reference("civic", "civic"), 242);

const started = new Date().toISOString();
const start = performance.now();
const useReference = process.argv.includes("--reference");
const ranking = guesses
  .map((word) => {
    const histogram = new Uint32Array(243);
    const guess = encode(word);
    for (let i = 0; i < encodedAnswers.length; i++) {
      histogram[
        useReference
          ? reference(word, answers[i])
          : feedback(guess, encodedAnswers[i])
      ]++;
    }
    assert.equal(
      histogram.reduce((sum, count) => sum + count, 0),
      answers.length,
    );
    const sumSquares = histogram.reduce((sum, count) => sum + count * count, 0);
    return {
      word,
      sumSquares,
      meanRemaining: sumSquares / answers.length,
      worstCase: Math.max(...histogram),
      histogram: [...histogram],
    };
  })
  .sort((a, b) => a.sumSquares - b.sumSquares || a.word.localeCompare(b.word));
const bestAnswer = ranking.find((row) => answers.includes(row.word));
const selected = [
  ...new Set([
    "adieu",
    "audio",
    "crane",
    "slate",
    "raise",
    ranking[0].word,
    bestAnswer.word,
  ]),
].map((word) => ({
  ...ranking.find((row) => row.word === word),
  rank: ranking.findIndex((row) => row.word === word) + 1,
}));
const result = {
  started,
  machine: {
    platform: platform(),
    release: release(),
    arch: arch(),
    cpu: cpus()[0].model,
    node: process.version,
  },
  source: {
    repository: "https://github.com/3b1b/videos",
    revision: "9add2c2eebcbe40377d8dd08169a42d556dd7ebc",
    answersSha256: createHash("sha256").update(answerText).digest("hex"),
    guessesSha256: createHash("sha256").update(guessText).digest("hex"),
  },
  definition:
    "Uniform answers. Expected size of the compatible-answer set after one guess, including the known answer on an all-correct result. Sum of squared feedback-bucket sizes divided by answer count. Lower is better.",
  answerCount: answers.length,
  guessCount: guesses.length,
  pairs: answers.length * guesses.length,
  referenceChecks: checks,
  scorer: useReference
    ? "independent string reference"
    : "encoded letter counts",
  scoringSeconds: (performance.now() - start) / 1000,
  winner: ranking[0].word,
  bestAnswer: bestAnswer.word,
  tiedWinners: ranking
    .filter((row) => row.sumSquares === ranking[0].sumSquares)
    .map((row) => row.word),
  selected,
  ranking: ranking.map(({ histogram: _histogram, ...row }) => row),
};
result.rankingSha256 = createHash("sha256")
  .update(JSON.stringify(result.ranking))
  .digest("hex");
const output = process.argv[2];
if (output) {
  const { ranking: _ranking, ...summary } = result;
  writeFileSync(
    new URL(output, root),
    JSON.stringify(
      process.argv.includes("--summary") ? summary : result,
      null,
      2,
    ) + "\n",
  );
}
if (process.argv.includes("--write-module")) {
  const traces = Object.fromEntries(
    ["adieu", result.winner].map((word) => {
      const row = selected.find((entry) => entry.word === word);
      const guess = encode(word);
      let sum = 0;
      const trace = [];
      for (let i = 0; i < answers.length; i++) {
        const left = row.histogram[feedback(guess, encodedAnswers[i])];
        sum += left;
        if (i === 0 || i === answers.length - 1 || i % 38 === 0) {
          trace.push({
            tested: i + 1,
            answer: answers[i],
            left,
            mean: sum / (i + 1),
          });
        }
      }
      assert.equal(sum, row.sumSquares);
      return [word, trace];
    }),
  );
  const data = {
    answerCount: result.answerCount,
    guessCount: result.guessCount,
    pairs: result.pairs,
    winner: result.winner,
    bestAnswer: result.bestAnswer,
    selected,
    traces,
  };
  writeFileSync(
    new URL("src/vertical/54-wordle/measurements.ts", root),
    "// Generated by scripts/measure-wordle.mjs. See the recorded run for inputs and checks.\nexport const RUN = " +
      JSON.stringify(data, null, 2) +
      " as const;\n",
  );
}
console.log(
  JSON.stringify(
    {
      ...result,
      ranking: result.ranking.slice(0, 10),
      selected: selected.map(({ histogram: _histogram, ...row }) => row),
    },
    null,
    2,
  ),
);
