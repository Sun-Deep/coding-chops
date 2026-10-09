# Storyboard

One shot: the same corridor twice, side by side, at real time. The same two
people meet in both, bump on their first step, and then the left pair steps
again at once and mirrors four times while the right pair waits a random
beat, bumps once more and passes. The next pairs pass cleanly in both,
showing the wait costs nothing without a bump.

## How it got here

The first build put three meeting places in each of two wide corridors,
camera at head height looking straight down. The person walking away hid
the one walking towards them, and everyone was small: the gridlock reel's
problem again. One meeting place per corridor, a camera high on the wall
and tall side-by-side panels put both people in view at about 250 px.

The first version of the rule waited before every step. That made pairs who
would never have bumped slower, and which side won depended on settings.
Ethernet only backs off after a collision; with the rule changed to match,
the wait costs nothing without a bump and the result holds across the sweep.

Separate runs for each corridor made the race a matter of luck (seed 2
reversed it). Sharing each pair's reactions between the corridors makes it
a fair comparison of the same people.

## Colour

Orange is one thing: a bump. Clothes are muted everyday colours kept off
orange.

## Cue map

```text
walking          soft footsteps
sidestep         scuff
bump             dull knock
pair gets past   short send
payoff           settle
```

## Checks run

Duration 14.06 s. Peak -7.4 dBFS. No silence of 0.35 s or longer. One
near-still frame. Quarter-scale glance at frame 15 readable.
