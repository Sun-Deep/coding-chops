/**
 * The band under the chart, and what lives in it.
 *
 * The chart's day labels end at y 716 and the caption floor is y 940, which
 * leaves 224px for everything the walk needs on screen at once: the caret, the
 * day's arithmetic, and the two state slots. These numbers are shared rather
 * than retyped per scene, because two acts that both draw a state slot and
 * disagree by thirty pixels make it jump on the cut.
 */

/** Points up at the day the walk is standing on. */
export const CARET = { apex: 720, base: 731, half: 10 } as const;

/** The day's arithmetic, between the day it belongs to and the state it feeds. */
export const EQUATION = { y: 752, size: 38 } as const;

/**
 * Term columns.
 *
 * The sell term shares a column across rows, which is what lets two
 * comparisons prove that only the buy price differs.
 */
export const COLUMN = {
  sell: 776,
  minus: 866,
  buy: 952,
  equals: 1042,
  result: 1136,
} as const;

/**
 * The two state slots.
 *
 * Act 4 introduces the first and Act 5 adds the second, so the first cannot sit
 * centred and shift over later. The pair is what ends up centred on 960, at the
 * midpoints between days 2 and 3 and between days 4 and 5, so neither slot sits
 * under a day label pretending to belong to it.
 */
export const SLOT = {
  cheapest: 736,
  best: 1184,
  labelY: 818,
  labelSize: 19,
  valueY: 844,
  valueSize: 48,
} as const;

/**
 * Where the walk goes once the code arrives.
 *
 * Acts 6 and 7 both show the code beside the example, so the block's park
 * position and the code panel's metrics are shared. Two scenes that each
 * decided where the panel goes would put it in two places on the cut.
 */
export const BLOCK = { x: 1136, y: 260, scale: 0.55 } as const;

export const CODE = { x: 90, y: 230, size: 25, line: 42 } as const;

/** Top of a code line, and the vertical middle of its glyphs. */
export const codeLineY = (index: number) => CODE.y + index * CODE.line;
export const codeLineMid = (index: number) =>
  codeLineY(index) + CODE.size * 0.62;
