import { DURATION, SIM_FROM, SPEED, VERDICT_FROM } from "./beats";
import { RUNS } from "./runs";

/**
 * Every cue is somebody stepping off at the top, read off the runs: a soft
 * tick, lower on the left escalator and higher on the right, so the right
 * one is audibly the faster rhythm. At most one tick every two frames per
 * escalator. Gains come from each file's measured peak.
 */

type Name = "tick" | "settle";

export type Cue = {
  readonly id: string;
  readonly name: Name;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
};

const PEAK: Record<Name, number> = { tick: -22.9, settle: -23.2 };
const gainFor = (name: Name, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;

const offs = (key: "walkLeft" | "standBoth", rate: number): Cue[] => {
  const frames = [...RUNS[key].lanes[0], ...RUNS[key].lanes[1]]
    .map((r) => Math.round(((r.off - SIM_FROM) / SPEED) * 30))
    .filter((f) => f >= 0 && f < DURATION - 4)
    .sort((a, b) => a - b);
  const out: Cue[] = [];
  let last = -Infinity;
  for (const f of frames) {
    if (f - last < 2) continue;
    last = f;
    out.push({
      id: `${key}-${f}`,
      name: "tick",
      frame: f,
      rate,
      gain: gainFor("tick", -13),
    });
  }
  return out;
};

export const CUES: readonly Cue[] = [
  ...offs("walkLeft", 0.8),
  ...offs("standBoth", 1.15),
  {
    id: "verdict",
    name: "settle",
    frame: VERDICT_FROM,
    rate: 1,
    gain: gainFor("settle", -5),
  },
];
