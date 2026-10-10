import { DURATION, VERDICT_FROM, frameAt } from "./beats";
import { RUNS, YOU } from "./runs";
import type { Rule } from "./simulation";

/**
 * Every cue is read off the restaurants. A low room hum under the whole
 * reel. On each: a till beep or a kiosk tap when an order is placed, a bell
 * when a tray comes up on the pass, and a brighter sound when yours does. At
 * most one cue every three frames per restaurant. Gains come from each
 * file's measured peak.
 */

type Name = "scan" | "beep" | "fill" | "ding" | "solved" | "settle";

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
  beep: -29.4,
  fill: -34.1,
  ding: -20.2,
  solved: -22.7,
  settle: -23.2,
};
const gainFor = (name: Name, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;

type Event = "beep" | "fill" | "ding" | "solved";
const LEVEL: Record<Event, number> = {
  beep: -13,
  fill: -11,
  ding: -14,
  solved: -5,
};

const restaurant = (rule: Rule, rate: number): Cue[] => {
  const raw: { name: Event; f: number }[] = [];
  for (const c of RUNS[rule]) {
    raw.push({
      name: rule === "cashier" ? "beep" : "fill",
      f: Math.round(frameAt(c.orderEnd)),
    });
    raw.push({
      name: c.id === YOU ? "solved" : "ding",
      f: Math.round(frameAt(c.ready)),
    });
  }
  const rank = { solved: 4, ding: 3, beep: 2, fill: 1 } as const;
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
      rate,
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
  ...restaurant("cashier", 0.95),
  ...restaurant("kiosks", 1.05),
  {
    id: "verdict",
    name: "settle",
    frame: VERDICT_FROM,
    rate: 1,
    gain: gainFor("settle", -5),
  },
];
