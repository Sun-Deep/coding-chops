# Sources

- PostgreSQL 15 documentation, LIMIT and OFFSET: "The rows skipped by an
  OFFSET clause still have to be computed inside the server; therefore a
  large OFFSET might be inefficient."
  https://www.postgresql.org/docs/15/queries-limit.html
- The measurement in this repository, `scripts/measure-sql-offset.mjs`,
  which is the evidence for every number on screen.
