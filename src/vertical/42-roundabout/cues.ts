import { DURATION, VERDICT_FROM } from "./beats";
import { HEROES } from "./hero";

/**
 * Every cue is read off the model. A low wash of traffic under the whole
 * reel. At the lights, the relay clicking each time the signals change,
 * your brakes as you come to a stop at the red, and your engine as you
 * pull away on green. At the roundabout, your tyres as you roll on into
 * the gap without stopping. A settle on the verdict. Gains come from each
 * file's measured peak.
 */

export type Name =
  | "street-air"
  | "signal-click"
  | "brake"
  | "engine-pull"
  | "tyre-roll"
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
  "street-air": -32.8,
  "signal-click": -26.1,
  brake: -32.1,
  "engine-pull": -20.2,
  "tyre-roll": -34.3,
  settle: -23.2,
};
export const gainFor = (name: Name, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;

/** The first frame from `from` on where `test` holds. */
const first = (xs: number[], from: number, test: (x: number) => boolean) => {
  for (let f = from; f < xs.length; f++) if (test(xs[f])) return f;
  return -1;
};

const lights = HEROES.lights.v;
const stop = first(lights, 0, (v) => v < 0.5);
const go = stop >= 0 ? first(lights, stop, (v) => v > 0.8) : -1;
// At the roundabout: the slowest moment at the give-way, then rolling on.
const round = HEROES.roundabout.v;
let slowest = 0;
for (let f = 1; f < 250; f++) if (round[f] < round[slowest]) slowest = f;

export const CUES: readonly Cue[] = [
  {
    id: "air",
    name: "street-air",
    frame: 0,
    rate: 1,
    gain: gainFor("street-air", -21),
    length: DURATION,
  },
  ...HEROES.lights.changes.map(
    (f, k): Cue => ({
      id: `click-${k}`,
      name: "signal-click",
      frame: f,
      rate: 1,
      gain: gainFor("signal-click", -8),
    }),
  ),
  ...(stop > 6
    ? [
        {
          id: "brake",
          name: "brake" as const,
          frame: stop - 6,
          rate: 0.8,
          gain: gainFor("brake", -9),
        },
      ]
    : []),
  ...(go >= 0
    ? [
        {
          id: "go",
          name: "engine-pull" as const,
          frame: go,
          rate: 1,
          gain: gainFor("engine-pull", -5),
        },
      ]
    : []),
  {
    id: "roll",
    name: "tyre-roll",
    frame: slowest,
    rate: 1,
    gain: gainFor("tyre-roll", -8),
  },
  {
    id: "verdict",
    name: "settle",
    frame: VERDICT_FROM,
    rate: 1,
    gain: gainFor("settle", -6),
  },
];
