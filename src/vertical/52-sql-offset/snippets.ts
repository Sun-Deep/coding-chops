import { PAGE, RUN } from "./measurements";

/**
 * The two queries, one clause a line, so each line can light as it runs.
 * `scripts/measure-sql-offset.mjs` joins these same lines and runs them for
 * every page it measures, so the SQL on screen is the SQL measured. Both
 * return the same 100 rows.
 */
export const offsetLines = (n: number) =>
  [
    "SELECT id, customer, amount FROM orders",
    "ORDER BY id",
    `OFFSET ${n}`,
    `LIMIT ${PAGE}`,
  ] as const;

export const keysetLines = (n: number) =>
  [
    "SELECT id, customer, amount FROM orders",
    `WHERE id > ${n}`,
    "ORDER BY id",
    `LIMIT ${PAGE}`,
  ] as const;

/** The page the reel shows. */
export const OFFSET_SQL = offsetLines(RUN.hero.offset);
export const KEYSET_SQL = keysetLines(RUN.hero.offset);
