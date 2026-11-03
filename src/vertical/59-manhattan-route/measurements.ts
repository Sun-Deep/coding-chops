/**
 * Copied from `curriculum/vertical/59-manhattan-route/runs/route.json`,
 * written by `scripts/measure-delivery-route.mjs` on the OpenStreetMap
 * snapshot of 3 November 2026. `scripts/blender/manhattan/export.mjs`
 * refuses to run if these drift from that file.
 */
export const RUN = {
  osmSnapshot: "2026-11-03T08:28:45Z",
  intersections: 63050,
  dijkstra: 21559,
  astar: 1062,
  routeMetres: 13231.2,
  sameRoute: true,
} as const;

export const RATIO = RUN.dijkstra / RUN.astar;
export const ROUTE_KM = (RUN.routeMetres / 1000).toFixed(1);
