import { DURATION, simAt } from "./beats";
import { clearance, gForce, pose, type Rule, type State } from "./simulation";

/**
 * What each panel's instruments read on every frame, straight from the
 * model: the force on the car in g and the most it has felt so far, the gap
 * under it, how fast it is going (along the ramp, then through the air) and
 * how far it has turned over.
 */
export type Reading = {
  readonly state: State;
  readonly g: number;
  readonly peak: number;
  readonly height: number;
  /** Metres a second, in whatever direction it is moving. */
  readonly speed: number;
  readonly turned: number;
};

const readings = (rule: Rule): Reading[] => {
  const out: Reading[] = [];
  let peak = 0;
  for (let f = 0; f <= DURATION; f++) {
    const q = pose(rule, simAt(f));
    const g = gForce(q);
    peak = Math.max(peak, g);
    out.push({
      state: q.state,
      g,
      peak,
      height: clearance(q),
      speed: Math.hypot(q.vx, q.vz),
      turned: ((Math.PI - q.roll) * 180) / Math.PI,
    });
  }
  return out;
};

export const READINGS: Record<Rule, readonly Reading[]> = {
  off: readings("off"),
  on: readings("on"),
};
