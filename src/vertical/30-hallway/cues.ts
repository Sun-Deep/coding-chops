import { DURATION, VERDICT_FROM, frameAt } from "./beats";
import { RUNS } from "./runs";
import { STEP, WALK_OUT, type Rule } from "./simulation";

/**
 * Every cue is read off the corridors. Soft footsteps while a pair walks in
 * and out, a scuff on every sidestep, a dull knock on every bump and a short
 * send when a pair gets past. Lower on the left, higher on the right, so the
 * left's run of scuffs and knocks is heard. At most one cue every three
 * frames per corridor. Gains come from each file's measured peak.
 */

type Name = "tick" | "plate-swish" | "reject" | "send" | "settle";

export type Cue = {
  readonly id: string;
  readonly name: Name;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
};

const PEAK: Record<Name, number> = {
  tick: -22.9,
  "plate-swish": -39.4,
  reject: -21.1,
  send: -27.0,
  settle: -23.2,
};
const gainFor = (name: Name, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;

const LEVEL: Record<Exclude<Name, "settle">, number> = {
  tick: -24,
  "plate-swish": -17,
  reject: -6,
  send: -13,
};

/** Footsteps every STRIDE seconds, the two people half a stride apart. */
const STRIDE = 0.55;

const corridor = (rule: Rule, rate: number): Cue[] => {
  const raw: { name: Exclude<Name, "settle">; t: number }[] = [];
  for (const e of RUNS[rule]) {
    for (let t = e.start; t < e.meet; t += STRIDE / 2)
      raw.push({ name: "tick", t });
    for (let t = e.passed - STEP / 2; t < e.passed + WALK_OUT; t += STRIDE / 2)
      raw.push({ name: "tick", t });
    for (const r of e.rounds) {
      raw.push({ name: "plate-swish", t: e.meet + r.a });
      raw.push({ name: "plate-swish", t: e.meet + r.b });
      if (r.collided) raw.push({ name: "reject", t: e.meet + r.end });
    }
    raw.push({ name: "send", t: e.passed });
  }
  // Louder events win a shared frame.
  const rank = { reject: 3, send: 2, "plate-swish": 1, tick: 0 } as const;
  const byFrame = new Map<number, Exclude<Name, "settle">>();
  for (const c of raw) {
    const f = Math.round(frameAt(c.t));
    if (f < 0 || f >= DURATION - 4) continue;
    const had = byFrame.get(f);
    if (!had || rank[c.name] > rank[had]) byFrame.set(f, c.name);
  }
  const out: Cue[] = [];
  let last = -Infinity;
  for (const f of [...byFrame.keys()].sort((a, b) => a - b)) {
    const name = byFrame.get(f) as Exclude<Name, "settle">;
    if (f - last < 3 && name === "tick") continue;
    last = f;
    out.push({
      id: `${rule}-${name}-${f}`,
      name,
      frame: f,
      rate: name === "tick" ? rate * 0.6 : rate,
      gain: gainFor(name, LEVEL[name]),
    });
  }
  return out;
};

export const CUES: readonly Cue[] = [
  ...corridor("instant", 0.9),
  ...corridor("random", 1.1),
  {
    id: "verdict",
    name: "settle",
    frame: VERDICT_FROM,
    rate: 1,
    gain: gainFor("settle", -6),
  },
];
