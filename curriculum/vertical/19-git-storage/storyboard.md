# Storyboard

420 frames, 14.06 seconds. Three objects that never leave: the file, the store,
the terminal.

| Frames  | Beat    | What happens                                                 |
| ------- | ------- | ------------------------------------------------------------ |
| -14-8   | commit  | a copy of the file flies into the store, 5,138 B             |
| 34-77   | edit    | line 80 retyped to zeros, one character a frame, marked      |
| 72-100  | diff    | `git diff` prints the real - and + line                      |
| 106-158 | commit  | a second whole copy flies in; the store reads 10,257 B       |
| 176-236 | sweep   | a line runs down both copies: 159 of 160 lines same as v1    |
| 240-292 | gc      | `git gc`; v1 crushed to a 68-byte sliver, "delta against v2" |
| 286-312 | pack    | `git verify-pack -v`, the two blob rows                      |
| 318-354 | rebuild | "take v2, put back line 80", the old value typed out         |

## What the first plan got wrong

It held two still blocks for two seconds after the second commit and a finished
frame for the last three. Both gaps were missing events, not missing sound. The
sweep makes "the whole file again" something the frame shows. The rebuild card
answers the question the number raises: 68 bytes of what.

The first cover held the frame where `git gc` was half typed, and the sweep
bars were parked on the last line. Both fixed: the cover holds frame 238, and
the sweep stops existing when it ends.

## Colour

One accent, the change: line 80 in the file and in v2, the + line of the diff,
the delta, and the 68.

## Cue map

Gains are derived from each file's measured peak in `cues.ts`.

| Cue     | Sample                        | Fires on                                                           |
| ------- | ----------------------------- | ------------------------------------------------------------------ |
| land    | `land`                        | each copy arriving                                                 |
| count   | `tick`                        | six rising ticks as each size counts up                            |
| edit    | `tick`                        | every fourth character of line 80                                  |
| type    | `code-step`                   | every other character of each command                              |
| diff    | `appear`                      | the diff lines                                                     |
| send    | `send`                        | the second copy leaving                                            |
| sweep   | `probe`                       | every eighth line, pentatonic; line 80 an octave and a fourth down |
| gc      | `process`                     | the pack starting                                                  |
| crush   | `tick`                        | eight ticks falling as v1 shrinks                                  |
| pack    | `tick`                        | each verify-pack row                                               |
| rebuild | `appear`, `code-step`, `name` | the card, its value typing, the landing                            |

## Review

- Peak -6.6 dBFS, after lowering line 80's sweep note, which stacked to -4.0.
- One silence over 0.35 seconds at -45 dB: the closing 1.3.
- No held frame under the threshold anywhere.
- Frame 15 at quarter size: headline readable, copy in flight.
- Safe areas clean; the store and terminal stay inside 150 to 930.
- Cover survives the 1:1 and 3:4 crops.
