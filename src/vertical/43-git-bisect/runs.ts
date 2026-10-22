import { CHECKS } from "./beats";
import { RUN } from "./measurements";
import { LEFT, LINES, TESTED } from "./transcript";

/**
 * The run the reel draws, checked against itself on load. The numbers are
 * checked against git by `scripts/measure-git-bisect.mjs`, which reruns
 * everything and fails if `measurements.ts` disagrees; this catches the
 * file disagreeing with itself, which no rerun would.
 */
const results = RUN.transcript
  .filter((l) => l.startsWith("ok ") || l.startsWith("FAIL "))
  .map((l) => (l.startsWith("ok ") ? "good" : "bad"));
if (JSON.stringify(results) !== JSON.stringify(RUN.steps.map((s) => s.result)))
  throw new Error("runs.ts: the test results disagree with RUN.steps");
if (RUN.steps.length > RUN.mostBisect)
  throw new Error("runs.ts: more checks than the worst case");
if (RUN.found !== RUN.bad)
  throw new Error(`runs.ts: git found ${RUN.found}, the bug is in ${RUN.bad}`);
if (TESTED[TESTED.length - 1] !== RUN.hash)
  throw new Error("runs.ts: the last commit tested is not the one git names");
if (LEFT[LEFT.length - 1] !== 0 || CHECKS.length !== RUN.steps.length)
  throw new Error("runs.ts: the run does not end at 0 left");
if (RUN.oneByOne !== RUN.commits + 1 - RUN.bad)
  throw new Error(
    "runs.ts: one at a time should take 1,001 minus the bad commit",
  );
void LINES;
