/**
 * Every number the reel shows, from `scripts/measure-sql-offset.mjs`:
 * PostgreSQL 15.13 on an Apple M5 Pro, 28 Oct 2026, 1,000,000 orders with
 * the id as primary key, 100 a page, each time the median of 51 runs after
 * a warm-up. Both queries return the same 100 rows; the read counts are
 * the index scan's actual rows from EXPLAIN ANALYZE.
 */
export const TABLE_ROWS = 1000000;
export const PAGE = 100;

export const RUN = {
  /** The page the reel shows: page 1,001, after 100,000 orders. */
  hero: {
    offset: 100000,
    offsetRead: 100100,
    keysetRead: 100,
    offsetMs: 5.314,
    keysetMs: 0.024,
  },
  /** Every page measured, for the readouts. */
  pages: [
    {
      offset: 0,
      offsetRead: 100,
      offsetMs: 0.021,
      keysetRead: 100,
      keysetMs: 0.019,
    },
    {
      offset: 1000,
      offsetRead: 1100,
      offsetMs: 0.078,
      keysetRead: 100,
      keysetMs: 0.023,
    },
    {
      offset: 10000,
      offsetRead: 10100,
      offsetMs: 0.574,
      keysetRead: 100,
      keysetMs: 0.023,
    },
    {
      offset: 100000,
      offsetRead: 100100,
      offsetMs: 5.314,
      keysetRead: 100,
      keysetMs: 0.024,
    },
    {
      offset: 500000,
      offsetRead: 500100,
      offsetMs: 26.846,
      keysetRead: 100,
      keysetMs: 0.028,
    },
    {
      offset: 900000,
      offsetRead: 900100,
      offsetMs: 48.869,
      keysetRead: 100,
      keysetMs: 0.026,
    },
  ],
  postgres: "PostgreSQL 15.13",
  /** How far a timing may drift from the recorded one before the check fails. */
  band: 0.5,
} as const;
