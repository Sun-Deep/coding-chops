import {
  DURATION,
  PASS_FRAMES,
  VERDICT_FROM,
  YOU_SERVED,
  frameAt,
} from "./beats";
import { SHOPPERS } from "./measurements";
import { VISITS } from "./simulation";

/**
 * Every cue is something happening in one of the two shops, read off the
 * simulation through `frameAt`. Gains are derived from each file's measured
 * peak.
 *
 * A shopper reaching a till is the scanner's beep, and one leaving is a
 * light tick. Somebody who joined after
 * you being served before you is a pluck that rises with the count, so the
 * left shop's unfairness is audible as a climbing run while your clock keeps
 * going. A cue both shops would fire on the same frame is played once.
 */

type Name = "beep" | "tick" | "probe" | "land" | "name" | "settle";

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
  probe: -37.5,
  land: -17.0,
  name: -16.0,
  settle: -23.2,
};

const gainFor = (name: Name, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;

const raw: Cue[] = [];

for (const key of ["shortest", "shared"] as const) {
  VISITS[key].forEach((v, id) => {
    raw.push({
      id: `${key}-beep-${id}`,
      name: "beep",
      frame: Math.round(frameAt(v.start)),
      rate: key === "shortest" ? 1 : 1.06,
      gain: gainFor("beep", -18),
    });
    raw.push({
      id: `${key}-leave-${id}`,
      name: "tick",
      frame: Math.round(frameAt(v.end)),
      rate: 1.25,
      gain: gainFor("tick", -21),
    });
  });
}

for (const c of SHOPPERS) {
  raw.push({
    id: `in-${c.id}`,
    name: "tick",
    frame: Math.round(frameAt(c.at)),
    rate: 0.8,
    gain: gainFor("tick", -24),
  });
}

PASS_FRAMES.forEach((frame, k) => {
  raw.push({
    id: `passed-${k}`,
    name: "probe",
    frame: frame + 2,
    rate: 0.9 * 2 ** ((k * 2) / 12),
    gain: gainFor("probe", -18 + k * 0.4),
  });
});

raw.push(
  {
    id: "you-shared",
    name: "name",
    frame: YOU_SERVED.shared,
    rate: 1.1,
    gain: gainFor("name", -5),
  },
  {
    id: "you-shortest",
    name: "land",
    frame: YOU_SERVED.shortest,
    rate: 0.8,
    gain: gainFor("land", -6),
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
    const k = `${c.name}-${c.frame}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
