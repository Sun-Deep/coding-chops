#!/usr/bin/env node
/* global Buffer, console, process */

// Which of 1,000 commits broke free shipping, found with git bisect.
//
// Builds a throwaway repository of 1,000 commits with every name, email and
// date pinned, so the commit ids reproduce with the same git. Commit 1 is
// tagged v1.0 and works. One later commit changes `>=` to `>` in the free
// shipping check, and from then on a $50 order pays for shipping. Nothing
// is timed: a check here is one checkout plus one run of the test, and the
// reel counts checks.
//
// Printed: the hero run of `git bisect run` exactly as git prints it, the
// same search done one commit at a time back from HEAD, and git bisect run
// once for every possible bad commit (2 to 1,000) to get the worst case.
// Then everything is compared with src/vertical/43-git-bisect/measurements.ts
// and the script exits 1 if they disagree.
//
// Usage: node --experimental-strip-types scripts/measure-git-bisect.mjs

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const COMMITS = 1000;
/** The commit, counted from 1, that changes `>=` to `>`. */
export const BAD = 639;

const work = mkdtempSync(join(tmpdir(), "bisect-"));
const repo = join(work, "shop");
const env = {
  ...process.env,
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_CONFIG_GLOBAL: "/dev/null",
  HOME: work,
  LC_ALL: "C",
};
const git = (...args) =>
  execFileSync("git", args, {
    cwd: repo,
    env,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });

const shipping = (op) =>
  `// Orders of $50 or more ship free.\nexport const freeShipping = (total) => total ${op} 50;\n`;
const test = `import { freeShipping } from "./shipping.js";

if (freeShipping(50)) console.log("ok    a $50 order ships free");
else {
  console.log("FAIL  a $50 order paid for shipping");
  process.exit(1);
}
`;

// Ordinary work: each commit edits one page or stylesheet of the shop.
const CHORES = [
  ["pages/faq.md", "Reword the FAQ"],
  ["pages/returns.md", "Update the returns page"],
  ["styles/cart.css", "Nudge cart spacing"],
  ["pages/about.md", "Fix a typo on the about page"],
  ["styles/buttons.css", "Darken the buy button"],
  ["pages/contact.md", "Add the new support hours"],
  ["styles/header.css", "Tighten the header"],
  ["pages/sizes.md", "Add a size guide row"],
];

/** A `git fast-import` stream: every byte that feeds a hash is fixed. */
const stream = () => {
  const out = [];
  const pages = {};
  const blob = (s) => `data ${Buffer.byteLength(s)}\n${s}\n`;
  const start = Date.UTC(2026, 0, 5, 9) / 1000;
  for (let n = 1; n <= COMMITS; n++) {
    const when = `${start + (n - 1) * 3 * 3600} +0000`;
    let msg;
    const files = [];
    if (n === 1) {
      msg = "Add free shipping over $50";
      files.push(["shipping.js", shipping(">=")], ["test.mjs", test]);
    } else if (n === BAD) {
      msg = "Tidy up the shipping check";
      files.push(["shipping.js", shipping(">")]);
    } else {
      const [path, m] = CHORES[n % CHORES.length];
      pages[path] = (pages[path] ?? "") + `Change ${n}.\n`;
      msg = m;
      files.push([path, pages[path]]);
    }
    out.push(
      "commit refs/heads/main",
      `mark :${n}`,
      `author Dev <dev@example.com> ${when}`,
      `committer Dev <dev@example.com> ${when}`,
      blob(msg).trimEnd(),
    );
    if (n > 1) out.push(`from :${n - 1}`);
    for (const [path, body] of files)
      out.push(`M 100644 inline ${path}`, blob(body).trimEnd());
    out.push("");
  }
  return out.join("\n") + "\n";
};

const lines = [];
const say = (s = "") => {
  lines.push(s);
  console.log(s);
};

