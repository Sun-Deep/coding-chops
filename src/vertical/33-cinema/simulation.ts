/**
 * A cinema with no assigned seats. One module, imported by both the reel and
 * `scripts/measure-cinema.mjs`, so the frames and the committed run are the
 * same code.
 *
 * ROWS rows of SEATS seats. Groups of one to four arrive one after another,
 * seeded, and each wants to sit together in one row. Two ways to choose:
 *
 *   spread  keep an empty seat between you and strangers if you can; among
 *           the places that allow it, take the one nearest the middle of the
 *           room. If none is left, sit anywhere you fit together.
 *   pack    sit right beside whoever is already there, or against the end of
 *           a row; among those, the place nearest the middle of the room.
 *
 * Either way, a group that finds no run of free seats long enough in any row
 * splits up and takes whatever singles are left. Free space cut into pieces
 * too small to use is what a computer's memory allocator calls
 * fragmentation, and packing is how allocators avoid it.
 *
 * Seeded, so every run is the same.
 */

export type Rule = "spread" | "pack";

export const ROWS = 6;
export const SEATS = 10;
/** Share of groups of each size, 1 to 4. */
export const MIX = [0.2, 0.45, 0.15, 0.2] as const;
export const SEED = 1;

export type Options = {
  readonly mix?: readonly number[];
  readonly rows?: number;
  readonly seats?: number;
  /** Spread rule: share of groups who bother to keep a gap. */
  readonly keepGap?: number;
};

export type Seat = { readonly row: number; readonly seat: number };

export type Group = {
  readonly id: number;
  readonly size: number;
  /** Seats taken, in the order the group sits. */
  readonly seats: readonly Seat[];
  /** True if the group could not sit together. */
  readonly split: boolean;
  /** Free seats, and the longest free run in any row, as the group arrives. */
  readonly freeBefore: number;
  readonly longestBefore: number;
};

const rng = (seed: number) => {
  let s = seed >>> 0;
  const next = () =>
    (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 8; i++) next();
  return next;
};

/** Group sizes in arrival order; their own generator, so rules share them. */
export const arrivals = (seed: number, count: number, mix = MIX) => {
  const random = rng(seed * 7919 + 1);
  return Array.from({ length: count }, () => {
    let u = random();
    for (let k = 0; k < mix.length; k++) {
      if (u < mix[k]) return k + 1;
      u -= mix[k];
    }
    return mix.length;
  });
};

/** The longest run of free seats in each row. */
const runs = (taken: boolean[][]) =>
  taken.map((row) => {
    let best = 0;
    let cur = 0;
    for (const t of row) {
      cur = t ? 0 : cur + 1;
      best = Math.max(best, cur);
    }
    return best;
  });

export const fill = (
  rule: Rule,
  sizes: readonly number[],
  opts: Options = {},
  seed: number = SEED,
): Group[] => {
  const rows = opts.rows ?? ROWS;
  const seats = opts.seats ?? SEATS;
  const keepGap = opts.keepGap ?? 1;
  const careful = rng(seed * 7919 + 2);
  const taken = Array.from({ length: rows }, () =>
    new Array<boolean>(seats).fill(false),
  );
  const free = (r: number, s: number) => s >= 0 && s < seats && !taken[r][s];
  // How far a place is from the middle of the room: middle rows, middle seats.
  const midRow = (rows - 1) * 0.55;
  const centre = (r: number, s0: number, n: number) =>
    Math.abs(r - midRow) * 1.6 + Math.abs(s0 + (n - 1) / 2 - (seats - 1) / 2);

  return sizes.map((size, id) => {
    const freeBefore = taken.flat().filter((t) => !t).length;
    const longestBefore = Math.max(0, ...runs(taken));
    const gapper = rule === "spread" && careful() < keepGap;
    type Place = { r: number; s0: number; score: number };
    const places: Place[] = [];
    for (let r = 0; r < rows; r++)
      for (let s0 = 0; s0 + size <= seats; s0++) {
        let ok = true;
        for (let k = 0; k < size; k++) if (!free(r, s0 + k)) ok = false;
        if (!ok) continue;
        const left = s0 - 1;
        const right = s0 + size;
        // A neighbour is a stranger in the next seat; a wall is the row end.
        const strangers =
          Number(left >= 0 && !free(r, left)) +
          Number(right < seats && !free(r, right));
        const walls = Number(left < 0) + Number(right >= seats);
        let score: number;
        if (rule === "pack")
          score = -(strangers + walls) * 100 + centre(r, s0, size);
        else score = (gapper ? strangers * 100 : 0) + centre(r, s0, size);
        places.push({ r, s0, score });
      }
    if (places.length) {
      places.sort((a, b) => a.score - b.score);
      const p = places[0];
      const mine: Seat[] = [];
      for (let k = 0; k < size; k++) {
        taken[p.r][p.s0 + k] = true;
        mine.push({ row: p.r, seat: p.s0 + k });
      }
      return { id, size, seats: mine, split: false, freeBefore, longestBefore };
    }
    // No run long enough anywhere: take singles, nearest the middle first.
    const singles: Seat[] = [];
    for (let r = 0; r < rows; r++)
      for (let s = 0; s < seats; s++)
        if (!taken[r][s]) singles.push({ row: r, seat: s });
    singles.sort((a, b) => centre(a.row, a.seat, 1) - centre(b.row, b.seat, 1));
    const mine = singles.slice(0, size);
    for (const m of mine) taken[m.row][m.seat] = true;
    return { id, size, seats: mine, split: true, freeBefore, longestBefore };
  });
};

/** People sitting right beside someone from another group. */
export const elbows = (groups: readonly Group[]) => {
  const owner = new Map<string, number>();
  for (const g of groups)
    for (const s of g.seats) owner.set(`${s.row},${s.seat}`, g.id);
  let n = 0;
  for (const g of groups)
    for (const s of g.seats) {
      const l = owner.get(`${s.row},${s.seat - 1}`);
      const r = owner.get(`${s.row},${s.seat + 1}`);
      if ((l !== undefined && l !== g.id) || (r !== undefined && r !== g.id))
        n++;
    }
  return n;
};

/** Groups arriving in a seed, enough to fill the room and then some. */
export const ARRIVING = 80;

/**
 * The group the reel follows: in the room where people spread out, the
 * first group of four that cannot sit together.
 */
export const hero = (seed: number = SEED) => {
  const sizes = arrivals(seed, ARRIVING);
  const spread = fill("spread", sizes, {}, seed);
  return spread.findIndex((g) => g.size === 4 && g.split);
};

/**
 * Both rooms from the first group to a full house: every group that arrives
 * until the next one would not fit in the seats left.
 */
export const rooms = (seed: number = SEED) => {
  const sizes = arrivals(seed, ARRIVING);
  let total = 0;
  let full = 0;
  while (full < sizes.length && total + sizes[full] <= ROWS * SEATS)
    total += sizes[full++];
  const you = hero(seed);
  return {
    you,
    spread: fill("spread", sizes.slice(0, full), {}, seed),
    pack: fill("pack", sizes.slice(0, full), {}, seed),
  };
};
