import { CELLS, DAYS, FIELDS, GRIDS, HOURS, STEPS, YEAR } from "./measurements";

/**
 * Cron's five fields, implemented again and checked against the measurement.
 *
 * Double entry, the rule from section 2 of the playbook. The script counts a
 * year twice, by hand and with `cron-parser`. This walks the year a third time
 * and asserts it lands on the same figures, so a change to the field parser on
 * either side fails at module load rather than drawing a grid that no longer
 * matches the number beside it.
 */

const agree = (label: string, here: number, script: number) => {
  if (here !== script) {
    throw new Error(
      `VR15 ${label}: the port says ${here}, the measurement says ${script}`,
    );
  }
};

/**
 * One field into the set of values it selects.
 *
 * Handles `*`, `a-b`, `a,b` and any of those with a `/step`, which is every
 * form used here. Deliberately not a complete cron parser; the complete one is
 * in the measurement script and it is the check.
 */
export const valuesOf = (spec: string, field: { min: number; max: number }) => {
  const out = new Set<number>();
  for (const part of spec.split(",")) {
    const [range, stepText] = part.split("/");
    const step = stepText ? Number(stepText) : 1;
    let lo = field.min;
    let hi = field.max;
    if (range !== "*") {
      const [a, b] = range.split("-");
      lo = Number(a);
      hi = b === undefined ? Number(a) : Number(b);
    }
    for (let v = lo; v <= hi; v += step) out.add(v);
  }
  return out;
};

export type Compiled = readonly Set<number>[];

export const compile = (expression: string): Compiled => {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== FIELDS.length) {
    throw new Error(`VR15 ${expression}: expected ${FIELDS.length} fields`);
  }
  return FIELDS.map((field, i) => valuesOf(parts[i], field));
};

/** The written fields of an expression, for drawing them one slot at a time. */
export const slotsOf = (expression: string) => expression.trim().split(/\s+/);

/**
 * The one case this matcher must refuse.
 *
 * POSIX cron ORs the day-of-month and day-of-week fields when both are
 * restricted, so `0 9 5 * 1` means nine o'clock on the fifth *and* nine o'clock
 * every Monday, not "the fifth if it is a Monday". The walker below ANDs its
 * five fields, which is correct whenever one of those two is `*` and wrong
 * otherwise. Measured against `cron-parser` the two differ by a factor of four
 * on that expression.
 *
 * Every expression in this cut leaves day-of-month as `*`, so every figure is
 * right. The guard is here so that stays true by construction rather than by
 * luck.
 */
const refuseOredFields = (expression: string) => {
  const parts = slotsOf(expression);
  if (parts[2] !== "*" && parts[4] !== "*") {
    throw new Error(
      `VR15 ${expression}: day-of-month and day-of-week are both set, and cron ` +
        `ORs them rather than ANDing them. This matcher cannot count that case.`,
    );
  }
};

/** Count by asking about every minute of the year, the slow unambiguous way. */
const countInYear = (expression: string) => {
  refuseOredFields(expression);
  const [minute, hour, dom, month, dow] = compile(expression);
  const at = new Date(YEAR, 0, 1, 0, 0, 0, 0);
  const end = new Date(YEAR + 1, 0, 1, 0, 0, 0, 0);
  let fires = 0;
  while (at < end) {
    if (
      minute.has(at.getMinutes()) &&
      hour.has(at.getHours()) &&
      dom.has(at.getDate()) &&
      month.has(at.getMonth() + 1) &&
      dow.has(at.getDay())
    ) {
      fires++;
    }
    at.setMinutes(at.getMinutes() + 1);
  }
  return fires;
};

/**
 * A week as 7 days by 24 hours, each cell holding how many of that hour's sixty
 * minutes fire.
 *
 * Only true while the day-of-month and month fields are `*`, which holds for
 * every expression in this cut. Anything else throws rather than drawing a lie.
 */
export const weekGrid = (expression: string): number[][] => {
  const parts = slotsOf(expression);
  if (parts[2] !== "*" || parts[3] !== "*") {
    throw new Error(
      `VR15 ${expression}: a week grid only holds when day and month are *`,
    );
  }
  const [minute, hour, , , dow] = compile(expression);
  // Rows Monday to Sunday, which is how a calendar is read. Cron calls Sunday 0.
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order.map((d) =>
    Array.from({ length: HOURS }, (_, h) =>
      dow.has(d) && hour.has(h) ? minute.size : 0,
    ),
  );
};

/** Every step's grid, computed once. */
export const STEP_GRIDS: readonly number[][][] = STEPS.map((s) =>
  weekGrid(s.expression),
);

// ---------------------------------------------------------------------------
// The check.
// ---------------------------------------------------------------------------

agree("week cells", DAYS.length * HOURS, CELLS);

STEPS.forEach((step, i) => {
  agree(`${step.expression} fires`, countInYear(step.expression), step.fires);

  const flat = STEP_GRIDS[i].flat();
  agree(
    `${step.expression} live hours`,
    flat.filter((v) => v > 0).length,
    GRIDS[i].live,
  );
  agree(
    `${step.expression} fires a week`,
    flat.reduce((a, b) => a + b, 0),
    GRIDS[i].perWeek,
  );
});

// The whole point of the sequence: each step is a year of the next unit up.
agree("minutes in the year", STEPS[0].fires, 365 * 24 * 60);
agree("hours in the year", STEPS[1].fires, 365 * 24);
agree("days in the year", STEPS[2].fires, 365);
if (STEPS[3].fires < 52 || STEPS[3].fires > 53) {
  throw new Error(`VR15: ${STEPS[3].expression} should be a year of Mondays`);
}

/** Which slot each step pins, or -1 for the opening expression. */
export const PINNED: readonly number[] = STEPS.map((step, i) => {
  if (i === 0) return -1;
  const before = slotsOf(STEPS[i - 1].expression);
  const now = slotsOf(step.expression);
  const at = now.findIndex((v, j) => v !== before[j]);
  if (at < 0) throw new Error(`VR15 ${step.expression}: nothing changed`);
  return at;
});
