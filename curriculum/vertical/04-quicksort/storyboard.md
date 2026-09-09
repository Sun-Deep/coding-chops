# Storyboard

Not approved copy. `script.md` carries the copy. This is the shot plan and the
reasoning.

Geometry and reserves come from `docs/vertical-format-standard.md`.

## Shot map

| Shot           | Frames  | Seconds | Hero                                         |
| -------------- | ------- | ------- | -------------------------------------------- |
| Race           | 0-330   | 11.0    | One field lapping the other twelve times     |
| Cleave         | 330-445 | 3.8     | The lit range halving, then halving          |
| Already sorted | 445-555 | 3.7     | A counter running over bars that do not move |
| Writes         | 555-665 | 3.7     | One field filling with orange, one not       |
| Verdict        | 665-745 | 2.7     | 12.8x, then the catch under it               |
| End card       | 745-805 | 2.0     | The line, then the mark                      |

No title card. Frame zero is both fields already mid-run, six frames of
comparison already on the clock.

## The format change this cut is testing

The first three vertical cuts put a diagram in a box in the middle of the frame
and left the rest dark. VR03 did 3K. This one runs a field of two hundred bars
the full 1080 wide.

Horizontal bleed is free. Nothing the platform draws lives on the left or right
edge, so a field can run edge to edge and should.

Vertical bleed is not free and the first cut of this shot got it wrong. It
anchored the bars to the top and bottom edges of the frame on the theory that
artwork may cross a reserve as long as text does not. What that did was fill the
header band with bar roots and push the short half of the sorted ramp underneath
the caption and the progress bar. The picture was not crossing the reserve, the
data was. Both reserves are real interface. The bars now stand between them, on
baselines at 270 and 1300, and every tip is inside 190 to 1500.

## The scene

Two fields of two hundred bars, facing each other across a single row of
counters. The top field hangs from its baseline, the bottom stands on its own,
so the two runs read as two runs rather than as one picture.

Bone bars on a near black ground. Contrast is carried by value rather than hue,
which survives a phone in daylight and leaves the accent free to mean what it
means everywhere else in the format: the thing currently being looked at.

## Per shot

Race. Both fields compare at sixty-two comparisons a frame. Nothing is time
warped, so the gap is not a claim, it is how long each algorithm takes at a
fixed budget. Quicksort lands its first run at frame 20, holds eighteen frames
so the finish can be read, then scatters and goes again, and again, until the
tally reads twelve. Selection sort finishes one pass at frame 315.

The two counters read the same number nearly all the time and that is the point.
The rate is shared, so the count is not what differs. The tally beside it is.
An earlier version stacked the two counters down the middle of the frame and the
matching numbers read as a rendering fault rather than as the claim.

Cleave. The race is honest about quicksort being cheap and says nothing about
why, because at sixty-two comparisons a frame the mechanism is a blur. This is
one run at sixteen a frame, with the partition in play lit and everything
outside it dropped back, so the lit stretch visibly halves and halves again. A
cut that sells an algorithm and never draws its mechanism is a scoreboard.

Already sorted. The bars are in perfect order and never move. The rake runs
anyway and the counter reaches 19,900 with the swap count sitting on zero. It
runs at a hundred and eighty comparisons a frame because it is a separate
demonstration rather than part of the race; the counter is the honest thing and
it is untouched.

Writes. The field stops being about order. A bar lights by how many times it has
been written, so selection sort stays nearly dark at 384 and quicksort fills in
at 1,228. The threshold sits at three writes, between selection's mean of 1.92
and quicksort's of 6.14, because both algorithms touch nearly every position at
least once and an earlier version that coloured anything with a write in it made
the two fields the same colour and threw away the comparison.

Verdict. Two rows, then the ratio, then the catch under it, so the shot has
three events rather than one and a hold.

End card. The line, then the mark, with the corner watermark handing over on the
same beat so only one lockup is ever on screen.

## Sound

No music. Effects only, cut to the animation.

The race gets an opening cue, a landing when quicksort's first run finishes, and
then a lap sound each time it finishes another. The laps rise in gain rather
than in rate, because the rate is fixed by the comparison clock and the tension
is not.

The already sorted shot gets counter ticks and nothing else. There are no swaps,
so there is no swap sound, and the silence where one would be is the shot.

Nothing sustained plays anywhere. The rate limiting cut laid seven seconds of
filtered noise under four shots because they felt quiet, and the answer to a
quiet shot is to find the event in it.

## Checks run

```text
frozen frames   longest run 1.1s, inside the 1.5s limit
safe areas      all six shots clear of the header, rail and caption reserves
runtime         805 frames, 26.8s, inside the 20 to 30 second band
```
