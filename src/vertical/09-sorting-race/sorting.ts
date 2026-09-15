import { budgetAt, DURATION, PRE_ROLL } from "./beats";
import { N, RUNS, SEED, type AlgorithmKey, type Run } from "./measurements";

/**
 * Six sorts, instrumented, and the frames they produce.
 *
 * Every algorithm runs once at module load against the same permutation and
 * records an operation stream. Nothing in a shot sorts anything, and nothing in
 * a shot invents a count: a panel reads the array state and the operation
 * total straight out of these traces, so correcting the instrumentation
 * corrects the frame.
 *
 * An operation is a comparison between two element values, a write into the
 * array, or a write into an auxiliary buffer. That third kind exists for merge
 * sort alone and it is counted, because the scratch copy is real work and
 * leaving it out would flatter the only algorithm here that is not in place.
 * It touches an index without changing a bar, which is why it gets its own
 * kind rather than being folded into a write: the panel should light the slot
 * up and leave the height alone.
 *
 * Frames are precomputed rather than replayed. Six panels replaying up to two
 * and a half thousand operations on every one of four hundred and twenty
 * frames is work done again and again for an answer that never changes, so the
 * stream is walked once and the array state, the activity trail and the active
 * range are banked per frame.
 */

const COMPARE = 0;
const WRITE = 1;
const AUX_WRITE = 2;

/**
 * How fast a touched slot cools.
 *
 * The clock runs at about two operations a frame at the open and seventeen at
 * the close, so at the end a single frame touches a third of the array. A trail
 * of roughly three frames is what turns that from a strobe into a sweep.
 */
const HEAT_DECAY = 0.55;

/** Deterministic shuffle, matching `scripts/measure-sorting-race.mjs`. */
const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => (s = (s * 1_664_525 + 1_013_904_223) >>> 0) / 4_294_967_296;
};

