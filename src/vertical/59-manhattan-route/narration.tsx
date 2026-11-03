import type { NarrationLine } from "../../shared/vertical/Narration";
import { ACCENT } from "../../shared/vertical/palette";
import * as B from "./beats";
import { RATIO } from "./measurements";

/**
 * Seventeen words. The picture carries the cause; these say which search is
 * which while it happens, and the one number at the end.
 */
export const narration: readonly NarrationLine[] = [
  { from: 6, to: B.ASTAR_DONE + 2, text: "A* heads for Wall Street." },
  {
    from: B.ASTAR_DONE + 10,
    to: B.DIJKSTRA_DONE - 4,
    text: (
      <>
        Dijkstra checks every street
        <br />
        nearer than Wall Street first.
      </>
    ),
  },
  {
    from: B.DIJKSTRA_DONE + 2,
    to: B.VERDICT - 4,
    emphasis: true,
    text: "Same route.",
  },
  {
    from: B.VERDICT,
    to: 416,
    emphasis: true,
    text: (
      <>
        A* checked <span style={{ color: ACCENT }}>{Math.floor(RATIO)}x</span>{" "}
        fewer.
      </>
    ),
  },
];
