import { MEASURED } from "./measurements";
import { blockages, run } from "./simulation";

export const RUN = run();
const visit = (bus: number, stop: number) =>
  RUN.visits.find((v) => v.bus === bus && v.stop === stop && v.arrival >= 35);
const a = visit(0, 0);
const b = visit(0, 1);
const c = visit(1, 0);
const d = visit(0, 2);
const e = visit(1, 2);
if (
  a?.queueAtArrival !== MEASURED.firstQueue ||
  a.boarded !== MEASURED.firstBoarded ||
  b?.queueAtArrival !== MEASURED.nextQueue ||
  c?.queueAtArrival !== MEASURED.followingQueue ||
  d?.departure !== MEASURED.thirdDeparture[0] ||
  e?.departure !== MEASURED.thirdDeparture[1]
)
  throw new Error(
    `Bus model changed: ${JSON.stringify({ a, b, c, d, e })}. Rerun the measurement before rendering.`,
  );

const block = blockages(RUN)[0];
if (
  block.from !== MEASURED.blocked.from ||
  block.to !== MEASURED.blocked.to ||
  block.seconds !== MEASURED.blocked.seconds ||
  Math.round(block.seconds) !== MEASURED.blocked.roundedSeconds
)
  throw new Error(
    "Bus blockage changed. Rerun the measurement before rendering.",
  );
