# Measurements

Run with `node scripts/measure-cron.mjs`.

Machine: MacBook Pro, Darwin 25.5.0 arm64, Node v22.14.0, cron-parser 5.10.1, 2026-09-21.

## Everything here is a count

A millisecond is a property of the laptop and a fire count is a property of the
expression, so this cut has no timings in it at all.

The counting is done twice by implementations that share nothing. One walks
every minute of 2026 and asks a matcher written here whether the expression
selects it, which is 525,600 questions each and completely unambiguous. The
other uses `cron-parser` and steps from one fire to the next. They agree on
every line or the script throws.

`src/vertical/15-cron/fields.ts` then walks the year a third time, in
TypeScript, and asserts against the published figures at module load.

## Why these four expressions

Chosen after seeing the counts rather than before. Pinning the fields in order
walks down the units of time, and every number it lands on is one everybody
already knows.

| expression  | fires   | which is          |
| ----------- | ------- | ----------------- |
| `* * * * *` | 525,600 | minutes in a year |
| `0 * * * *` | 8,760   | hours in a year   |
| `0 9 * * *` | 365     | days in a year    |
| `0 9 * * 1` | 52      | weeks in a year   |

That is the lesson in four numbers. The five fields are not five settings, they
are five units, and pinning one drops you to the next.

2026 is not a leap year, so `* * * * *` is exactly 525,600. The script asserts
that rather than assuming it.

## The case the matcher refuses

POSIX cron ORs the day-of-month and day-of-week fields when both are restricted.
`0 9 5 * 1` is nine o'clock on the fifth _and_ nine o'clock every Monday, not
"the fifth if it is a Monday".

The hand-written matcher ANDs its five fields, which is correct whenever one of
those two is `*` and wrong otherwise. Checked against `cron-parser` on
`0 9 5 * 1` in January 2026, the two differ by a factor of four: one fire
against four.

Every expression in this cut leaves day-of-month as `*`, so every figure it
prints is right. That was luck rather than design until the guard was added.
Both implementations now refuse an expression that restricts both fields instead
of quietly producing a wrong number, and the gotcha is the caption's catch.

## Drift

None by construction, and checked anyway. The expressions are literals, the year
is pinned, and nothing is sampled. Run twice back to back, the output was byte
identical.

## Raw output

```text
# Fires in 2026, counted two ways that agree

## The build-up
  * * * * *             525600  every minute of the year
  0 * * * *               8760  every hour
  0 9 * * *                365  every day at nine
  0 9 * * 1                 52  every Monday at nine

## Common lines
  * * * * *             525600  every minute
  */15 * * * *           35040  every quarter hour
  0 * * * *               8760  on the hour
  0 9 * * 1-5              261  weekday mornings
  0 9 * * 1                 52  Monday mornings

## Sanity
  minutes in 2026          525600
  365 x 24 x 60             525600

## The week grid the reel draws, Monday to Sunday by hour
  * * * * *            168 of 168 hours live, 10080 fires a week
    ########################
    ########################
    ########################
    ########################
    ########################
    ########################
    ########################
  0 * * * *            168 of 168 hours live,   168 fires a week
    ------------------------
    ------------------------
    ------------------------
    ------------------------
    ------------------------
    ------------------------
    ------------------------
  0 9 * * *              7 of 168 hours live,     7 fires a week
    .........-..............
    .........-..............
    .........-..............
    .........-..............
    .........-..............
    .........-..............
    .........-..............
  0 9 * * 1              1 of 168 hours live,     1 fires a week
    .........-..............
    ........................
    ........................
    ........................
    ........................
    ........................
    ........................
```
