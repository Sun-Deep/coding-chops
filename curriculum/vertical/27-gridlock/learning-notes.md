# Learning notes

## How the loop forms

Four one-way streets ring the block, all anticlockwise. A car on the top
street that enters the top right junction behind a full queue stops inside
it. When the light turns, the street running north up the right side cannot
cross, so its queue grows back to the bottom right junction, where the same
thing happens to a car on the bottom street, and so on round. Once all four
junctions hold a stuck car, each one is waiting on the next and none of them
can ever move. The lights keep changing and nothing happens.

## Why it is a deadlock

Coffman, Elphick and Shoshani (1971) gave the four conditions a deadlock
needs, and all four are on the road:

- mutual exclusion: two cars cannot share a junction
- hold and wait: a stuck car holds its junction while it waits for road
- no preemption: nobody can take the junction away from it
- circular wait: the four cars wait on each other round the block

Remove any one and the deadlock cannot happen. "Wait for room" removes hold
and wait: a driver never takes the junction until it can also have the road
after it. Programs that take two locks at once do the same thing, or take
locks in a fixed order, which removes the circle.

## Why the right side does not lose speed

A driver who waits still gets through as soon as the car ahead moves on. In
the model the wait-for-room grid moves about as many cars as the go-on-green
grid when traffic is light (146 against 147 a run at 4 cars a minute) and
far more once it is busy, because it never locks. With every light in step
the go-on-green grid never locks and moves slightly more (338 against 327),
so the rule costs a little when nothing would have jammed.

## What the model leaves out

Turning traffic, pedestrians, more than one lane, horns, and drivers who
reverse or squeeze past. Real gridlock usually spreads over many blocks
(Daganzo 2007 models a whole neighbourhood); one block is the smallest place
the loop can form.
