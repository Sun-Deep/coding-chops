# Learning notes

## The two rules

In order: a queue of calls. Fetch the head of the queue, carry them to their
floor, fetch the next. Nobody else gets in, even when the doors open on their
floor. When the head is dropped where the next caller is standing, the next one
gets in on the same door opening rather than a second stop.

Sweep: directional collective control, the rule real single-car lifts run.
Keep the current direction while anybody inside wants a floor that way or
anybody waiting is that way. At each floor, stop for anyone getting out and
for any caller whose button points the same way. Turn round when there is
nothing ahead. In disk scheduling this is SCAN, called the elevator algorithm;
turning at the last request rather than the end of the shaft is its LOOK form.

## Why the sweep wins on average

It combines trips. Floors 9 and 6 both had people going down, and one pass
collected four of them. The in-order car crossed the building for each rider
separately: 49 floors and 13 stops against 20 and 10.

## Why it does not win for everybody

The sweep serves the building in space order, not time order. Rider 2 was
third to press, on floor 3 going up. The car was above them going up, then
came down through 3 with a full load going the other way, and only came back
up after emptying at the ground floor, so they got out 48 seconds later than
in order. That is the price of the average and the reason real
lifts cap how long a call can wait.

## The two assumptions

2 seconds a floor and 8 seconds a stop. The sweep over a thousand scenarios
was run at four other settings (1 and 4, 2 and 4, 2 and 12, 3 and 10): the
sweep travelled fewer floors in every scenario at every setting and had the
shorter mean trip in 997 to 1,000 of them. The direction does not hang on the
numbers chosen.

## What the frame shows at each point

The first 45 simulated seconds are identical in both buildings: both cars go
up to 4, 6 and 9 for the same people. They part at 45 seconds on floor 9.
Going down, the sweep stops at 6 for you; the in-order car goes straight past,
because you are not next. That split is the reel's moment.
