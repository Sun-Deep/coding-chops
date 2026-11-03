# Measurements

Run with `node scripts/measure-birthdays.mjs` on 3 November 2026, Node
22.14.0. The full record is `runs/birthdays.json`;
`src/vertical/60-birthdays/measurements.ts` copies it and the Blender
export refuses to run if the two disagree.

| Quantity                                  | Value                                             |
| ----------------------------------------- | ------------------------------------------------- |
| Pairs in a class of 23                    | 253                                               |
| Exact chance at least two share           | 0.50730                                           |
| Classes simulated (mulberry32, seed 2026) | 1,000,000                                         |
| With at least one shared birthday         | 507,783 (50.78%)                                  |
| Rooms on screen (seed 100)                | 100                                               |
| Rooms with a shared birthday              | 53                                                |
| First room shown                          | room 3, the first with exactly one shared pair    |
| Its match                                 | students 6 and 18 (indices 5 and 17), 12 November |

Assumptions: 365 days, no 29 February, every day equally likely.
