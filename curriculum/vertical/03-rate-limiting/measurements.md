# Measurement run

Run on 2026-09-08 by `scripts/measure-rate-limiting.mjs`. Twice, an hour apart,
identical both times.

## What is exact and what is measured

The request counts are exact. The limiters are deterministic and the timeline is
fixed, so those numbers are properties of the algorithms and repeat on any
machine. `src/vertical/03-rate-limiting/measurements.ts` runs the same three
limiters at module load and the shots read the results directly, so the band on
screen cannot disagree with the claim.

The memory figures are real heap on this machine and would move on another.

```text
Node.js v22.14.0, Apple silicon
```

## The setup

```text
limit    100 requests per 60s
attack   100 requests at t=59.00s to 59.99s
         100 more at t=60.00s to 60.99s
         200 requests across 1.99 seconds
```

Nothing about that traffic is exotic. It is what a client with a retry loop and
a clock does by accident.

## What gets through

```text
Fixed window             allowed 200   rejected   0
Sliding window log       allowed 100   rejected 100
Sliding window counter   allowed 102   rejected  98
Token bucket             allowed 103   rejected  97
```

## Worst rolling 60 second window each one permits

```text
Fixed window             200
Sliding window log       100
Sliding window counter   102
Token bucket             103
```

Fixed window is the only one that misses by a factor rather than by a few
percent, and it is the only one where the overshoot is an accident. The token
bucket's 103 is the burst allowance working as designed.

## Heap per user, 100,000 users

```text
Fixed window                48 bytes     4.6 MB
Sliding window log        1208 bytes   115.2 MB
Sliding window counter      56 bytes     5.3 MB
Token bucket                64 bytes     6.1 MB
```

Measured with `global.gc()` either side of allocating 100,000 limiters, each one
driven to the state it reaches under real traffic. An empty sliding log costs
nothing, and an empty sliding log is not what a rate limiter has.

The 1,208 bytes is 100 timestamps plus the array. That is the whole tradeoff:
the reason it is exact is that it remembers everything, and the reason it is
expensive is the same reason.

## Both runs

```text
                         run 1                run 2
allowed, all four        200/100/102/103      200/100/102/103
heap, all four           48/1208/56/64        48/1208/56/64
```

Nothing moved, so every figure goes on screen as an absolute.
