/**
 * What git did, from `scripts/measure-git-bisect.mjs`.
 *
 * git 2.53.0, node 22.14.0. A throwaway repository of 1,000 commits with
 * every name, email and date pinned, so the commit ids reproduce with the
 * same git. Commit 1 is tagged v1.0 and works; commit 639 changes `>=` to
 * `>` in the free shipping check, so from there on a $50 order pays for
 * shipping. Nothing is timed: a check is one checkout and one run of the
 * test. The script rebuilds the repository, reruns everything and exits 1
 * if this file disagrees with what git printed.
 */

export type Step = { readonly n: number; readonly result: "good" | "bad" };

export const RUN = {
  commits: 1000,
  bad: 639,
  found: 639,
  hash: "1c617b2",
  /** Each commit git tested, counted from 1, and what the test said. */
  steps: [
    { n: 500, result: "good" },
    { n: 750, result: "bad" },
    { n: 625, result: "good" },
    { n: 687, result: "bad" },
    { n: 656, result: "bad" },
    { n: 640, result: "bad" },
    { n: 632, result: "good" },
    { n: 636, result: "good" },
    { n: 638, result: "good" },
    { n: 639, result: "bad" },
  ] as readonly Step[],
  /** "Bisecting: N revisions left to test after this", per check. */
  left: [499, 249, 124, 62, 30, 15, 7, 3, 1, 0],
  /** Testing back from HEAD one commit at a time until one passes. */
  oneByOne: 362,
  /**
   * Over every possible bad commit, 2 to 1,000: bisect run for real each
   * time, and one at a time counted by the same rule as the run above
   * (stopping at v1.0, which is known good).
   */
  mostBisect: 10,
  mostOneByOne: 998,
  /** `git bisect start HEAD v1.0` then `git bisect run node test.mjs`. */
  transcript: [
    "Bisecting: 499 revisions left to test after this (roughly 9 steps)",
    "[b32f0b706b075109ba8d368e0497fda2e3e860bb] Darken the buy button",
    "running 'node' 'test.mjs'",
    "ok    a $50 order ships free",
    "Bisecting: 249 revisions left to test after this (roughly 8 steps)",
    "[fbcfd7a9bf85f6d831bb9cf12529b939c4a8ad50] Tighten the header",
    "running 'node' 'test.mjs'",
    "FAIL  a $50 order paid for shipping",
    "Bisecting: 124 revisions left to test after this (roughly 7 steps)",
    "[aa44ce4b23f620da3e58b72fce317df8f4cc3a86] Update the returns page",
    "running 'node' 'test.mjs'",
    "ok    a $50 order ships free",
    "Bisecting: 62 revisions left to test after this (roughly 6 steps)",
    "[2601352b7660c4846f3602ae07168a697df9d58a] Add a size guide row",
    "running 'node' 'test.mjs'",
    "FAIL  a $50 order paid for shipping",
    "Bisecting: 30 revisions left to test after this (roughly 5 steps)",
    "[df45758b54b4125add0a32f53c6d286676f0160d] Reword the FAQ",
    "running 'node' 'test.mjs'",
    "FAIL  a $50 order paid for shipping",
    "Bisecting: 15 revisions left to test after this (roughly 4 steps)",
    "[3cccb39f305a4a981e3c9aa453757bed19444be3] Reword the FAQ",
    "running 'node' 'test.mjs'",
    "FAIL  a $50 order paid for shipping",
    "Bisecting: 7 revisions left to test after this (roughly 3 steps)",
    "[9f538a461630f76af446acea461db447f51b65a9] Reword the FAQ",
    "running 'node' 'test.mjs'",
    "ok    a $50 order ships free",
    "Bisecting: 3 revisions left to test after this (roughly 2 steps)",
    "[0016973e37f2cfdc935cde87ebcfe78a9dc90ce0] Darken the buy button",
    "running 'node' 'test.mjs'",
    "ok    a $50 order ships free",
    "Bisecting: 1 revision left to test after this (roughly 1 step)",
    "[3834df8466d569c5bbc9c30999e0efd3af283ad2] Tighten the header",
    "running 'node' 'test.mjs'",
    "ok    a $50 order ships free",
    "Bisecting: 0 revisions left to test after this (roughly 0 steps)",
    "[1c617b2116ede425eb77d3a1245f0bfa22719cb3] Tidy up the shipping check",
    "running 'node' 'test.mjs'",
    "FAIL  a $50 order paid for shipping",
    "1c617b2116ede425eb77d3a1245f0bfa22719cb3 is the first bad commit",
    "commit 1c617b2116ede425eb77d3a1245f0bfa22719cb3",
    "Author: Dev <dev@example.com>",
    "Date:   Thu Mar 26 03:00:00 2026 +0000",
    "",
    "    Tidy up the shipping check",
    "",
    " shipping.js | 2 +-",
    " 1 file changed, 1 insertion(+), 1 deletion(-)",
    "bisect found first bad commit",
  ],
};

/** `git show --format= --unified=0` of the first bad commit, as printed. */
export const DIFF = {
  file: "shipping.js",
  before: "export const freeShipping = (total) => total >= 50;",
  after: "export const freeShipping = (total) => total > 50;",
  show: [
    "diff --git a/shipping.js b/shipping.js",
    "index 91aaf8f..30b9ea0 100644",
    "--- a/shipping.js",
    "+++ b/shipping.js",
    "@@ -2 +2 @@",
    "-export const freeShipping = (total) => total >= 50;",
    "+export const freeShipping = (total) => total > 50;",
  ],
} as const;

export const CONDITIONS = "git 2.53.0 · bisect run · 1,000 commits";
