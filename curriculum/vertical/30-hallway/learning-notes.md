# Learning notes

## Why the dance repeats

Two moves that start within a fraction of a second of each other are made
blind: neither person has seen the other move yet. After a bump both are on
the same side, and the obvious move for each is back to the open side, so if
they move together again they mirror again. Symmetry plus identical timing
is a loop. In computing that is a livelock: everyone is busy and nothing
gets through.

## Why a random wait ends it

If each waits a random moment first, the two moves rarely start together.
Whoever moves first commits; the other sees it and goes the other way. The
wait only happens after a bump, so pairs who pass cleanly pay nothing.

## Where computers do it

Ethernet's binary exponential backoff and Wi-Fi's contention window: after
a collision each device waits a random number of slots before retrying, and
the range doubles after each further collision.

## The other fix

A convention: everyone keeps right. Then nobody ever chooses, and nobody
dances. Networks use the same idea where they can, by giving turns or
priorities, and fall back on random backoff where they cannot.
