import { DURATION, VERDICT_FROM, frameAt } from "./beats";
import { RUNS, YOU } from "./runs";
import type { Rule } from "./simulation";

/**
 * Every cue is read off the gyms. A low room hum under the whole reel. On
 * each bench: a clank when a set ends and the bar goes back on the hooks, and
 * a lighter slide when a different lifter starts changing the plates. A
 * brighter sound when your turn comes, which happens only below. At
 * most one cue every three frames per gym. Gains come from each file's
 * measured peak.
 */

type Name = "scan" | "land" | "plate-lift" | "solved" | "settle";

export type Cue = {
  readonly id: string;
  readonly name: Name;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
  readonly length?: number;
};

const PEAK: Record<Name, number> = {
  scan: -37.8,
  land: -17.0,
  "plate-lift": -24.1,
  solved: -22.7,
  settle: -23.2,
};
const gainFor = (name: Name, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;

type Event = "land" | "plate-lift" | "solved";
const LEVEL: Record<Event, number> = {
  land: -8,
  "plate-lift": -12,
  solved: -4,
};

const gym = (rule: Rule, rate: number): Cue[] => {
  const raw: { name: Event; f: number }[] = [];
  for (const l of RUNS[rule]) {
    l.sets.forEach((s, i) => {
      if (s.lift > s.swap)
        raw.push({ name: "plate-lift", f: Math.round(frameAt(s.swap)) });
      raw.push({ name: "land", f: Math.round(frameAt(s.end)) });
      // Your turn: you get the bench.
      if (l.id === YOU && i === 0)
        raw.push({ name: "solved", f: Math.round(frameAt(s.swap)) });
    });
  }
  const rank = { solved: 3, land: 2, "plate-lift": 1 } as const;
  const byFrame = new Map<number, Event>();
  for (const c of raw) {
    if (c.f < 0 || c.f >= DURATION - 4) continue;
    const had = byFrame.get(c.f);
    if (!had || rank[c.name] > rank[had]) byFrame.set(c.f, c.name);
  }
  const out: Cue[] = [];
  let last = -Infinity;
  for (const f of [...byFrame.keys()].sort((a, b) => a - b)) {
    const name = byFrame.get(f) as Event;
    if (f - last < 3 && name !== "solved") continue;
    last = f;
    out.push({
      id: `${rule}-${name}-${f}`,
      name,
      frame: f,
      rate: name === "solved" ? 1 : rate,
      gain: gainFor(name, LEVEL[name]),
    });
  }
  return out;
};

export const CUES: readonly Cue[] = [
  {
    id: "hum-1",
    name: "scan",
    frame: -30,
    rate: 0.5,
    gain: gainFor("scan", -30),
    length: 250,
  },
  {
    id: "hum-2",
    name: "scan",
    frame: 210,
    rate: 0.5,
    gain: gainFor("scan", -30),
    length: 210,
  },
  ...gym("keep", 0.95),
  ...gym("share", 1.05),
  {
    id: "verdict",
    name: "settle",
    frame: VERDICT_FROM,
    rate: 1,
    gain: gainFor("settle", -4),
  },
];
