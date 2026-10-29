/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;
export const FPS = 30;

/**
 * The view count on the video's page. Every frame below is shared with
 * the dancer in `scripts/blender/gangnam/dancer.py` through `export.mjs`.
 */

/** The count climbs to 2,147,483,647, slowing as it arrives. */
export const COUNT_TO = 128;
/** When the narration moves on to the ceiling. */
export const CEILING_LINE = 64;
/** One more view: the carry runs left a bit every RIPPLE_STEP frames. */
export const PLUS_ONE = 150;
export const RIPPLE_STEP = 2;
/** The carry reaches bit 31, the sign: the count reads -2,147,483,648. */
export const SIGN_AT = PLUS_ONE + 31 * RIPPLE_STEP;
/** 64 bits: a second row of bits appears; bit 31 is a number again. */
export const LONG_FROM = 290;
/** The 64-bit counter runs on to 6 billion. */
export const RACE_FROM = 352;
export const RACE_TO = 398;
