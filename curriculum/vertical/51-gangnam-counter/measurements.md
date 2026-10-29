# Measurements

`scripts/measure-gangnam-counter.mjs`, run on 26 Oct 2026, Apple M5 Pro,
OpenJDK 26.0.2, Apple clang 21.0.0. It compiles the reel's lines from
`src/vertical/51-gangnam-counter/snippets.ts` with javac and asserts every
value below.

```text
{
  int32: -2147483648,
  int64: 2147483648,
  sixBillionAsInt: 1705032704,
  maxBits: '01111111111111111111111111111111',
  wrappedBits: '10000000000000000000000000000000',
  longMax: '9223372036854775807',
  intRange: '2147483647 -2147483648',
  c: '-2147483648'
}

openjdk version "26.0.2" 2026-07-21
Apple clang version 21.0.0 (clang-2100.1.1.101)
all checks pass
```

`sixBillionAsInt` is what the reel's `SIX` lines print. `c` is the same addition in C on an int32_t, built with -fwrapv because
signed overflow is otherwise undefined.

The values are in `src/vertical/51-gangnam-counter/measurements.ts`, and
`runs.ts` checks them against 32-bit arithmetic when the reel loads.
