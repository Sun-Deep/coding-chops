import { DONE_AT, DURATION, VERDICT_FROM, frameAt } from "./beats";
import { METHODS } from "./boarding";
import { RUNS } from "./runs";

/**
 * Every cue is a passenger sitting down, read off the simulation, so a cabin
 * filling fast is a fast run of soft taps and a jammed one goes quiet. A cue
 * fires at most every two frames across all three cabins. Each cabin's last
 * passenger sitting down is a chord. Gains come from each file's measured peak.
 */

type Name = "tick" | "solved" | "settle";

export type Cue = {
  readonly id: string;
  readonly name: Name;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
};

const PEAK: Record<Name, number> = {
  tick: -22.9,
  solved: -22.7,
  settle: -23.2,
};

const gainFor = (name: Name, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;

const RATE: Record<string, number> = {
  backToFront: 0.8,
  random: 1.0,
  windowFirst: 1.2,
};

const sits = METHODS.flatMap((m) =>
  RUNS[m].seatedAt.map((s, i) => ({
    m,
    i,
    frame: Math.round(frameAt(s)),
  })),
).sort((a, b) => a.frame - b.frame);

const taps: Cue[] = [];
let last = -Infinity;
for (const s of sits) {
  if (s.frame - last < 2) continue;
  last = s.frame;
  taps.push({
    id: `sit-${s.m}-${s.i}`,
    name: "tick",
    frame: s.frame,
    rate: RATE[s.m],
    gain: gainFor("tick", -19),
  });
}

const all: Cue[] = [
  ...taps,
  ...METHODS.map((m, k) => ({
    id: `done-${m}`,
    name: "solved" as const,
    frame: DONE_AT[m],
    rate: [0.85, 1.0, 1.2][k],
    gain: gainFor("solved", -4),
  })),
  {
    id: "verdict",
    name: "settle",
    frame: VERDICT_FROM,
    rate: 1,
    gain: gainFor("settle", -8),
  },
];

export const CUES: readonly Cue[] = all.filter(
  (c) => c.frame >= 0 && c.frame < DURATION - 4,
);
