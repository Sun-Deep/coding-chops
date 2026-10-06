import { DURATION, LOCK_FRAME, SIM_FROM, VERDICT_FROM, frameAt } from "./beats";
import { CAR_L, RECORD, STREETS, boxesOf } from "./simulation";
import { RUNS } from "./runs";

/**
 * Every cue is read off the runs. A soft tick each time a car clears a
 * junction, lower for the left grid and higher for the right, so the left
 * grid's rhythm audibly thins and stops while the right one carries on. A
 * reject each time a car on the left grid comes to a stop inside a junction,
 * the moment it starts blocking. A heavy landing when the loop closes. Gains
 * come from each file's measured peak.
 */

type Name = "tick" | "reject" | "land" | "settle";

export type Cue = {
  readonly id: string;
  readonly name: Name;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
};

const PEAK: Record<Name, number> = {
  tick: -22.9,
  reject: -19.0,
  land: -17.0,
  settle: -23.2,
};
const gainFor = (name: Name, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;

const inShot = (f: number) => f >= 0 && f < DURATION - 4;

const ticks = (key: "green" | "room", rate: number, target: number): Cue[] => {
  const out: Cue[] = [];
  let last = -Infinity;
  for (const t of RUNS[key].crossings) {
    if (t < SIM_FROM) continue;
    const f = Math.round(frameAt(t));
    if (!inShot(f) || f - last < 3) continue;
    last = f;
    out.push({
      id: `${key}-${f}`,
      name: "tick",
      frame: f,
      rate,
      gain: gainFor("tick", target),
    });
  }
  return out;
};

const BOXES = STREETS.map(boxesOf);
const stops = (): Cue[] => {
  const frames: number[] = [];
  for (const c of RUNS.green.cars) {
    let was = false;
    for (let k = 0; k < c.s.length; k++) {
      const s = c.s[k];
      const now =
        c.v[k] < 0.3 &&
        BOXES[c.street].some((b) => s > b.sIn + 0.3 && s - CAR_L < b.sOut);
      if (now && !was) {
        const f = Math.round(frameAt(c.on + k * RECORD));
        if (inShot(f) && f < LOCK_FRAME) frames.push(f);
      }
      was = now;
    }
  }
  return [...new Set(frames)]
    .sort((a, b) => a - b)
    .map((f) => ({
      id: `stop-${f}`,
      name: "reject" as const,
      frame: f,
      rate: 0.9,
      gain: gainFor("reject", -12),
    }));
};

export const CUES: readonly Cue[] = [
  ...ticks("green", 0.8, -15),
  ...ticks("room", 1.15, -15),
  ...stops(),
  {
    id: "lock",
    name: "land",
    frame: LOCK_FRAME,
    rate: 0.85,
    gain: gainFor("land", -3),
  },
  {
    id: "verdict",
    name: "settle",
    frame: VERDICT_FROM,
    rate: 1,
    gain: gainFor("settle", -6),
  },
];
