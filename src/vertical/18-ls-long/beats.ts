/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * The seven columns leave the line one at a time and land in the key.
 *
 * The first leaves before frame zero, so the opening frame has a token already
 * in the air rather than a finished table, which is the moment a scroll is
 * decided.
 */
export const FLY_FIRST = -20;
export const FLY_EVERY = 12;
export const FLY = 16;

export const flyStart = (i: number) => FLY_FIRST + i * FLY_EVERY;
export const landedAt = (i: number) => flyStart(i) + FLY;

/** chmod's digits, lifted out of the mode into the band. */
export const TRIPLETS_FROM = 70;
export const DIGITS_FROM = 88;
export const DIGIT_EVERY = 8;

/**
 * Each digit handed to whoever it belongs to: owner, group, everyone else.
 *
 * The first render had nothing happening between the digits landing and line
 * three, a 0.77 second held frame and 1.2 seconds of silence. The missing event
 * was the one the owner and group rows already promise in their notes.
 */
export const HAND_FROM = 114;
export const HAND_EVERY = 12;
/** Which digit is being handed over, 0 to 2, or -1. */
export const handedDigit = (frame: number) => {
  const k = Math.floor((frame - HAND_FROM) / HAND_EVERY);
  return k >= 0 && k < 3 ? k : -1;
};

/** Links to name, pointed at one after another while line three names them. */
export const POINT_FROM = 148;
export const POINT_EVERY = 10;
/** Rows 1 to 6: everything after the mode. */
export const pointedRow = (frame: number) => {
  const k = Math.floor((frame - POINT_FROM) / POINT_EVERY);
  return k >= 0 && k < 6 ? k + 1 : -1;
};

/** The file becomes the folder. */
export const SWAP_FROM = 206;
export const SWAP = 18;

/** 363 folders counted into the band, one square each. */
export const COUNT_FROM = 234;
export const COUNT_TO = 284;

/** The proof: the folder's contents listed, then the two numbers. */
export const PROOF_FROM = 294;
export const TYPE_FROM = 298;
export const TYPE_EVERY = 1.2;
export const OUTPUT_AT = 316;
export const NUMBERS_FROM = 324;
/** The inside size counts up from nothing to its measured value. */
export const CLIMB_TO = 370;
/** The size row's note changes to say what the number is. */
export const NOTE_AT = 378;
