import * as B from "./beats";

/**
 * From the recorded CC0 set in `public/sfx/kenney/`: a light tick for A*'s
 * search as it runs, a chime when it reaches Wall Street, a switch as the
 * route is traced back, slower and lower ticks under Dijkstra's flood that
 * grow louder as it spreads, a bell when Dijkstra arrives, and the verdict
 * landing.
 */

const cue = (
  id: string,
  name: string,
  frame: number,
  db: number,
  rate = 1,
) => ({
  id,
  name: `kenney/${name}`,
  frame: Math.round(frame),
  gain: Math.round(10 ** ((db + 1) / 20) * 1000) / 1000,
  rate,
});

const every = (from: number, to: number, step: number) =>
  Array.from(
    { length: Math.floor((to - from) / step) + 1 },
    (_, i) => from + i * step,
  );

export const CUES = [
  cue("go", "click_003", B.START, -10),
  ...every(B.START + 3, B.ASTAR_DONE - 3, 3).map((f, i) =>
    cue(`astar-${i}`, i % 2 ? "tick_001" : "tick_002", f, -17, 1.25),
  ),
  cue("found", "confirmation_001", B.ASTAR_DONE, -6),
  cue("trace", "switch_003", B.ASTAR_DONE + 4, -12),
  ...every(B.ASTAR_DONE + 16, B.DIJKSTRA_DONE - 6, 6).map((f, i, all) =>
    cue(
      `dijkstra-${i}`,
      i % 2 ? "tick_001" : "tick_002",
      f,
      -22 + (8 * i) / all.length,
      0.85,
    ),
  ),
  cue("arrived", "impactBell_heavy_000", B.DIJKSTRA_DONE, -9),
  cue("verdict", "impactSoft_heavy_000", B.VERDICT, -3),
];
