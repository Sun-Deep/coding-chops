/**
 * The geometry of the channel mark: two angular C forms, offset on the house
 * slope so the first sits in the second's approach.
 *
 * Every dimension is a whole number tied to the stroke:
 *
 *   stroke        12        C height      48   (4 strokes)
 *   gap            6        (half a stroke, the only clearance in the mark)
 *   offset     35 / 14      (5 across, 2 down: the house slope)
 *
 * The two forms never touch. That is deliberate: with no overlapping ink the
 * mark is one flat path with two subpaths, so it needs no mask, no knockout
 * and no boolean pass before an embroidery digitiser or a one colour stamp can
 * read it. An earlier interlocked version left a floating fragment inside the
 * second counter, which is invisible below about 32 pixels and reads as dirt
 * above it, so the mark changed as it scaled.
 */
export const STROKE = 12;
export const C_HEIGHT = 4 * STROKE;
export const GAP = STROKE / 2;

/** Run and rise of the offset between the two C forms. */
export const SLOPE: readonly [number, number] = [5, 2];
export const OFFSET: readonly [number, number] = [35, 14];

/** Trimmed to the ink. Wider than tall, at 83 by 62. */
export const VIEW_BOX = "8 19 83 62";
export const WIDTH = 83;
export const HEIGHT = 62;

export const MARK_PATH =
  "M8 19 H37 V31 H20 V55 H37 V67 H8 Z " +
  "M43 33 H91 V45 H55 V69 H91 V81 H43 Z";

/**
 * Clear space on every side. One stroke, so the mark's own clearance and its
 * breathing room are the same measure.
 */
export const CLEAR_SPACE = STROKE / HEIGHT;

/**
 * Mark height over wordmark cap height, set beside the type.
 *
 * Not one to one. Both forms are flat topped, so no optical overshoot is
 * needed for alignment, but alignment is not the question mass is. Two C
 * forms with open counters and a gap between them carry roughly half the ink
 * of twelve characters of Inter 800, so matched cap heights leave the mark
 * reading as a stray glyph rather than a logo.
 */
export const CAP_RATIO = 1.6;

/** Above the type rather than beside it, the mark has to carry more still. */
export const STACKED_CAP_RATIO = 2.6;

/**
 * Cap height of the wordmark face as a fraction of its font size.
 *
 * Archivo, measured rather than assumed, because every lockup proportion is
 * derived from cap height and a wrong figure here throws all of them.
 */
export const WORDMARK_CAP = 0.73;

/** Gap between mark and wordmark, as a fraction of mark height. */
export const LOCKUP_GAP = 0.34;
export const STACKED_GAP = 0.5;
