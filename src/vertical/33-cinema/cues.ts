import { DECIDE, DURATION, REVEAL_FROM, VERDICT_FROM } from "./beats";
import { WALKERS } from "./layout";
import { ROOMS, YOU } from "./runs";
import type { Rule } from "./simulation";

/**
 * Every cue is read off the rooms. A low hum of the film under the whole
 * reel. On each room: a soft seat thud as each person sits. For the four
 * friends: a probe as they start to look, a scan while the free seats
 * light up, and a reject above, where they cannot sit together, or a solved
 * tone below, where they can. A knock for every other group split up. At most one cue every three frames per room. Gains come
 * from each file's measured peak.
 */

type Name = "scan" | "plate-land" | "probe" | "reject" | "solved" | "settle";

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
  "plate-land": -20.0,
  probe: -29.1,
  reject: -21.1,
  solved: -22.7,
  settle: -23.2,
};
const gainFor = (name: Name, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;

const room = (rule: Rule, rate: number): Cue[] => {
  const out: Cue[] = [];
  let last = -Infinity;
  const frames = WALKERS[rule]
    .filter((w) => w.group !== YOU)
    .map((w) => w.seated)
    .sort((a, b) => a - b);
  for (const f of frames) {
    if (f - last < 3 || f >= DURATION - 4) continue;
    last = f;
    out.push({
      id: `${rule}-sit-${f}`,
      name: "plate-land",
      frame: f,
      rate,
      gain: gainFor("plate-land", -20),
    });
  }
  for (const g of ROOMS[rule].filter((k) => k.split && k.id !== YOU)) {
    const f = Math.max(
      ...WALKERS[rule].filter((w) => w.group === g.id).map((w) => w.seated),
    );
    if (f < DURATION - 4)
      out.push({
        id: `${rule}-split-${g.id}`,
        name: "reject",
        frame: f,
        rate: 0.85,
        gain: gainFor("reject", -12),
      });
  }
  const sat = Math.max(
    ...WALKERS[rule].filter((w) => w.group === YOU).map((w) => w.seated),
  );
  out.push(
    rule === "spread"
      ? {
          id: `${rule}-you`,
          name: "reject",
          frame: sat,
          rate: 1,
          gain: gainFor("reject", -6),
        }
      : {
          id: `${rule}-you`,
          name: "solved",
          frame: sat,
          rate: 1,
          gain: gainFor("solved", -6),
        },
  );
  return out;
};

export const CUES: readonly Cue[] = [
  {
    id: "hum-1",
    name: "scan",
    frame: -30,
    rate: 0.45,
    gain: gainFor("scan", -30),
    length: 250,
  },
  {
    id: "hum-2",
    name: "scan",
    frame: 210,
    rate: 0.45,
    gain: gainFor("scan", -30),
    length: 210,
  },
  ...room("spread", 0.95),
  ...room("pack", 1.05),
  {
    id: "look",
    name: "probe",
    frame: REVEAL_FROM - 4,
    rate: 1,
    gain: gainFor("probe", -12),
  },
  {
    id: "reveal",
    name: "scan",
    frame: REVEAL_FROM,
    rate: 1.2,
    gain: gainFor("scan", -16),
    length: DECIDE - REVEAL_FROM,
  },
  {
    id: "verdict",
    name: "settle",
    frame: VERDICT_FROM,
    rate: 1,
    gain: gainFor("settle", -4),
  },
];