const shuffled = (n: number, seed: number) => {
  const a = [...Array(n)].map((_, i) => i + 1);
  const r = rng(seed);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const INPUT = shuffled(N, SEED);

type Recorder = {
  readonly a: number[];
  readonly kind: number[];
  readonly p: number[];
  readonly q: number[];
  readonly lo: number[];
  readonly hi: number[];
  low: number;
  high: number;
  compares: number;
  writes: number;
  auxWrites: number;
};

const recorder = (): Recorder => ({
  a: [...INPUT],
  kind: [],
  p: [],
  q: [],
  lo: [],
  hi: [],
  low: 0,
  high: N - 1,
  compares: 0,
  writes: 0,
  auxWrites: 0,
});

const push = (r: Recorder, kind: number, p: number, q: number) => {
  r.kind.push(kind);
  r.p.push(p);
  r.q.push(q);
  r.lo.push(r.low);
  r.hi.push(r.high);
};

/** Two element values put side by side. The pair lights up; nothing moves. */
const compare = (r: Recorder, i: number, j: number) => {
  r.compares++;
  push(r, COMPARE, i, j);
};

/** A value landing in a slot. The bar changes height on this operation. */
const write = (r: Recorder, i: number, value: number) => {
  r.writes++;
  r.a[i] = value;
  push(r, WRITE, i, value);
};

/** A slot copied out to scratch. Work done, and no bar moves for it. */
const auxWrite = (r: Recorder, i: number) => {
  r.auxWrites++;
  push(r, AUX_WRITE, i, r.a[i]);
};

const swap = (r: Recorder, i: number, j: number) => {
  const held = r.a[i];
  write(r, i, r.a[j]);
  write(r, j, held);
};

const range = (r: Recorder, low: number, high: number) => {
  r.low = low;
  r.high = high;
};

/**
 * The active range each algorithm reports.
 *
 * Not decoration. It is the one thing that tells the six panels apart while
 * they are all mid-run: bubble sort's shrinks by one a pass, selection sort's
 * suffix does the same while almost nothing moves inside it, insertion sort's
 * prefix grows, merge sort's jumps around the array in widening blocks, heap
 * sort's drains from the end, and quicksort's halves. Six different pictures of
 * where the work is, from one field.
 */

const bubble = (r: Recorder) => {
  for (let end = N - 1; end > 0; end--) {
    range(r, 0, end);
    let swapped = false;
    for (let i = 0; i < end; i++) {
      compare(r, i, i + 1);
      if (r.a[i] > r.a[i + 1]) {
        swap(r, i, i + 1);
        swapped = true;
      }
    }
    if (!swapped) break;
  }
};

const selection = (r: Recorder) => {
  for (let i = 0; i < N - 1; i++) {
    range(r, i, N - 1);
    let m = i;
    for (let j = i + 1; j < N; j++) {
      compare(r, j, m);
      if (r.a[j] < r.a[m]) m = j;
    }
    if (m !== i) swap(r, i, m);
  }
};

const insertion = (r: Recorder) => {
  for (let i = 1; i < N; i++) {
    range(r, 0, i);
    const key = r.a[i];
    let j = i - 1;
    while (j >= 0) {
      compare(r, j, i);
      if (r.a[j] <= key) break;
      write(r, j + 1, r.a[j]);
      j--;
    }
    write(r, j + 1, key);
  }
};

const merge = (r: Recorder) => {
  const aux = new Array<number>(N);

  const mergeRange = (low: number, mid: number, high: number) => {
    range(r, low, high);
    for (let k = low; k <= high; k++) {
      auxWrite(r, k);
      aux[k] = r.a[k];
    }
    let i = low;
    let j = mid + 1;
    for (let k = low; k <= high; k++) {
      if (i > mid) write(r, k, aux[j++]);
      else if (j > high) write(r, k, aux[i++]);
      else {
        compare(r, i, j);
        write(r, k, aux[j] < aux[i] ? aux[j++] : aux[i++]);
      }
    }
  };

  const sort = (low: number, high: number) => {
    if (low >= high) return;
    const mid = (low + high) >> 1;
    sort(low, mid);
    sort(mid + 1, high);
    mergeRange(low, mid, high);
  };

  sort(0, N - 1);
};

const heap = (r: Recorder) => {
  const siftDown = (root: number, end: number) => {
    for (;;) {
      let child = 2 * root + 1;
      if (child > end) return;
      if (child + 1 <= end) {
        compare(r, child + 1, child);
        if (r.a[child + 1] > r.a[child]) child++;
      }
      compare(r, root, child);
      if (r.a[root] >= r.a[child]) return;
      swap(r, root, child);
      root = child;
    }
  };

  range(r, 0, N - 1);
  for (let i = (N >> 1) - 1; i >= 0; i--) siftDown(i, N - 1);
  for (let end = N - 1; end > 0; end--) {
    range(r, 0, end);
    swap(r, 0, end);
    siftDown(0, end - 1);
  }
};

const quick = (r: Recorder) => {
  const partition = (low: number, high: number) => {
    range(r, low, high);
    const pivot = r.a[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      compare(r, j, high);
      if (r.a[j] <= pivot) {
        i++;
        if (i !== j) swap(r, i, j);
      }
    }
    if (i + 1 !== high) swap(r, i + 1, high);
    return i + 1;
  };

  const sort = (low: number, high: number) => {
    if (low >= high) return;
    const p = partition(low, high);
    sort(low, p - 1);
    sort(p + 1, high);
  };

  sort(0, N - 1);
};

export type Playback = {
  readonly key: AlgorithmKey;
  readonly run: Run;
  /** Operation index of every write, in order. */
  readonly writeOps: Int32Array;
  /** The value that landed on each of those writes, for pitching a cue. */
  readonly writeValue: Uint8Array;
  /** The race frame each write lands on. */
  readonly writeFrame: Int16Array;
  /** Array values, `DURATION * N`, indexed `frame * N + slot`. */
  readonly state: Uint8Array;
  /** Decaying activity per slot, same shape as `state`. */
  readonly heat: Float32Array;
  /** The stretch the algorithm is working inside, per frame. */
  readonly low: Int16Array;
  readonly high: Int16Array;
  /** Operations spent by the end of each frame. */
  readonly spent: Int32Array;
  /** The frame it spends its last operation on. */
  readonly finishedAt: number;
};

const play = (key: AlgorithmKey, sort: (r: Recorder) => void): Playback => {
  const r = recorder();
  sort(r);

  const expected = RUNS[key];
  const actual = {
    compares: r.compares,
    writes: r.writes,
    auxWrites: r.auxWrites,
    ops: r.compares + r.writes + r.auxWrites,
  };
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${key}: trace counts ${JSON.stringify(actual)} do not match the ` +
        `measured ${JSON.stringify(expected)}`,
    );
  }
  for (let i = 0; i < N; i++) {
    if (r.a[i] !== i + 1) throw new Error(`${key} did not sort the array`);
  }

  const total = actual.ops;
  const state = new Uint8Array(DURATION * N);
  const heat = new Float32Array(DURATION * N);
  const low = new Int16Array(DURATION);
  const high = new Int16Array(DURATION);
  const spent = new Int32Array(DURATION);

  const writeOps: number[] = [];
  const writeValue: number[] = [];
  const writeFrame: number[] = [];

  const a = Uint8Array.from(INPUT);
  const warm = new Float32Array(N);
  let k = 0;
  let activeLow = 0;
  let activeHigh = N - 1;
  let finishedAt = DURATION - 1;
  let running = true;

  // Frames before zero are run and thrown away. The clock starts behind the
  // frame so that the cut opens on work already done, and catching that up
  // inside frame zero would mark every one of those forty-odd slots as touched
  // on the same frame: six panels opening as a solid block of accent, claiming
  // an activity that actually happened over most of a second. Running the
  // warm-up properly costs a few hundred iterations and the trail is honest.
  for (let frame = -PRE_ROLL; frame < DURATION; frame++) {
    const budget = Math.min(total, budgetAt(frame));

    for (let i = 0; i < N; i++) warm[i] *= HEAT_DECAY;

    while (k < budget) {
      const kind = r.kind[k];
      const p = r.p[k];
      const q = r.q[k];

      if (kind === WRITE) {
        a[p] = q;
        writeOps.push(k);
        writeValue.push(q);
        // Clamped, because the pre-roll happens on frames that do not exist and
        // its writes still have to be addressable by a cue on frame zero.
        writeFrame.push(Math.max(0, frame));
      }
      warm[p] = 1;
      if (kind === COMPARE) warm[q] = 1;

      activeLow = r.lo[k];
      activeHigh = r.hi[k];
      k++;
    }

    if (frame < 0) continue;

    if (running && k >= total) {
      finishedAt = frame;
      running = false;
    }

    state.set(a, frame * N);
    heat.set(warm, frame * N);
    low[frame] = activeLow;
    high[frame] = activeHigh;
    spent[frame] = k;
  }

  return {
    key,
    run: expected,
    writeOps: Int32Array.from(writeOps),
    writeValue: Uint8Array.from(writeValue),
    writeFrame: Int16Array.from(writeFrame),
    state,
    heat,
    low,
    high,
    spent,
    finishedAt,
  };
};

export type Algorithm = {
  readonly key: AlgorithmKey;
  /** How it reads on the panel. Short enough for a 378 pixel card. */
  readonly name: string;
  readonly complexity: string;
  readonly playback: Playback;
};

/**
 * Grid order: the three quadratic sorts, then the three that are not.
 *
 * Reading order is the claim before a single bar has moved, and it puts the
 * two extremes in opposite corners, which is where the verdict draws its span
 * from.
 */
export const ALGORITHMS: readonly Algorithm[] = [
  { key: "bubble", name: "Bubble", complexity: "O(n²)", sort: bubble },
  { key: "selection", name: "Selection", complexity: "O(n²)", sort: selection },
  { key: "insertion", name: "Insertion", complexity: "O(n²)", sort: insertion },
  { key: "merge", name: "Merge", complexity: "O(n log n)", sort: merge },
  { key: "heap", name: "Heap", complexity: "O(n log n)", sort: heap },
  { key: "quick", name: "Quick", complexity: "O(n log n)", sort: quick },
].map(({ key, name, complexity, sort }) => ({
  key: key as AlgorithmKey,
  name,
  complexity,
  playback: play(key as AlgorithmKey, sort),
}));

/**
 * The frame of the race at which `ops` had been spent.
 *
 * The verdict runs its two survivors again on a clock of its own, faster and
 * linear, and it needs the array as it stood after a given number of
 * operations rather than on a given frame. Rather than bank a second set of
 * snapshots keyed by operation, this walks back into the ones the race already
 * produced: `spent` rises with the frame number, so the frame holding a budget
 * is a binary search away.
 */
export const frameForSpend = (playback: Playback, ops: number) => {
  const { spent } = playback;
  let low = 0;
  let high = spent.length - 1;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (spent[mid] < ops) low = mid + 1;
    else high = mid;
  }
  return low;
};

export const byKey = (key: AlgorithmKey) => {
  const found = ALGORITHMS.find((algorithm) => algorithm.key === key);
  if (!found) throw new Error(`no algorithm ${key}`);
  return found;
};

/** Finishing order, computed rather than asserted, so a retime cannot lie. */
export const FINISHING_ORDER: readonly Algorithm[] = [...ALGORITHMS].sort(
  (a, b) => a.playback.run.ops - b.playback.run.ops,
);
