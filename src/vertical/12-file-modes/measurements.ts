/**
 * From `scripts/measure-file-modes.mjs`.
 *
 * Two kinds of figure here and they are not the same kind of claim.
 *
 * The arithmetic is exact. A mode is three octal digits, one for the owner, one
 * for the group and one for everyone else, and each digit is three bits worth
 * 4, 2 and 1. That is 8 x 8 x 8 = 512 modes, and the script derives all 512 two
 * independent ways and checks they agree rather than asserting it.
 *
 * The distribution is measured, on one disk, and the reel says so. What does
 * not move between machines is the shape: a handful of modes out of 512 cover
 * almost everything, because almost every file is either a document or a
 * program.
 */

export const READ = 4;
export const WRITE = 2;
export const EXECUTE = 1;

/** Eight values per digit, three digits. */
export const TOTAL_MODES = 8 ** 3;

/** Who each digit is dialled for, in the order a mode is written. */
export const AUDIENCES = ["You", "Group", "Everyone"] as const;

/**
 * System directories only: /usr/bin, /usr/lib, /etc and /usr/share/man.
 *
 * This repository was in the scan to begin with and made the figure drift,
 * because every file added to the project moved the count. The script's own
 * assertion fired the moment VR12's source was written, which is what it is
 * for. A number that changes because somebody did unrelated work is not a
 * measurement.
 */
export const SCAN = {
  files: 4_572,
  directories: 127,
  /** Of 512 possible. */
  distinct: 9,
} as const;

export type ModeRow = {
  readonly mode: string;
  readonly count: number;
  readonly share: number;
  /** What it is in plain words, because the octal is not the explanation. */
  readonly label: string;
};

/** Ranked by how many files carry them, which is the order the reel builds. */
export const TOP_MODES: readonly ModeRow[] = [
  { mode: "644", count: 2_574, share: 56.3, label: "a file you edit" },
  { mode: "444", count: 1_016, share: 22.2, label: "a file nobody edits" },
  { mode: "755", count: 806, share: 17.6, label: "a program anyone runs" },
  { mode: "555", count: 163, share: 3.6, label: "a program nobody edits" },
];

/** The claim: four of the 512 cover almost every file on the disk. */
export const TOP_FOUR_SHARE = 99.7;

/** The mode the cut opens on, because it is the one everybody has typed. */
export const OPENING_MODE = "755";

/**
 * The catch, run rather than described.
 *
 * A 644 file inside a 644 directory cannot be read. The file is fine; the
 * directory lost its execute bit, and on a directory that bit is not "run", it
 * is "enter". It is in the caption rather than the reel because it is a second
 * idea and this cut has one.
 */
export const DIRECTORY_CATCH = {
  fileMode: "644",
  openFolder: "755",
  closedFolder: "644",
  error: "EACCES",
} as const;
