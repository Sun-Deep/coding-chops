import {
  DURATION,
  REPLAY_FROM,
  SIM_FROM,
  SIM_PER_FRAME,
  VERDICT_FROM,
  localFrameAt,
} from "./beats";
import { CARS, DT, TAP_FROM, type Track } from "./physics";
import { HUMAN, SMOOTHED } from "./tracks";

/**
 * Every cue is a car braking, read straight off the simulation, so the sound
 * is the jam: a busy run of brakes on the human ring that never lets up, and
 * on the replay a short run after the tap that goes quiet once the wave
 * reaches the orange car. Gains come from each file's measured peak.
 *
 * A brake is a car's deceleration crossing 1 m/s^2, louder the harder it is. Several cars can cross
 * in the same few frames, so a cue fires at most every three frames, at the
 * level of the hardest brake in that window.
 */

type Name = "brake" | "return" | "settle";

export type Cue = {
  readonly id: string;
  readonly name: Name;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
};

const PEAK: Record<Name, number> = {
  brake: -32.1,
  return: -20.0,
  settle: -23.2,
};

const gainFor = (name: Name, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;

const ONSET = -1;
const GAP = 3;

/** Harder braking, louder cue. */
const level = (hard: number) =>
  gainFor("brake", hard > 2.5 ? -9 : hard > 1.5 ? -14 : -20);

const brakes = (track: Track, offset: number, until: number, key: string) => {
  const hits: { frame: number; hard: number }[] = [];
  const lastStep = Math.min(
    track.steps - 1,
    Math.round((SIM_FROM + (until - offset) * SIM_PER_FRAME) / DT),
  );
  for (let k = Math.round(SIM_FROM / DT) + 1; k <= lastStep; k++) {
    for (let i = 0; i < CARS; i++) {
      const a = track.a[k * CARS + i];
      const before = track.a[(k - 1) * CARS + i];
      if (a < ONSET && before >= ONSET) {
        hits.push({
          frame: Math.round(offset + localFrameAt(k * DT)),
          hard: -a,
        });
      }
    }
  }
  const out: Cue[] = [];
  let last = -Infinity;
  for (const h of hits) {
    if (h.frame - last < GAP) {
      const prev = out[out.length - 1];
      if (prev && level(h.hard) > prev.gain)
        out[out.length - 1] = { ...prev, gain: level(h.hard) };

      continue;
    }
    last = h.frame;
    out.push({
      id: `${key}-brake-${h.frame}`,
      name: "brake",
      frame: h.frame,
      rate: 0.9 + Math.min(0.3, h.hard / 10),
      gain: level(h.hard),
    });
  }
  return out;
};

const tap = (offset: number, key: string): Cue => ({
  id: `${key}-tap`,
  name: "brake",
  frame: Math.round(offset + localFrameAt(TAP_FROM)),
  rate: 0.85,
  gain: gainFor("brake", -5),
});

const all: Cue[] = [
  tap(0, "human"),
  ...brakes(HUMAN, 0, REPLAY_FROM - 2, "human").filter(
    (c) => c.frame > localFrameAt(TAP_FROM) + 2,
  ),
  {
    id: "replay",
    name: "return",
    frame: REPLAY_FROM,
    rate: 1,
    gain: gainFor("return", -9),
  },
  tap(REPLAY_FROM, "smooth"),
  ...brakes(SMOOTHED, REPLAY_FROM, DURATION - 6, "smooth").filter(
    (c) => c.frame > REPLAY_FROM + localFrameAt(TAP_FROM) + 2,
  ),
  {
    id: "verdict",
    name: "settle",
    frame: VERDICT_FROM,
    rate: 1,
    gain: gainFor("settle", -7),
  },
];

export const CUES: readonly Cue[] = all.filter(
  (c) => c.frame >= 0 && c.frame < DURATION - 4,
);
