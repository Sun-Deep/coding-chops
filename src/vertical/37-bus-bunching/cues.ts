import { BLOCK_FROM, frameAt, PASS_FRAMES } from "./beats";
import { RUN } from "./runs";

/** Brakes mark stops, ticks mark boardings, and the follower keeps signalling. */
export const CUES = [
  { name: "brake", frame: 0, gain: 3.92, rate: 0.85 },
  ...RUN.visits
    .filter(
      (v) =>
        (v.bus === 0 || (v.bus === 1 && v.stop === 3)) &&
        v.arrival > 35 &&
        v.arrival < 260,
    )
    .map((v) => ({
      name: "brake",
      frame: Math.round(frameAt(v.arrival)),
      gain: 3.92,
      rate: 0.9,
    })),
  ...[40, 55, 57.25, 67.25, 77.25, 129.75, 144.75, 159.75, 217, 234.5].map(
    (time) => ({
      name: "tick",
      frame: Math.round(frameAt(time)),
      gain: 2.49,
      rate: 0.95,
    }),
  ),
  { name: "settle", frame: 329, gain: 11.04, rate: 0.9 },
  { name: "brake", frame: BLOCK_FROM, gain: 3.92, rate: 0.9 },
  ...PASS_FRAMES.map((frame) => ({
    name: "bus-horn",
    frame,
    gain: 3.5,
    rate: 1,
  })),
];
