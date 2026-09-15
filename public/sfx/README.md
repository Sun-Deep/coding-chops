# Sound effects

Generated, not licensed. Every file here is synthesized by
`scripts/build-sfx.sh` from ffmpeg oscillators and noise sources, so the
repository owns them outright and there is no third-party term to track.

Re-run the script to reproduce the set. Do not edit the WAV files by hand.

| File          | Event it marks                                    |
| ------------- | ------------------------------------------------- |
| `tick`        | A named thing lands                               |
| `swap`        | A value lands in a slot during a sort             |
| `dissolve`    | Something is dismissed and leaves the frame       |
| `appear`      | A hero object is born                             |
| `settle`      | An object is placed                               |
| `send`        | Something departs along a path                    |
| `land`        | Something arrives                                 |
| `process`     | The machine does one named piece of work          |
| `return`      | A reply travels back                              |
| `fill`        | Data arriving, one piece at a time                |
| `name`        | A concept is named and holds                      |
| `plate-lift`  | A rubber weight plate leaves a stack              |
| `plate-swish` | A weight plate crosses between pegs               |
| `plate-land`  | A rubber plate and metal hub land                 |
| `code-step`   | Execution advances to the next code line          |
| `solved`      | The completed tower resolves                      |
| `scan`        | A sequential scan running, for as long as it runs |
| `reject`      | A request is turned away                          |

Levels are deliberately low. Set per-use gain in the composition rather than
regenerating a file, so one loud placement never forces the whole set down.

They are low because narration is the loudest layer in an episode. A vertical
cut has no narration, so its gains run above one. That is expected, not a
mistake: see section 11 of `docs/vertical-format-standard.md`.

`swap` is the one effect here that is fired in runs rather than on its own. A
sorting visualiser moves a bar hundreds of times and a viewer expects to hear
that, so a cut may play it once every N writes with `playbackRate` carrying the
value that landed. It is still one cue per event; what makes it legible rather
than a drone is that the rate is tied to how much work an algorithm is actually
doing, so a panel that moves little is audibly quieter than one that moves a
lot. Do not reach for it as a rhythm track under a shot that is not about
things moving.

`scan` is the only sustained sound here, and it is the easiest one to misuse. It
marks a duration, so it belongs under a shot that is about how long something
takes and nowhere else. Reaching for it because a shot felt quiet put seven and
a half seconds of filtered noise under four separate shots of the rate limiting
cut, where nothing was scanning anything.

If a shot feels quiet, the answer is to find the event in it, not to lay
something across the whole thing.

Narration stays the clearest layer. If an effect competes with a word, it is
wrong regardless of how good it sounds alone.
