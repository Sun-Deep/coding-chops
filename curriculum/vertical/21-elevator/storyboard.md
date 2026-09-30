# Storyboard

One shot. Two buildings side by side on one clock, the hammer-and-nails shape
from the Explore study: the same setup twice with one thing different.

## The clock

Simulated time, shared by both buildings so the race is fair. It opens at 10 s,
with the first caller waiting and both cars on their way, so frame zero moves.
0.3 simulated seconds a frame until frame 40 while the other six calls land,
then 0.45: a floor is four and a half frames and a stop is eighteen.

## The shot map

```text
0-40     calls arrive; you press on 6 at frame 20, your lamp and clock light
40-104   both cars do exactly the same thing: 4, 6, 9
104      they part at floor 9 going down
104-113  right stops at 6 and you step in; left goes straight past
162      right lets you out on 3; its clock stops at 1:01
162-247  left serves everyone who pressed before you
247-278  left finally picks you up and lets you out; clock stops at 1:53
260      right has already delivered all seven
284-420  payoff line; the left car keeps working the rest of its queue
```

Nothing holds still longer than 11 frames. The left car is still moving at the
end because its queue is not done, and that is the point.

## Why these choices

The hero object is you, one orange figure, the same person in both buildings.
It is the only accent in the frame apart from the headline word and your two
clocks, which are all you.

The first 45 simulated seconds are identical on purpose. A split that starts
from two identical pictures is one a viewer can see without reading anything.

Lane hues were not used: there are two lanes and the labels sit over them, and
the one thing being looked for is you, which already has the accent.

## Cue map

```text
call lands      probe, pitched by floor, once per call
car at a floor  tick, pitched by floor, quiet: a car going up is a rising run
car stops       ding, the lift's own sound, generated into build-sfx.sh
you out, right  name
you out, left   land, lower
payoff          settle
```

A cue both buildings would fire on the same frame is played once. For the
first third they are the same building, and doubling every cue would make the
opening twice as loud as the race.

## Checks run

Duration 14.06 s. Peak -5.5 dBFS. No silence of 0.35 s or longer at -45 dB.
Longest held frame 11 frames. Safe area overlay clean on the verdict frame;
nothing below y 1000 crosses x 930. Cover checked at 1:1 and 3:4.
