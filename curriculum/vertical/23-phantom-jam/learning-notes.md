# Learning notes

## Why a tap becomes a jam

Each driver reacts to the car ahead a moment late and then overcorrects. When
the car ahead slows, the follower brakes a little harder to keep its gap, the
one behind harder again, and so on. In a stable flow the wave shrinks as it
goes back. Below a certain time gap it grows instead, until somebody has to
stop. Once cars are stopped, the jam keeps itself going: cars leave the front
of it at the rate drivers pull away and join the back at the rate traffic
arrives, so it drifts backwards round the ring as a standing wave.

## Why one car can end it

The orange car does not chase the car ahead. It holds a steady speed a little
under the flow and keeps at least 0.8 s of travel between itself and the car in
front. When a wave reaches it there is room to slow gently instead of braking
hard, so it passes no wave back. The cars behind it see a smooth car, and the
jam has nothing feeding it.

## Why the fix is fragile

It only cleared the jam where drivers follow closely (0.6 s). With 0.8 or 1.0 s
gaps the waves are slower and longer, the smoothing car's fixed target is too
low or too high for them, and it helps the average without ending the jam.
Stern et al.'s controller adapts its target speed; this rule does not.

## Why the first wave still stops cars on the replay

The tap happens before the wave reaches the orange car. The cars between the
tapper and it are human, so they stop just as on the first ring. What changes
is what happens next. That is why the numbers are measured from 50 seconds on.
