import {
  DURATION,
  LET_GO,
  ROOF_DOWN,
  VERDICT_FROM,
  WHEELS_DOWN,
  frameAt,
} from "./beats";
import { PLAN } from "./runs";

/**
 * Every cue is read off the model. Open air over the test pad under the
 * whole reel. While the cars are on the ramp, the motor pulling away and the
 * fan holding them on; a clunk as they let go, then air rushing past while
 * they fall, slowed down with the picture. Below, a hiss each time a pair of
 * thrusters opens: the pair that starts the roll, the pair that stops it,
 * then the four underneath braking. On top the roof hits; below the tyres
 * land. Gains come from each file's measured peak.
 */

export type Name =
  | "pad-air"
  | "ev-whine"
  | "fan-hum"
  | "ramp-release"
  | "fall-air"
  | "jet-hiss"
  | "roof-crash"
  | "tyre-land"
  | "settle";

export type Cue = {
  readonly id: string;
  readonly name: Name;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
  readonly length?: number;
};

const PEAK: Record<Name, number> = {
  "pad-air": -32.0,
  "ev-whine": -23.5,
  "fan-hum": -32.1,
  "ramp-release": -18.0,
  "fall-air": -34.4,
  "jet-hiss": -20.0,
  "roof-crash": -14.0,
  "tyre-land": -18.0,
  settle: -23.2,
};
export const gainFor = (name: Name, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;

/** Slowed down with the picture. */
const SLOW = 0.85;

const spinUp = LET_GO;
const spinDown = Math.round(frameAt(PLAN.rollBy / 2));
const braking = Math.round(frameAt(PLAN.rollBy));

export const CUES: readonly Cue[] = [
  {
    id: "air",
    name: "pad-air",
    frame: 0,
    rate: 1,
    gain: gainFor("pad-air", -30),
    length: DURATION,
  },
  {
    id: "motor",
    name: "ev-whine",
    frame: 0,
    rate: 1,
    gain: gainFor("ev-whine", -15),
  },
  {
    id: "fan",
    name: "fan-hum",
    frame: 0,
    rate: 1,
    gain: gainFor("fan-hum", -19),
  },
  {
    id: "release",
    name: "ramp-release",
    frame: LET_GO,
    rate: 1,
    gain: gainFor("ramp-release", -9),
  },
  {
    id: "fall",
    name: "fall-air",
    frame: LET_GO,
    rate: SLOW,
    gain: gainFor("fall-air", -17),
    length: WHEELS_DOWN + 12 - LET_GO,
  },
  {
    id: "jet-spin",
    name: "jet-hiss",
    frame: spinUp,
    rate: SLOW,
    gain: gainFor("jet-hiss", -12),
    length: spinDown - spinUp,
  },
  {
    id: "jet-stop",
    name: "jet-hiss",
    frame: spinDown,
    rate: SLOW * 0.96,
    gain: gainFor("jet-hiss", -12),
    length: braking - spinDown,
  },
  {
    id: "jet-brake",
    name: "jet-hiss",
    frame: braking,
    rate: SLOW * 0.9,
    gain: gainFor("jet-hiss", -10),
    length: WHEELS_DOWN - braking,
  },
  {
    id: "roof",
    name: "roof-crash",
    frame: ROOF_DOWN,
    rate: 0.9,
    gain: gainFor("roof-crash", -5),
  },
  {
    id: "tyres",
    name: "tyre-land",
    frame: WHEELS_DOWN,
    rate: 0.95,
    gain: gainFor("tyre-land", -8),
  },
  {
    id: "verdict",
    name: "settle",
    frame: VERDICT_FROM,
    rate: 1,
    gain: gainFor("settle", -9),
  },
];
