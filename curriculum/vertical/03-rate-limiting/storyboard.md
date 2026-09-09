# Storyboard

Not approved copy. `script.md` carries the copy. This is the shot plan and the
reasoning.

Geometry and reserves come from `docs/vertical-format-standard.md`. The build
order is `docs/vertical-cut-playbook.md`.

## Shot map

| Shot               | Frames     | Seconds | Hero                             |
| ------------------ | ---------- | ------- | -------------------------------- |
| Fixed window       | 0 to 236   | 7.9     | The counter going backwards      |
| Sliding window log | 236 to 416 | 6.0     | The log filling and staying full |
| Token bucket       | 416 to 566 | 5.0     | The tank running dry             |
| Verdict            | 566 to 664 | 3.3     | 2x the limit                     |
| End card           | 664 to 750 | 2.9     | The line, then the mark          |

No title card. Frame zero is the first frame of the demonstration, with the
counter already climbing and the limit beside it as the denominator.

## The rebuild

This cut was built twice and the first version was wrong in five ways.

The three algorithm shots shared a hero. Same band, same counter, same label
position. The differences between the algorithms were real and the pictures were
nearly identical, so it read as one frame shown three times.

Every shot opened on a zero. Counters started eight frames in, which is a third
of a second of a dead number at every cut.

The payoff narration ran past its own shot, so the fixed window line was still
fading over the sliding window's opening frame.

The one event in the cut, the counter reset, was never drawn. The band just
filled all the way across. The reset is the bug and drawing it is the entire
reason the cut exists.

It opened on a card stating the topic, which bought two and a bit seconds of a
still frame at the exact moment a scroll gets decided.

And its shots were longer than their animations, so the picture froze while the
clock ran on.

## The scene

A toll gate on a road. Requests are cars, driving in from the left. The limiter
is a boom barrier that either lets them through or drops across the lane. The
counter is a mechanical lane sign on a gantry over the road, and the queue that
builds behind a dropped boom is the payoff.

This is the fourth scene the cut has had, and the three before it failed the
same way for the same reason: nothing travelled across the frame. A bar
filling, a grid of squares, a tank draining, then two piles growing either side
of a grey rectangle. Every one of them was accurate and every one of them was
static, which is the structural reason none of them was worth stopping for. The
channel's best reels move something through space: a route racing across a real
map, plates being delivered, a crane lifting.

The road is also why the object question resolved itself. A request is a car
because a car is a thing that arrives, is admitted or turned away, and queues
when it is not. The token bucket's permits are discs on a rack on the booth
roof, so a car spending a permit is visibly two different objects.

Material language from `02-tower-of-hanoi/WeightPlate.tsx`: gradients across
each face, a cast shadow under anything with weight, one specular sweep. The
form comes from what the thing is.

One car is ten requests. A hundred at a readable size is four screens wide.

## Per shot

Fixed window. The lane sign runs to 100, the boom drops, traffic stops. The
clock rolls over, the sign spins back to 000 and the boom lifts while the same
queue is still sitting there. It is the only thing in the cut that runs
backwards.

Sliding window log. The same sign and the same rollover, and neither moves. The
boom stays down and the queue keeps growing.

Token bucket. A rack of permits on the booth roof instead of a sign. It empties,
the boom drops, and it refills one permit at a time.

Verdict. Three rows sliding in from the right, seven frames apart. Then the
ratio at 148.

End card. The line the cut is for, the memory cost, the mark.

## Sound

No music. Fifty-one cues, all of them short, none sustained.

The first version laid `scan`, a seven and a half second bed of filtered noise,
under four separate shots. It got reached for because the shots felt quiet, not
because anything was scanning, and the result was a hiss running most of the
reel. If a shot feels quiet the answer is to find the event in it.

A counter climbing gets seven `fill` cues across it, one per ten requests. That
is a meter ticking rather than a bed, and the difference is that a tick is tied
to the number moving on screen. The gain rises across the run, because a counter
is under more tension at 90 than at 10, and the rise carries into the `land` at
the top. They sit around -15 dBFS against accents at -3.4.

A run of requests being rejected gets no ticks. Nothing is being counted, so
nothing counts. The three requests that do get through the token bucket on
refilled tokens keep their ticks, among the rejections.

`reject` was added to the channel set for this cut. The audio contract has
always listed a reject sound for a blocked path and the set never had one.

|              Frame | Cue        | Event                                     |
| -----------------: | ---------- | ----------------------------------------- |
|                  0 | `appear`   | The cut opens on a counter already moving |
|                 72 | `land`     | The limit is reached                      |
|                 88 | `name`     | The counter resets                        |
|                158 | `land`     | The limit is reached again                |
|                170 | `settle`   | 200 holds                                 |
|                236 | `send`     | Into the sliding window                   |
|                300 | `land`     | The limit is reached and holds            |
| 310, 326, 348, 378 | `reject`   | Requests turned away, quieter each time   |
|                400 | `settle`   | 100 and 100 hold                          |
|                416 | `send`     | Into the token bucket                     |
|                476 | `process`  | The tank runs dry                         |
|      486, 504, 528 | `reject`   | Requests bouncing off it                  |
|                550 | `settle`   | 103 holds                                 |
|                566 | `dissolve` | Into the comparison                       |
|      574, 582, 590 | `fill`     | A row each                                |
|                594 | `name`     | The ratio                                 |
|                664 | `send`     | Into the end card                         |
|                690 | `name`     | The mark                                  |

The heaviest sound in the set is on the counter reset rather than the end card.
The reset is the thing the cut exists to show, and it is the only moment a number
on screen goes backwards.

Rejections run in threes and fours with the gain coming down each time, so a
hundred blocked requests read as a run that settles rather than a machine gun.

## Colour

One accent, the brand orange, meaning the limiter let this through. Rejections
are neutral. Nothing is red: the frame is reporting a decision, not a fault, and
half of those decisions are the limiter working.

The one exception is the counter, which turns from chalk to accent the moment it
reaches the limit. That is the same meaning, applied to a number instead of a
request.
