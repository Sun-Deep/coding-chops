# Measurements

Run on 2026-10-12 with Apple M5 Pro, Darwin 25.5.0 and Node 22.14.0.

```sh
node --experimental-strip-types --no-warnings scripts/measure-buffet.mjs
```

The full first run is in measurement-run.txt. Figures used by the cut are
in measurement-run.json and src/vertical/34-buffet/measurements.ts. The script
imports the same simulation the animation draws. Figures are seconds on
the simulated clock, so host execution speed does not affect them.

## Assumptions

Eight dishes, 60 people, exponential arrival gaps averaging 8 seconds. Each
dish is independently wanted with probability 0.4. A person who selected
nothing selects one dish. Serving takes 3 to 7 seconds, rounded to whole
seconds. One in seven people takes five times as long at every wanted dish.
The two policies use identical people, including their individual serving
times. Walking speed is 0.8 metres per second, station spacing one metre,
minimum line spacing 0.5 metres, and simulation steps 0.25 seconds.

## Result

Across seeds 1 through 100, mean time from arrival to a complete plate is
139.183 seconds in line and 51.347 seconds skipping. Their ratio is 2.7106.
The on-screen clocks round to 2:19 and 0:51 and the ratio to 2.7x.

3.433% of people take longer skipping, with 10.385 seconds extra on average
among those people. The frame rounds to 3% and +10s. Both are pooled across
all 6,000 matched diners, not comparisons between unrelated people.

The speedup ranges from 1.49x at a 20-second arrival gap to 3.13x at a
4-second gap. Serving variation and dish choice also change it. If everyone
wants every dish, the speedup falls to 1.51x and nobody waits longer in this
model. Do not claim a fixed threefold gain at every crowd level.

## Displayed race

Seed 13 is the first seed found where the first diner is slow, wants salad,
and a dessert-only diner appears among the next eight. It makes the mechanism
visible at the start. It was chosen for that event, not for its average or
fairness. Its averages are 192.74 and 50.94 seconds; none of its diners is
worse off. The verdict explicitly reports the 100-run aggregate instead.
The dessert-only diner is id 4, whose plate takes 69.016 seconds above and
23.266 below. The race opens 15 simulated seconds in and speeds both rooms
up on one clock. Top finishes at 680.5 seconds, just after the cut ends.

The script asserts no passing above, exclusive service at every dish, and
exactly the wanted number of portions for each diner. runs.ts checks the
selected race averages against the recorded figures before rendering.

A second full run is in measurement-repeat.txt. Its output matches the first
byte for byte. Both runs use simulated time, not elapsed host time.
