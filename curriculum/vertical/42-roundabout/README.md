# Vertical 42: roundabout or traffic lights

Status: posted 2026-10-21

## What it claims

The same junction of two single-lane roads, the same 1,800 cars an hour,
built once with traffic lights and once as a roundabout. On average over
20 simulated hours, a car gets through the lights in 37.4 seconds and
spends 6.9 of them standing still; through the roundabout it takes 32.4
seconds, 5 seconds sooner, and stands still for 1.0. 58% of cars stop at
the lights, 21% at the roundabout. The computing idea: lights are a lock,
one road holds the junction while the other waits; a roundabout is
lock-free, everyone goes when there is a gap.

## Why this topic

A fight people already have, in the countries that pay most (US, UK,
Canada, Australia): roundabouts are either the best thing on the road or
a confusing slowdown. The zipper merge, the last driving argument, did
324K. The last four reels sat on the floor across topics, so this one also
changes the look: one edge-to-edge drone view of a town, no panel frames,
no side column, very little text.

## Scope and honesty

Both camps are partly right and the reel says so. The roundabout slows
every car to about 17 mph, so on empty roads late at night the lights win
(30 cars an hour on each arm: 25.0 s against 26.6 s). At every busier
setting swept, from 60 to 650 cars an hour on each arm, with a busy main
road and a quiet side road, with 40% of cars turning left or none, with
fixed-time lights, a longer maximum green or a shorter gap-out, the
roundabout gets cars through sooner and stops fewer of them.

The lights are not a straw man: they are actuated (green held while cars
keep coming, 8 to 32 seconds), each arm has a left-turn lane, and left
turns wait for a 4.5 second gap in oncoming traffic. Without the left-turn
lanes the first version jammed at 450 cars an hour, which is a real
junction but not a fair one. The first measured version also let left
turners and cars on the ring drive through each other, and that is what
made the lights look faster at rush hour; once nothing could collide, the
rush-hour reversal went away.

The car model is the Intelligent Driver Model. Cars leave a standing queue
at the lights every 2.00 seconds (1,800 an hour; the Highway Capacity
Manual's base is 1,900). At the roundabout a driver goes when the next car
coming round is at least 3.25 seconds from the merge and 1.5 seconds
behind where they can get to; with that, the model's entry capacity is
within about 1% of the Highway Capacity Manual (6th edition) curve at
about 650 cars an hour going round, 12% above it on a quiet ring and 25%
below it on a busy one, which is hard on the roundabout. Two brief
overlaps remain in an hour of roundabout traffic, both at the west entry
and neither in the reel's window.

"Standing still" is any time below 0.5 m/s. "Through in" is from 150 m out
on the way in to 150 m out on the way out. The followed car is picked by
rule: from the west, straight on, closest to the averages.

## Files

- `src/vertical/42-roundabout/`: the model, the overlays and the reel
- `scripts/measure-roundabout.mjs`: the committed run
- `scripts/blender/roundabout/`: the town, the cars and the render
