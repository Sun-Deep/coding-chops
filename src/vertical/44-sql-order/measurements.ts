/**
 * What Postgres did, from `scripts/measure-sql-order.mjs`.
 *
 * PostgreSQL 15.13 in a throwaway cluster, the 1,000 orders in `data.ts`,
 * the query in `data.ts` under EXPLAIN ANALYZE. The row counts are the
 * plan's own: the scan's rows and rows removed by its filter, the
 * aggregate's groups and groups removed by HAVING, the limit's rows. The
 * script checks them against separate count queries and against data.ts
 * worked by hand, and exits 1 if this file disagrees. Nothing is timed.
 */

export const RUN = {
  /** Rows read by the scan: FROM. */
  from: 1000,
  /** Rows the scan's filter kept: WHERE. */
  where: 626,
  /** Customers grouped: GROUP BY. */
  groups: 98,
  /** Groups the aggregate's filter kept: HAVING. */
  having: 29,
  /** Rows out of the top: LIMIT. */
  limit: 5,
  /** The query's result, totals in cents. */
  top: [
    { customer: "Uma", total: 192824 },
    { customer: "Kiran", total: 132388 },
    { customer: "Mina", total: 129402 },
    { customer: "Jade", total: 117172 },
    { customer: "Dara", total: 114735 },
  ],
  /** psql's first line for the SELECT alias used in WHERE. */
  errorInWhere: 'ERROR:  column "total" does not exist',
  /** Rows back for the same alias used in ORDER BY. */
  orderByRows: 1,
};

export const CONDITIONS = "PostgreSQL 15.13 · EXPLAIN ANALYZE · 1,000 orders";
