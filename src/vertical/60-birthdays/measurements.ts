/**
 * Copied from `curriculum/vertical/60-birthdays/runs/birthdays.json`,
 * written by `scripts/measure-birthdays.mjs`. 365 days, no 29 February,
 * every day equally likely. `scripts/blender/birthdays/export.mjs` refuses
 * to run if these drift from that file.
 */
export const RUN = {
  classSize: 23,
  pairs: 253,
  trials: 1_000_000,
  trialsWithShared: 507783,
  exactShare: 0.5072972343239857,
  heroRoom: 3,
  heroPair: [5, 17],
  sharedDay: "NOV 12",
  birthdays: [
    "JUN 23",
    "SEP 30",
    "APR 27",
    "MAY 20",
    "MAY 12",
    "NOV 12",
    "JUL 8",
    "FEB 19",
    "MAR 11",
    "FEB 13",
    "JUN 21",
    "DEC 29",
    "FEB 14",
    "SEP 16",
    "APR 9",
    "MAY 2",
    "APR 20",
    "NOV 12",
    "MAY 6",
    "JAN 27",
    "SEP 9",
    "APR 21",
    "NOV 14",
  ],
  /** One digit per room, 1 where two of its 23 share a birthday. */
  roomsShared:
    "0011011001011010100011100100101101010101110011000010001101011101110110101110010011110011101010101010",
  roomsWithShared: 53,
} as const;

export const PERCENT = (100 * RUN.exactShare).toFixed(1);
