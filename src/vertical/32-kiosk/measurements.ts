/**
 * The figures the frames use, from `scripts/measure-kiosk.mjs`, which
 * imports the same `simulation.ts` the reel draws from.
 */

/**
 * Seed 1. The followed customer is #24, whose wait in the till line is
 * closest to the 20-rush average. Seconds in line, waiting for food after
 * ordering, and door to tray, and the order number on the board.
 */
export const HERO = {
  id: 24,
  cashier: { line: 261, food: 112, total: 408, number: 125 },
  kiosks: { line: 0, food: 327, total: 372, number: 126 },
} as const;

/** 20 rushes, customers arriving from 5 to 20 minutes, at the defaults. */
export const AVERAGE = {
  cashier: { line: 264, food: 91, total: 410 },
  kiosks: { line: 0, food: 250, total: 324 },
} as const;

export const CONDITIONS = "simulated · same customers both times · sped up";
