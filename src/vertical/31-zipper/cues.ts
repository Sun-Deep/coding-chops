import { DURATION, VERDICT_FROM, frameAt, simAt } from "./beats";
import { RUNS, YOU, carAt } from "./runs";
import type { Rule } from "./simulation";

/**
 * Every cue is read off the roads. A low road hum under the whole reel. On
 * each road: a brake when the followed car first brakes hard, a rush of air
 * when a car goes past it, a dull knock when the "got past you" count goes
 * up, a tick for each car through the cones while the clock is slowed to
 * show the turn about there, and a send when the followed car gets through.
 * At most one cue every three frames per road. Gains come from each file's
 * measured peak.
 */

type Name =
  | "scan"
  | "brake"
  | "dissolve"
  | "reject"
  | "tick"
  | "send"
  | "settle";

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
  brake: -32.2,
  dissolve: -32.8,
  reject: -21.1,
  tick: -22.9,
  send: -27.0,
  settle: -23.2,
};
const gainFor = (name: Name, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;

type Event = Exclude<Name, "scan" | "settle">;
const LEVEL: Record<Event, number> = {
  brake: -10,
  dissolve: -12,
  reject: -9,
  tick: -24,
  send: -12,
};

/** Frames the clock is slowed to show the cones. */
const SLOW = [222, 296];

const road = (rule: Rule, rate: number): Cue[] => {
  const run = RUNS[rule];
  const cars = run.cars;
  const you = cars[YOU];
  const raw: { name: Event; f: number }[] = [];
  // The followed car's first hard brake, and cars going past it.
  let braked = false;
  const ahead = new Set<number>();
  for (let f = 0; f < DURATION; f++) {
    const t = simAt(f);
    const y = carAt(run, YOU, t);
    if (!y) continue;
    if (!braked && y.a < -1.5) {
      braked = true;
      raw.push({ name: "brake", f });
    }
    for (let i = YOU + 1; i < cars.length; i++) {
      if (ahead.has(i)) continue;
      const c = carAt(run, i, t);
      if (c && c.x > y.x && c.v > y.v + 3) {
        ahead.add(i);
        raw.push({ name: "dissolve", f });
      }
    }
  }
  for (const c of cars) {
    const f = Math.round(frameAt(c.through));
    if (c.arrive > you.arrive && c.through < you.through)
      raw.push({ name: "reject", f });
    if (f >= SLOW[0] && f <= SLOW[1]) raw.push({ name: "tick", f });
  }
  raw.push({ name: "send", f: Math.round(frameAt(you.through)) });

  // Louder events win a shared frame.
  const rank = { send: 5, reject: 4, brake: 3, dissolve: 2, tick: 1 } as const;
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
    if (f - last < 3 && name === "tick") continue;
    last = f;
    out.push({
      id: `${rule}-${name}-${f}`,
      name,
      frame: f,
      rate: name === "dissolve" ? rate * 1.4 : rate,
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
    rate: 0.6,
    gain: gainFor("scan", -30),
    length: 250,
  },
  {
    id: "hum-2",
    name: "scan",
    frame: 210,
    rate: 0.6,
    gain: gainFor("scan", -30),
    length: 210,
  },
  ...road("early", 0.9),
  ...road("zipper", 1.1),
  {
    id: "verdict",
    name: "settle",
    frame: VERDICT_FROM,
    rate: 1,
    gain: gainFor("settle", -6),
  },
];
