/**
 * The cabin. One module, imported by both the reel and
 * `scripts/measure-plane-boarding.mjs`, so the frames and the committed run
 * are the same code.
 *
 * 12 rows of six seats, one aisle, one door at the front: the size of the mock
 * 757 cabin Steffen and Hotchkiss boarded with 72 real passengers in 2012. Every passenger has
 * the same seat and the same bag in all three planes; only the order they are
 * called in differs:
 *
 *   back to front   three zones, rows 9 to 12 first, then 5 to 8, then 1 to 4,
 *                   in random order within each zone
 *   random          everyone at once, in random order
 *   window first    all window seats, then all middles, then all aisles, in
 *                   random order within each
 *
 * One tick is one second. A passenger walks one row a second and cannot pass
 * anyone in the aisle. At their row they stand in the aisle while they stow
 * their bag (three in four have one, 4 to 12 seconds; the rest take 1 second),
 * plus 5 seconds for every passenger already seated between them and their
 * seat, who has to get up and let them in. Then they sit and the aisle frees.
 *
 * The cabin is shorter than a real narrow-body, which runs to about 30 rows,
 * so the people are big enough to see. The script reruns the comparison at
 * 30 rows, with passengers taking two rows of aisle, and with five zones.
 */

export const ROWS = 12;
export const COLS = 6;
export const ZONES = 3;
export const BAG_SHARE = 0.75;
export const STOW_MIN = 4;
export const STOW_MAX = 12;
export const NO_BAG_S = 1;
export const SHUFFLE_S = 5;
export const SEED = 1;

export type MethodKey = "backToFront" | "random" | "windowFirst";
export const METHODS: readonly MethodKey[] = [
  "backToFront",
  "random",
  "windowFirst",
];

/** Seats 0 to 5 across, A to F; the aisle runs between 2 and 3. */
export const sideOf = (col: number) => (col < 3 ? 0 : 1);
/** 0 for an aisle seat, 1 middle, 2 window. */
export const depthOf = (col: number) => (col < 3 ? 2 - col : col - 3);

export type Passenger = {
  readonly id: number;
  /** 1 at the front. */
  readonly row: number;
  readonly col: number;
  readonly bag: boolean;
  readonly stow: number;
};

const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
};

const shuffle = <T>(xs: readonly T[], random: () => number): T[] => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
};

export type CabinOptions = {
  readonly rows?: number;
  readonly zones?: number;
  /** Aisle cells a passenger occupies, 1 or 2. */
  readonly spacing?: number;
  readonly seed?: number;
};

export const passengers = (rows: number, seed: number): Passenger[] => {
  const random = rng(seed * 7 + 1);
  const out: Passenger[] = [];
  for (let row = 1; row <= rows; row++) {
    for (let col = 0; col < COLS; col++) {
      const bag = random() < BAG_SHARE;
      out.push({
        id: out.length,
        row,
        col,
        bag,
        stow: bag
          ? STOW_MIN + Math.floor(random() * (STOW_MAX - STOW_MIN + 1))
          : NO_BAG_S,
      });
    }
  }
  return out;
};

export const callOrder = (
  method: MethodKey,
  people: readonly Passenger[],
  rows: number,
  zones: number,
  seed: number,
): Passenger[] => {
  const random = rng(seed * 13 + 5);
  if (method === "random") return shuffle(people, random);
  if (method === "windowFirst") {
    return [2, 1, 0].flatMap((d) =>
      shuffle(
        people.filter((p) => depthOf(p.col) === d),
        random,
      ),
    );
  }
  const per = Math.ceil(rows / zones);
  const out: Passenger[] = [];
  for (let z = zones - 1; z >= 0; z--) {
    out.push(
      ...shuffle(
        people.filter((p) => p.row > z * per && p.row <= (z + 1) * per),
        random,
      ),
    );
  }
  return out;
};

/** Where a passenger is on a tick. */
export const OUTSIDE = -1;
export const SEATED = -2;

export type Boarding = {
  readonly people: readonly Passenger[];
  readonly ticks: number;
  /** Aisle cell per tick per passenger, or OUTSIDE or SEATED. */
  readonly cell: Int16Array;
  /** 1 on a tick the passenger is standing at their row stowing or waiting to sit. */
  readonly stowing: Uint8Array;
  /** 1 on a tick the passenger is in the aisle short of their row and could not move. */
  readonly stuck: Uint8Array;
  readonly seatedAt: readonly number[];
  /** Seconds until the last passenger sat down. */
  readonly seconds: number;
};

export const board = (
  method: MethodKey,
  { rows = ROWS, zones = ZONES, spacing = 1, seed = SEED }: CabinOptions = {},
): Boarding => {
  const people = passengers(rows, seed);
  const queue = callOrder(method, people, rows, zones, seed);
  const n = people.length;
  const cells = rows * spacing + spacing + 1;
  const aisle: (Passenger | null)[] = new Array(cells).fill(null);
  const where = new Array<number>(n).fill(OUTSIDE);
  const wait = new Array<number>(n).fill(-1);
  const seatedAt = new Array<number>(n).fill(-1);
  const seated: Passenger[] = [];
  const frames: { cell: number[]; stowing: number[]; stuck: number[] }[] = [];
  let t = 0;
  let done = 0;
  while (done < n) {
    const stowing = new Array<number>(n).fill(0);
    const stuck = new Array<number>(n).fill(0);
    for (let c = cells - 1; c >= 0; c--) {
      const p = aisle[c];
      if (!p) continue;
      if (p.row * spacing === c) {
        if (wait[p.id] < 0) {
          const blockers = seated.filter(
            (q) =>
              q.row === p.row &&
              sideOf(q.col) === sideOf(p.col) &&
              depthOf(q.col) < depthOf(p.col),
          ).length;
          wait[p.id] = p.stow + blockers * SHUFFLE_S;
        }
        wait[p.id]--;
        stowing[p.id] = 1;
        if (wait[p.id] <= 0) {
          aisle[c] = null;
          seated.push(p);
          where[p.id] = SEATED;
          seatedAt[p.id] = t + 1;
          done++;
        }
      } else {
        let free = true;
        for (let k = 1; k <= spacing; k++) {
          if (c + k < cells && aisle[c + k]) free = false;
        }
        if (free) {
          aisle[c + 1] = p;
          aisle[c] = null;
          where[p.id] = c + 1;
        } else {
          stuck[p.id] = 1;
        }
      }
    }
    let doorFree = true;
    for (let k = 0; k <= spacing; k++) if (aisle[k]) doorFree = false;
    if (doorFree && queue.length) {
      const p = queue.shift() as Passenger;
      aisle[0] = p;
      where[p.id] = 0;
    }
    t++;
    frames.push({ cell: [...where], stowing, stuck });
    if (t > 20000) throw new Error("boarding.ts: the cabin never filled");
  }
  const cell = new Int16Array((t + 1) * n).fill(OUTSIDE);
  const stowingArr = new Uint8Array((t + 1) * n);
  const stuckArr = new Uint8Array((t + 1) * n);
  frames.forEach((f, k) => {
    for (let i = 0; i < n; i++) {
      cell[(k + 1) * n + i] = f.cell[i];
      stowingArr[k * n + i] = f.stowing[i];
      stuckArr[k * n + i] = f.stuck[i];
    }
  });
  return {
    people,
    ticks: t + 1,
    cell,
    stowing: stowingArr,
    stuck: stuckArr,
    seatedAt,
    seconds: t,
  };
};
