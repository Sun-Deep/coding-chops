import {
  DIFF_FROM,
  DUMP,
  FILE_FLY,
  FILL_EVERY,
  FILL_FROM,
  LEFT_FROM,
  MOVE,
  MOVE_FROM,
  REFILL_EVERY,
  RIGHT_FROM,
  slabAt,
  stepAt,
  TYPE_EVERY,
  TYPE_FROM,
  VERDICT_FROM,
} from "./beats";
import {
  CODE_FIRST,
  LINE_AFTER,
  PACKAGES,
  PACKAGES_FIRST,
  type Step,
} from "./measurements";

/**
 * Every cue is a thing arriving, read off `beats.ts`, at a gain derived from
 * each file's measured peak so its intended loudness is readable here.
 *
 * Packages landing are VR10's plucked `probe` on the pentatonic scale, so an
 * install is a rising run. The code-first rebuild plays that run a second time
 * and the packages-first rebuild does not, which is the claim with the screen
 * off.
 */

type Name =
  | "tick"
  | "settle"
  | "dissolve"
  | "probe"
  | "appear"
  | "code-step"
  | "send"
  | "name";

export type Cue = {
  readonly id: string;
  readonly name: Name;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
};

const PEAK: Record<Name, number> = {
  tick: -22.9,
  settle: -23.2,
  dissolve: -32.8,
  probe: -37.5,
  appear: -17.0,
  "code-step": -36.6,
  send: -27.0,
  name: -16.0,
};

const gainFor = (name: Name, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;

const DEGREES = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const note = (t: number) => {
  const i = Math.max(
    0,
    Math.min(DEGREES.length - 1, Math.round(t * (DEGREES.length - 1))),
  );
  return 0.65 * 2 ** (DEGREES[i] / 12);
};

const run = (
  id: string,
  from: number,
  every: number,
  target: number,
): Cue[] => {
  const out: Cue[] = [];
  for (let n = 0; n < PACKAGES; n += 5) {
    const frame = Math.floor(from + n * every);
    if (frame < 0) continue;
    out.push({
      id: `${id}-${n}`,
      name: "probe",
      frame,
      rate: note(n / PACKAGES),
      gain: gainFor("probe", target),
    });
  }
  return out;
};

const slabs: Cue[] = Array.from({ length: 5 }, (_, i) => ({
  id: `slab-${i}`,
  name: "tick" as const,
  frame: slabAt(i),
  rate: 0.9 + i * 0.1,
  gain: gainFor("tick", -16),
})).filter((c) => c.frame >= 0);

const typing: Cue[] = Array.from(
  { length: Math.ceil(LINE_AFTER.length / 2) },
  (_, k) => ({
    id: `type-${k}`,
    name: "code-step" as const,
    frame: TYPE_FROM + Math.floor(k * 2 * TYPE_EVERY),
    rate: 1.24,
    gain: gainFor("code-step", -20),
  }),
);

/**
 * A file leaving the build context for the step that copies it. The changed
 * file is louder and higher than the unchanged ones.
 */
const flights = (id: string, steps: readonly Step[], from: number): Cue[] =>
  steps.flatMap((step, i) =>
    (step.inputs ?? []).slice(0, 1).map(() => {
      const changed = step.inputs?.includes("server.js") ?? false;
      return {
        id: `${id}-fly-${i}`,
        name: "send" as const,
        frame: stepAt(from, i) - FILE_FLY,
        rate: changed ? 1.15 : 0.9,
        gain: gainFor("send", changed ? -10 : -15),
      };
    }),
  );

/** One cue per step checked: a light tick for cached, a weight for ran. */
const rebuild = (id: string, steps: readonly Step[], from: number): Cue[] =>
  steps.flatMap((step, i) => {
    const frame = stepAt(from, i);
    if (step.rebuild === "ran") {
      const out: Cue[] = [
        {
          id: `${id}-${i}`,
          name: "settle",
          frame,
          rate: 0.9,
          gain: gainFor("settle", -6),
        },
      ];
      if (step.install) {
        out.push({
          id: `${id}-dump`,
          name: "dissolve",
          frame,
          rate: 1,
          gain: gainFor("dissolve", -12),
        });
        out.push(...run(`${id}-refill`, frame + DUMP, REFILL_EVERY, -15));
      }
      return out;
    }
    if (step.rebuild === "cached") {
      return [
        {
          id: `${id}-${i}`,
          name: step.install ? ("appear" as const) : ("tick" as const),
          frame,
          rate: step.install ? 1.3 : 1.5,
          gain: step.install ? gainFor("appear", -12) : gainFor("tick", -17),
        },
      ];
    }
    return [
      {
        id: `${id}-${i}`,
        name: "tick",
        frame,
        rate: 0.8,
        gain: gainFor("tick", -18),
      },
    ];
  });

const verdict: Cue[] = Array.from({ length: 6 }, (_, k) => ({
  id: `verdict-${k}`,
  name: "tick" as const,
  frame: VERDICT_FROM + Math.round(((k + 1) / 6) * 20),
  rate: 1.0 + k * 0.1,
  gain: gainFor("tick", -18 + k),
}));

/** The line being carried along the arrow: a rising tick every few frames. */
const carrying: Cue[] = Array.from({ length: 7 }, (_, k) => ({
  id: `carry-${k}`,
  name: "tick" as const,
  frame: MOVE_FROM + 4 + Math.round((k / 7) * (MOVE - 8)),
  rate: 1.0 + k * 0.12,
  gain: gainFor("tick", -17 + k * 0.5),
}));

export const CUES: readonly Cue[] = [
  ...carrying,
  ...slabs,
  ...run("fill", FILL_FROM, FILL_EVERY, -16),
  {
    id: "diff",
    name: "appear",
    frame: DIFF_FROM,
    rate: 1.1,
    gain: gainFor("appear", -8),
  },
  ...typing,
  ...flights("left", CODE_FIRST, LEFT_FROM),
  ...rebuild("left", CODE_FIRST, LEFT_FROM),
  ...flights("right", PACKAGES_FIRST, RIGHT_FROM),
  ...rebuild("right", PACKAGES_FIRST, RIGHT_FROM),
  ...verdict,
  {
    id: "move",
    name: "send",
    frame: MOVE_FROM,
    rate: 1,
    gain: gainFor("send", -10),
  },
  {
    id: "name",
    name: "name",
    frame: MOVE_FROM + MOVE,
    rate: 1,
    gain: gainFor("name", -5),
  },
];
