# Sources

- PostgreSQL 15 documentation, SELECT, "Description": the FROM list is
  computed, WHERE eliminates rows, GROUP BY and HAVING form and filter
  groups, the output expressions are computed, then ORDER BY and LIMIT;
  and the note that an output column's name can be used in ORDER BY and
  GROUP BY but not in WHERE or HAVING.
- PostgreSQL 15 documentation, "Using EXPLAIN": reading a plan from the
  innermost node out, and what "Rows Removed by Filter" counts.
- The run: `scripts/measure-sql-order.mjs`, PostgreSQL 15.13, which loads
  the rows from `src/vertical/44-sql-order/data.ts`, the same module the
  scene draws.
