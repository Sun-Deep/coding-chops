import { RUN } from "./measurements";

/**
 * The run the reel draws, checked against itself on load. Postgres is
 * checked by `scripts/measure-last-ticket.mjs`; this catches the file
 * disagreeing with itself.
 */
if (RUN.lockedTwice !== 0)
  throw new Error("runs.ts: the reel says FOR UPDATE never sold twice");
if (RUN.plainTwice.some((n) => n <= 0 || n >= RUN.races))
  throw new Error("runs.ts: a plain run is out of range");
const mean = RUN.plainTwice.reduce((a, b) => a + b, 0) / RUN.plainTwice.length;
if (Math.round(RUN.races / mean) !== 3)
  throw new Error(
    `runs.ts: the reel says 1 in 3; the runs say 1 in ${RUN.races / mean}`,
  );
if (RUN.hero.gapMs >= 50)
  throw new Error(
    "runs.ts: the hero race should be well inside the double-sell window",
  );
