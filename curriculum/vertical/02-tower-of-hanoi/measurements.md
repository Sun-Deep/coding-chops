# Measurement run

The cut uses structural counts, not wall-clock timings. The recursive program
in `scripts/measure-tower-of-hanoi.mjs` performs the moves, rejects an illegal
move and prints the resulting trace.

Run twice on September 7, 2026. Both runs reproduced every line exactly.

## Machine

```text
Node.js on Apple silicon, macOS
```

## Raw output

```text
input_disks=4
moves=15
calls=31
max_depth=5
1: disk 1 A->B
2: disk 2 A->C
3: disk 1 B->C
4: disk 3 A->B
5: disk 1 C->A
6: disk 2 C->B
7: disk 1 A->B
8: disk 4 A->C
9: disk 1 B->C
10: disk 2 B->A
11: disk 1 C->A
12: disk 3 B->C
13: disk 1 A->B
14: disk 2 A->C
15: disk 1 B->C
final_A=[]
final_B=[]
final_C=[4,3,2,1]
```

The values used by the composition live in
`src/vertical/02-tower-of-hanoi/measurements.ts`. The run confirms fifteen
moves, thirty-one function calls, a maximum call depth of five and the final
stack on peg C. No timing appears in the cut because it would describe the
machine, not the algorithm.

## Reproduce

```bash
npm run measure:tower-of-hanoi
```
