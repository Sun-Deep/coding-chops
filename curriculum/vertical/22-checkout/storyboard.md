# Storyboard

One shot, the elevator cut's shape: two shops side by side on one clock, the
same people in both, one orange "you".

## The clock

0.9 simulated seconds a frame throughout. It opens at second 441, 98 seconds
before you join, so both shops are busy at frame zero while the rules are read.

## The shot map

```text
0-109    both shops serving; the two rules read out
109      you walk in; left you join till 1, behind a checkout that has just started
137      right: you reach a till, clock stops at 0:25
120-300  left: each later shopper who reaches a till adds one to PASSED YOU
301      left: you reach till 1, clock stops at 2:53, counter at 7
309-420  payoff line; both shops keep serving
```

Longest held frame 25 frames.

## Cue map

```text
shopper reaches a till   beep, the scanner, generated into build-sfx.sh
shopper leaves a till    tick, light
shopper walks in         tick, low and quiet
someone passes you       probe, rising a whole tone per count
you reach a till, right  name
you reach a till, left   land, lower
payoff                   settle
```

## Checks run

Duration 14.06 s. Peak -5.9 dBFS. Eight quiet gaps of 0.35 to 0.9 s at -45 dB,
each a moment when nothing happens in either shop. Safe area overlay clean on
the verdict frame. Cover checked at 1:1 and 3:4.
