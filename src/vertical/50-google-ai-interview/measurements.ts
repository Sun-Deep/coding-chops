/**
 * What the three versions in `snippets.ts` did, from
 * `scripts/measure-google-interview.mjs`: the reported case, the other case,
 * and how many of 12,156 cases each gets wrong (every target from -1 to 10 in
 * every sorted array of distinct values 0..9 up to length 8). Exact; the
 * script exits 1 if this file disagrees.
 */
export const RUN = {
  cases: 12156,
  original: { report: -1, other: -1, wrong: 2509 },
  suggested: { report: 2, other: -1, wrong: 2004 },
  fixed: { report: 2, other: 0, wrong: 0 },
} as const;

export const CONDITIONS = "Node 22.14 · 12,156 cases";
