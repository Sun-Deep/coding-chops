import { COINS, HERO, solve } from "./simulation";
import { MEASURED } from "./measurements";

export const RUN = solve(HERO);
const all = Array.from({ length: COINS }, (_, id) => solve(id));
const counts = [COINS, ...RUN.steps.map((step) => step.remaining.length)];
if (
  COINS !== MEASURED.coins ||
  RUN.steps.length !== MEASURED.weighings ||
  all.filter((run) => run.found === run.target).length !== MEASURED.solved ||
  counts.some((count, i) => count !== MEASURED.candidates[i])
)
  throw new Error(
    "Coin puzzle changed. Run scripts/measure-coin-puzzle.mjs again.",
  );
