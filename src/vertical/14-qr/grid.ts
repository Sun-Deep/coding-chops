import {
  CODEWORD_MODULES,
  GRID,
  HERO,
  LEVELS,
  MODULES_TOTAL,
  REMAINDER_BITS,
  RESERVED,
  SIZE,
  STRUCTURE,
} from "./measurements";

/**
 * The symbol, re-derived from the grids and checked against the figures.
 *
 * Double entry, the rule from section 2 of the playbook, with one honest limit:
 * this cannot re-run the decoder, because that would mean shipping a QR decoder
 * into the render. What it can do is prove that the grids the reel draws are
 * the symbol the script measured, that the structure map and the module map
 * describe the same 29 by 29 symbol, and that every count printed on screen is
 * derived from those grids rather than typed in beside them.
 *
 * So the hole sizes are asserted to be geometrically possible and the module
 * counts are asserted exactly. If a grid is edited by hand, this fails at
 * module load instead of drawing a symbol that no longer matches its numbers.
 */

const agree = (label: string, here: number, script: number) => {
  if (here !== script) {
    throw new Error(
      `VR14 ${label}: the port says ${here}, the measurement says ${script}`,
    );
  }
};

agree("grid rows", GRID.length, SIZE);
agree("reserved rows", RESERVED.length, SIZE);

GRID.forEach((row, y) => {
  agree(`grid row ${y} width`, row.length, SIZE);
  agree(`reserved row ${y} width`, RESERVED[y].length, SIZE);
});

/** True where the module is dark. */
export const dark = (x: number, y: number) => GRID[y][x] === "1";

/** True where the module is a finder, timing, alignment or format module. */
export const structural = (x: number, y: number) => RESERVED[y][x] === "1";

const countStructure = RESERVED.reduce(
  (sum, row) => sum + [...row].filter((c) => c === "1").length,
  0,
);

agree("structure modules", countStructure, STRUCTURE);
agree("total modules", SIZE * SIZE, MODULES_TOTAL);
agree(
  "modules carrying codewords",
  MODULES_TOTAL - STRUCTURE - REMAINDER_BITS,
  CODEWORD_MODULES,
);
agree("codewords split", HERO.data + HERO.ec, HERO.codewords);

// Every level's hole has to fit inside its own symbol, and the ladder only
// means anything if more backup really does buy a bigger hole.
LEVELS.forEach((level, i) => {
  if (level.hole > level.size) {
    throw new Error(
      `VR14 ${level.level}: a ${level.hole} module hole does not fit in ${level.size}`,
    );
  }
  agree(`${level.level} codewords`, level.data + level.ec, level.codewords);
  if (i > 0) {
    const before = LEVELS[i - 1];
    if (level.backup <= before.backup || level.hole < before.hole) {
      throw new Error(
        `VR14 ${level.level}: the ladder does not rise from ${before.level}`,
      );
    }
  }
});

/** The blanked square, as module coordinates, for a given side length. */
export const holeRect = (side: number) => {
  const from = Math.floor((SIZE - side) / 2);
  return { from, to: from + side };
};

/** True where a module is inside a centred hole of `side` modules. */
export const inHole = (x: number, y: number, side: number) => {
  if (side <= 0) return false;
  const { from, to } = holeRect(side);
  return x >= from && x < to && y >= from && y < to;
};

/** The three corners a scanner needs before it can read anything. */
export const FINDERS: readonly { readonly x: number; readonly y: number }[] = [
  { x: 0, y: 0 },
  { x: SIZE - 7, y: 0 },
  { x: 0, y: SIZE - 7 },
];

export const FINDER_SIZE = 7;
