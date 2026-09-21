/**
 * From `scripts/measure-cron.mjs`.
 *
 * Everything here is a count, which is what this format prefers: a millisecond
 * is a property of the laptop and a fire count is a property of the expression.
 *
 * The script counts twice with two implementations that share nothing. One
 * walks every minute of 2026 and asks a matcher written by hand whether the
 * expression selects it; the other uses `cron-parser` and steps from one fire
 * to the next. They agree on every line below or the script throws.
 *
 * `cron.ts` then walks the year a third time, in TypeScript, and asserts
 * against these figures at module load, so a frame cannot print a number the
 * code no longer produces.
 *
 * 2026 is not a leap year, so `* * * * *` fires exactly 525,600 times.
 */

export const YEAR = 2026;

export type Field = {
  readonly label: string;
  readonly min: number;
  readonly max: number;
};

/**
 * The five fields, in the order they are written.
 *
 * This is the thing the cut is actually teaching. Almost everybody who has used
 * cron has copied a line without being sure which position is which, the same
 * gap `755` fills for permissions.
 */
export const FIELDS: readonly Field[] = [
  { label: "MINUTE", min: 0, max: 59 },
  { label: "HOUR", min: 0, max: 23 },
  { label: "DAY", min: 1, max: 31 },
  { label: "MONTH", min: 1, max: 12 },
  { label: "WEEKDAY", min: 0, max: 6 },
];

export type Line = {
  readonly expression: string;
  readonly says: string;
  readonly fires: number;
};

/**
 * The build-up, one field landing at a time.
 *
 * Chosen after seeing the counts rather than before, which is the only reason
 * it is this sequence. Pinning the fields in order walks down the units of
 * time, and every number it lands on is one everybody already knows:
 *
 *   525,600  minutes in a year
 *     8,760  hours in a year
 *       365  days in a year
 *        52  weeks in a year
 *
 * That is the lesson in four numbers. The five fields are not five settings,
 * they are five units, and pinning one drops you to the next.
 */
export const STEPS: readonly Line[] = [
  { expression: "* * * * *", says: "every minute of the year", fires: 525_600 },
  { expression: "0 * * * *", says: "every hour", fires: 8_760 },
  { expression: "0 9 * * *", says: "every day at nine", fires: 365 },
  { expression: "0 9 * * 1", says: "every Monday at nine", fires: 52 },
];

/** What each step is a year's worth of, which is why the numbers land. */
export const UNITS: readonly string[] = ["minutes", "hours", "days", "weeks"];

/** The reference the cut leaves behind, for the notes rather than the frame. */
export const COMMON: readonly Line[] = [
  { expression: "* * * * *", says: "every minute", fires: 525_600 },
  { expression: "*/15 * * * *", says: "every quarter hour", fires: 35_040 },
  { expression: "0 * * * *", says: "on the hour", fires: 8_760 },
  { expression: "0 9 * * 1-5", says: "weekday mornings", fires: 261 },
  { expression: "0 9 * * 1", says: "Monday mornings", fires: 52 },
];

/** A week is 7 days of 24 hours, which is the grid the reel draws. */
export const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
export const HOURS = 24;
export const CELLS = DAYS.length * HOURS;

export type GridStat = {
  /** How many of the 168 hours have any fire in them. */
  readonly live: number;
  /** How many fires the expression makes in a week. */
  readonly perWeek: number;
};

/** Asserted against the TypeScript port in `cron.ts`. */
export const GRIDS: readonly GridStat[] = [
  { live: 168, perWeek: 10_080 },
  { live: 168, perWeek: 168 },
  { live: 7, perWeek: 7 },
  { live: 1, perWeek: 1 },
];
