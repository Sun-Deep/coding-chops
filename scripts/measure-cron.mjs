#!/usr/bin/env node

// What the five fields of a cron expression actually select.
//
// Everything here is a count, and counts are what this format prefers: a
// millisecond is a property of the laptop and a fire count is a property of the
// expression.
//
// The counting is done twice, by two implementations that share nothing.
//
// The first walks every minute of 2026 and asks a matcher written here whether
// the expression selects it. That is 525,600 questions per expression, which is
// slow and completely unambiguous.
//
// The second uses `cron-parser`, an independent library, and steps from one
// fire to the next until it leaves the year. If the two disagree by a single
// minute the script throws, so a bug in the field parser cannot reach the
// screen.
//
// 2026 is not a leap year, so `* * * * *` fires exactly 525,600 times. That is
// not a coincidence worth hiding: a year of minutes is where the number comes
// from, and the reel says so.

import { CronExpressionParser } from "cron-parser";

const YEAR = 2026;

/** Cron's five fields, in the order they are written. */
const FIELDS = [
  { name: "minute", label: "MINUTE", min: 0, max: 59 },
  { name: "hour", label: "HOUR", min: 0, max: 23 },
  { name: "dom", label: "DAY", min: 1, max: 31 },
  { name: "month", label: "MONTH", min: 1, max: 12 },
  { name: "dow", label: "WEEKDAY", min: 0, max: 6 },
];

/**
 * One field into the set of values it selects.
 *
 * Handles `*`, `a-b`, `a,b`, and any of those with a `/step`, which is every
 * form the expressions in this cut use. Deliberately not a complete cron
 * parser: `cron-parser` is the complete one, and it is the check.
 */
const valuesOf = (spec, { min, max }) => {
  const out = new Set();
  for (const part of spec.split(",")) {
    const [range, stepText] = part.split("/");
    const step = stepText ? Number(stepText) : 1;
    let lo = min;
    let hi = max;
    if (range !== "*") {
      const [a, b] = range.split("-");
      lo = Number(a);
      hi = b === undefined ? Number(a) : Number(b);
    }
    for (let v = lo; v <= hi; v += step) out.add(v);
  }
  return out;
};

const compile = (expression) => {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== FIELDS.length) {
    throw new Error(`${expression}: expected ${FIELDS.length} fields`);
  }
  return FIELDS.map((field, i) => valuesOf(parts[i], field));
};

/**
 * Sunday is both 0 and 7 in cron, and JavaScript calls it 0 too.
 *
 * Worth stating rather than assuming, because an off-by-one here would make
 * every weekday figure wrong in a way that still looks plausible.
 */
const dowOf = (date) => date.getDay();

/**
 * The one case this matcher must refuse.
 *
 * POSIX cron ORs the day-of-month and day-of-week fields when both are
 * restricted, so `0 9 5 * 1` is nine o'clock on the fifth *and* nine o'clock
 * every Monday, not "the fifth if it is a Monday". The matcher below ANDs its
 * five fields, which is correct whenever at least one of those two is `*` and
 * wrong otherwise.
 *
 * Every expression in this cut leaves day-of-month as `*`, so every figure it
 * prints is right. That was luck rather than design until this guard existed:
 * checked against `cron-parser`, the two implementations differ by a factor of
 * four on `0 9 5 * 1`, and without this the script would have reported the
 * disagreement as a crash in some future edit instead of explaining it.
 */
const refuseOredFields = (expression) => {
  const parts = expression.trim().split(/\s+/);
  if (parts[2] !== "*" && parts[4] !== "*") {
    throw new Error(
      `${expression}: day-of-month and day-of-week are both set, and cron ORs ` +
        `them rather than ANDing them. This matcher cannot count that case.`,
    );
  }
};

/** Count by asking about every minute of the year, the slow unambiguous way. */
const countByWalking = (expression) => {
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
      dow.has(dowOf(at))
    ) {
      fires++;
    }
    at.setMinutes(at.getMinutes() + 1);
  }
  return fires;
};

