# Storyboard

420 frames, 14.06 seconds. Two towers of the same app's layers, built side by
side, then rebuilt one at a time after the same one-line change.

| Frames  | Beat    | What happens                                                                                                                         |
| ------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| -40-60  | build   | both towers build top to bottom; 67 packages land in each install                                                                    |
| 56-92   | edit    | server.js turns orange over both towers; line 11 gains `page: 1`                                                                     |
| 98-196  | left    | package\*.json and server.js fly into `COPY . .`: input changed; the orange runs down through the install, which empties and refills |
| 204-248 | right   | package\*.json flies into its COPY: cached; the install stays; server.js flies into the last COPY: input changed, nothing below      |
| 262-282 | verdict | 4.37 MB + 30 KB, 67 packages / 30 KB, 0 packages                                                                                     |
| 294-350 | move    | the COPY . . line is carried along an arrow to where it sits on the right                                                            |

## What the second version fixed

The first version was right and did not explain anything. A cursor stepped
down each tower and labelled blocks "cached" or "ran again", so the viewer was
told the outcome and never shown the cause. Two things were missing.

Which step the changed file goes into. A COPY's cache key is the contents of
what it copies, so the build context's files now sit over each tower and fly
into the step that copies them. The changed one is orange. On the left it
lands in `COPY . .`, above the install. On the right it lands in the last step.

What happens below a changed step. The rule, that every step under a changed
one runs again, is now drawn as an orange line running down the tower from the
first changed step, with a bright edge sweeping across as it goes, and said by
the narration while it happens.

## What the first renders got wrong

The edit sat alone for two seconds with nothing else moving, and the typing is
too small a change for the frozen-frame check to count. The diff and both
rebuilds were pulled earlier until every gap closed. The ending was a finished
frame for three seconds; now the line that moved travels to its place, which is
the lesson happening rather than being stated.

The install's count line first wrapped onto the package squares, and the
cover's headline at 70px wrapped into its second line. Both caught in stills.

## Colour

One accent, work being redone: a step that ran again, packages reinstalled,
the changed line, the line that moved. Cached work stays neutral.

## Cue map

| Cue     | Sample                 | Fires on                                                          |
| ------- | ---------------------- | ----------------------------------------------------------------- |
| slab    | `tick`                 | each step appearing on the first build                            |
| fill    | `probe`                | every fifth package landing, pentatonic, rising                   |
| diff    | `appear`               | the diff card                                                     |
| fly     | `send`                 | a COPY's files leaving for it; the changed file louder and higher |
| type    | `code-step`            | every other character of the new line                             |
| step    | `tick`                 | a step checked and found cached                                   |
| ran     | `settle`               | a step that runs again                                            |
| dump    | `dissolve`             | the code-first install emptying                                   |
| refill  | `probe`                | every fifth package landing again                                 |
| pulse   | `appear`               | the packages-first install found cached                           |
| verdict | `tick`                 | six rising ticks as the count lands                               |
| move    | `send`, `tick`, `name` | the line leaving, passing each step, arriving                     |

## Review

- Peak -7.1 dBFS. One silence over 0.35 seconds at -45 dB: the closing 1.45.
- Longest held frame 1.07 seconds, at the end.
- Frame 15 at quarter size: headline readable, both towers building.
- Safe areas clean; both towers and the diff stay inside 150 to 930.
- Cover survives the 1:1 and 3:4 crops.
