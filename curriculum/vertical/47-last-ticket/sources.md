# Sources

- PostgreSQL 15 documentation, "Explicit Locking", row-level locks: FOR
  UPDATE locks the rows retrieved as though for update, so other
  transactions that try to lock or modify them block until the current
  transaction ends.
- PostgreSQL 15 documentation, "Transaction Isolation": at the default
  Read Committed level a plain SELECT sees only data committed before the
  query began, so two transactions can both read the same seats_left.
- The run: `scripts/measure-last-ticket.mjs`, PostgreSQL 15.13.
