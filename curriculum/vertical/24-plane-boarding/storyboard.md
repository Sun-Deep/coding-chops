# Storyboard

One shot, three cabins on one clock.

The first version opened close on one aisle and pulled back over two seconds.
The creator's note: it did not look like a plane, and the reveal was too slow
for a viewer deciding in half a second. Three cabins side by side leave no room
for wings, so the reel now opens on one complete airliner and splits it into
three within the first half second; the cabins keep a pointed nose, a
windscreen, a window per row, wing roots and a tapered tail.

## The clock

Simulated second 12 at frame 0, 0.6 s a frame for two seconds, then about
1.06 s a frame so back to front finishes at frame 390. Window first finishes
at frame 258, random at 313.

## The shot map

```text
0-4      one whole airliner, wings, engines and tailplanes, under the headline
4-16     the other two cabins slide out from behind it as the wings fade
16-258   back to front's aisle red end to end; the others fill everywhere
258      window first's clock stops, orange
313      random's clock stops; payoff line
390      back to front's clock stops
```

## Colour

Red means stuck, the meaning the brake lights had in the traffic cut. Orange
marks a cabin whose boarding is finished. Everything else is neutral.

## Cue map

```text
a passenger sits      tick, pitched by cabin, at most every 2 frames
a cabin finishes      solved, pitched by finishing order
payoff                settle
```

## Checks run

Duration 14.06 s. Peak -6.7 dBFS. No silence of 0.35 s or longer. Longest
held frame 5 frames. Cover checked at 1:1 and
3:4.
