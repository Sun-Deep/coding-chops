/**
 * Every number this reel puts on screen, and where it came from.
 *
 * All of them were measured on 2026-09-05 rather than recalled. The full run,
 * including the SQL and the raw `EXPLAIN` output, is in
 * `curriculum/vertical/01-database-index/measurements.md`. Nothing in the shots
 * hardcodes a figure, so correcting a measurement corrects the frame.
 *
 *   PostgreSQL 15.13, Homebrew, aarch64-apple-darwin24.4.0
 *   table events(id bigint, user_id bigint, amount int, note text)
 *   10,000,000 rows, 498 MB heap, warm shared buffers
 *   query: SELECT amount FROM events WHERE user_id = 8675309;
 */

export const SETUP = {
  rows: 10_000_000,
  heapMb: 498,
  postgres: "15.13",
  /** The literal in the query, kept here so the shot and the note agree. */
  key: "8675309",
} as const;

/** Parallel Seq Scan, three runs, 103.3 / 104.4 / 105.5 ms. */
export const SEQ = {
  /** Sum of "Rows Removed by Filter" across the three workers. */
  rowsDiscarded: 9_999_999,
  rowsMatched: 1,
  /** shared hit=16176 + read=47519. */
  pages: 63_695,
  ms: 104,
} as const;

/**
 * Index Scan on a b-tree over `user_id`.
 *
 * `bt_metap` reports root level 2, so three pages take a lookup from the root
 * to a leaf. `bt_page_stats` gives the fanout at each of them, which is what
 * makes the descent below a measurement rather than a diagram.
 */
export const INDEX = {
  sizeMb: 214,
  buildSeconds: 1.9,
  /** Pages of any kind touched, from `Buffers: shared hit=7`. */
  pages: 7,
  ms: 0.03,
  /** Root, one internal level, leaf. The heap fetch is the fourth read. */
  height: 3,
} as const;

/**
 * How many rows are still possible after each page read.
 *
 * 97 root children, 285 per internal page, 367 entries per leaf, all from
 * `bt_page_stats`. 97 x 285 x 367 is 10,145,715, which is the same 10 million
 * rows with the fill factor left in.
 */
export const DESCENT = [
  { page: "root", fanout: 97, remaining: 10_000_000 },
  { page: "internal", fanout: 285, remaining: 103_093 },
  { page: "leaf", fanout: 367, remaining: 362 },
  { page: "heap", fanout: 1, remaining: 1 },
] as const;

/**
 * What the index costs on write.
 *
 * 500,000 inserts into an empty table carrying 0, 1 and 3 indexes. Two runs on
 * the same machine:
 *
 *   indexes   run 1    run 2
 *   0         1.73 s   1.16 s
 *   1         2.50 s   1.71 s
 *   3         5.13 s   3.58 s
 *
 * The absolute seconds move by half between runs, because insert timing depends
 * on the page cache, the WAL and whatever the background writer is doing. The
 * ratio does not: three indexes came out 2.96 and 3.08 times the no-index run.
 *
 * So the ratio is what goes on screen. A figure that changes when you run it
 * again is not a measurement, it is a reading, and the whole claim of this
 * format is that the numbers hold up.
 */
export const WRITES = {
  inserts: 500_000,
  /** Three indexes over none. */
  slowdown: 3,
} as const;

/** 104 ms over 0.03 ms, rounded down to the nearest hundred. */
export const SPEEDUP = 3_400;

export const commas = (value: number) => value.toLocaleString("en-US");
