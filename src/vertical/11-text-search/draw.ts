import { COLS } from "./measurements";

/**
 * Character cells as one path, not one element each.
 *
 * A page is 2,400 cells and there are six pages on screen. Everything sharing
 * a colour goes into a single `<path>`, so a panel costs about a dozen elements
 * however much of it has been read.
 */
export const cellsPath = (
  cells: readonly number[],
  advance: number,
  line: number,
) => {
  let d = "";
  for (const i of cells) {
    const x = (i % COLS) * advance;
    const y = Math.floor(i / COLS) * line;
    d += `M${x.toFixed(2)} ${y.toFixed(2)}h${advance.toFixed(2)}v${line.toFixed(2)}h-${advance.toFixed(2)}z`;
  }
  return d;
};

/** One row of the page, for a `<text>` element. */
export const rowOf = (text: string, row: number) =>
  text.slice(row * COLS, (row + 1) * COLS);
