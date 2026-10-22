import { CIRCLE_IN, DURATION, ROW_IN, VERDICT_FROM, frameAt } from "./beats";
import { DEFAULTS, DRIVING, STALL_LIST, aisleX } from "./parking";
import { TRIPS } from "./runs";

/**
 * Every cue is something in the car park, read off the trips. A car leaving or
 * arriving anywhere is a soft tick, at most every three frames; a close stall
 * the circler wanted being taken by someone else is a low reject; each orange
 * car parking is a settle; each driver reaching the door is a chord. While the
 * circler loops, every open stall it drives past because it is outside the
 * band is a soft pluck, and every corner it turns is a low tick, so the
 * looping is heard as well as seen. Gains
 * come from each file's measured peak.
 */

type Name = "tick" | "reject" | "settle" | "solved" | "probe";

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
  settle: -23.2,
  solved: -22.7,
  probe: -37.5,
};

const gainFor = (name: Name, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;

const circle = TRIPS.circle;
const n = STALL_LIST.length;
const ticks = circle.x.length;

const changes: Cue[] = [];
const taken: Cue[] = [];
let last = -Infinity;
for (let k = 1; k < ticks; k++) {
  for (let i = 0; i < n; i++) {
    const before = circle.full[(k - 1) * n + i];
    const now = circle.full[k * n + i];
    if (before === now || i === circle.stall) continue;
    const frame = Math.round(frameAt(k));
    if (!before && now && STALL_LIST[i].j < 6 && frame > ROW_IN) {
      taken.push({
        id: `taken-${k}-${i}`,
        name: "reject",
        frame,
        rate: 0.9,
        gain: gainFor("reject", -13),
      });
      continue;
    }
    if (frame - last < 3) continue;
    last = frame;
    changes.push({
      id: `move-${k}-${i}`,
      name: "tick",
      frame,
      rate: now ? 1.1 : 0.85,
      gain: gainFor("tick", -21),
    });
  }
}

const passes: Cue[] = [];
let lastPass = -Infinity;
for (let k = 1; k < ticks - 1; k++) {
  if (circle.mode[k] !== DRIVING) continue;
  const frame = Math.round(frameAt(k));
  const dx0 = circle.x[k] - circle.x[k - 1];
  const dx1 = circle.x[k + 1] - circle.x[k];
  const turned = Math.abs(dx0) > 0.01 !== Math.abs(dx1) > 0.01;
  if (turned) {
    passes.push({
      id: `turn-${k}`,
      name: "tick",
      frame,
      rate: 0.7,
      gain: gainFor("tick", -17),
    });
    continue;
  }
  if (frame - lastPass < 4) continue;
  const open = STALL_LIST.some(
    (st, i) =>
      !circle.full[k * n + i] &&
      st.j >= DEFAULTS.near &&
      Math.abs(aisleX(st.a) - circle.x[k]) < 1 &&
      Math.abs(st.y - circle.y[k]) <= DEFAULTS.drive / 2,
  );
  if (open) {
    lastPass = frame;
    passes.push({
      id: `pass-${k}`,
      name: "probe",
      frame,
      rate: 1.4,
      gain: gainFor("probe", -16),
    });
  }
}

const all: Cue[] = [
  ...passes,
  ...changes,
  ...taken,
  {
    id: "row-parks",
    name: "settle",
    frame: Math.round(frameAt(TRIPS.row.parkedAt)),
    rate: 1,
    gain: gainFor("settle", -8),
  },
  {
    id: "circle-parks",
    name: "settle",
    frame: Math.round(frameAt(TRIPS.circle.parkedAt)),
    rate: 1,
    gain: gainFor("settle", -8),
  },
  {
    id: "row-in",
    name: "solved",
    frame: ROW_IN,
    rate: 1.15,
    gain: gainFor("solved", -5),
  },
  {
    id: "circle-in",
    name: "solved",
    frame: CIRCLE_IN,
    rate: 0.85,
    gain: gainFor("solved", -5),
  },
  {
    id: "verdict",
    name: "settle",
    frame: VERDICT_FROM,
    rate: 1,
    gain: gainFor("settle", -7),
  },
];

export const CUES: readonly Cue[] = all.filter(
  (c) => c.frame >= 0 && c.frame < DURATION - 4,
);
