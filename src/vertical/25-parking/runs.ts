import { SEED, trip, type DriverKey, type Trip } from "./parking";
import { DRIVEN_M, SECONDS, STALL_ROW } from "./measurements";
import { STALLS } from "./parking";

/** The two trips the reel draws, checked on load against `measurements.ts`. */
export const TRIPS: Record<DriverKey, Trip> = {
  row: trip("row", SEED, undefined, true),
  circle: trip("circle", SEED, undefined, true),
};

for (const d of ["row", "circle"] as const) {
  const tr = TRIPS[d];
  if (
    tr.seconds !== SECONDS[d] ||
    Math.round(tr.drivenMetres) !== DRIVEN_M[d] ||
    tr.stall % STALLS !== STALL_ROW[d]
  ) {
    throw new Error(`runs.ts: the ${d} trip disagrees with measurements.ts`);
  }
}
