import { DURATION, SIGN, VERDICT_FROM } from "./beats";
import { RUNS, YOU } from "./runs";
import { DOOR } from "./simulation";
import { frameAt } from "./beats";

/**
 * Every cue is read off the model. A low cabin hum under the whole reel. The
 * seatbelt chime when the sign goes off, a soft thud as the door opens, a
 * light tick as each passenger leaves by the door (at most one every three
 * frames per cabin), and a brighter sound when you get off. Gains come from
 * each file's measured peak.
 */

type Name = "scan" | "ding" | "land" | "tick" | "solved" | "settle";

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
  ding: -20.2,
  land: -17.0,
  tick: -22.9,
  solved: -22.7,
  settle: -23.2,
};
const gainFor = (name: Name, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;

const exits = (rule: "stand" | "sit", rate: number): Cue[] => {
  const out: Cue[] = [];
  let last = -Infinity;
  const frames = RUNS[rule]
    .map((x) => ({ id: x.id, f: Math.round(frameAt(x.off)) }))
    .sort((a, b) => a.f - b.f);
  for (const { id, f } of frames) {
    if (f < 0 || f >= DURATION - 4) continue;
    const you = id === YOU;
    if (!you && f - last < 3) continue;
    last = f;
    out.push({
      id: `${rule}-${you ? "you" : "off"}-${f}`,
      name: you ? "solved" : "tick",
      frame: f,
      rate: you ? 1 : rate,
      gain: gainFor(you ? "solved" : "tick", you ? -6 : -20),
    });
  }
  return out;
};

export const CUES: readonly Cue[] = [
  {
    id: "hum-1",
    name: "scan",
    frame: -30,
    rate: 0.45,
    gain: gainFor("scan", -30),
    length: 220,
  },
  {
    id: "hum-2",
    name: "scan",
    frame: 210,
    rate: 0.45,
    gain: gainFor("scan", -30),
    length: 210,
  },
  { id: "sign", name: "ding", frame: SIGN, rate: 1, gain: gainFor("ding", -6) },
  {
    id: "door",
    name: "land",
    frame: Math.round(frameAt(DOOR)),
    rate: 0.7,
    gain: gainFor("land", -9),
  },
  ...exits("stand", 1.05),
  ...exits("sit", 0.95),
  {
    id: "verdict",
    name: "settle",
    frame: VERDICT_FROM,
    rate: 1,
    gain: gainFor("settle", -5),
  },
];
