# Measurements

Run on 19 October 2026. These are exhaustive algorithm counts, not elapsed
time or physical mass measurements.

```text
machine: darwin 25.5.0 arm64; Node v22.14.0
coin 1: left / left; candidates 9 -> 3 -> 1; found 1
coin 2: left / balanced; candidates 9 -> 3 -> 1; found 2
coin 3: left / right; candidates 9 -> 3 -> 1; found 3
coin 4: right / left; candidates 9 -> 3 -> 1; found 4
coin 5: right / balanced; candidates 9 -> 3 -> 1; found 5
coin 6: right / right; candidates 9 -> 3 -> 1; found 6
coin 7: balanced / left; candidates 9 -> 3 -> 1; found 7
coin 8: balanced / balanced; candidates 9 -> 3 -> 1; found 8
coin 9: balanced / right; candidates 9 -> 3 -> 1; found 9
mass sweep: 81 cases passed
size sweep: every position at 3, 9, 27 and 81 coins passed
shown coin: 5, the middle input coin
shown run: {"target":4,"found":4,"steps":[{"left":[0,1,2],"right":[3,4,5],"outside":[6,7,8],"outcome":"right","remaining":[3,4,5]},{"left":[3],"right":[5],"outside":[4],"outcome":"balanced","remaining":[4]}]}
one weighing distinguishes at most 3 positions; two distinguish 9
```

Every possible lighter coin is checked. The shown coin is the middle input
coin by rule. Its outcomes are right pan up, then balanced. A second exhaustive run matched every count. These integer counts do not
depend on processor timing; wall-clock timing is never displayed.

## Second run

```text
machine: darwin 25.5.0 arm64; Node v22.14.0
coin 1: left / left; candidates 9 -> 3 -> 1; found 1
coin 2: left / balanced; candidates 9 -> 3 -> 1; found 2
coin 3: left / right; candidates 9 -> 3 -> 1; found 3
coin 4: right / left; candidates 9 -> 3 -> 1; found 4
coin 5: right / balanced; candidates 9 -> 3 -> 1; found 5
coin 6: right / right; candidates 9 -> 3 -> 1; found 6
coin 7: balanced / left; candidates 9 -> 3 -> 1; found 7
coin 8: balanced / balanced; candidates 9 -> 3 -> 1; found 8
coin 9: balanced / right; candidates 9 -> 3 -> 1; found 9
mass sweep: 81 cases passed
size sweep: every position at 3, 9, 27 and 81 coins passed
shown coin: 5, the middle input coin
shown run: {"target":4,"found":4,"steps":[{"left":[0,1,2],"right":[3,4,5],"outside":[6,7,8],"outcome":"right","remaining":[3,4,5]},{"left":[3],"right":[5],"outside":[4],"outcome":"balanced","remaining":[4]}]}
one weighing distinguishes at most 3 positions; two distinguish 9
```

## Generated sound peaks

Measured with FFmpeg astats after synthesis. The composition computes each gain
from these source peaks.

| File              | Peak dBFS |
| ----------------- | --------: |
| coin-clink.wav    |    -31.72 |
| coin-handle.wav   |    -33.90 |
| scale-release.wav |    -23.81 |
| coin-turn.wav     |    -32.18 |

## Run after the full render

First saved run: 2026-10-19T09:07:12+00:00. Final saved run: 2026-10-19T12:23:58+00:00.
Both runs give the same integer counts.

```text
machine: darwin 25.5.0 arm64; Node v22.14.0
coin 1: left / left; candidates 9 -> 3 -> 1; found 1
coin 2: left / balanced; candidates 9 -> 3 -> 1; found 2
coin 3: left / right; candidates 9 -> 3 -> 1; found 3
coin 4: right / left; candidates 9 -> 3 -> 1; found 4
coin 5: right / balanced; candidates 9 -> 3 -> 1; found 5
coin 6: right / right; candidates 9 -> 3 -> 1; found 6
coin 7: balanced / left; candidates 9 -> 3 -> 1; found 7
coin 8: balanced / balanced; candidates 9 -> 3 -> 1; found 8
coin 9: balanced / right; candidates 9 -> 3 -> 1; found 9
mass sweep: 81 cases passed
size sweep: every position at 3, 9, 27 and 81 coins passed
shown coin: 5, the middle input coin
shown run: {"target":4,"found":4,"steps":[{"left":[0,1,2],"right":[3,4,5],"outside":[6,7,8],"outcome":"right","remaining":[3,4,5]},{"left":[3],"right":[5],"outside":[4],"outcome":"balanced","remaining":[4]}]}
one weighing distinguishes at most 3 positions; two distinguish 9
```
