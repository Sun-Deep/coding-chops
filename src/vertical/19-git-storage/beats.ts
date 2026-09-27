/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * The first copy is already in flight at frame zero, so the opening frame has
 * the file, the store and something crossing between them.
 */
export const COPY1_FROM = -14;
export const COPY = 22;
export const COPY1_LANDS = COPY1_FROM + COPY;

/** Line 80 is edited, one character a frame, then the diff says one line. */
export const EDIT_FROM = 34;
export const EDIT_EVERY = 1;
export const DIFF_CMD = 72;
export const DIFF_AT = 86;

/** The second commit: typed, then a whole second copy crosses. */
export const COMMIT2_CMD = 106;
export const COPY2_FROM = 136;
export const COPY2_LANDS = COPY2_FROM + COPY;

/**
 * A sweep down both copies, counting the lines they share.
 *
 * Without it the two blocks sat still for two seconds after the second one
 * landed, and "the whole file again" was a claim rather than something the
 * frame shows: 159 of the 160 lines are identical, stored twice.
 */
export const SAME_FROM = 176;
export const SAME_TO = 236;
export const sweptAt = (frame: number, lines: number) =>
  Math.max(
    0,
    Math.min(
      lines,
      Math.floor(((frame - SAME_FROM) / (SAME_TO - SAME_FROM)) * lines),
    ),
  );

/** `git gc`: typed, then the old copy is crushed to a delta. */
export const GC_CMD = 240;
export const CRUSH_FROM = 254;
export const CRUSH = 30;

/** The pack listing, one line at a time. */
export const PACK_CMD = 286;
export const PACK_LINES_FROM = 300;
export const PACK_LINE_EVERY = 12;

/**
 * What the 68 bytes are: v2, with the old line 80 put back.
 *
 * The last three seconds held a finished frame in the first plan. This is the
 * event that belongs there, and it answers the question the number raises.
 */
export const REBUILD_FROM = 318;
export const REBUILD_TYPE = 36;

/** A counter climbs to its figure over this many frames once its object lands. */
export const COUNT = 16;

/** Command typing speed, frames per character. */
export const TYPE_EVERY = 0.9;
