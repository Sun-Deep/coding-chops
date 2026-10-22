# Sound effects

Generated, not licensed. Every file here is synthesized by
`scripts/build-sfx.sh` from ffmpeg oscillators and noise sources, so the
repository owns them outright and there is no third-party term to track.

Re-run the script to reproduce the set. Do not edit the WAV files by hand.
Pass effect names to build only those files, for example
`scripts/build-sfx.sh ceramic-clink serving-tongs tile-step buffet-room`.

| File              | Event it marks                                     |
| ----------------- | -------------------------------------------------- |
| `tick`            | A named thing lands                                |
| `swap`            | A value lands in a slot during a sort              |
| `probe`           | A search reaches one cell                          |
| `dissolve`        | Something is dismissed and leaves the frame        |
| `appear`          | A hero object is born                              |
| `settle`          | An object is placed                                |
| `send`            | Something departs along a path                     |
| `land`            | Something arrives                                  |
| `process`         | The machine does one named piece of work           |
| `return`          | A reply travels back                               |
| `fill`            | Data arriving, one piece at a time                 |
| `name`            | A concept is named and holds                       |
| `plate-lift`      | A rubber weight plate leaves a stack               |
| `plate-swish`     | A weight plate crosses between pegs                |
| `plate-land`      | A rubber plate and metal hub land                  |
| `code-step`       | Execution advances to the next code line           |
| `solved`          | The completed tower resolves                       |
| `scan`            | A sequential scan running, for as long as it runs  |
| `reject`          | A request is turned away                           |
| `ding`            | A lift arrives at a floor and its doors open       |
| `beep`            | A shopper reaches a checkout and is scanned        |
| `brake`           | A car brakes                                       |
| `lift-chime`      | A lift arrives at a floor                          |
| `lift-door-open`  | Lift doors slide open                              |
| `lift-door-close` | Lift doors slide shut and meet                     |
| `lift-door-bump`  | Closing lift doors meet an arm and open again      |
| `lobby-room`      | The air of a stone-floored lobby, no voices        |
| `lobby-step`      | A heel lands on a stone lobby floor                |
| `floor-blip`      | A lift's floor display moves on by one             |
| `ev-whine`        | An electric motor pulls away, rising in pitch      |
| `fan-hum`         | A suction fan holds a car to a ramp                |
| `ramp-release`    | A car lets go of a ramp: a heavy metal clunk       |
| `fall-air`        | Air rushes past a falling car, slowed down         |
| `jet-hiss`        | A cold-gas thruster opens and hisses               |
| `roof-crash`      | A car lands on its roof                            |
| `tyre-land`       | A car lands on its wheels                          |
| `pad-air`         | Open air over a concrete test pad                  |
| `rain-bed`        | Heavy rain on a street                             |
| `roof-patter`     | Rain drumming on a bus shelter roof, from under it |
| `thunder`         | Distant thunder                                    |
| `wet-step`        | A foot coming down on a wet pavement               |
| `street-air`      | Distant traffic at a suburban junction             |
| `signal-click`    | A traffic signal's relay changing                  |
| `engine-pull`     | A car pulling away through first gear              |
| `tyre-roll`       | A car rolling through without stopping             |
| `buffet-room`     | Air through powered buffet warmers                 |
| `ceramic-clink`   | A serving utensil touches a ceramic plate          |
| `serving-tongs`   | Tongs touch the rim of a serving tray              |
| `tile-step`       | A shoe lands on a tiled floor                      |

Levels are deliberately low. Set per-use gain in the composition rather than
regenerating a file, so one loud placement never forces the whole set down.

They are low because narration is the loudest layer in an episode. A vertical
cut has no narration, so its gains run above one. That is expected, not a
mistake: see section 11 of `docs/vertical-format-standard.md`.

`swap` and `probe` are the two effects here fired in runs rather than on their
own. A
sorting visualiser moves a bar hundreds of times and a viewer expects to hear
that, so a cut may play it once every N writes with `playbackRate` carrying the
value that landed. It is still one cue per event; what makes it legible rather
than a drone is that the rate is tied to how much work an algorithm is actually
doing, so a panel that moves little is audibly quieter than one that moves a
lot. Do not reach for it as a rhythm track under a shot that is not about
things moving.

`scan` is a sustained sound, and it is the easiest one to misuse. It
marks a duration, so it belongs under a shot that is about how long something
takes and nowhere else. Reaching for it because a shot felt quiet put seven and
a half seconds of filtered noise under four separate shots of the rate limiting
cut, where nothing was scanning anything.

If a shot feels quiet, the answer is to find the event in it, not to lay
something across the whole thing.

`buffet-room` belongs to a room with powered hot trays. It is ventilation,
without voices or music, under the footsteps and serving sounds. VR34 keeps
it below the material events, following the room sound in VR32 and VR33.

Narration stays the clearest layer. If an effect competes with a word, it is
wrong regardless of how good it sounds alone.
