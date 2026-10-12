# Storyboard

Both buffets stay visible throughout. Their paired counter is one continuous
hero object. Changing rooms mid-cut would make a speed difference harder to
judge, so this uses the simultaneous race pattern of VR28, VR31 and VR32.

| Frames  | Event                                                                                                                      |
| ------- | -------------------------------------------------------------------------------------------------------------------------- |
| 0-54    | Slow diner already serving salad. Dessert-only diner waits above and walks past below. Headline and both policies visible. |
| 54-90   | Both clocks accelerate together. The dessert-only diner reaches dessert below.                                             |
| 90-230  | Top queue grows through the foreground and counter. Below, serving positions work independently. Plates leave right.       |
| 230-316 | Completed plate counters give way to the 100-run averages. The fairness receipt appears at 276. Rooms continue moving.     |
| 316-420 | Written narration names head-of-line blocking. The cost stays visible while the race continues.                            |

## Physical scene

Dark timber wall panels, warm pendant lamps, stone counter, steel food trays,
glass sneeze guard, stacks of plates and tiled floor. Eight dishes have their
own food shapes. Diners have fixed clothes, skin, hair, build and height in
both rooms. They hold plates, walk, idle and scoop. All motion uses Remotion
frames. The top's incoming line turns from the foreground toward salad; the
bottom has a bypass aisle and local queues at the dishes.

Positions come from the simulation and settle over four display frames. The
same positive smoothing preserves the no-pass ordering. The top's foreground
queue is a drawn bend in its continuous path, not extra serving capacity.
Finished diners leave the frame; counters read the simulated finish times.

## Colour

Orange has one meaning, a slow diner or the line that diner blocks. Floor
strokes under blocked people carry that same meaning. Food, wood, skin and
clothes use muted material colours, following the physical-scene treatment
of VR32. They do not identify policies or outcomes. Numeric results stay chalk.

## Sound

A rejection as the salad pause becomes legible, a departure cue as skipping is
explained, a plate landing when the dessert-only diner finishes below, a probe
as the blocked line is explained, another plate event, a settle for the
average, a rejection for the fairness cost and a settle for the computing
name. Effects come from the repository's generated set. No music bed.

## Safe geometry

Headline starts at y 232, conditions at 424, rooms at 494 and 926. Both rooms
are x 150 to 930 and end above the narration reserve at y 1300. Fairness is
at 1276. Narration ends on the shared baseline at 1460. The cover keeps its
headline, both rooms and lockup inside the centred square crop.

## Render checks

420 video frames at 30 fps, 1080 x 1920. AAC container duration 14.059 seconds.
Reviewed the complete muted playback at a 360-pixel width, then played with
sound. The final audio peak is -5.3 dBFS. The quarter-size opening reads, all
five narration intervals clear the safe-area overlay, and both cover crops
retain the headline, rooms and lockup. The longest run of near-still frames
under YAVG 0.06 is 0.4 seconds. Typecheck, lint, formatting, curriculum
validation and composition discovery pass.

The understanding check stays unticked. The creator has not passed it, and
this cut is not marked publish-ready. Source files and recorded measurements
ship together; generated renders remain under ignored out/.
