# Measurements

Two sessions, 2026-09-12, on this machine. Reproduce with
`node scripts/measure-regex-backtracking.mjs`.

```text
macOS, aarch64-apple-darwin
Node v22.14.0
Python 3.14.6
3 runs per point, median reported
pattern:  /^(a+)+$/   against "a".repeat(n) + "X"
control:  /^a+$/      same input, same process
```

## What is on screen and what is not

The playbook's rule is that anything moving between two runs does not go up as
an absolute figure.

The doubling ratio reproduced: 2.01 in session one, 2.00 in session two. It
carries the cut's actual claim and goes up unhedged.

The absolute times did not reproduce at the precision they print to. Node's
n=30 figure moved 3.9 percent between sessions and Python's moved 0.7 percent.
Rounded until both sessions agree, Node is 4 seconds and Python is 20 seconds,
and those are the figures the frames carry. The narration says "twenty seconds"
and the frame says the same, so the two cannot disagree.

The speedup at n=30 is between 20.8 and 24.9 million depending on the session.
It is in `measurements.ts` and on no frame.

## Still owed

A third session at least an hour later, on a cold machine. These two ran
minutes apart, which confirms determinism and not range. VR05 learned this the
expensive way: two runs seventeen minutes apart agreed with each other and were
both low, and a run ten hours later is what caught it.

## Session one

```text
n	nested ms	linear ms	python ms	ratio to n-1
20	4.514	0.0136	21.971	-
21	8.312	0.0003	38.515	1.84
22	15.675	0.0001	76.160	1.89
23	31.487	0.0001	147.623	2.01
24	62.854	0.0002	295.167	2.00
25	126.123	0.0002	602.518	2.01
26	251.003	0.0002	1197.337	1.99
27	512.393	0.0002	2514.970	2.04
28	1019.309	0.0002	4821.228	1.99
29	2053.540	0.0002	9704.969	2.01
30	4159.650	0.0002	19936.956	2.03

summary
  steps a backtracking engine can take at n: 2^n
  median doubling ratio: 2.01
  at n=30: nested 4159.6 ms, linear 0.0002 ms
  speedup at n=30: 24,908,083x
  python at n=30: 19937.0 ms
```

## Session two

```text
n	nested ms	linear ms	python ms	ratio to n-1
20	4.593	0.0120	19.189	-
21	8.392	0.0002	38.539	1.83
22	16.979	0.0002	76.675	2.02
23	33.207	0.0001	151.629	1.96
24	66.377	0.0002	306.225	2.00
25	129.038	0.0002	618.293	1.94
26	267.278	0.0002	1236.821	2.07
27	521.261	0.0002	2521.541	1.95
28	1081.101	0.0002	4951.735	2.07
29	2145.959	0.0002	9912.163	1.98
30	4322.488	0.0002	19788.680	2.01

summary
  steps a backtracking engine can take at n: 2^n
  median doubling ratio: 2.00
  at n=30: nested 4322.5 ms, linear 0.0002 ms
  speedup at n=30: 20,781,191x
  python at n=30: 19788.7 ms
```

## The two sessions side by side

| n   | node s1  | node s2  | python s1 | python s2 |
| --- | -------- | -------- | --------- | --------- |
| 25  | 126.123  | 129.038  | 602.518   | 618.293   |
| 27  | 512.393  | 521.261  | 2514.970  | 2521.541  |
| 29  | 2053.540 | 2145.959 | 9704.969  | 9912.163  |
| 30  | 4159.650 | 4322.488 | 19936.956 | 19788.680 |

The control, `/^a+$/`, read 0.0002 ms at every n in both sessions after the
first call. It does not grow across a range where the nested pattern grows by a
factor of a thousand.

## The warm-up artifact

At n=20 the control reads 0.0136 ms in session one and 0.0120 in session two,
then 0.0002 for every n after. That is JIT warm-up on the first call in the
process, not a property of n=20.

It is left in the committed output rather than trimmed. Discarding the
inconvenient sample is how a measurement becomes a story, and the note here is
cheaper than the credibility.
