import {
  HOST_OPENS,
  PULL,
  REACT,
  REVEAL,
  TALLY_TO,
  VERDICT_FROM,
} from "./beats";
import { landings } from "./Stage";

/**
 * The sound of what is on screen, from the recorded CC0 set in
 * `public/sfx/kenney/`:
 *
 * - the first game: a tick as YOU lands on door 1, a latch and a knock as
 *   the host's door swings, a clock ticking while you decide, rising a
 *   little each tick, two knocks as yours and the other open, and a bell
 *   for the car;
 * - the cut to the studio, a switch as its lights come up, and the clock
 *   carrying on while the cases stand empty;
 * - every car landing in its case, a light plastic clack, the switch case
 *   a little higher, so the switch side is heard landing twice as often;
 * - the count in, a wooden knock; the switcher's win, a chime, and the
 *   sticker's slump, a low buzz;
 * - the verdict, a low hit and the bell slowed down ringing out.
 *
 * Every file peaks near -1 dBFS, so a gain is the level it should sit at.
 */

export type Cue = {
  readonly id: string;
  readonly name: string;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
  readonly length?: number;
};

const dB = (target: number) =>
  Math.round(10 ** ((target + 1) / 20) * 1000) / 1000;
const random = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const rng = random(45);
const pick = <T>(xs: readonly T[]) => xs[Math.floor(rng() * xs.length)];
const k = (name: string) => `kenney/${name}`;
const LIGHT = [0, 1, 2].map((i) => `impactGeneric_light_00${i}`);

export const CUES: readonly Cue[] = [
  { id: "you", name: k("tick_001"), frame: 6, rate: 1, gain: dB(-10) },
  {
    id: "pick",
    name: k("impactWood_light_001"),
    frame: 12,
    rate: 1.2,
    gain: dB(-14),
  },
  {
    id: "latch",
    name: k("impactWood_medium_001"),
    frame: HOST_OPENS,
    rate: 1.1,
    gain: dB(-9),
  },
  {
    id: "swing",
    name: k("impactWood_light_002"),
    frame: HOST_OPENS + 9,
    rate: 0.85,
    gain: dB(-12),
  },
  {
    id: "open-1",
    name: k("impactWood_medium_001"),
    frame: REVEAL,
    rate: 1.0,
    gain: dB(-9),
  },
  {
    id: "open-2",
    name: k("impactWood_light_000"),
    frame: REVEAL + 3,
    rate: 0.95,
    gain: dB(-11),
  },
  {
    id: "car",
    name: k("impactBell_heavy_000"),
    frame: REVEAL + 8,
    rate: 1,
    gain: dB(-7),
  },
  ...Array.from(
    { length: 12 },
    (_, h): Cue => ({
      id: `clock-${h}`,
      name: k(h % 2 ? "tick_002" : "tick_001"),
      frame: HOST_OPENS + 16 + h * 5,
      rate: 0.9 + h * 0.03,
      gain: dB(-12),
    }),
  ),
  {
    id: "studio",
    name: k("switch_003"),
    frame: PULL,
    rate: 0.8,
    gain: dB(-9),
  },
  ...Array.from(
    { length: 6 },
    (_, h): Cue => ({
      id: `wait-${h}`,
      name: k(h % 2 ? "tick_002" : "tick_001"),
      frame: PULL + 6 + h * 5,
      rate: 1.25 + h * 0.03,
      gain: dB(-14),
    }),
  ),
  ...landings().flatMap((frames, side) =>
    frames.map(
      (frame, j): Cue => ({
        id: `car-${side}-${j}`,
        name: k(pick(LIGHT)),
        frame,
        rate: (side ? 1.15 : 0.95) + rng() * 0.12,
        gain: dB(-13 - rng() * 3),
      }),
    ),
  ),
  {
    id: "counted",
    name: k("impactWood_medium_001"),
    frame: TALLY_TO,
    rate: 0.9,
    gain: dB(-10),
  },
  {
    id: "win",
    name: k("confirmation_001"),
    frame: REACT,
    rate: 1,
    gain: dB(-9),
  },
  {
    id: "slump",
    name: k("error_004"),
    frame: REACT + 6,
    rate: 0.7,
    gain: dB(-15),
  },
  {
    id: "verdict",
    name: k("impactSoft_heavy_000"),
    frame: VERDICT_FROM,
    rate: 0.9,
    gain: dB(-5),
  },
  {
    id: "verdict-ring",
    name: k("impactBell_heavy_000"),
    frame: VERDICT_FROM + 4,
    rate: 0.42,
    gain: dB(-8),
  },
];
