import * as B from "./beats";

const cue = (
  id: string,
  name: string,
  frame: number,
  db: number,
  rate = 1,
) => ({
  id,
  name: `kenney/${name}`,
  frame,
  gain: 10 ** ((db + 1) / 20),
  rate,
});

export const CUES = [
  cue("first-word", "impactWood_light_001", 0, -14),
  ...[8, 23, 38, 53].map((frame, i) =>
    cue(`test-a-${i}`, "click_003", frame, -15, 0.95 + i * 0.05),
  ),
  cue("adieu-result", "impactWood_medium_001", 62, -9),
  ...[0, 1, 2, 3, 4].map((i) =>
    cue(
      `tile-${i}`,
      "click_005",
      B.SECOND_GUESS + i * 3 + 6,
      -15,
      0.95 + i * 0.06,
    ),
  ),
  ...[148, 163, 178].map((frame, i) =>
    cue(`test-b-${i}`, "click_003", frame, -15, 1.05 + i * 0.05),
  ),
  cue("winner", "impactWood_medium_001", B.WINNER_LANDS, -2),
  cue("compare", "switch_004", B.COMPARE + 6, -13),
  cue("catch", "click_004", B.CATCH + 4, -13),
];
