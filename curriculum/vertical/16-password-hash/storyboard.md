# Storyboard

420 frames, 14.06 seconds, one object, three passes.

## The object

A login box with a password field, and under it the row a site keeps instead of
the password: 64 hex characters, 16 across by 4 down, at 44px, which is about
15.5 points on a phone. chmod's switches ran at 19.7 and its arithmetic at 11.6,
and that cut is the one that earned "the best explanation I've ever seen", so
the row is sized to sit between them rather than below.

The row is recomputed from the field on every keystroke by the SHA-256 in this
folder. Cells turn over in a wave that lags across the row, so a keystroke reads
as sixty-four characters rolling rather than sixty-four things blinking at once.

## The three passes

| Frames  | Pass    | Field     | Ends on  |
| ------- | ------- | --------- | -------- |
| 0-139   | sign up | `hunter2` | SAVED    |
| 140-279 | log in  | `hunter3` | NO MATCH |
| 280-419 | log in  | `hunter2` | MATCH    |

Each pass is the same four beats. Typing from local frame 4, a character every
six frames. A comparison crossing the row from 54 to 112, one cell at a time,
lighting what came back. The count climbing as it goes. The verdict sliding in
at 114.

## Why a sweep rather than a reveal

The count has to be arrived at rather than announced, which is VR07's live ratio
lesson. It also solves the frozen frame problem that has cost this format four
render cycles: a comparison crossing sixty-four positions is something travelling
across the frame for nearly two seconds of every pass, and the longest held
stretch in the finished cut is 0.27 seconds.

## Why the middle pass is the cover

It is the only state where the claim is visible as a picture: three filled cells
in a field of sixty-one dim ones, with the count and the refusal underneath. The
held frame is local 135, after the typing, after the comparison and after the
verdict has finished sliding, because VR14's cover was caught mid scan and mid
typing at once.

## Cue map

| Cue      | Sample      | Fires on                                  |
| -------- | ----------- | ----------------------------------------- |
| key      | `code-step` | each keystroke, 7 a pass                   |
| ring     | `probe`     | a position that came back the same        |
| knock    | `probe`     | every other position that did not, an octave and a fourth down |
| verdict  | `solved`    | SAVED and MATCH                           |
| verdict  | `reject`    | NO MATCH                                  |

## Colour

One accent. The orange is a character that survived, a character being typed,
and a door that opened. Everything else is neutral. The refusal chip is
deliberately not red: this is a one accent cut, and VR12 settled the same
question by striking through its switched-off values in a neutral rather than
reaching for a second hue.
