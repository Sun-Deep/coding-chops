import * as B from "./beats";

const cue = (
  id: string,
  name: string,
  frame: number,
  db: number,
  rate = 1,
) => ({ id, name: `kenney/${name}`, frame, gain: 10 ** ((db + 1) / 20), rate });
export const CUES = [
  ...[B.TYPE_A, B.TYPE_B, B.TYPE_SOLVE].flatMap((from, row) =>
    [0, 1, 2, 3, 4]
      .filter((i) => from + i * B.TYPE_STEP >= 0)
      .map((i) =>
        cue(
          `key-${row}-${i}`,
          "click_005",
          from + i * B.TYPE_STEP,
          -13,
          0.97 + i * 0.04,
        ),
      ),
  ),
  ...[B.FLIP_A, B.FLIP_B, B.FLIP_SOLVE].flatMap((from, row) =>
    [0, 1, 2, 3, 4].map((i) =>
      cue(
        `flip-${row}-${i}`,
        "impactWood_light_001",
        from + i * B.FLIP_STEP + 5,
        -17,
        0.95 + i * 0.06,
      ),
    ),
  ),
  cue("reset", "switch_004", B.RESET, -13),
  cue("first-result", "tick_001", 70, -12),
  cue("second-result", "tick_001", 202, -10),
  cue("solved", "confirmation_001", B.WIN, -4),
  cue("comparison", "impactWood_medium_001", B.COMPARE, -2),
];
