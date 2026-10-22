import { DURATION, VERDICT_FROM, frameAt, simAt } from "./beats";
import { HERO } from "./measurements";
import { RUNS } from "./runs";
import { FLOOR_S, STOP_S, type Rule, type Trip } from "./simulation";

/**
 * Every cue is read off the model. The air of a stone lobby under the whole
 * reel. When a car reaches the lobby, its chime and the doors sliding open;
 * when the doors close, the slide and the thud of the panels meeting; each
 * time they start to close and are held instead, the bump of the doors on
 * an arm. A soft blip each time a floor display moves on by one, so the
 * race up the building can be heard, and the chime again, brighter, when
 * you step out at your floor. Footsteps come from the render itself, in
 * `Footsteps.tsx`. Gains come from each file's measured peak.
 */

export type Name =
  | "lobby-room"
  | "lift-chime"
  | "lift-door-open"
  | "lift-door-close"
  | "lift-door-bump"
  | "lobby-step"
  | "floor-blip"
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
  "lobby-room": -32.1,
  "lift-chime": -26.4,
  "lift-door-open": -29.7,
  "lift-door-close": -24.6,
  "lift-door-bump": -22.1,
  "lobby-step": -42.7,
  "floor-blip": -29.6,
  settle: -23.2,
};
export const gainFor = (name: Name, target: number) =>
  Math.round(10 ** ((target - PEAK[name]) / 20) * 100) / 100;

const onScreen = (f: number) => f >= 0 && f < DURATION - 4;

/** Which floor the car is at, as a continuous number, at second t. */
const floorAt = (trips: readonly Trip[], t: number) => {
  for (const trip of trips) {
    if (t < trip.close || t > trip.back) continue;
    let s = trip.close;
    let f = 0;
    for (const stop of trip.stops) {
      if (t < stop.at) return f + ((t - s) / (stop.at - s)) * (stop.floor - f);
      if (t < stop.at + STOP_S) return stop.floor;
      s = stop.at + STOP_S;
      f = stop.floor;
    }
    return Math.max(0, f - (t - s) / FLOOR_S);
  }
  return 0;
};

const lobby = (rule: Rule, rate: number): Cue[] => {
  const out: Cue[] = [];
  const trips = RUNS[rule].trips;
  for (const [k, t] of trips.entries()) {
    const open = Math.round(frameAt(t.open));
    if (onScreen(open) && open > 4) {
      out.push({
        id: `${rule}-chime-${k}`,
        name: "lift-chime",
        frame: open - 4,
        rate,
        gain: gainFor("lift-chime", -9),
      });
      out.push({
        id: `${rule}-open-${k}`,
        name: "lift-door-open",
        frame: open,
        rate,
        gain: gainFor("lift-door-open", -16),
      });
    }
    for (const h of t.holds) {
      const f = Math.round(frameAt(h)) + 6;
      if (onScreen(f))
        out.push({
          id: `${rule}-bump-${k}-${f}`,
          name: "lift-door-bump",
          frame: f,
          rate,
          gain: gainFor("lift-door-bump", -12),
        });
    }
    const close = Math.round(frameAt(t.close));
    if (onScreen(close))
      out.push({
        id: `${rule}-close-${k}`,
        name: "lift-door-close",
        frame: close,
        rate,
        gain: gainFor("lift-door-close", -12),
      });
  }
  // The display moving on by a floor: higher going up than coming down.
  let shown = Math.round(floorAt(trips, simAt(0)));
  for (let f = 1; f < DURATION - 4; f++) {
    const now = Math.round(floorAt(trips, simAt(f)));
    if (now === shown) continue;
    out.push({
      id: `${rule}-floor-${f}`,
      name: "floor-blip",
      frame: f,
      rate: rate * (now > shown ? 1.06 : 0.9),
      gain: gainFor("floor-blip", -21),
    });
    shown = now;
  }
  const you = Math.round(frameAt(HERO[rule].out));
  if (onScreen(you))
    out.push({
      id: `${rule}-you`,
      name: "lift-chime",
      frame: you,
      rate: 1.26,
      gain: gainFor("lift-chime", -4.5),
    });
  return out;
};

export const CUES: readonly Cue[] = [
  {
    id: "room",
    name: "lobby-room",
    frame: 0,
    rate: 1,
    gain: gainFor("lobby-room", -27),
    length: DURATION,
  },
  ...lobby("hold", 1.03),
  ...lobby("close", 0.97),
  {
    id: "verdict",
    name: "settle",
    frame: VERDICT_FROM,
    rate: 1,
    gain: gainFor("settle", -9),
  },
];
