import { RUN } from "./measurements";

/**
 * The run the reel draws, checked against itself on load. The script
 * checks it against Python; this catches the file disagreeing with itself.
 */
const last = RUN.running[RUN.running.length - 1];
if (RUN.stick + RUN.switch !== RUN.games)
  throw new Error("runs.ts: every game is won by sticking or by switching");
if (last[0] !== RUN.stick || last[1] !== RUN.switch)
  throw new Error("runs.ts: the running tally does not end on the totals");
if (RUN.cars.length !== 300 || RUN.opened.length !== 300)
  throw new Error("runs.ts: the reel draws 300 games");
const shownStick = [...RUN.cars].filter((c) => c === "1").length;
if (shownStick !== RUN.shownStick)
  throw new Error("runs.ts: shownStick disagrees with the cars");
for (let i = 0; i < 300; i++)
  if (RUN.opened[i] === RUN.cars[i] || RUN.opened[i] === "1")
    throw new Error(`runs.ts: game ${i + 1} opened the car or your door`);
