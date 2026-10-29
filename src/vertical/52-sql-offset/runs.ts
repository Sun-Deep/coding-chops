import { CRATES, CRATE_ORDERS, PAGE_CRATE, READS, SKIPPED } from "./wall";
import { PAGE, RUN, TABLE_ROWS } from "./measurements";

/**
 * The run the reel draws, checked against itself on load. Postgres is
 * checked by `scripts/measure-sql-offset.mjs`; this catches the wall and
 * the recorded counts disagreeing.
 */
if (RUN.hero.offsetRead !== RUN.hero.offset + PAGE)
  throw new Error("runs.ts: OFFSET should read the skipped rows plus a page");
if (RUN.hero.keysetRead !== PAGE)
  throw new Error("runs.ts: keyset should read one page");
if (READS.length * CRATE_ORDERS !== RUN.hero.offset)
  throw new Error("runs.ts: the crates read are not the rows skipped");
if (SKIPPED * CRATE_ORDERS !== RUN.hero.offset)
  throw new Error("runs.ts: the crates dumped are not the rows skipped");
if (PAGE_CRATE >= CRATES)
  throw new Error("runs.ts: the page's crate is not on the wall");
if (PAGE > CRATE_ORDERS)
  throw new Error("runs.ts: a page has to fit in one crate");
if (RUN.hero.offset >= TABLE_ROWS)
  throw new Error("runs.ts: the page is past the end of the table");
