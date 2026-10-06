import { DURATION, VERDICT_FROM, frameAt } from "./beats";
import { RUNS } from "./runs";
import { HANDLE, type Rule } from "./simulation";

/**
 * Every cue is read off the runs: a short beep when someone sets the timer,
 * a low hum for exactly as long as their food turns, and a ding when it is
 * done, lower for the top kitchen and higher
 * for the bottom one, so the bottom's early run of quick dings is heard. At
 * most one cue every three frames per kitchen. Gains come from each file's
 * measured peak.
 */

type Name = "beep" | "ding" | "settle" | "scan";

export type Cue = {
  readonly id: string;
  readonly name: Name;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
  /** For a sustained cue, how long it plays. */
  readonly frames?: number;
};

const PEAK: Record<Name, number> = {
  beep: -29.4,
  ding: -20.2,
  settle: -23.2,
  scan: -37.8,
};
const gainFor = (name: Name, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;

const kitchen = (rule: Rule, rate: number): Cue[] => {
  const raw = RUNS[rule].flatMap((p) => [
    { name: "beep" as const, frame: Math.round(frameAt(p.start + HANDLE / 2)) },
    { name: "ding" as const, frame: Math.round(frameAt(p.end - HANDLE / 2)) },
  ]);
  raw.sort((a, b) => a.frame - b.frame);
  const out: Cue[] = [];
  let last = -Infinity;
  for (const c of raw) {
    if (c.frame < 0 || c.frame >= DURATION - 4 || c.frame - last < 3) continue;
    last = c.frame;
    out.push({
      id: `${rule}-${c.name}-${c.frame}`,
      name: c.name,
      frame: c.frame,
      rate,
      gain: c.name === "ding" ? gainFor("ding", -4) : gainFor("beep", -15),
    });
  }
  return out;
};

/** The hum: the sustained scan tone, pitched down, while a dish turns. */
const hums = (rule: Rule, rate: number): Cue[] =>
  RUNS[rule].flatMap((p) => {
    const from = Math.round(frameAt(p.start + HANDLE / 2));
    const to = Math.round(frameAt(p.end - HANDLE / 2));
    if (from >= DURATION - 4 || to - from < 3) return [];
    return [
      {
        id: `${rule}-hum-${from}`,
        name: "scan" as const,
        frame: from,
        rate,
        gain: gainFor("scan", -24),
        frames: Math.min(to, DURATION - 2) - from,
      },
    ];
  });

export const CUES: readonly Cue[] = [
  ...kitchen("fifo", 0.85),
  ...kitchen("sjf", 1.12),
  ...hums("fifo", 0.5),
  ...hums("sjf", 0.6),
  {
    id: "verdict",
    name: "settle",
    frame: VERDICT_FROM,
    rate: 1,
    gain: gainFor("settle", -4),
  },
];
