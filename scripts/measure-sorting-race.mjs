#!/usr/bin/env node

// Six sorts, one array, one shared unit of work.
//
// The reel puts all six on screen at once and steps every panel at the same
// number of operations per frame, so the finishing order is the claim. That
// only means anything if the operations are counted the same way in all six,
// which is what this script exists to pin down.
//
// An operation is a comparison between two element values, or a write into an
// array. Auxiliary writes count: merge sort's scratch buffer is real work a
// machine does, and excluding it would flatter the one algorithm here that is
// not in place. The three totals are reported separately so anybody who wants
// to argue with the accounting can see exactly what went into it.
//
// Values are 1..N shuffled by a pinned LCG, so every run of this script and
// every render of the reel sort the identical permutation.

const N = 48;
const SEED = 20260914;

const rng = (seed) => {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
};

const shuffled = (n, seed) => {
  const a = [...Array(n)].map((_, i) => i + 1);
  const r = rng(seed);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const run = (fn, input) => {
  const a = [...input];
  const c = { compares: 0, writes: 0, auxWrites: 0 };
  fn(a, c);
  return { a, ...c };
};

const bubble = (a, c) => {
  for (let end = a.length - 1; end > 0; end--) {
    let swapped = false;
    for (let i = 0; i < end; i++) {
      c.compares++;
      if (a[i] > a[i + 1]) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        c.writes += 2;
        swapped = true;
      }
    }
    if (!swapped) break;
  }
};

const selection = (a, c) => {
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let m = i;
    for (let j = i + 1; j < n; j++) {
      c.compares++;
      if (a[j] < a[m]) m = j;
    }
    if (m !== i) {
      [a[i], a[m]] = [a[m], a[i]];
      c.writes += 2;
    }
  }
};

const insertion = (a, c) => {
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0) {
      c.compares++;
      if (a[j] <= key) break;
      a[j + 1] = a[j];
      c.writes++;
      j--;
    }
    a[j + 1] = key;
    c.writes++;
  }
};

const merge = (a, c) => {
  const aux = new Array(a.length);

  const mergeRange = (lo, mid, hi) => {
    for (let k = lo; k <= hi; k++) {
      aux[k] = a[k];
      c.auxWrites++;
    }
    let i = lo;
    let j = mid + 1;
    for (let k = lo; k <= hi; k++) {
      if (i > mid) a[k] = aux[j++];
      else if (j > hi) a[k] = aux[i++];
      else {
        c.compares++;
        a[k] = aux[j] < aux[i] ? aux[j++] : aux[i++];
      }
      c.writes++;
    }
  };

  const sort = (lo, hi) => {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    sort(lo, mid);
    sort(mid + 1, hi);
    mergeRange(lo, mid, hi);
  };

  sort(0, a.length - 1);
};

const heap = (a, c) => {
  const n = a.length;

  const siftDown = (root, end) => {
    for (;;) {
      let child = 2 * root + 1;
      if (child > end) return;
      if (child + 1 <= end) {
        c.compares++;
        if (a[child + 1] > a[child]) child++;
      }
      c.compares++;
      if (a[root] >= a[child]) return;
      [a[root], a[child]] = [a[child], a[root]];
      c.writes += 2;
      root = child;
    }
  };

  for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(i, n - 1);
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    c.writes += 2;
    siftDown(0, end - 1);
  }
};

const quick = (a, c) => {
  const partition = (lo, hi) => {
    const pivot = a[hi];
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      c.compares++;
      if (a[j] <= pivot) {
        i++;
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          c.writes += 2;
        }
      }
    }
    if (i + 1 !== hi) {
      [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
      c.writes += 2;
    }
    return i + 1;
  };

  const sort = (lo, hi) => {
    if (lo >= hi) return;
    const p = partition(lo, hi);
    sort(lo, p - 1);
    sort(p + 1, hi);
  };

  sort(0, a.length - 1);
};

const ALGORITHMS = [
  ["bubble", bubble],
  ["selection", selection],
  ["insertion", insertion],
  ["merge", merge],
  ["heap", heap],
  ["quick", quick],
];

const input = shuffled(N, SEED);
const sorted = [...Array(N)].map((_, i) => i + 1);

const results = ALGORITHMS.map(([name, fn]) => {
  const r = run(fn, input);
  if (r.a.join(",") !== sorted.join(",")) {
    throw new Error(`${name} did not sort the array`);
  }
  return {
    name,
    compares: r.compares,
    writes: r.writes,
    auxWrites: r.auxWrites,
    ops: r.compares + r.writes + r.auxWrites,
  };
});

// The figures `src/vertical/09-sorting-race/measurements.ts` is built from.
// A change to any implementation above, to N, or to the seed moves these, and
// moving them silently would leave the reel stating numbers no run produces.
const EXPECTED = {
  bubble: { compares: 1113, writes: 1304, auxWrites: 0, ops: 2417 },
  selection: { compares: 1128, writes: 92, auxWrites: 0, ops: 1220 },
  insertion: { compares: 695, writes: 699, auxWrites: 0, ops: 1394 },
  merge: { compares: 210, writes: 272, auxWrites: 272, ops: 754 },
  heap: { compares: 384, writes: 448, auxWrites: 0, ops: 832 },
  quick: { compares: 199, writes: 188, auxWrites: 0, ops: 387 },
};

for (const r of results) {
  const { name, ...actual } = r;
  if (JSON.stringify(actual) !== JSON.stringify(EXPECTED[name])) {
    throw new Error(
      `${name} counts changed: ${JSON.stringify(actual)} is not ` +
        JSON.stringify(EXPECTED[name]),
    );
  }
}

const width = Math.max(...results.map((r) => r.name.length));
console.log(`n = ${N}, seed = ${SEED}`);
console.log(`input = ${input.join(" ")}`);
console.log("");
for (const r of results) {
  console.log(
    `${r.name.padEnd(width)}  compares=${String(r.compares).padStart(5)}` +
      `  writes=${String(r.writes).padStart(5)}` +
      `  aux=${String(r.auxWrites).padStart(5)}` +
      `  ops=${String(r.ops).padStart(5)}`,
  );
}

const slowest = results.reduce((a, b) => (b.ops > a.ops ? b : a));
const fastest = results.reduce((a, b) => (b.ops < a.ops ? b : a));
console.log("");
console.log(
  `slowest ${slowest.name} ${slowest.ops} ops, fastest ${fastest.name} ` +
    `${fastest.ops} ops, ratio ${(slowest.ops / fastest.ops).toFixed(1)}x`,
);
