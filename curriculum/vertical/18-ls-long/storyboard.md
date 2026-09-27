# Storyboard

420 frames, 14.06 seconds. One object, the key, with a band under it that
changes per beat.

## The object

The terminal holds the real line all the way through. Seven tokens leave it one
at a time and land in the key, each with what it is beside it. The first three
leave before frame zero, so the opening frame has the key half built and a
token in the air.

## The beats

| Frames  | Beat  | What happens                                                        |
| ------- | ----- | ------------------------------------------------------------------- |
| -20-68  | key   | seven tokens fly from the line into seven rows                      |
| 70-106  | chmod | rwx r-x r-x drop from the mode into the band and become 7 5 5       |
| 114-150 | hand  | each digit handed to owner, group, everyone, the rows lighting up   |
| 148-212 | point | links to name lit one after another as line three names them        |
| 206-224 | swap  | the file becomes the folder: d, 2, 4096, logs roll in               |
| 234-284 | count | 363 squares, 361 accent, the folders in Debian's /usr               |
| 294-370 | proof | `ls -l logs` typed, the 10 MB file listed, 4,096 against 10,485,760 |
| 378-420 | note  | the size row says what 4096 is                                      |

## What the first render got wrong

The hand-over beat did not exist. The digits landed and nothing happened until
line three, a 0.77 second held frame and 1.2 seconds of silence. The missing
event was already promised by the owner and group rows' own notes, so it went
in. Three smaller gaps were closed by moving beats, not by adding sound.

## Colour

One accent, marking what is being looked at: the token in flight, the lit row,
the lit column in the terminal line, and 4096 from the swap onward. The
exception rule is the count's two squares that are not 4096, drawn neutral.

## Cue map

| Cue    | Sample      | Fires on                                              |
| ------ | ----------- | ----------------------------------------------------- |
| land   | `tick`      | each token landing, climbing across the line          |
| lift   | `tick`      | the triplets leaving the mode                         |
| drop   | `tick`      | the triplets landing in the band                      |
| digit  | `tick`      | each chmod digit, harder                              |
| hand   | `probe`     | each digit handed over, a rising triad                |
| point  | `tick`      | each row lit by line three                            |
| swap   | `tick`      | each column that changes, then `settle`               |
| count  | `probe`     | every eleventh folder, pentatonic; the two others low |
| key    | `code-step` | each character of `ls -l logs`                        |
| output | `appear`    | the listing arriving                                  |
| climb  | `tick`      | each tenth of 10,485,760                              |
| note   | `name`      | the size row saying what 4096 is                      |

## Review

- Peak -6.1 dBFS. One silence over 0.35 seconds at -45 dB: the closing 0.52.
- Longest held frame 1.47 seconds, the end, under the 1.5 limit.
- Frame 15 at quarter size: headline readable, key half built.
- Safe area overlay clean on every beat; the key and band stay inside 150 to 930.
- Cover survives the 1:1 and 3:4 crops.
