import { DURATION, VERDICT_FROM, frameAt } from "./beats";
import { RUNS } from "./runs";
import type { Method } from "./simulation";
import { CHECK } from "./simulation";

/**
 * Every cue is read off the searches. A check that finds power beeps; one
 * that finds none clicks low; the string lighting up chimes. Lower on the
 * left, higher on the right. When the left hurries through its bulbs the
 * checks come at most one every three frames. Gains come from each file's
 * measured peak.
 */

type Name = "beep" | "tick" | "solved" | "settle";

export type Cue = {
  readonly id: string;
  readonly name: Name;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
};

const PEAK: Record<Name, number> = {
  beep: -29.4,
  tick: -22.9,
  solved: -22.7,
  settle: -23.2,
};
const gainFor = (name: Name, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;

const tree = (method: Method, rate: number): Cue[] => {
  const out: Cue[] = [];
  let last = -Infinity;
  for (const c of RUNS[method].checks) {
    const f = Math.round(frameAt(c.t - CHECK));
    if (f < 0 || f >= DURATION - 4 || f - last < 3) continue;
    last = f;
    out.push({
      id: `${method}-${f}`,
      name: c.power ? "beep" : "tick",
      frame: f,
      rate: rate * (c.power ? 1 : 0.7),
      gain: c.power ? gainFor("beep", -15) : gainFor("tick", -14),
    });
  }
  const lit = Math.round(frameAt(RUNS[method].lit));
  if (lit < DURATION - 4)
    out.push({
      id: `${method}-lit`,
      name: "solved",
      frame: lit,
      rate,
      gain: gainFor("solved", -7),
    });
  return out;
};

export const CUES: readonly Cue[] = [
  ...tree("linear", 0.85),
  ...tree("binary", 1.1),
  {
    id: "verdict",
    name: "settle",
    frame: VERDICT_FROM,
    rate: 1,
    gain: gainFor("settle", -7),
  },
];
