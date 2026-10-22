# Storyboard

One shot, two identical car parks on one clock, the plane reel's shape.

## The clock

Half a simulated second a frame until the row picker is through the door at
frame 112, then about one second a frame so the circler reaches the door at
frame 330.

## The shot map

```text
0        both orange cars entering at the bottom left, the car park full
0-52     row picker drives up the door aisle; circler likewise
52-112   left parks seven rows out and walks in: 0:56
112-330  right loops; open stalls outside the band go by, close ones get taken
330      right through the door: 4:31
336-414  payoff line
```

## Colour

Orange is you, in both car parks, and the circler's accepted band. Body
colours of everyone else are neutrals. No red: nothing in this one is stuck.

## Cue map

```text
a car leaves or arrives          tick, at most every 3 frames
a close stall taken by another   reject
circler passes an open far stall probe
circler turns a corner           tick, low
an orange car parks              settle
a driver reaches the door        solved
payoff                           settle
```

## Checks run

Duration 14.06 s. Peak -6.6 dBFS. Quiet gaps of 0.35 to 0.52 s, plus 1.9 s
under the payoff once both drivers are inside. Longest held frame 26 frames,
at the end. Safe area overlay clean. Cover checked at 1:1 and 3:4.
