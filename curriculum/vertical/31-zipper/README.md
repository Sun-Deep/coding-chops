# Vertical 31: merge early, or drive to the cones

Status: posted 2026-10-09, understanding check open

## What it claims

Where a lane ends at a row of cones, one car gets through every couple of
seconds whatever anyone does. If most drivers in the ending lane move over
as soon as they see the sign, that lane empties, and the few who stay in it
drive to the cones and get let in at the front. The polite drivers pay for
it. If everyone uses both lanes to the cones and they go through one from
each lane in turn, the zipper merge, nobody gets past anybody. Taking turns
between queues is round-robin, how a computer shares one processor between
programs.

In the model, at the defaults, drivers who move over early lose 111 seconds
to the queue, the same drivers lose 95 with the zipper, and the ones who
stay in the ending lane lose under 2. The queue is less than half as long.
The same number of cars get through the cones either way.

## Why this topic

Late merging is an argument people already have: "they're cutting in"
against "that's what the lane is for". The comments on the plane, escalator
and microwave reels came from arguments like this. And unlike the hallway
reel, the race does not end early: the queues and the count of cars that
got past you keep moving until the payoff.

## Scope and honesty

The cones are a fixed capacity: one car every 2.25 seconds, about 1,600 an
hour, near the figure usually quoted for one lane at a work zone. Who goes
through when is decided by that and by turn about, not by how the cars are
drawn. The share of drivers who stay in the ending lane when everyone else
moves over is not something the model can take from data; the script sweeps
it from 0 to 50%. At 0% the two rules cost the same; the polite drivers'
loss grows with the share who stay. Zipper drivers are allowed to switch to
the other lane when it is 2 or more cars shorter, because with no balancing
round-robin favours the shorter queue.

The reel follows car #109 of seed 1, the first to arrive in the ending lane
after 3 minutes who moves over early. It loses 77.0 s against 63.5 s, a
smaller gap than the average (111 against 95).
