# Storyboard

One object, four states, and a marker that never stops moving.

| Frames  | Beat               | Hero                                    |
| ------- | ------------------ | --------------------------------------- |
| 0-16    | all five open      | 168 hours lit, 525,600 on the counter   |
| 110-132 | the minute pinned  | every cell drops to a single pip, 8,760 |
| 200-222 | the hour pinned    | the week collapses to one column, 365   |
| 290-312 | the weekday pinned | one cell left, 52                       |
| 332-395 | what they were     | minutes, hours, days, weeks in a year   |

## Why a marker sweeps the week

Four changes of 22 frames across 420 leaves about eighty frames of nothing per
step, which the frozen-frame check reads as a stall and the silence check agrees
with. The first pass had two holds over a second and a half and a 2.8 second
silence.

It is also the only honest way to draw what cron is. A schedule is not a
picture, it is a thing that happens as time passes, so time passes on screen: an
hour marker crosses the week and every live cell it touches fires. The finished
cut has no frozen holds anywhere, which is a first for this format.

The collapse then becomes audible as well as visible. At `* * * * *` almost
every tick carries an accent; by `0 9 * * 1` one in twenty-four does.

## Why both halves of the key are big

The lesson is a pairing: position two is HOUR. The first cut drew the value at
21 points of feed size and the name under it at 6.7, so the half that does the
teaching was the half nobody could read. Measured against VR12, whose switches
are 19.7 points and whose `4 + 2 + 1` is 11.6, the names were furniture-sized.

They are 9.2 points now, and the unit each count belongs to is named as the
count lands rather than waiting for the list at the end.

## Why the empty cells are drawn

Without a skeleton the grid only exists where it fires, and the late states read
as a few dots floating in the dark rather than as one hour out of a hundred and
sixty-eight. The empty cells are what make the collapse mean anything.

## Why density is size and not brightness

An hour that fires once and an hour that fires sixty times are both live, and
the first version drew the first at a tenth of the opacity of the second, which
read as "almost off" rather than "once". Size carries the density now and
brightness only says whether the cell is live at all.

## Why the numbers are the ones they are

The four expressions were chosen after the measurement rather than before.
Pinning the fields in order lands on 525,600, 8,760, 365 and 52, which are the
minutes, hours, days and weeks in a year. Nothing was arranged to make that
happen; it falls out of cron's fields being units of time, which is the point of
the cut.

## Colour

One accent. Neutral chalk is a field still open and the empty week behind
everything; orange is a field pinned, a cell that fires, the marker and the
count. The reference rows go neutral once they are no longer the live one.

## Cue map

| Event                       | Sound    | Pitch                  |
| --------------------------- | -------- | ---------------------- |
| the schedule arriving       | `appear` | fixed                  |
| the marker crossing an hour | `tick`   | fixed, quiet, always   |
| an hour that fires          | `probe`  | by hour of the day     |
| a field pinned              | `settle` | falling with each step |
| a line of the reference     | `land`   | rising down the rows   |
| what a number is a year of  | `tick`   | rising                 |
| the last state              | `solved` | fixed                  |
