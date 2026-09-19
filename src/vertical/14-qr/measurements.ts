/**
 * From `scripts/measure-qr.mjs`.
 *
 * Two kinds of figure here and they are not the same kind of claim.
 *
 * The structure is exact and comes out of the encoder. How many modules a
 * symbol has, how many of them are the patterns a scanner needs in order to
 * find and read it, and how the rest divide into your data and its error
 * correction are all properties of the QR specification at a given version and
 * level.
 *
 * The hole is measured, by decoding. A square of modules is blanked in the
 * middle of a real symbol and a real decoder is asked to read it, and the
 * square grows until the decoder fails. The encoder and the decoder are
 * different implementations on purpose: `qrcode` writes the symbol and `jsqr`
 * reads it back, because a round trip through one library would prove much
 * less.
 *
 * One thing this cut exists to not say. It is widely repeated that you can
 * destroy 30 per cent of a QR code and it still scans, and the first draft of
 * this reel was going to say it. That number is the share of *codewords*
 * Reed-Solomon can reconstruct, not a licence to black out a third of the
 * picture. Measured, random damage fails at a few per cent, because it hits the
 * corners a scanner needs to locate the symbol at all.
 */

/** What the symbol holds. Short, which is what almost every real QR code holds. */
export const TEXT = "https://codingchops.dev";

/** The decoder the hole figures came from, named on screen. */
export const DECODER = "jsqr";

export type Level = {
  readonly level: "L" | "M" | "Q" | "H";
  readonly version: number;
  readonly size: number;
  /** Total codewords, and how they split. */
  readonly codewords: number;
  readonly data: number;
  readonly ec: number;
  /** Share of codewords that are error correction. */
  readonly backup: number;
  /** The largest centred blank square the decoder still read through. */
  readonly hole: number;
  /** That square as a share of the whole symbol. */
  readonly holeShare: number;
};

/**
 * The four error correction levels, measured.
 *
 * The correlation is the argument: every step up buys more backup, and every
 * step up survives a bigger hole. At Q the symbol itself has to grow from 25 to
 * 29 modules to carry the extra redundancy, which is the cost nobody mentions.
 */
export const LEVELS: readonly Level[] = [
  {
    level: "L",
    version: 2,
    size: 25,
    codewords: 44,
    data: 34,
    ec: 10,
    backup: 23,
    hole: 4,
    holeShare: 2.6,
  },
  {
    level: "M",
    version: 2,
    size: 25,
    codewords: 44,
    data: 28,
    ec: 16,
    backup: 36,
    hole: 7,
    holeShare: 7.8,
  },
  {
    level: "Q",
    version: 3,
    size: 29,
    codewords: 70,
    data: 34,
    ec: 36,
    backup: 51,
    hole: 10,
    holeShare: 11.9,
  },
  {
    level: "H",
    version: 3,
    size: 29,
    codewords: 70,
    data: 26,
    ec: 44,
    backup: 63,
    hole: 11,
    holeShare: 14.4,
  },
];

/** The one the reel draws: the most protected, and the biggest hole. */
export const HERO = LEVELS[3];

/** 29 x 29. */
export const SIZE = 29;
export const MODULES_TOTAL = SIZE * SIZE;

/**
 * The modules a scanner needs before it can read anything: the three corner
 * finders and their separators, the timing lines, the alignment square and the
 * format strips. Everything else carries codewords.
 */
export const STRUCTURE = 274;

/** 70 codewords x 8 bits, plus 7 bits the symbol has no room to use. */
export const CODEWORD_MODULES = 560;
export const REMAINDER_BITS = 7;

/**
 * The catch, run rather than described.
 *
 * Blanking one finder square is 49 modules, less than half the 121 the middle
 * survives, and it kills the scan outright. Where the damage falls matters more
 * than how much of it there is. It is in the caption rather than the reel,
 * because this cut has one idea.
 */
export const FINDER_CATCH = {
  modules: 49,
  share: 5.8,
  scans: false,
} as const;

/** Median share of randomly blacked-out modules survived, over 12 patterns each. */
export const RANDOM_SURVIVED = {
  L: 2.6,
  M: 2.4,
  Q: 4.8,
  H: 4.2,
} as const;

/** The hero symbol, row by row. 1 is a dark module. */
export const GRID: readonly string[] = [
  "11111110010001011011101111111",
  "10000010110100000001101000001",
  "10111010011010000101101011101",
  "10111010000001110010001011101",
  "10111010001001011110001011101",
  "10000010100000110101001000001",
  "11111110101010101010101111111",
  "00000000111111100001100000000",
  "00001111000111001000001100010",
  "10001000111100001010011110111",
  "10110010010011101010110101101",
  "00001100001011011110110101011",
  "11110010100110010101100101001",
  "01110000001111011100001010101",
  "11001010101101100000111010001",
  "11010101111100010011000101010",
  "11001111110000000111100100011",
  "10001101111100000110001111101",
  "00010111010110011000000011101",
  "00101001101011100100100011000",
  "11111010001100110111111111010",
  "00000000110010110001100010101",
  "11111110100110100001101010001",
  "10000010101001001101100011001",
  "10111010111000100101111110001",
  "10111010010011001000000101010",
  "10111010010000001011110000011",
  "10000010011000100000100101011",
  "11111110001101100010101011010",
];

/** Which of those modules are structure rather than payload. */
export const RESERVED: readonly string[] = [
  "11111111100000000000011111111",
  "11111111100000000000011111111",
  "11111111100000000000011111111",
  "11111111100000000000011111111",
  "11111111100000000000011111111",
  "11111111100000000000011111111",
  "11111111111111111111111111111",
  "11111111100000000000011111111",
  "11111111100000000000011111111",
  "00000010000000000000000000000",
  "00000010000000000000000000000",
  "00000010000000000000000000000",
  "00000010000000000000000000000",
  "00000010000000000000000000000",
  "00000010000000000000000000000",
  "00000010000000000000000000000",
  "00000010000000000000000000000",
  "00000010000000000000000000000",
  "00000010000000000000000000000",
  "00000010000000000000000000000",
  "00000010000000000000111110000",
  "11111111100000000000111110000",
  "11111111100000000000111110000",
  "11111111100000000000111110000",
  "11111111100000000000111110000",
  "11111111100000000000000000000",
  "11111111100000000000000000000",
  "11111111100000000000000000000",
  "11111111100000000000000000000",
];
