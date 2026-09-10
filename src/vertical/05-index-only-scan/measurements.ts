/**
 * Every number this reel puts on screen, and where it came from.
 *
 * All of them were measured on 2026-09-10 rather than recalled. The full run,
 * including the SQL and the raw `EXPLAIN` output, is in
 * `curriculum/vertical/05-index-only-scan/measurements.md`. Nothing in the
 * shots hardcodes a figure, so correcting a measurement corrects the frame.
 *
 *   PostgreSQL 15.13, Homebrew, aarch64-apple-darwin24.4.0
 *   the same machine and configuration as VR01, because this is VR01's third lane
 *   table events(id bigint, cust_id int, day_id int, amount int, note text)
 *   10,000,000 rows, 965 MB heap, 123,457 pages
 *   query: SELECT sum(amount) FROM events WHERE cust_id = 42;
 */

export const SETUP = {
  rows: 10_000_000,
  heapMb: 965,
  heapPages: 123_457,
  postgres: "15.13",
  /** 100 distinct values in each key column, so the lanes are comparable. */
  distinctValues: 100,
  key: "42",
} as const;

/**
 * The controlled pair.
 *
 * `cust_id` is hashed and `day_id` is the row number in buckets. Same number of
 * distinct values, same rows per value, opposite physical layout. `correlation`
 * is from `pg_stats` and is the variable the whole cut turns on.
 */
export const LAYOUT = {
  scattered: { column: "cust_id", correlation: 0.006, matchingRows: 100_366 },
  contiguous: { column: "day_id", correlation: 1.0, matchingRows: 100_000 },
} as const;

/**
 * Scattered rows, three lanes. Pages are from `Buffers: shared`, identical in
 * both runs. Milliseconds are the warm runs, which moved about 7 percent
 * between them, so they are rounded on screen.
 *
 * The plain index lane is a Parallel Bitmap Heap Scan, and its 69,211 is two
 * effects at once: 100,366 scattered rows land on close to 100,000 distinct
 * pages, and the bitmap goes lossy at the default 4 MB `work_mem`, which adds
 * 872,200 rechecked rows. The cut must not sell it as correlation alone.
 */
export const SCATTERED = [
  { lane: "no index", plan: "Parallel Seq Scan", pages: 123_457, ms: 140, heapFetches: null },
  { lane: "plain index", plan: "Parallel Bitmap Heap Scan", pages: 69_211, ms: 117, heapFetches: null },
  { lane: "covering index", plan: "Index Only Scan", pages: 281, ms: 4.8, heapFetches: 0 },
] as const;

/**
 * Contiguous rows, the counterweight. Without this lane the finding is not true
 * in general: an in-order plain index already reads 1,322 pages, so the
 * covering index is worth 4.8 times here and 246 times when scattered.
 */
export const CONTIGUOUS = [
  { lane: "plain index", plan: "Index Scan", pages: 1_322, ms: 6.8, heapFetches: null },
  { lane: "covering index", plan: "Index Only Scan", pages: 277, ms: 4.6, heapFetches: 0 },
] as const;

/** What the second copy of `amount` costs. 215 over 66 is 3.3. */
export const INDEX_SIZE = {
  plainMb: 66,
  plainPages: 8_468,
  coveringMb: 215,
  coveringPages: 27_460,
  buildSeconds: 5.1,
  growth: 3.3,
} as const;

/**
 * The catch. An index-only scan is a property of how recently `VACUUM` ran, not
 * of the index. One percent of rows updated, `ANALYZE` run, `VACUUM` withheld,
 * and the same covering index falls back to the bitmap heap scan.
 *
 * The 10,790 ms first run after the update is not included. It was writing out
 * dirtied pages and is not a measurement of the plan.
 */
export const STALE_VISIBILITY_MAP = {
  rowsUpdated: 100_000,
  stalePages: 70_103,
  staleMs: 187,
  afterVacuumPages: 284,
  afterVacuumMs: 6,
} as const;

/**
 * Pages the bitmap index scan itself read to find all 100,366 entries, from
 * `Bitmap Index Scan ... Buffers: shared read=88`.
 *
 * The number the caption leans on, and the reason the cut is not about indexes
 * being slow. Finding the rows cost 88 pages. Going and getting them cost the
 * other 69,123.
 */
export const INDEX_PAGES_READ = 88;

/** 69,211 over 281, the scattered plain index against the covering index. */
export const PAGE_RATIO = 246;

export const commas = (value: number) => value.toLocaleString("en-US");
