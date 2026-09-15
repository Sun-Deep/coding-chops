import type { NarrationLine } from "../../shared/vertical/Narration";
import { CHEAPEST, FEWEST_STEPS_COST, MUD_COST, RUNS } from "./measurements";

/**
 * Thirty-two words, cut to what the frame is doing.
 *
 * Line four arrives before the first walk and names the thing the picture is
 * about to show. Without it the two walks are two lines and a pair of numbers;
 * with it they are an explanation, because the mud the short route crosses
 * lights up under the walker as it is paid for.
 *
 * A sixth line said "All six find the exit" and went, at 38 words for fourteen
 * seconds against the format's rough 28. The panels were already saying it.
 */
export const narration: readonly NarrationLine[] = [
  { from: 6, to: 84, text: `Six searches. One maze. Mud costs ${MUD_COST}.` },
  { from: 96, to: 168, text: "Greedy searches least and pays most." },
  { from: 180, to: 250, text: "The rest flood the whole maze." },
  { from: 262, to: 344, text: "The short way goes through mud." },
  {
    from: 356,
    to: 412,
    emphasis: true,
    text: `${RUNS.bfs.steps} steps cost ${FEWEST_STEPS_COST}. ${RUNS.dijkstra.steps} cost ${CHEAPEST}.`,
  },
];
