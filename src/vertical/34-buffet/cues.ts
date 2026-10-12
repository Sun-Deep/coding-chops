import { DURATION, NAME_FROM, VERDICT_FROM } from "./beats";
import { SCOOP_RATE, STRIDE_RATE, poseAt } from "./motion";
import { DESSERT, DINERS } from "./runs";
import type { Rule } from "./simulation";

/** Material sounds follow the same positions and arm cycles as the drawing. */
type Name =
  | "buffet-room"
  | "ceramic-clink"
  | "serving-tongs"
  | "tile-step"
  | "reject"
  | "send"
  | "solved"
  | "settle"
  | "name";
export type Cue = {
  readonly id: string;
  readonly name: Name;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
  readonly length?: number;
};

/** Source peaks measured after synthesis, before per-use gain. */
const PEAK: Record<Name, number> = {
  "buffet-room": -25.16,
  "ceramic-clink": -26.61,
  "serving-tongs": -28.86,
  "tile-step": -28.2,
  reject: -21.1,
  send: -27.0,
  solved: -22.7,
  settle: -23.2,
  name: -16.0,
};
const gainFor = (name: Name, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;
const phaseCrosses = (
  frame: number,
  rate: number,
  phase: number,
  period: number,
) =>
  Math.floor((frame * rate + phase - Math.PI / 2) / period) >
  Math.floor(((frame - 1) * rate + phase - Math.PI / 2) / period);

const room = (rule: Rule, pitch: number): Cue[] => {
  const raw = new Map<number, { cue: Cue; priority: number }>();
  const add = (cue: Cue, priority: number) => {
    const had = raw.get(cue.frame);
    if (!had || priority > had.priority) raw.set(cue.frame, { cue, priority });
  };
  for (let f = 0; f < DURATION - 4; f++) {
    for (const person of DINERS) {
      const now = poseAt(rule, person.id, f);
      const before = poseAt(rule, person.id, f - 1);
      const visible =
        now.p.state !== "away" &&
        now.p.state !== "done" &&
        now.x >= -10 &&
        now.x <= 790 &&
        now.y <= 344;
      if (!visible) continue;
      const variation = ((person.id % 5) - 2) * 0.025;
      if (now.p.portions > before.p.portions) {
        add(
          {
            id: `${rule}-plate-${person.id}-${f}`,
            name: "ceramic-clink",
            frame: f,
            rate: pitch + variation,
            gain: gainFor("ceramic-clink", -16),
          },
          3,
        );
      } else if (
        now.p.state === "serve" &&
        (before.p.state !== "serve" ||
          phaseCrosses(f, SCOOP_RATE, person.id, Math.PI * 2))
      ) {
        add(
          {
            id: `${rule}-tongs-${person.id}-${f}`,
            name: "serving-tongs",
            frame: f,
            rate: pitch + variation,
            gain: gainFor(
              "serving-tongs",
              person.id === 0 && f < 80 ? -15 : -20,
            ),
          },
          2,
        );
      } else if (
        now.speed > 0.25 &&
        now.p.state === "walk" &&
        phaseCrosses(f, STRIDE_RATE, person.id * 2.3, Math.PI)
      ) {
        add(
          {
            id: `${rule}-step-${person.id}-${f}`,
            name: "tile-step",
            frame: f,
            rate: pitch * 0.85 + variation,
            gain: gainFor("tile-step", -23),
          },
          1,
        );
      }
    }
  }
  // Keep material events distinct as the clock accelerates. A plate landing
  // wins over tongs, which win over a footstep on the same frame.
  const out: Cue[] = [];
  let last = -Infinity;
  for (const { cue, priority } of [...raw.values()].sort(
    (a, b) => a.cue.frame - b.cue.frame,
  )) {
    const gap = priority === 3 ? 4 : priority === 2 ? 7 : 9;
    if (cue.frame - last < gap) continue;
    last = cue.frame;
    out.push(cue);
  }
  return out;
};

const dessertOut = (rule: Rule): Cue => {
  // The followed diner's complete plate leaving each room is the success cue.
  const finished = DINERS[DESSERT];
  for (let f = 0; f < DURATION; f++) {
    if (poseAt(rule, finished.id, f).p.state === "done")
      return {
        id: `${rule}-dessert-out`,
        name: "solved",
        frame: f,
        rate: rule === "skip" ? 1.15 : 0.9,
        gain: gainFor("solved", -9),
      };
  }
  return {
    id: `${rule}-dessert-out`,
    name: "solved",
    frame: DURATION,
    rate: 1,
    gain: 0,
  };
};

/** No music. Powered warmers, walking, serving and finished plates fill the room. */
const all: Cue[] = [
  {
    id: "warmers",
    name: "buffet-room",
    frame: 0,
    rate: 1,
    gain: gainFor("buffet-room", -30),
    length: DURATION,
  },
  ...room("line", 0.9),
  ...room("skip", 1.1),
  {
    id: "salad-stall",
    name: "reject",
    frame: 8,
    rate: 0.8,
    gain: gainFor("reject", -11),
  },
  {
    id: "dessert-passes",
    name: "send",
    frame: 66,
    rate: 1.15,
    gain: gainFor("send", -15),
  },
  dessertOut("skip"),
  dessertOut("line"),
  { id: "average", name: "settle", frame: VERDICT_FROM, rate: 1, gain: 11.2 },
  {
    id: "fairness",
    name: "reject",
    frame: 276,
    rate: 0.9,
    gain: gainFor("reject", -12),
  },
  {
    id: "name",
    name: "name",
    frame: NAME_FROM,
    rate: 1,
    gain: gainFor("name", -3),
  },
];

export const CUES: readonly Cue[] = all
  .filter((c) => c.frame < DURATION)
  .sort((a, b) => a.frame - b.frame);
