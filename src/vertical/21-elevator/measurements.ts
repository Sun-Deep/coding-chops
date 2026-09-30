/**
 * One elevator, seven calls, two rules, from `scripts/measure-elevator.mjs`.
 *
 * Simulated, not timed. A floor takes 2 seconds and a stop, doors open, people
 * on and off, doors shut, takes 8. Those two are the only assumptions, they are
 * in the conditions line, and the script re-runs the comparison at four other
 * settings to show the direction of the result does not hang on them.
 *
 * The scenario is seed 1, the first one the script generates, not one picked
 * for looking good. Its mean trip ratio is 1.41 against a median of 1.52 over a
 * thousand other scenarios, so it understates the ordinary case.
 *
 * `simulation.ts` re-runs both rules on these riders when the module loads and
 * throws if any figure below disagrees with what it gets.
 */

export const FLOORS = 10;
export const START_FLOOR = 1;
export const FLOOR_S = 2;
export const STOP_S = 8;
export const SEED = 1;

export type Rider = {
  readonly id: number;
  /** Second the button was pressed. */
  readonly at: number;
  readonly from: number;
  readonly to: number;
};

/** Seed 1's seven calls, in the order the buttons were pressed. */
export const RIDERS: readonly Rider[] = [
  { id: 0, at: 5, from: 4, to: 6 },
  { id: 1, at: 14, from: 9, to: 3 },
  { id: 2, at: 15, from: 3, to: 5 },
  { id: 3, at: 16, from: 1, to: 4 },
  { id: 4, at: 16, from: 6, to: 3 },
  { id: 5, at: 18, from: 6, to: 1 },
  { id: 6, at: 23, from: 9, to: 4 },
];

/** The rider the cut follows: fifth to press, floor 6, going down to 3. */
export const YOU = 4;

export type RuleKey = "order" | "sweep";

export type Run = {
  /** Second each rider got out, by rider id. */
  readonly out: readonly number[];
  readonly floors: number;
  readonly stops: number;
};

export const RUNS: Readonly<Record<RuleKey, Run>> = {
  order: { out: [27, 61, 73, 103, 129, 161, 203], floors: 49, stops: 13 },
  sweep: { out: [27, 77, 121, 111, 77, 89, 67], floors: 20, stops: 10 },
};

/** Your trip, pressing the button to stepping out, in seconds. */
export const YOUR_TRIP: Readonly<Record<RuleKey, number>> = {
  order: RUNS.order.out[YOU] - RIDERS[YOU].at,
  sweep: RUNS.sweep.out[YOU] - RIDERS[YOU].at,
};

/**
 * The catch, in this scenario. Three of the seven got out later with the
 * sweep than in order: riders 1, 2 and 3, by 16, 48 and 8 seconds.
 */
export const LATER_WITH_SWEEP = 3;

/** Over seeds 100,001 to 101,000 at 2 s a floor and 8 s a stop. */
export const OVER_MANY = {
  scenarios: 1_000,
  sweepFewerFloors: 1_000,
  sweepShorterMeanTrip: 998,
  medianMeanTripRatio: 1.52,
  everyRiderSooner: 6,
} as const;

/** m:ss, the way a lift lobby clock would say it. */
export const clock = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export const CONDITIONS = `simulated · ${FLOORS} floors · ${FLOOR_S} s a floor · ${STOP_S} s a stop`;

/**
 * The payoff line: the sweep has let the last of the seven out before the
 * in-order car lets you out.
 */
export const SWEEP_ALL_OUT = Math.max(...RUNS.sweep.out);
if (SWEEP_ALL_OUT >= RUNS.order.out[YOU]) {
  throw new Error("measurements.ts: the sweep is not done before you are out");
}

if (YOUR_TRIP.order !== 113 || YOUR_TRIP.sweep !== 61) {
  throw new Error("measurements.ts: your trip disagrees with the run");
}
