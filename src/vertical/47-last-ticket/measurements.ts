/**
 * What Postgres did, from `scripts/measure-last-ticket.mjs`.
 *
 * PostgreSQL 15.13 in a throwaway cluster. 1,000 races, each one show with
 * one seat left and two buyers in separate sessions, tapping within 0.2 s
 * of each other (a seeded gap per race), with 50 ms of payment between
 * reading seats_left and writing the ticket. Run with a plain SELECT and
 * with SELECT ... FOR UPDATE on the same gaps.
 *
 * The plain count depends on real timing near the boundary (taps about
 * 55 to 65 ms apart can go either way), so it moves a little between runs.
 * Five runs are recorded; the script checks a new run lands in that band,
 * that FOR UPDATE never sells twice, and that the race the reel plays sold
 * twice. Nothing else is timed.
 */

export const RUN = {
  races: 1000,
  paymentMs: 50,
  spreadMs: 200,
  /** Races sold twice with a plain SELECT, in five runs. */
  plainTwice: [327, 336, 329, 338, 342],
  /** Races sold twice with SELECT ... FOR UPDATE, every run. */
  lockedTwice: 0,
  /** The race the reel plays: the first the plain SELECT sold twice. */
  hero: { show: 2, gapMs: 19 },
} as const;

export const lowest = Math.min(...RUN.plainTwice);
export const highest = Math.max(...RUN.plainTwice);

export const CONDITIONS = "PostgreSQL 15.13 · 5 × 1,000 races";
