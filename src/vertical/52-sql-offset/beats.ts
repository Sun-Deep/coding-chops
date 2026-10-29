/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;
export const FPS = 30;

/**
 * One fixed shot of a wall of crates, the same page fetched twice. Every
 * frame below is shared with `scripts/blender/offset/wall.py` through
 * `export.mjs`; when each crate is read is in `wall.ts`.
 */

/** Take 1, OFFSET: the crates before the page, read and dumped in id order. */
export const FIRST = 2;
export const SKIP_TO = 178;
/** LIMIT: the page's crate slides out, opens, and the page goes to him. */
export const PAGE_OUT = 188;
export const PAGE_OPEN = 194;
export const FLY = 202;
export const CAUGHT = 214;
/** Take 2, keyset: the wall winds back to full. */
export const TAKE_2 = 236;
export const REWOUND = 254;
/** The index: the row's sign, then the crate's label. */
export const HOP_1 = 260;
export const HOP_2 = 272;
/** LIMIT: only the page's crate moves. */
export const PAGE_OUT_2 = 282;
export const PAGE_OPEN_2 = 288;
export const FLY_2 = 296;
export const CAUGHT_2 = 308;
/** Both results, side by side. */
export const VERDICT = 336;
