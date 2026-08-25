# Sound effects

Generated, not licensed. Every file here is synthesized by
`scripts/build-sfx.sh` from ffmpeg oscillators and noise sources, so the
repository owns them outright and there is no third-party term to track.

Re-run the script to reproduce the set. Do not edit the WAV files by hand.

| File       | Event it marks                              |
| ---------- | ------------------------------------------- |
| `tick`     | A named thing lands                         |
| `dissolve` | Something is dismissed and leaves the frame |
| `appear`   | A hero object is born                       |
| `settle`   | An object is placed                         |
| `send`     | Something departs along a path              |
| `land`     | Something arrives                           |
| `process`  | The machine does one named piece of work    |
| `return`   | A reply travels back                        |
| `fill`     | Data arriving, one piece at a time          |
| `name`     | A concept is named and holds                |

Levels are deliberately low. Set per-use gain in the composition rather than
regenerating a file, so one loud placement never forces the whole set down.

Narration stays the clearest layer. If an effect competes with a word, it is
wrong regardless of how good it sounds alone.
