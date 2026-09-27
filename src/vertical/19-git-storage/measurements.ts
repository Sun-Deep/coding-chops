/**
 * What git stored, from `scripts/measure-git-storage.sh`.
 *
 * git 2.53.0, default compression, a throwaway repository with every name,
 * email and date pinned, so the object ids below reproduce exactly. Two runs
 * were byte identical. Nothing is timed.
 */

export const LINES = 160;
export const FILE_BYTES = 10_240;
/** The line that changes, counted from 1. */
export const CHANGED_LINE = 80;
/** Bytes of the + and - lines in `git diff`. */
export const DIFF_BYTES = 130;

/** The first commit's copy of the file, loose. */
export const V1 = {
  id: "f40bcc85b34147c002f088ae794dde09fadc63a6",
  onDisk: 5_138,
} as const;

/** The second commit's copy of the file, loose. */
export const V2 = {
  id: "05e7cf5bc8d7cfb6bc8e0383af92111017cc0d66",
  onDisk: 5_119,
} as const;

/**
 * After `git gc`, from `git verify-pack -v`.
 *
 * The newest copy stays whole and the older one becomes a delta against it,
 * which is the opposite of the "original plus changes" most people picture.
 * Git packs this way because the version checked out most often is the
 * newest, so that is the one it keeps ready to read.
 */
export const PACKED = {
  v2Whole: 5_112,
  v1Delta: 68,
  /** The delta's own data before the pack entry's header and zlib. */
  v1DeltaData: 56,
} as const;

export const CONDITIONS = "git 2.53.0 · default compression · 2 commits";
