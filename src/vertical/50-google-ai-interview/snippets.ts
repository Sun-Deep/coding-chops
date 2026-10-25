/**
 * The code the reel shows, exactly as `scripts/measure-google-interview.mjs`
 * runs it: a binary search with a bug, an AI-style fix that passes the case
 * it was asked about while another still fails, and the real fix.
 *
 * The suggested fix is an example written for the reel, not Gemini's
 * output; the reel labels it as one.
 */

/** Lines that differ between versions are marked by index. */
export const BUGGY = [
  "function search(nums, target) {",
  "  let lo = 0, hi = nums.length - 1;",
  "  while (lo < hi) {",
  "    const mid = (lo + hi) >> 1;",
  "    if (nums[mid] === target) return mid;",
  "    if (nums[mid] < target) lo = mid + 1;",
  "    else hi = mid - 1;",
  "  }",
  "  return -1;",
  "}",
] as const;

/** The suggestion: make hi exclusive. It finds 5, and still misses 1. */
export const SUGGESTED = BUGGY.map((l, i) =>
  i === 1 ? "  let lo = 0, hi = nums.length;" : l,
);
export const SUGGESTED_LINE = 1;

/** The real fix: keep hi inclusive, and let the loop check lo === hi. */
export const FIXED = BUGGY.map((l, i) =>
  i === 2 ? "  while (lo <= hi) {" : l,
);
export const FIXED_LINE = 2;

export const REPORT = { nums: [1, 3, 5], target: 5 } as const;
export const OTHER = { nums: [1, 3, 5], target: 1 } as const;
