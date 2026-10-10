# Storyboard

One shot: the same restaurant twice, one above the other, seen at eye
level with a slow push in and a little handheld drift. The followed
customer has just walked in. On top they join a line of nine for the till;
below they go straight to a free screen, order, and join the crowd at the
pickup counter. At fifty-five times real time the top line shuffles
forward while the crowd below grows and the board fills with numbers. The
lower tray comes up at frame 253, the upper at 273. At the payoff the clock
slows to six times, the kitchen is marked as the slowest step and the lower
label becomes "Amdahl's law".

## How it got here

The first frames were a flat brown cross-section seen from high up, with
small people over a lot of empty floor. The room is now drawn 0.7 times as
wide as it is modelled and the camera is at eye level, so people are about
140 px tall. Lighting moved from even to pools: dark walls, pendant cones
with dust in them, bloom on the brightest things, reflections in the
floor, a cool and warm grade, film grain and soft foreground blur.

The first full render moved clunkily. People walked at full speed from
the first frame and stopped dead; a whole line stepped forward on the same
frame; people who took a tray vanished mid-floor, because at 55 times real
time the nine seconds they were given to leave was five frames; arms
snapped up to the screens; and numbers, trays and screens changed in one
frame. Now people speed up and slow down, each reacts a moment later the
further back in line they stand, so a line ripples forward, they walk all
the way out of the door, poses ease in over a few frames, and board
numbers, trays and screens slide and fade. The board shows one column per
list so a number moving up never crosses another.

## Colour

Orange is one thing: you. Clothes are muted, food on the menu boards is
drawn in muted food colours, the grill glows a deep red.

## Cue map

```text
room             low hum under the whole reel
order placed     till beep above, screen tap below
tray up          pickup bell
your tray        brighter tone
payoff           settle
```

## Checks run

Duration 14.06 s. Peak -6.4 dBFS. No silence of 0.35 s or longer. No
near-still frames. Quarter-scale glance at frame 15 readable.
