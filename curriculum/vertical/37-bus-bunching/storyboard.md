# Storyboard

One continuous side view follows the orange bus. Open with that bus alone,
boarding a queue. The following bus is farther down the same route, outside
the camera's view. It reaches its passenger stop by frame 54, or 1.8 seconds.

The camera widens between frames 0 and 30 as the following bus approaches.
At frames 23 and 35, it gives two short horn taps with matching high-beam
pulses. It repeats that pair every 54 frames through the end of the video.
The lamp brightens inside its housing, with a soft local bloom, a
short horizontal streak and a faint road reflection. There is no beam wedge.
Each pulse rises over two frames, holds for three and fades over five.
The following bus brakes at its stop at frame 54 and picks up thirteen
passengers between modelled seconds 52.25 and 89.75, departing at frame 125.
Its label says "Picking up" during boarding. The orange bus is also boarding
through most of this interval. The queues shrink and people walk into both
doors. The following bus later clears smaller queues, catches up and reaches
the clearance behind the orange bus at frame 240. The orange bus is still boarding. The following bus
brakes, its wheels stop, and its label becomes "Blocked". The orange bus's
label reads "Still boarding". The gap between the buses has no arrow.

Frames 240 to 325 hold the real modelled blockage for about 2.8 seconds of
screen time. Passengers continue boarding the first bus while the second
cannot move. The subtitle says "Now it has to wait." The constraint is visible
as "One lane. No overtaking." This explains why it cannot drive past.

At frame 325 the orange bus finishes boarding and moves away. The following
bus can then move into the stop. The readout reports the completed blockage,
rounded from 22.75 to about 23 seconds. The buses continue through the end as
the final narration names positive feedback.

## Geometry

The camera follows the front bus. A monotone projection compresses road
distances and reserves room for enlarged bus shapes. The opening shows less
of the road behind the first bus; the later widening reveals its follower.
This changes framing, not model positions, driving speeds or bus order.
Do not infer metres or speed from screen pixels. Passengers, stop posts,
buses and road markings share the projection. The subtitle band below y 1300
is reserved. The canvas and safe-area rules are unchanged.

## Brake lamps

Both buses have rear brake lamps. They brighten over the six frames before
each passenger stop or blockage, stay lit while stopped, then fade over four
frames as the bus leaves. Stop intervals come from the same simulation as
the bus positions. The glow stays around the lamp, with a faint reflection
on the road.

At the creator's request, this cut makes one exception to the single-accent
rule. Physical brake lamps and their reflections use red so braking is
recognisable without another label. Red appears nowhere else and never
identifies a bus or a text label. Check moving, braking, waiting and departure
frames at feed size to confirm the red signal follows the stop. This exception
applies to VR37 only.

## Sound

Brakes mark the orange bus reaching a stop and the following bus stopping
behind it. Selected boarding events get a quiet tick. The final explanation
gets one cue. The follower's horn taps start at about 0.77 and 1.17 seconds,
each lasting 0.2 seconds. The pair repeats every 1.8 seconds through the end,
including boarding, the blockage and the final departure. The final pair
starts at about 13.37 and 13.77 seconds. This repeated signalling is the
creator's requested performance for VR37. There is no music or engine drone.

## Review targets

The second bus must be absent from the opening, arrive within two seconds,
visibly pick up passengers and stay stopped behind the first bus later. Check the approach, brake, wait
and release separately. The result must appear after the measured blockage
ends. Inspect every subtitle and watch the complete render at feed size.

## Cover

The cover uses the reel's buses and passenger figures. The orange bus boards
a queue beside the stop sign while the following bus sits close behind.
Both brake lamps glow red and the following bus's high beams are lit, with
the same lamp bloom and road reflections as the reel. There is no arrow.
The queue count comes from `MEASURED.nextQueue`, with one person at the door.
This is a dedicated cover composition rather than a simulation snapshot.

The headline, passengers, buses and lockup fit between y 480 and 1415, inside
the square crop. The street fades into the dark canvas. Check the square
and 3:4 crops at feed size before replacing the cover.
