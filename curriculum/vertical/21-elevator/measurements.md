# Measurements

`node scripts/measure-elevator.mjs`, run twice on 2026-09-30, identical output
both times. The simulation has no randomness beyond the seeded generator and no
timing, so the machine cannot move a figure: Apple M5 Pro, macOS 26.5.1,
Node 22.14.0.

```text
one car, 10 floors, starts at floor 1, 2s a floor, 8s a stop
seed 1, 7 riders

rider  pressed  from  to   in order: in  out  trip   sweep: in  out  trip
    0      5      4      6     15     27     22     15     27     22
    1     14      9      3     41     61     47     41     77     63
    2     15      3      5     61     73     58    101    121    106
    3     16      1      4     89    103     87     89    111     95
    4     16      6      3    115    129    113     55     77     61   <- you
    5     18      6      1    143    161    143     55     89     71
    6     23      9      4    185    203    180     41     67     44

in order  floors 49  stops 13  last out 203s  mean trip 92.9s  longest trip 180s
sweep     floors 20  stops 10  last out 121s  mean trip 66.0s  longest trip 106s

you (rider 4): in order passes your floor 1 times before picking you up
riders who got out later with the sweep: 1 (+16s), 2 (+48s), 3 (+8s)

over 1000 other scenarios (seeds 100001 to 101000)
floor_s stop_s  fewer floors  shorter mean trip  finished first  mean trip ratio (median, min)  every rider sooner
      2      8          1000                998            1000            1.52, 0.97                   6
      1      4          1000                998            1000            1.48, 0.90                  14
      2      4          1000               1000            1000            1.71, 1.02                  10
      2     12          1000                997            1000            1.43, 0.98                   2
      3     10          1000               1000            1000            1.59, 1.02                   3
```

## What goes on screen

| Figure                     | Value        | From                                 |
| -------------------------- | ------------ | ------------------------------------ |
| Your trip, in order        | 1:53 (113 s) | rider 4, out 129, pressed 16         |
| Your trip, sweep           | 1:01 (61 s)  | rider 4, out 77, pressed 16          |
| Floors travelled, sweep    | 20           | counted live, final                  |
| Floors travelled, in order | counted live | 49 at the end, not reached on screen |
| Sweep's last rider out     | 121 s        | before your 129 s in order           |

The in-order car is still working when the reel ends, so its odometer is shown
live and the payoff line claims only what the frame shows at that moment: the
right building is empty before the left one lets you out.

## Why seed 1

It is the first scenario the generator makes. `RANK=1` finds seeds where "you"
wait six to twelve times longer in order; those were not used. Seed 1's mean
trip ratio, 1.41, is below the thousand-scenario median of 1.52.
