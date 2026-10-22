import { DURATION, VERDICT_FROM, arrive } from "./beats";

/**
 * Every cue is read off the model. Heavy rain under the whole reel, a roll
 * of thunder as it opens, the drumming of rain on the shelter roof from
 * the moment each of you is under it, and a settle on the verdict.
 * Footsteps come from the render itself, in `Footsteps.tsx`. Gains come
 * from each file's measured peak.
 */

export type Name =
  | "rain-bed"
  | "thunder"
  | "roof-patter"
  | "wet-step"
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
  "rain-bed": -24.0,
  thunder: -21.0,
  "roof-patter": -30.0,
  "wet-step": -25.7,
  settle: -23.2,
};
export const gainFor = (name: Name, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;

export const CUES: readonly Cue[] = [
  {
    id: "rain",
    name: "rain-bed",
    frame: 0,
    rate: 1,
    gain: gainFor("rain-bed", -17),
    length: DURATION,
  },
  {
    id: "thunder",
    name: "thunder",
    frame: 2,
    rate: 1,
    gain: gainFor("thunder", -5),
  },
  {
    id: "roof-run",
    name: "roof-patter",
    frame: Math.round(arrive("run")),
    rate: 1.04,
    gain: gainFor("roof-patter", -19),
    length: DURATION - Math.round(arrive("run")),
  },
  {
    id: "roof-walk",
    name: "roof-patter",
    frame: Math.round(arrive("walk")),
    rate: 0.96,
    gain: gainFor("roof-patter", -19),
    length: DURATION - Math.round(arrive("walk")),
  },
  {
    id: "verdict",
    name: "settle",
    frame: VERDICT_FROM,
    rate: 1,
    gain: gainFor("settle", -7),
  },
];