try {
  execFileSync("git", ["init", "-q", "-b", "main", repo], { env });
  git("config", "gc.auto", "0");
  execFileSync("git", ["fast-import", "--quiet"], {
    cwd: repo,
    env,
    input: stream(),
  });
  git("checkout", "-q", "main");
  const ids = git("rev-list", "--reverse", "main").trim().split("\n");
  git("tag", "v1.0", ids[0]);

  say("== versions");
  say(git("--version").trim());
  say(execFileSync("node", ["--version"], { encoding: "utf8" }).trim());
  say();
  say("== the repository");
  say(`commits: ${git("rev-list", "--count", "HEAD").trim()}`);
  say(`since v1.0: ${git("rev-list", "--count", "v1.0..HEAD").trim()}`);
  say(`HEAD: ${git("log", "-1", "--format=%h %s").trim()}`);
  say(`v1.0: ${git("log", "-1", "--format=%h %s", "v1.0").trim()}`);

  // The hero run, exactly as git prints it.
  say();
  say("== $ git bisect start HEAD v1.0 && git bisect run node test.mjs");
  const started = git("bisect", "start", "HEAD", "v1.0");
  const ran = git("bisect", "run", "node", "test.mjs");
  const transcript = (started + ran).trimEnd();
  for (const l of transcript.split("\n")) say(l);
  git("bisect", "reset");

  // Each test git ran: the commit, then ok or FAIL.
  const steps = [];
  let current = null;
  for (const l of transcript.split("\n")) {
    const m = l.match(/^\[([0-9a-f]{40})\] (.*)$/);
    if (m) current = m[1];
    if (l.startsWith("ok ") || l.startsWith("FAIL "))
      steps.push({
        n: ids.indexOf(current) + 1,
        result: l.startsWith("ok ") ? "good" : "bad",
      });
  }
  const left = [
    ...transcript.matchAll(/Bisecting: (\d+) revisions? left/g),
  ].map((m) => Number(m[1]));
  const culprit = transcript.match(/^([0-9a-f]{40}) is the first bad commit/m);
  const found = ids.indexOf(culprit[1]) + 1;
  say();
  say("== the checks");
  steps.forEach((s, k) => say(`${k + 1}. commit ${s.n}: ${s.result}`));
  say(`first bad: commit ${found}, ${culprit[1].slice(0, 7)}`);

  say();
  say("== $ git show --format= first-bad");
  const diff = git("show", "--format=", "--unified=0", culprit[1]).trimEnd();
  for (const l of diff.split("\n")) say(l);

  // The same search with no bisect: step back from HEAD one commit at a
  // time, testing each, until one passes. The one after it is the answer.
  let oneByOne = 0;
  for (let k = 1; ; k++) {
    git("checkout", "-q", `main~${k}`);
    oneByOne++;
    try {
      execFileSync("node", ["test.mjs"], { cwd: repo, stdio: "ignore" });
      break;
    } catch {
      // Still broken: keep going back.
    }
  }
  git("checkout", "-q", "main");
  say();
  say("== one commit at a time, back from HEAD");
  say(`checks: ${oneByOne}`);

  // Every place the bug could have gone in, bisected for real. The test
  // reads which commit it is standing on from the commit's own date.
  const probe = join(work, "probe.mjs");
  writeFileSync(
    probe,
    `import { execFileSync } from "node:child_process";
const t = Number(execFileSync("git", ["log", "-1", "--format=%at"], { encoding: "utf8" }));
const n = (t - ${Date.UTC(2026, 0, 5, 9) / 1000}) / ${3 * 3600} + 1;
process.exit(n >= Number(process.env.BAD) ? 1 : 0);
`,
  );
  const counts = {};
  let worstOne = 0;
  for (let bad = 2; bad <= COMMITS; bad++) {
    git("bisect", "start", "main", "v1.0");
    const out = execFileSync("git", ["bisect", "run", "node", probe], {
      cwd: repo,
      env: { ...env, BAD: String(bad) },
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    git("bisect", "reset");
    const first = out.match(/^([0-9a-f]{40}) is the first bad commit/m)[1];
    if (ids.indexOf(first) + 1 !== bad)
      throw new Error(`bisect found ${ids.indexOf(first) + 1}, not ${bad}`);
    const checks = (out.match(/^running /gm) ?? []).length;
    counts[checks] = (counts[checks] ?? 0) + 1;
    // One at a time by the hero loop's rule: test back from HEAD~1 until a
    // commit passes, and stop early on reaching v1.0, which is known good.
    worstOne = Math.max(worstOne, Math.min(COMMITS - bad + 1, COMMITS - 2));
  }
  const total = Object.entries(counts).reduce((a, [c, k]) => a + c * k, 0);
  say();
  say("== every possible bad commit, 2 to 1,000, bisected for real");
  for (const [c, k] of Object.entries(counts)) say(`${c} checks: ${k} times`);
  say(`most: ${Math.max(...Object.keys(counts).map(Number))}`);
  say(`mean: ${(total / (COMMITS - 1)).toFixed(2)}`);
  say(`one at a time, most: ${worstOne}`);

  const run = {
    commits: COMMITS,
    bad: BAD,
    found,
    hash: culprit[1].slice(0, 7),
    steps,
    left,
    oneByOne,
    mostBisect: Math.max(...Object.keys(counts).map(Number)),
    mostOneByOne: worstOne,
    transcript: transcript.split("\n"),
  };

  const { RUN, DIFF } =
    await import("../src/vertical/43-git-bisect/measurements.ts");
  if (diff !== DIFF.show.join("\n")) {
    say("== MISMATCH: the first bad commit's diff is not DIFF.show");
    process.exitCode = 1;
  }
  const want = JSON.stringify(RUN);
  const got = JSON.stringify(run);
  say();
  if (want !== got) {
    say(`== MISMATCH with measurements.ts\nrun:  ${got}\nfile: ${want}`);
    process.exitCode = 1;
  } else say("== measurements.ts matches this run");
} finally {
  rmSync(work, { recursive: true, force: true });
}
