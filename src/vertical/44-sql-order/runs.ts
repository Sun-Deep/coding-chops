import { orders, steps } from "./data";
import { RUN } from "./measurements";

/**
 * The rows the scene draws, worked through by hand on load and checked
 * against what Postgres reported in `measurements.ts`. The script checks
 * Postgres itself; this catches data.ts changing without a rerun.
 */
const s = steps(orders());
const got = {
  from: s.from,
  where: s.where,
  groups: s.groups,
  having: s.having,
  limit: s.limit.length,
  top: s.limit.map(({ customer, total }) => ({ customer, total })),
};
const want = {
  from: RUN.from,
  where: RUN.where,
  groups: RUN.groups,
  having: RUN.having,
  limit: RUN.limit,
  top: RUN.top,
};
if (JSON.stringify(got) !== JSON.stringify(want))
  throw new Error(
    `runs.ts: data.ts gives ${JSON.stringify(got)}, measurements.ts says ${JSON.stringify(want)}`,
  );
