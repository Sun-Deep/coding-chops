import {
  COMMIT2_CMD,
  COPY1_LANDS,
  COPY2_FROM,
  COPY2_LANDS,
  COUNT,
  CRUSH,
  CRUSH_FROM,
  DIFF_AT,
  DIFF_CMD,
  EDIT_FROM,
  GC_CMD,
  PACK_CMD,
  PACK_LINE_EVERY,
  PACK_LINES_FROM,
  REBUILD_FROM,
  REBUILD_TYPE,
  SAME_FROM,
  SAME_TO,
  TYPE_EVERY,
} from "./beats";
import { CHANGED_LINE, LINES } from "./measurements";

/**
 * Every cue is a thing arriving, read off `beats.ts`.
 *
 * Gains come from each file's measured peak, not from another cut: `send`
 * -27.0 dBFS, `land` -17.0, `process` -30.1, `tick` -22.9, `code-step` -36.6,
 * `probe` -37.5, `name` -16.0, `appear` -17.0. `gainFor` turns a target peak
 * into the linear gain, so the intended loudness is readable here.
 */

export type Cue = {
  readonly id: string;
  readonly name:
    | "send"
    | "land"
    | "process"
    | "tick"
    | "code-step"
    | "probe"
    | "name"
    | "appear";
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
};

const PEAK = {
  send: -27.0,
  land: -17.0,
  process: -30.1,
  tick: -22.9,
  "code-step": -36.6,
  probe: -37.5,
  name: -16.0,
  appear: -17.0,
} as const;

const gainFor = (name: keyof typeof PEAK, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;

const DEGREES = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const note = (t: number) => {
  const i = Math.max(
    0,
    Math.min(DEGREES.length - 1, Math.round(t * (DEGREES.length - 1))),
  );
  return 0.65 * 2 ** (DEGREES[i] / 12);
};

/** Keystrokes, every other character so typing is a patter and not a buzz. */
const typing = (id: string, at: number, text: string): Cue[] =>
  Array.from({ length: Math.ceil(text.length / 2) }, (_, k) => ({
    id: `${id}-${k}`,
    name: "code-step" as const,
    frame: Math.max(0, at + Math.floor(k * 2 * TYPE_EVERY)),
    rate: 1.24,
    gain: gainFor("code-step", -20),
  }));

/** A counter climbing to its figure: six ticks rising. */
const climbing = (id: string, from: number): Cue[] =>
  Array.from({ length: 6 }, (_, k) => ({
    id: `${id}-${k}`,
    name: "tick" as const,
    frame: from + Math.round(((k + 1) / 6) * COUNT),
    rate: 1.0 + k * 0.1,
    gain: gainFor("tick", -18 + k),
  }));

const editing: Cue[] = Array.from({ length: 11 }, (_, k) => ({
  id: `edit-${k}`,
  name: "tick",
  frame: EDIT_FROM + k * 4,
  rate: 1.6,
  gain: gainFor("tick", -17),
}));

/**
 * The sweep: a pluck every eighth line on the pentatonic scale, and at line 80,
 * the one line that differs, the same voice dropped an octave and a fourth.
 */
const sweeping: Cue[] = (() => {
  const out: Cue[] = [];
  const span = SAME_TO - SAME_FROM;
  for (let line = 0; line < LINES; line += 8) {
    out.push({
      id: `sweep-${line}`,
      name: "probe",
      frame: SAME_FROM + Math.floor((line / LINES) * span),
      rate: note(line / LINES),
      gain: gainFor("probe", -16),
    });
  }
  out.push({
    id: "sweep-differs",
    name: "probe",
    frame: SAME_FROM + Math.floor(((CHANGED_LINE - 1) / LINES) * span) + 2,
    rate: 0.65 * 2 ** (-17 / 12),
    gain: gainFor("probe", -13),
  });
  return out;
})();

/** The old copy being crushed: ticks falling in pitch. */
const crushing: Cue[] = Array.from({ length: 8 }, (_, k) => ({
  id: `crush-${k}`,
  name: "tick",
  frame: CRUSH_FROM + Math.round((k / 7) * CRUSH),
  rate: 1.5 - k * 0.1,
  gain: gainFor("tick", -14),
}));

const rebuilding: Cue[] = Array.from({ length: 8 }, (_, k) => ({
  id: `rebuild-${k}`,
  name: "code-step",
  frame: REBUILD_FROM + 6 + Math.round((k / 8) * (REBUILD_TYPE - 6)),
  rate: 1.4,
  gain: gainFor("code-step", -18),
}));

export const CUES: readonly Cue[] = [
  {
    id: "land-1",
    name: "land",
    frame: Math.max(0, COPY1_LANDS),
    rate: 1,
    gain: gainFor("land", -8),
  },
  ...climbing("count-1", COPY1_LANDS),
  ...editing,
  ...typing("diff", DIFF_CMD, "git diff"),
  {
    id: "diff",
    name: "appear",
    frame: DIFF_AT,
    rate: 1.1,
    gain: gainFor("appear", -10),
  },
  ...typing("commit-2", COMMIT2_CMD, 'git commit -m "change line 80"'),
  {
    id: "send-2",
    name: "send",
    frame: COPY2_FROM,
    rate: 1,
    gain: gainFor("send", -10),
  },
  {
    id: "land-2",
    name: "land",
    frame: COPY2_LANDS,
    rate: 0.94,
    gain: gainFor("land", -8),
  },
  ...climbing("count-2", COPY2_LANDS),
  ...sweeping,
  ...typing("gc", GC_CMD, "git gc"),
  {
    id: "gc",
    name: "process",
    frame: CRUSH_FROM,
    rate: 1,
    gain: gainFor("process", -11),
  },
  ...crushing,
  ...typing("pack", PACK_CMD, "git verify-pack -v"),
  {
    id: "pack-1",
    name: "tick",
    frame: PACK_LINES_FROM,
    rate: 1.2,
    gain: gainFor("tick", -13),
  },
  {
    id: "pack-2",
    name: "tick",
    frame: PACK_LINES_FROM + PACK_LINE_EVERY,
    rate: 1.5,
    gain: gainFor("tick", -11),
  },
  {
    id: "rebuild",
    name: "appear",
    frame: REBUILD_FROM,
    rate: 1,
    gain: gainFor("appear", -10),
  },
  ...rebuilding,
  {
    id: "name",
    name: "name",
    frame: REBUILD_FROM + REBUILD_TYPE,
    rate: 1,
    gain: gainFor("name", -7),
  },
];
