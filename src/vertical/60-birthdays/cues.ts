import * as B from "./beats";
import { RUN } from "./measurements";

/**
 * From the recorded CC0 set in `public/sfx/kenney/`: a light tick as the
 * strings go down, at most one every two frames and louder as they rush, a
 * chime when the matching string turns orange, a rush as the camera rises,
 * a click for each room that lights, and the verdict landing.
 */

const cue = (
  id: string,
  name: string,
  frame: number,
  db: number,
  rate = 1,
) => ({
  id,
  name: `kenney/${name}`,
  frame: Math.round(frame),
  gain: Math.round(10 ** ((db + 1) / 20) * 1000) / 1000,
  rate,
});

const spaced = (frames: number[], gap: number) => {
  const out: number[] = [];
  for (const f of [...frames].sort((a, b) => a - b))
    if (out.length === 0 || f - out[out.length - 1] >= gap) out.push(f);
  return out;
};

const strings = spaced(
  Array.from({ length: RUN.pairs }, (_, k) => B.threadAt(k + 1)),
  2,
);
const rooms = spaced(
  Array.from({ length: 100 }, (_, r) => B.roomLitAt(r)).filter(
    (f): f is number => f !== null,
  ),
  2,
);

export const CUES = [
  ...strings.map((f, i) =>
    cue(
      `string-${i}`,
      i % 2 ? "tick_001" : "tick_002",
      f,
      -22 + (8 * i) / strings.length,
      1.1 + (i % 3) * 0.06,
    ),
  ),
  cue("match", "confirmation_001", B.MATCH, -6),
  cue("rise", "impactGeneric_light_001", B.RISE, -12, 0.7),
  ...rooms.map((f, i) =>
    cue(`room-${i}`, "click_002", f, -15, 1 + (i % 4) * 0.05),
  ),
  cue("verdict", "impactSoft_heavy_000", B.VERDICT, -3),
];
