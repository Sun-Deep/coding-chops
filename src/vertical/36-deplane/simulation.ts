/**
 * Getting off a plane. One module, imported by both the reel and
 * `scripts/measure-deplane.mjs`, so the frames and the committed run are the
 * same code.
 *
 * ROWS rows of six seats, one aisle, one door at the front. The seatbelt sign
 * goes off at second 0 and the door opens DOOR seconds later. Every passenger
 * has the same seat and the same bag in both cabins; only when people stand
 * up differs:
 *
 *   stand   everyone stands up when the sign goes off. Whoever can get into
 *           the aisle does, and takes their bag down while the door is shut;
 *           the rest wait on their feet in their row, bent under the bins.
 *   sit     everyone stays seated until the whole row in front of them has
 *           stepped into the aisle, then stands up.
 *
 * One tick is one second. A passenger in the aisle walks one row a second and
 * cannot pass anyone. A row's passengers step into the aisle beside their
 * row when it is free, aisle seat first, before people from behind move into
 * it: the front rows go first, as people do. Stepping out of a row takes
 * longer from the window than from the aisle. A passenger on their feet gets
 * their bag down where they stand: in the aisle, or in the row once the seat
 * between them and the aisle is empty. Standing early buys two things:
 * being up already, and having the bag down sooner. It costs the time spent
 * on your feet.
 *
 * A processor waiting for something can spin, checking again and again, or
 * sleep until it is woken. Spinning gets it going a little sooner and burns
 * the whole wait doing nothing. That is busy waiting.
 */

export type Rule = "stand" | "sit";

export const ROWS = 12;
/** Seconds from the seatbelt sign going off to the door opening. */
export const DOOR = 90;
export const BAG_SHARE = 0.75;
export const BAG_MIN = 5;
export const BAG_MAX = 15;
/** Seconds to stand up from a seat. */
export const STAND_UP = 2;
/** Seconds to step from aisle, middle and window into the aisle, standing. */
export const STEP_OUT = [1, 2, 3] as const;
export const SEED = 1;

export type Options = {
  /**
   * When a seated row stands: once the whole row in front has stepped into
   * the aisle ("gone", the default), or once anyone from it has ("moving").
   */
  readonly wake?: "gone" | "moving";
  readonly rows?: number;
  readonly door?: number;
  readonly bagShare?: number;
  readonly bagMax?: number;
};

/** Seats 0 to 5 across, A to F; the aisle runs between 2 and 3. */
export const depthOf = (col: number) => (col < 3 ? 2 - col : col - 3);

export type Passenger = {
  readonly id: number;
  /** 0 at the front. */
  readonly row: number;
  readonly col: number;
  readonly bag: boolean;
  /** Seconds to get the bag down, 0 without one. */
  readonly bagTime: number;
};

/** Where one passenger is, second by second. */
export type Trace = {
  readonly id: number;
  /** Second they get to their feet. */
  readonly up: number;
  /** Second they step into the aisle, and the aisle cell at each second after. */
  readonly enter: number;
  readonly cells: readonly number[];
  /** Seconds after entering spent stepping out, then on the bag. */
  readonly stepping: number;
  readonly bagFrom: number;
  readonly bagTo: number;
  /** Second they leave by the door. */
  readonly off: number;
};

const rng = (seed: number) => {
  let s = seed >>> 0;
  const next = () =>
    (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 8; i++) next();
  return next;
};

/** The passengers of one flight, the same whichever rule the cabin uses. */
export const passengers = (
  seed: number = SEED,
  opts: Options = {},
): Passenger[] => {
  const rows = opts.rows ?? ROWS;
  const share = opts.bagShare ?? BAG_SHARE;
  const max = opts.bagMax ?? BAG_MAX;
  const bags = rng(seed * 7919 + 1);
  const times = rng(seed * 7919 + 2);
  const out: Passenger[] = [];
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < 6; col++) {
      const bag = bags() < share;
      const t = BAG_MIN + Math.round(times() * (max - BAG_MIN));
      out.push({ id: out.length, row, col, bag, bagTime: bag ? t : 0 });
    }
  return out;
};

type Live = {
  p: Passenger;
  up: number | null;
  enter: number | null;
  cell: number;
  /** Seconds left stepping out, then seconds left on the bag. */
  step: number;
  bag: number;
  bagFrom: number | null;
  bagTo: number | null;
  cells: number[];
  off: number | null;
};

