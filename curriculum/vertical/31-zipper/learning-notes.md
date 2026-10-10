# Learning notes

## What the cones decide

Past the cones there is one lane, so the number of cars that get through an
hour is fixed by that lane, not by how anyone merges. Merging early does not
let more cars through, and neither does the zipper. What the rule changes is
the order, and so who waits.

## Why the early mergers pay

If most of the ending lane moves over early, that lane is nearly empty, so
the few who stay in it reach the cones with almost no one ahead of them.
Drivers there let them in one at a time. Every car let in at the front is
one more car ahead of everyone in the long queue.

## Why the zipper is fair

With both lanes used to the cones, both queues are about the same length,
and one from each in turn means nobody arriving later goes first. That is
round-robin: each queue gets the next turn in rotation.

## Round-robin's catch

Round-robin is fair between queues, not between cars. A short queue gets
the same turns as a long one, so its cars go faster. That is the early-merge
picture exactly: turn about at the front still happens, but one lane is
almost empty. Operating systems and network switches meet the same problem
and balance the queues, or weight the turns, to fix it.

## The queue

Two lanes of queue hold twice as many cars per metre as one, so the zipper
queue is less than half as long. On a real road that is the difference
between the queue reaching back past the previous exit or not.
