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
export const TEXT = "https://github.com/Sun-Deep/coding-chops";

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
    version: 3,
    size: 29,
    codewords: 70,
    data: 55,
    ec: 15,
    backup: 21,
    hole: 6,
    holeShare: 4.3,
  },
  {
    level: "M",
    version: 3,
    size: 29,
    codewords: 70,
    data: 44,
    ec: 26,
    backup: 37,
    hole: 8,
    holeShare: 7.6,
  },
  {
    level: "Q",
    version: 4,
    size: 33,
    codewords: 100,
    data: 48,
    ec: 52,
    backup: 52,
    hole: 11,
    holeShare: 11.1,
  },
  {
    level: "H",
    version: 5,
    size: 37,
    codewords: 134,
    data: 46,
    ec: 88,
    backup: 66,
    hole: 16,
    holeShare: 18.7,
  },
];

/** The one the reel draws: the most protected, and the biggest hole. */
export const HERO = LEVELS[3];

/** 37 x 37. */
export const SIZE = 37;
export const MODULES_TOTAL = SIZE * SIZE;

/**
 * The modules a scanner needs before it can read anything: the three corner
 * finders and their separators, the timing lines, the alignment square and the
 * format strips. Everything else carries codewords.
 */
export const STRUCTURE = 290;

/** 70 codewords x 8 bits, plus 7 bits the symbol has no room to use. */
export const CODEWORD_MODULES = 1_072;
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
  share: 3.6,
  scans: false,
} as const;

/** Median share of randomly blacked-out modules survived, over 12 patterns each. */
export const RANDOM_SURVIVED = {
  L: 2.5,
  M: 4.0,
  Q: 4.4,
  H: 5.1,
} as const;

/** The hero symbol, row by row. 1 is a dark module. */
export const GRID: readonly string[] = [
  "1111111011101011100010101011101111111",
  "1000001011001010101000111101001000001",
  "1011101001111000100001000010001011101",
  "1011101010011101000001111010001011101",
  "1011101010001100101111111011001011101",
  "1000001010100011110111011001101000001",
  "1111111010101010101010101010101111111",
  "0000000001100001010010110100000000000",
  "0001001001110001000101100011100111011",
  "1011100000001011100111100001011000011",
  "0110001010111100001110100000101111101",
  "1011010001111101000000110100000101001",
  "0001111001111000011011010100111000010",
  "1010100010101100111001001100001101011",
  "0100101111001100001111101110000100101",
  "1100110011110100000100100110111000010",
  "1010101000011111110110110101011101111",
  "0010110001001001001001100000101111101",
  "1101101111000110001000111100011000111",
  "1101000010100100100010011010000000110",
  "0000111110001000001100101111101111010",
  "0011110101110101000000100100001000111",
  "0110001010110101010011000110010111011",
  "1101100000111110011101111100011010001",
  "0110111101101101000010000011011000110",
  "0010100110000010000100010010001100011",
  "1001011000100011010001110110111111101",
  "0111100000111001000111110111001100000",
  "1110001111011001011010001000111110111",
  "0000000011010010001001011111100010011",
  "1111111000001001000010100111101010111",
  "1000001000110000000100110011100010100",
  "1011101001011001110101101110111111010",
  "1011101010100111001101111111010110011",
  "1011101001101010011000111100010011001",
  "1000001001100001010000111111100110000",
  "1111111000000001111011011101110110011",
];

/** Which of those modules are structure rather than payload. */
export const RESERVED: readonly string[] = [
  "1111111110000000000000000000011111111",
  "1111111110000000000000000000011111111",
  "1111111110000000000000000000011111111",
  "1111111110000000000000000000011111111",
  "1111111110000000000000000000011111111",
  "1111111110000000000000000000011111111",
  "1111111111111111111111111111111111111",
  "1111111110000000000000000000011111111",
  "1111111110000000000000000000011111111",
  "0000001000000000000000000000000000000",
  "0000001000000000000000000000000000000",
  "0000001000000000000000000000000000000",
  "0000001000000000000000000000000000000",
  "0000001000000000000000000000000000000",
  "0000001000000000000000000000000000000",
  "0000001000000000000000000000000000000",
  "0000001000000000000000000000000000000",
  "0000001000000000000000000000000000000",
  "0000001000000000000000000000000000000",
  "0000001000000000000000000000000000000",
  "0000001000000000000000000000000000000",
  "0000001000000000000000000000000000000",
  "0000001000000000000000000000000000000",
  "0000001000000000000000000000000000000",
  "0000001000000000000000000000000000000",
  "0000001000000000000000000000000000000",
  "0000001000000000000000000000000000000",
  "0000001000000000000000000000000000000",
  "0000001000000000000000000000111110000",
  "1111111110000000000000000000111110000",
  "1111111110000000000000000000111110000",
  "1111111110000000000000000000111110000",
  "1111111110000000000000000000111110000",
  "1111111110000000000000000000000000000",
  "1111111110000000000000000000000000000",
  "1111111110000000000000000000000000000",
  "1111111110000000000000000000000000000",
];
