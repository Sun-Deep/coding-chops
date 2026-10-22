/** Seed 37, from the recorded measurement run. Seconds, not road observations. */
export const MEASURED = {
  firstQueue: 15,
  firstBoarded: 18,
  nextQueue: 15,
  followingQueue: 5,
  thirdDeparture: [249.5, 256.5],
  departureGap: 7,
  blocked: { from: 226.75, to: 249.5, seconds: 22.75, roundedSeconds: 23 },
} as const;
export const CONDITIONS = "simulated · same driving speed · route compressed";
