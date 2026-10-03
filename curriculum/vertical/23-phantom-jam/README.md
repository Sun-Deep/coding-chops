# Vertical 23: why traffic jams happen for no reason

Status: built, not posted

## What it claims

22 cars drive round a 230 m ring with nothing in the way. One driver brakes
for three seconds and then drives on. Each driver behind brakes a little
harder than the one in front, the red travels backwards round the ring, and
the jam never clears: for the rest of the run up to 9 cars stand still at
once and the ring averages 13.6 km/h against the 26 it was doing.

Replay the same seconds with one car, the orange one, holding a steady speed
and leaving a gap instead of chasing the car ahead. The same tap sends the
same first wave, the wave dies at that car, and from 50 seconds on no car
stops and the ring averages 23.5 km/h.

## Why this topic

The creator's pick, from the Explore study's pattern: an everyday thing
everyone has sat in, the same cars under two rules, and a result you can see
without reading. The tech is the cause and the fix: every driver is running a
small rule, the jam is what that rule does at scale, and the fix is one car
running a different rule.

## Scope

The physics is the Intelligent Driver Model on the ring Sugiyama et al. used in 2008. The smoothing rule is a simplification of the idea Stern et al. tested on
a real track in 2018, not their controller.

The jam is robust: it formed in 1,020 of 1,080 simulated runs across 54 driver
settings. The fix is not: one smoothing car cleared the jam completely in 355
of those 1,020, all of them settings where drivers follow closely (a 0.6 s
gap), and raised the ring's average speed in 898 of 1,080. The reel shows one
of the settings where it works and the caption says that it does not always.

The reel runs at twelve times real time.
