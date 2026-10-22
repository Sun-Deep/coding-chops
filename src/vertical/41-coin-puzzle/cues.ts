import { BEATS } from "./beats";
import { CONTACT_FRAMES, TRANSFERS } from "./motion";

type Name = "coin-clink" | "coin-handle" | "scale-release" | "coin-turn";
const PEAK: Record<Name, number> = {
  "coin-clink": -31.72,
  "coin-handle": -33.9,
  "scale-release": -23.81,
  "coin-turn": -32.18,
};
export const gainFor = (name: Name, target: number) =>
  // Centre-panning a mono effect into the stereo mix costs about 3 dB.
  10 ** ((target + 3 - PEAK[name]) / 20);
type Cue = {
  id: string;
  name: Name;
  frame: number;
  gain: number;
  rate: number;
  length?: number;
};
const starts = [...new Map(TRANSFERS.map((t) => [t.from, t])).values()];
export const CUES: readonly Cue[] = [
  ...starts.map(
    (t): Cue => ({
      id: `handling-${t.from}`,
      name: "coin-handle",
      frame: Math.max(0, t.from),
      gain: gainFor("coin-handle", -24),
      rate: 1,
      length: t.to - Math.max(0, t.from) + 2,
    }),
  ),
  ...CONTACT_FRAMES.map(
    (frame, i): Cue => ({
      id: `contact-${frame}`,
      name: "coin-clink",
      frame,
      gain: gainFor(
        "coin-clink",
        frame < BEATS.keep[0] || frame > BEATS.keep[1] ? -6 : -12,
      ),
      rate: 0.96 + (i % 3) * 0.03,
    }),
  ),
  {
    id: "release-first",
    name: "scale-release",
    frame: BEATS.releaseFirst[0],
    gain: gainFor("scale-release", -15),
    rate: 1,
  },
  {
    id: "release-second",
    name: "scale-release",
    frame: BEATS.releaseSecond[0],
    gain: gainFor("scale-release", -16),
    rate: 1.03,
  },
  {
    id: "answer-turn",
    name: "coin-turn",
    frame: BEATS.reveal[0],
    gain: gainFor("coin-turn", -12),
    rate: 1,
    length: BEATS.reveal[1] - BEATS.reveal[0] + 4,
  },
  {
    id: "arrest-reset",
    name: "scale-release",
    frame: BEATS.keep[0],
    gain: gainFor("scale-release", -17),
    rate: 0.9,
    length: 20,
  },
  {
    id: "answer-grip",
    name: "coin-handle",
    frame: BEATS.gripAnswer[0],
    gain: gainFor("coin-handle", -24),
    rate: 1,
    length: BEATS.gripAnswer[1] - BEATS.gripAnswer[0],
  },
];
