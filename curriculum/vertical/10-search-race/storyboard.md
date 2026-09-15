# Storyboard

One shot, then one map. Cutting a race into scenes is how you lose the race.

## The shot map

```text
0-75      six panels, all searching, headline and rule already in frame
76        greedy runs out of work and draws its route
233-276   A*, bidirectional, Dijkstra, depth-first and breadth-first arrive
288-302   the grid gives way to one map
304-346   the route with the fewest steps is walked, and pays as it goes
352-398   the cheapest route is walked over the top of it
398-419   hold
```

## Why one shot, and why the verdict is not the grid

The race is six panels because the comparison is the content. The verdict is one
map because the claim changed: during the race the question is how much each
search looks at, and at the end the question is what it brings back. Those are
different pictures and the second one cannot be made out of six small panels.

The sorting cut's verdict kept two of its six panels and ran them again. That
worked there because the claim was about quantity. Here it would have shown two
mazes side by side and left the viewer comparing two squiggles across a gutter,
when the entire point is that the two routes share a map, come apart at the mud,
and rejoin at the exit.

## Frame zero

Headline and mechanism together, as section 10 of the standard requires. The
clock starts thirty frames behind the frame, so the first frame a viewer sees
already has 21 cells expanded in every panel and six mazes visibly filling.

## The hero per panel

Six mazes would read as one picture six times if only the set of explored cells
were drawn, because every search here except greedy ends up looking at most of
the corridors. So the order is drawn instead: each cell keeps the colour of when
it was reached, cold at the start of the search and accent at the frontier.

That leaves each panel showing the shape of its own search, permanently, rather
than its progress:

```text
depth-first     one long ribbon committed to a wrong direction
breadth-first   even rings, laid down like contours
dijkstra        rings bent out of shape around the mud
a*              a cone leaning at the exit
greedy          a thin finger, and most of the maze still dark
bidirectional   two ramps growing toward each other until they meet
```

Greedy's panel is the one that reads at a glance and at feed size: it is 99
cells of 674, so it is mostly unlit while the other five fill.

## The clock

Mostly cubic with a linear floor, the same shape the sorting cut uses. The
totals here are close together, 469 to 658 for five of the six, so no curve
spreads their arrivals out: greedy leaves at three seconds and the other five
land in a flurry between nine and eleven. That is what the measurement says and
the cut does not pretend otherwise. The flurry is given rising cues and the
arrival order is left to be what it is.

## The verdict

Four seconds, and every part of it is motion.

The two routes are walked one after the other, not together. Together is what
shipped first and it did not read: they share most of the maze, cross each other
four times, and at a second's viewing it is two tangled lines rather than two
answers. One at a time, with the first left underneath the second, the frame
asks a legible question. Here is the short way and what it cost. Now here is the
other way.

Each walker carries a head, so something travels rather than a line lengthening,
and each route's cost counts up as it is paid.

The mud is what makes it an explanation rather than a result. Every muddy square
a walker enters lights up and stays lit, and the cost jumps nine when it does.
The route with the fewest steps ends with twenty lit squares behind it and the
cheapest ends with two, so the arithmetic is on the map: 54 clear steps and 20
muddy ones make 234, and 96 clear and 2 muddy make 114.

That tally was missing from the first cut and it is the reason the creator could
not tell what the last three seconds were showing. Two routes and two totals is
a result. Twenty squares against two is a reason.

An earlier version also drew both routes as static reveals and held. That put
2.27 seconds of the frame under six hundredths of a per cent of pixel change and
left the last two and a half seconds almost silent, over the most important
thing in the cut.

## Cue map

Two layers, the same departure from the format's default density the sorting cut
made and for the same reason, recorded here rather than assumed.

Underneath, the searching: a `probe` every sixth cell a panel expands, pitched
by how far that cell is from the start. A flood spreading outward is a rising
sweep and a search doubling back is a pitch that falls, so depth-first sounds
like what it is doing before its label has been read. Greedy expands 99 cells
against breadth-first's 658, so it is audibly the quietest panel and the first
to stop.

The pitches are quantised to a major pentatonic scale across two octaves, and
`probe` is a plucked tone that rings for about a seventh of a second rather than
a click. Getting there took three attempts and the first two are worth keeping.

The first mapped distance straight onto playback rate. The creator's verdict was
"very boring" and that was right: a few hundred clicks at arbitrary pitches is
texture, and texture at one pitch per event is noise.

The second quantised the same mapping to nine notes. It changed nothing anybody
could hear, because the range barely moved, 0.85 to 2.09 against 0.80 to 2.40,
and because the sample was a fifty millisecond click with a twenty-five
millisecond decay. A transient that short carries no pitch at all. Quantising
pitches that cannot be heard is a change on paper.

The third rebuilt the sound rather than the mapping: a tone with a fundamental
that rings, two octaves of range, and a fifth of the density, because 170
millisecond notes at fifty a second are a wall rather than a run.

And the panels are fired out of phase with each other. Every panel is on the
same clock and has spent the same number of expansions at any frame, so a
stride counted from zero made all six cross their sixteenth cell on the same
frame: six notes at once and then nothing, repeating. That is what put two
four-tenths-of-a-second silences in the opening bars and, for the rest of the
race, replaced a run with one chord struck over and over. Starting each panel a
sixth of a stride further along interleaves them.

Then the walkers fire as they go, one a frame, pitched by how far along they
are, so each walk is a run up the scale and the longer route is audibly the
longer run. Any frame that takes a walker into mud is the same voice dropped an
octave and a fourth and lifted half again in level: the cost arriving in the ear
rather than in a number. The short route hits that twenty times and the cheapest
hits it twice, so the claim survives with the screen switched off.

Over the top:

```text
76    settle   greedy runs out of work
233   settle   A*
247   settle   bidirectional
260   settle   Dijkstra, and depth-first one frame later, heard as one event
276   settle   breadth-first, last, loudest
288   appear   the grid gives way
398   land     the cheapest route reaches the exit
```

Arrival frames are read out of the same curve the picture uses, so a retime
cannot leave the sound behind. Dijkstra and depth-first expand 583 and 586
cells, which on this clock is one frame apart and one event to a listener, so
they are one cue.

Levels: the searching layer sits around -14 dBFS with several tones ringing at
once, the mud steps sit half again above it, and the track peaks at -5.2 in the
first walk, where twenty mud steps land inside a second and a half. `probe` did not exist before this
cut and was generated into `scripts/build-sfx.sh` rather than borrowed from
`swap`, which means a value landing in a slot during a sort and is a different
event.

## Colour

Six lanes is past the four the standard allows to carry their own hue, so this
is a one-accent cut. The ramp on explored ground runs from a neutral slate to
the accent, which is one hue and not two, and the accent still marks where the
work is.

The verdict has exactly two lanes and could take two hues under section 6. It
does not need them. The cheapest route wears the accent because that is the
thing being looked for, and the route with the fewest steps is drawn in white,
which is the neutral this format gives to everything that is merely true.

Mud is drawn in a warm dark so it reads as ground rather than as wall. It is
deliberately quiet during the race: the viewer needs to see that it is there,
not to look at it. In the verdict a muddy square a walker has entered brightens
to a lit gold and stays there. That is the same element in a stronger state
rather than a second accent, and it is the only thing on screen that is allowed
to compete with the routes, because it is the reason they differ.