export const run = (
  rule: Rule,
  seed: number = SEED,
  opts: Options = {},
): Trace[] => {
  const rows = opts.rows ?? ROWS;
  const door = opts.door ?? DOOR;
  const wake = opts.wake ?? "gone";
  const people: Live[] = passengers(seed, opts).map((p) => ({
    p,
    up: null,
    enter: null,
    cell: -1,
    step: 0,
    bag: p.bagTime,
    bagFrom: null,
    bagTo: null,
    cells: [],
    off: null,
  }));
  const byRow = Array.from({ length: rows }, (_, r) =>
    people
      .filter((x) => x.p.row === r)
      // Aisle seats first, then middles, then windows; left side first on a tie.
      .sort((a, b) => depthOf(a.p.col) - depthOf(b.p.col) || a.p.col - b.p.col),
  );
  const aisle: (Live | null)[] = new Array(rows).fill(null);
  if (rule === "stand") for (const x of people) x.up = 0;
  let left = people.length;
  for (let t = 0; left > 0 && t < 20000; t++) {
    // In the sit rule a row stands once everyone in the row in front has
    // stepped into the aisle (the front row once the door opens).
    if (rule === "sit")
      for (let r = 0; r < rows; r++) {
        const row = byRow[r];
        if (row.every((x) => x.up !== null)) continue;
        const front =
          r === 0
            ? t >= door
            : wake === "gone"
              ? byRow[r - 1].every((x) => x.enter !== null)
              : byRow[r - 1].some((x) => x.enter !== null);
        if (front) for (const x of row) if (x.up === null) x.up = t;
      }
    // Aisle, front to back: step out, get the bag, then walk once the door
    // is open. A cell emptied this second is kept for the row beside it.
    const freed = new Set<number>();
    for (let c = 0; c < rows; c++) {
      const x = aisle[c];
      if (!x) continue;
      if (x.step > 0) {
        x.step--;
        continue;
      }
      if (x.bag > 0) {
        if (x.bagFrom === null) x.bagFrom = t;
        x.bag--;
        if (x.bag === 0) x.bagTo = t + 1;
        continue;
      }
      if (t < door) continue;
      if (c === 0) {
        aisle[0] = null;
        freed.add(0);
        x.off = t;
        x.cell = -1;
        left--;
        continue;
      }
      if (!aisle[c - 1] && !freed.has(c - 1)) {
        aisle[c - 1] = x;
        aisle[c] = null;
        freed.add(c);
        x.cell = c - 1;
      }
    }
    // Standing in the row, a passenger gets their bag down once the seat
    // between them and the aisle on their side is empty to stand in.
    for (const row of byRow)
      for (const x of row) {
        if (x.enter !== null || x.up === null || x.bag === 0) continue;
        if (t < x.up + STAND_UP) continue;
        const d = depthOf(x.p.col);
        const side = x.p.col < 3 ? 0 : 1;
        const blocked = row.some(
          (o) =>
            o !== x &&
            o.enter === null &&
            (o.p.col < 3 ? 0 : 1) === side &&
            depthOf(o.p.col) < d,
        );
        if (blocked) continue;
        if (x.bagFrom === null) x.bagFrom = t;
        x.bag--;
        if (x.bag === 0) x.bagTo = t + 1;
      }
    // Into the aisle from the seats: the next person in a row that is up
    // steps out when the cell beside the row is empty.
    for (let r = 0; r < rows; r++) {
      if (aisle[r]) continue;
      const next = byRow[r].find((x) => x.enter === null);
      if (!next || next.up === null || t < next.up + STAND_UP) continue;
      aisle[r] = next;
      next.enter = t;
      next.cell = r;
      next.step = STEP_OUT[depthOf(next.p.col)];
    }
    for (const x of people) if (x.off === null) x.cells.push(x.cell);
  }
  return people.map((x) => ({
    id: x.p.id,
    up: x.up ?? 0,
    enter: x.enter ?? 0,
    cells: x.cells,
    stepping: STEP_OUT[depthOf(x.p.col)],
    bagFrom: x.bagFrom ?? -1,
    bagTo: x.bagTo ?? -1,
    off: x.off ?? 0,
  }));
};

/** Seconds on your feet, from standing up to leaving by the door. */
export const onFeet = (x: Trace) => x.off - x.up;

export const SEEDS = 100;

/**
 * Over SEEDS flights: when people get off and how long they stand, under
 * each rule, and of the same passengers, the share who get off sooner by
 * standing at once and how much sooner on average.
 */
export const averages = (opts: Options = {}) => {
  let n = 0;
  const off = { stand: 0, sit: 0 };
  const feet = { stand: 0, sit: 0 };
  const last = { stand: 0, sit: 0 };
  let sooner = 0;
  let gain = 0;
  for (let seed = 1; seed <= SEEDS; seed++) {
    const a = run("stand", seed, opts);
    const b = run("sit", seed, opts);
    last.stand += Math.max(...a.map((x) => x.off));
    last.sit += Math.max(...b.map((x) => x.off));
    a.forEach((x, i) => {
      const y = b[i];
      n++;
      off.stand += x.off;
      off.sit += y.off;
      feet.stand += onFeet(x);
      feet.sit += onFeet(y);
      gain += y.off - x.off;
      if (x.off < y.off) sooner++;
    });
  }
  return {
    passengers: n,
    off: { stand: off.stand / n, sit: off.sit / n },
    feet: { stand: feet.stand / n, sit: feet.sit / n },
    last: { stand: last.stand / SEEDS, sit: last.sit / SEEDS },
    sooner: sooner / n,
    gain: gain / n,
  };
};

/**
 * The passenger the reel follows: in seed 1, the row whose time saved by
 * standing at once is closest to the average over all flights, and in it the
 * left aisle seat, which the camera can see. Everyone in a row saves about
 * the same, so the seat does not change the figure.
 */
export const hero = (
  stand: readonly Trace[],
  sit: readonly Trace[],
  gain: number,
  rows: number = ROWS,
) => {
  let best = 0;
  let bestDiff = Infinity;
  for (let r = 0; r < rows; r++) {
    let sum = 0;
    for (let c = 0; c < 6; c++) {
      const i = r * 6 + c;
      sum += sit[i].off - stand[i].off;
    }
    const diff = Math.abs(sum / 6 - gain);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = r;
    }
  }
  return best * 6 + 2;
};
