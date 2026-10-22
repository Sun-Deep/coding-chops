# Vertical 38: should you hold the elevator door

Status: posted 2026-10-16

## What it claims

Holding the lift for someone running gets them up sooner, and everyone
already inside, and everyone who comes after, pays for it. In the model,
holding for anyone up to 15 seconds away gets the people held for to their
floor 17.1 seconds sooner on average and everyone else 14.5 seconds later,
and about three people pay for each one held for. Whoever got into a held
car first, and so stood inside for every hold, got there 47.5 seconds
later. The morning as a whole is 9.8% slower. Holding only for someone a few steps away (up to 5 seconds)
makes the morning about 2% faster.

Holding the doors is batching: waiting so that more goes in one trip.
Networks do it with small packets and databases with writes, and the catch
is the same: everything already in the batch waits too.

## Why this topic

Everyone has held a lift door or watched it being held, and both camps are
sure: it is polite and costs two seconds, or it holds up a car full of
people for one late person. The answer depends on how far away they are,
which gives both camps a point.

## Scope and honesty

One lift, an up-peak morning, seeded arrivals, assumed timings: 2 s a
floor and 8 s a stop as in VR21, 1 s to step in, doors closing 3 s after
the last person. The script sweeps how far away people can be and still be
held for, how busy the lobby is, the number of floors, stop time, door
timer and car size. Holding for anyone up to 15 s away is slower overall in
12 of the 13 settings and about even in a 20-floor building, and the first
one into a held car is 24 to 69 seconds later at every setting. One single
hold is close to a coin flip, because it changes which later people catch
which car; the claims are about averages, over 19,836 people and the 1,895
first ones in.

The reel shows seed 1. The followed person is #181, bound for floor 9: the
first one into a held car whose extra time, 48.7 s, is closest to the
100-morning average for first ones in. On top they reach the lift 0.3 s
after its doors shut on a full car that had been held 75 s for runners,
wait for it to come back late, get in first, and stand through two more
holds, 29 s; out 3:18 after reaching the doors. Below they wait for the
car and ride up: 2:29.

## How it got here

The first framing measured one runner added to a morning. Single holds
turned out to be dominated by knock-on effects (one moved later trips by
11 minutes), so a followed moment could not stand for the average. The
reel compares two whole mornings instead, like every reel before it. The
first cut followed someone close to the everyone-else average, 12.6 s
later, and the creator found the difference too small to see; the person
who pays most is the one standing inside, so the reel follows the first
one in and says so.
Rendered in Blender (`scripts/blender/elevator/`) with Quaternius's CC0
characters; Remotion lays the headline, labels, narration and sound over
the two renders.