/** Count by stepping from one fire to the next, using the library. */
const countByStepping = (expression) => {
  const it = CronExpressionParser.parse(expression, {
    currentDate: new Date(YEAR, 0, 1, 0, 0, 0, 0),
    endDate: new Date(YEAR + 1, 0, 1, 0, 0, 0, 0),
  });
  let fires = 0;
  for (;;) {
    try {
      it.next();
    } catch {
      break;
    }
    fires++;
  }
  return fires;
};

/**
 * A typical week, as 7 days by 24 hours, with how many of each hour's sixty
 * minutes the expression selects.
 *
 * This is what the reel draws. It only holds while the day-of-month and month
 * fields are `*`, which is true of every expression here, and the script
 * refuses to build a grid for anything else rather than drawing a lie.
 */
const weekGrid = (expression) => {
  const parts = expression.trim().split(/\s+/);
  if (parts[2] !== "*" || parts[3] !== "*") {
    throw new Error(
      `${expression}: a week grid only holds when day and month are *`,
    );
  }
  const [minute, hour, , , dow] = compile(expression);
  // Rows Monday to Sunday, which is how a calendar is read.
  const rows = [1, 2, 3, 4, 5, 6, 0];
  return rows.map((d) =>
    Array.from({ length: 24 }, (_, h) =>
      dow.has(d) && hour.has(h) ? minute.size : 0,
    ),
  );
};

// ---------------------------------------------------------------------------
// The expressions.
// ---------------------------------------------------------------------------

/**
 * The build-up the reel animates, one field landing at a time.
 *
 * Chosen after seeing the counts rather than before. Pinning the fields in
 * order walks down the units of time, and every number it lands on is one
 * everybody already knows:
 *
 *   525,600   minutes in a year
 *     8,760   hours in a year
 *       365   days in a year
 *        52   weeks in a year
 *
 * That is the whole lesson in four numbers. The five fields are not five
 * settings, they are five units, and pinning one drops you to the next.
 */
const STEPS = [
  { expression: "* * * * *", says: "every minute of the year" },
  { expression: "0 * * * *", says: "every hour" },
  { expression: "0 9 * * *", says: "every day at nine" },
  { expression: "0 9 * * 1", says: "every Monday at nine" },
];

/** The reference the cut leaves behind. */
const COMMON = [
  { expression: "* * * * *", says: "every minute" },
  { expression: "*/15 * * * *", says: "every quarter hour" },
  { expression: "0 * * * *", says: "on the hour" },
  { expression: "0 9 * * 1-5", says: "weekday mornings" },
  { expression: "0 9 * * 1", says: "Monday mornings" },
];

const report = (rows) => {
  for (const row of rows) {
    const walked = countByWalking(row.expression);
    const stepped = countByStepping(row.expression);
    if (walked !== stepped) {
      throw new Error(
        `${row.expression}: walking says ${walked}, cron-parser says ${stepped}`,
      );
    }
    console.log(
      `  ${row.expression.padEnd(20)} ${String(walked).padStart(7)}  ${row.says}`,
    );
  }
};

console.log(`# Fires in ${YEAR}, counted two ways that agree`);
console.log();
console.log("## The build-up");
report(STEPS);
console.log();
console.log("## Common lines");
report(COMMON);
console.log();

console.log("## Sanity");
const allMinutes = countByWalking("* * * * *");
console.log(`  minutes in ${YEAR}          ${allMinutes}`);
console.log(`  365 x 24 x 60             ${365 * 24 * 60}`);
if (allMinutes !== 365 * 24 * 60) {
  throw new Error(`${YEAR} is not the 365 day year this assumes`);
}
console.log();

console.log("## The week grid the reel draws, Monday to Sunday by hour");
for (const step of STEPS) {
  const grid = weekGrid(step.expression);
  const lit = grid.flat().filter((v) => v > 0).length;
  const perWeek = grid.flat().reduce((a, b) => a + b, 0);
  console.log(
    `  ${step.expression.padEnd(20)} ${String(lit).padStart(3)} of 168 hours live, ${String(perWeek).padStart(5)} fires a week`,
  );
  // A density glyph per hour: how many of its sixty minutes fire.
  const glyph = (v) => (v === 0 ? "." : v === 60 ? "#" : v >= 15 ? "+" : "-");
  console.log(`    ${grid.map((r) => r.map(glyph).join("")).join("\n    ")}`);
}
