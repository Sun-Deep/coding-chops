/**
 * The two sorts, instrumented.
 *
 * Both algorithms run once at module load and record a trace. Nothing in a
 * shot recomputes a sort, and nothing in a shot invents a count: the numbers on
 * screen are read out of these traces, so correcting the instrumentation
 * corrects the frame.
 *
 * A trace is not a snapshot per comparison. Two hundred bars times twenty
 * thousand comparisons is four million numbers to hold a picture that changes
 * on a couple of hundred of them. It records the comparisons and the swaps, and
 * `stateAt` replays the swaps up to a comparison index. Selection makes 192
 * swaps and quicksort about 600, so a replay is cheap enough to do per frame.
 */

/** Deterministic shuffle. The seed is pinned in `measurements.ts`. */
const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
};

export const shuffled = (n: number, seed: number) => {
  const a = [...Array(n)].map((_, i) => i + 1);
  const r = rng(seed);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export type Trace = {
  /** The array as it started. */
  start: readonly number[];
  /** Total comparisons the run took. */
  comparisons: number;
  /** Total index writes, two per swap. */
  writes: number;
  /** Swap k happens after `at[k]` comparisons. */
  swaps: readonly { at: number; i: number; j: number }[];
  /** The two indices under comparison, at each comparison index. */
  probeA: Int16Array;
  probeB: Int16Array;
  /**
   * The stretch of the array the algorithm is working inside, per comparison.
   *
   * Selection sort's is everything it has not settled yet, which is why it
   * barely shrinks. Quicksort's is the partition under the recursion, which is
   * the whole mechanism: the range halves, then halves again, and the cut needs
   * to draw it to show why one is cheap.
   */
  rangeLo: Int16Array;
  rangeHi: Int16Array;
  /**
   * The comparison index at which each position becomes final.
   *
   * Selection settles a position at the end of its pass. Quicksort settles a
   * pivot when it is placed, and a range when the recursion bottoms out on it.
   * One mechanism for both, so a bar lights up under the same rule either way.
   */
  settledAt: Int32Array;
};

export const selectionSort = (input: readonly number[]): Trace => {
  const a = [...input];
  const n = a.length;
  const swaps: { at: number; i: number; j: number }[] = [];
  const probeA: number[] = [];
  const probeB: number[] = [];
  const settledAt = new Int32Array(n).fill(Number.MAX_SAFE_INTEGER);
  let c = 0;
  let writes = 0;

  const rangeLo: number[] = [];
  const rangeHi: number[] = [];

  for (let i = 0; i < n; i++) {
    let m = i;
    for (let j = i + 1; j < n; j++) {
      probeA.push(m);
      probeB.push(j);
      rangeLo.push(i);
      rangeHi.push(n - 1);
      c++;
      if (a[j] < a[m]) m = j;
    }
    if (m !== i) {
      swaps.push({ at: c, i, j: m });
      [a[i], a[m]] = [a[m], a[i]];
      writes += 2;
    }
    settledAt[i] = c;
  }

  return {
    start: input,
    comparisons: c,
    writes,
    swaps,
    probeA: Int16Array.from(probeA),
    probeB: Int16Array.from(probeB),
    rangeLo: Int16Array.from(rangeLo),
    rangeHi: Int16Array.from(rangeHi),
    settledAt,
  };
};

export const quickSort = (input: readonly number[]): Trace => {
  const a = [...input];
  const n = a.length;
  const swaps: { at: number; i: number; j: number }[] = [];
  const probeA: number[] = [];
  const probeB: number[] = [];
  const settledAt = new Int32Array(n).fill(Number.MAX_SAFE_INTEGER);
  let c = 0;
  let writes = 0;

  const rangeLo: number[] = [];
  const rangeHi: number[] = [];

  const partition = (lo: number, hi: number) => {
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      probeA.push(hi); // the pivot
      probeB.push(j);
      rangeLo.push(lo);
      rangeHi.push(hi);
      c++;
      if (a[j] <= a[hi]) {
        i++;
        if (i !== j) {
          swaps.push({ at: c, i, j });
          [a[i], a[j]] = [a[j], a[i]];
          writes += 2;
        }
      }
    }
    if (i + 1 !== hi) {
      swaps.push({ at: c, i: i + 1, j: hi });
      [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
      writes += 2;
    }
    return i + 1;
  };

  const go = (lo: number, hi: number) => {
    if (lo > hi) return;
    if (lo === hi) {
      settledAt[lo] = Math.min(settledAt[lo], c);
      return;
    }
    const p = partition(lo, hi);
    settledAt[p] = c;
    go(lo, p - 1);
    go(p + 1, hi);
  };

  go(0, n - 1);

  return {
    start: input,
    comparisons: c,
    writes,
    swaps,
    probeA: Int16Array.from(probeA),
    probeB: Int16Array.from(probeB),
    rangeLo: Int16Array.from(rangeLo),
    rangeHi: Int16Array.from(rangeHi),
    settledAt,
  };
};

/** The partition or unsorted tail in play at `k`. */
export const rangeAt = (trace: Trace, k: number) => {
  if (k <= 0 || trace.comparisons === 0) return null;
  const i = Math.min(k, trace.comparisons) - 1;
  return { lo: trace.rangeLo[i], hi: trace.rangeHi[i] };
};

/**
 * How many times each position has been written to, after `k` comparisons.
 *
 * The writes shot is the catch, and the catch is that the algorithm that loses
 * on comparisons wins on this by a factor of three. Accumulated per position
 * rather than totalled, because a bar that has been moved six times should look
 * different from one that has been moved twice.
 */
export const heatAt = (trace: Trace, k: number) => {
  const heat = new Int16Array(trace.start.length);
  let writes = 0;
  for (const s of trace.swaps) {
    if (s.at > k) break;
    heat[s.i] += 1;
    heat[s.j] += 1;
    writes += 2;
  }
  return { heat, writes };
};

/** The array as it stands after `k` comparisons. */
export const stateAt = (trace: Trace, k: number) => {
  const a = [...trace.start];
  for (const s of trace.swaps) {
    if (s.at > k) break;
    [a[s.i], a[s.j]] = [a[s.j], a[s.i]];
  }
  return a;
};

/** The pair under comparison at `k`, clamped to the run. */
export const probeAt = (trace: Trace, k: number) => {
  if (k <= 0 || trace.comparisons === 0) return null;
  const i = Math.min(k, trace.comparisons) - 1;
  return { a: trace.probeA[i], b: trace.probeB[i] };
};
