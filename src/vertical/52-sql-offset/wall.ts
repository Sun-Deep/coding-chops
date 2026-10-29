import * as B from "./beats";
import { PAGE, RUN } from "./measurements";

/**
 * The wall's layout and when each crate is read, shared by the Blender
 * scene (through `scripts/blender/offset/export.mjs`) and the reel's
 * counter, so the count goes up on the frame a crate's lid opens.
 *
 * One crate is 1,000 orders, labelled with its first id, in id order the
 * way you read a page: left to right, top to bottom. The 100 crates before
 * the page hold the 100,000 orders OFFSET skips. The page asked for is the
 * first 100 orders of the next crate, ids 100,001 to 100,100, an orange
 * folder at its front. Each row of shelves has a sign with its first id:
 * the upper level of the index, the crate labels the lower.
 */

export const COLS = 12;
export const ROWS = 9;
export const CRATES = COLS * ROWS;
export const CRATE_ORDERS = 1000;
export const SKIPPED = RUN.hero.offset / CRATE_ORDERS;
/** The page's crate: the first one after the skipped rows. */
export const PAGE_CRATE = SKIPPED;
export const firstId = (i: number) => i * CRATE_ORDERS + 1;
export const rowOf = (i: number) => Math.floor(i / COLS);
/** Frames from a crate starting out to its lid being open. */
export const OPEN = 4;

/**
 * The frame skipped crate i starts out of its slot: the first one slowly
 * enough to see it opened, then faster and faster.
 */
export const readAt = (i: number) =>
  B.FIRST + (B.SKIP_TO - B.FIRST) * (i / (SKIPPED - 1)) ** 0.55;

/** Frames a crate takes to fall to the belt: longer from the higher rows. */
export const dropFrames = (i: number) => 6 + (ROWS - 1 - rowOf(i));
/** The frame skipped crate i lands on the belt, after tipping. */
export const landAt = (i: number) => readAt(i) + OPEN + 1 + dropFrames(i);

/** Every frame a crate of the skipped 100,000 is read, in id order. */
export const READS: number[] = Array.from(
  { length: SKIPPED },
  (_, i) => readAt(i) + OPEN,
);

/** Take 1's rows read on frame f: 1,000 a crate, then the page. */
export const rowsRead1 = (f: number) =>
  CRATE_ORDERS * READS.filter((r) => r <= f).length +
  (f >= B.PAGE_OPEN ? PAGE : 0);
