import { DURATION, VERDICT_FROM, YOU_OUT, frameAt } from "./beats";
import { DAYS } from "./simulation";
import { FLOORS, RIDERS } from "./measurements";

/**
 * Every cue is a thing happening in one of the two buildings, read off the
 * simulation through `frameAt`, so a sound cannot drift from the car it
 * belongs to. Gains are derived from each file's measured peak.
 *
 * A car passing a floor is a quiet tick pitched by the floor, so a car going
 * up is a rising run and the in-order car's back and forth is audible as
 * back and forth. A car stopping is the lift's own ding. For the first third
 * both cars do exactly the same thing on the same frames, and a cue both
 * would fire is played once, not twice at double the level.
 */

type Name = "tick" | "ding" | "probe" | "land" | "name" | "settle";

export type Cue = {
  readonly id: string;
  readonly name: Name;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
};

const PEAK: Record<Name, number> = {
  tick: -22.9,
  ding: -20.2,
  probe: -37.5,
  land: -17.0,
  name: -16.0,
  settle: -23.2,
};

const gainFor = (name: Name, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;

const pitch = (floor: number) => 0.72 + ((floor - 1) / (FLOORS - 1)) * 0.5;

const raw: Cue[] = [];

for (const key of ["order", "sweep"] as const) {
  for (const leg of DAYS[key].legs) {
    if (leg.kind === "move") {
      raw.push({
        id: `${key}-pass-${leg.to}`,
        name: "tick",
        frame: Math.round(frameAt(leg.to)),
        rate: pitch(leg.toFloor),
        gain: gainFor("tick", -24),
      });
    }
    if (leg.kind === "stop") {
      raw.push({
        id: `${key}-ding-${leg.from}`,
        name: "ding",
        frame: Math.round(frameAt(leg.from)),
        rate: 1,
        gain: gainFor("ding", -11),
      });
    }
  }
}

for (const r of RIDERS) {
  raw.push({
    id: `call-${r.id}`,
    name: "probe",
    frame: Math.round(frameAt(r.at)),
    rate: pitch(r.from) * 1.3,
    gain: gainFor("probe", -14),
  });
}

raw.push(
  {
    id: "you-out-sweep",
    name: "name",
    frame: YOU_OUT.sweep,
    rate: 1.1,
    gain: gainFor("name", -6),
  },
  {
    id: "you-out-order",
    name: "land",
    frame: YOU_OUT.order,
    rate: 0.8,
    gain: gainFor("land", -8),
  },
  {
    id: "verdict",
    name: "settle",
    frame: VERDICT_FROM,
    rate: 1,
    gain: gainFor("settle", -7),
  },
);

const seen = new Set<string>();
export const CUES: readonly Cue[] = raw
  .filter((c) => c.frame >= 0 && c.frame < DURATION - 4)
  .filter((c) => {
    const k = `${c.name}-${c.frame}-${c.rate.toFixed(3)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
