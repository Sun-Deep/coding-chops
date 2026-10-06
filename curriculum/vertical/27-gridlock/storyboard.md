# Storyboard

One shot. The same block twice, from straight above, side by side: the left
one where drivers go on green, the right one where they wait for room. Same
cars, same arrival times, same lights.

## The clock

Simulated second 75.3 onward. The first second is close on the bottom left
junction of both grids at three times real time: the left car rolls into the
junction on green and stops in it, the right car is stopped at the same green
line because the space past the junction is full. The camera pulls back from
frame 36 and the whole block is on screen by frame 60, two seconds in. The
cross street gets its green during the pull: blocked on the left, moving on
the right. Then four and a half times real time, so the loop locks at frame
219 and the rest is the left grid standing still while the right keeps
moving.

The close-up came from the creator's first look: at full view they could not
see where the light was green or which car was waiting for room. The second
look found the close-up too long at four seconds; it is two now. The waiting
car stood just off the map's edge, so the streets now carry on past it, and
the space the waiting driver needs is outlined.

## Drawing

Everything in metres at 10 px a metre, so a car is 45 px. The first build had
two grids of six junctions stacked one over the other, and at 33 px the cars
read as barcodes; one long block per side, Manhattan proportions, fixed it.
The headline also wrapped to three lines and was shortened.

Signals are the stop lines themselves, lit green or red, a metre thick. Lamps at the corner
were the first try, and with two streets meeting at every junction nobody
could tell which lamp was whose.

## The word on the picture

Once the loop is drawn, DEADLOCK fades in inside it, written up the block in
the accent. The creator missed the payoff in the subtitle on their own
watch, and most viewers do not read subtitles, so the coding idea has to be
on the simulation itself, not only under it.

## Colour

Orange means one thing: a car standing still inside a junction, the car that
blocks the cross street. The loop is orange because it is made of those
cars. Green and red appear only on the stop lines and mean what a traffic
light means. Brake lights are red. Everything else is neutral.

## Cue map

```text
a car clears a junction        tick, lower on the left, higher on the right
a car stops inside a junction  reject, left grid only, until the lock
the loop locks                 land
payoff                         settle
```

The left grid's ticks thin out and stop: the lock, heard.

## Checks run

Duration 14.06 s. Peak -6.1 dBFS. Two gaps of 0.42 and 0.39 s after the
lock, the left grid gone quiet. No held frame. Quarter-scale glance at frame 15: headline and both grids
readable.
