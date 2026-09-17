import {
  cascade,
  DIALS,
  faceAt,
  READBACK_FROM,
  READBACK_STEP,
  ROLL,
  SUMS_FROM,
  TUMBLERS_FROM,
  WEIGHTS_FROM,
} from "./beats";
import { bitsOf, digitsOf } from "./modes";

/**
 * A lock being worked.
 *
 * Everything here is a mechanical event on a mechanical object, which is the
 * one advantage of having picked a lock: there is nothing to invent. A switch
 * arriving clicks, a drum coming to rest clicks lower, and a switch that flips
 * because the combination changed gets hit harder than one that was already
 * there.
 *
 * The cascades are what keep the first eight seconds from being three cues in a
 * row. Nine switches arriving one at a time is nine clicks, and it is also a
 * better picture than nine appearing together.
 */

export type Click = {
  readonly id: string;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
};

/** Switches arriving, low to high across the three groups. */
export const TUMBLER_CLICKS: readonly Click[] = Array.from(
  { length: 9 },
  (_, n) => ({
    id: `tumbler-${n}`,
    frame: cascade(TUMBLERS_FROM, n),
    rate: 0.9 + (n / 8) * 0.55,
    gain: 2.6,
  }),
);

/** Their values arriving, the same run a tone higher. */
export const WEIGHT_CLICKS: readonly Click[] = Array.from(
  { length: 9 },
  (_, n) => ({
    id: `weight-${n}`,
    frame: cascade(WEIGHTS_FROM, n),
    rate: 1.2 + (n / 8) * 0.7,
    gain: 2.3,
  }),
);

/** The three sums landing. */
export const SUM_CLICKS: readonly Click[] = Array.from(
  { length: 3 },
  (_, n) => ({
    id: `sum-${n}`,
    frame: cascade(SUMS_FROM, n),
    rate: 1.5 + n * 0.22,
    gain: 3.4,
  }),
);

/**
 * The lock turning.
 *
 * Three drums land a couple of frames apart rather than together, because a
 * combination lock does not settle all at once, and then every switch the new
 * combination changed is hit.
 */
export const DIAL_CLICKS: readonly Click[] = DIALS.flatMap((dial, index) => {
  // The opening roll is included. It starts before frame zero and it is the
  // first thing anybody hears, and leaving it out left the first six tenths of
  // a second silent under a lock that is visibly spinning.
  const previous = index === 0 ? { mode: "000" } : DIALS[index - 1];
  const digits = digitsOf(dial.mode);
  const before = digitsOf(previous.mode);

  // A spinning dial clicks on every digit that goes by, not only where it
  // stops. Without this the lock is silent for a second between changes, which
  // is what left ten silence gaps in the first cut, and it is also the sound
  // anybody who has opened a padlock is expecting.
  const drums = digits.flatMap((digit, i) => {
    const start = digitsOf(previous.mode)[i];
    let travel = (digit - start + 8) % 8;
    if (travel === 0) travel = 8;
    return Array.from({ length: travel }, (_, k) => {
      const last = k === travel - 1;
      return {
        id: `drum-${index}-${i}-${k}`,
        frame: Math.round(faceAt(dial.at, k + 1, travel)) + i,
        rate: (last ? 0.74 : 1.35) + i * 0.08,
        gain: last ? 3.8 : 1.5,
      };
    });
  });

  const flips = digits.flatMap((digit, i) =>
    bitsOf(digit)
      .map((bit, b) => ({ bit, b }))
      .filter(({ bit, b }) => bit.on !== bitsOf(before[i])[b].on)
      .map(({ b }) => ({
        id: `flip-${index}-${i}-${b}`,
        frame: dial.at + ROLL + 1 + b,
        rate: 1.9 + b * 0.18,
        gain: 4.6,
      })),
  );

  /** The row landing in the list, which also splits the rest between turns. */
  const landed =
    index === 0
      ? []
      : [
          {
            id: `landed-${index}`,
            frame: dial.at + ROLL + 7,
            rate: 1.15,
            gain: 3.0,
          },
        ];

  return [...drums, ...flips, ...landed].filter((click) => click.frame >= 0);
});

/** The list being read back at the end. */
export const READBACK_CLICKS: readonly Click[] = Array.from(
  { length: 4 },
  (_, n) => ({
    id: `readback-${n}`,
    frame: READBACK_FROM + n * READBACK_STEP,
    rate: 1.0 + n * 0.28,
    gain: 4.2,
  }),
);

export const CLICKS: readonly Click[] = [
  ...TUMBLER_CLICKS,
  ...WEIGHT_CLICKS,
  ...SUM_CLICKS,
  ...DIAL_CLICKS,
  ...READBACK_CLICKS,
];
