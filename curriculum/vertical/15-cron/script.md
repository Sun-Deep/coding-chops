# Script

Status: blocked

No voiceover and no music. The narration is burned into the frame. Twenty-eight
words across 14 seconds.

| Frames  | Line                                 |
| ------- | ------------------------------------ |
| 6-74    | Five stars. Every minute of a year.  |
| 92-166  | Pin the minute. 8,760 hours.         |
| 184-258 | Pin the hour. 365 days.              |
| 276-348 | Pin the weekday. 52 Mondays.         |
| 356-412 | **Five fields, five units of time.** |

Each line names the field being pinned and the number it lands on, so the
narration and the counter say the same thing at the same moment. The last line
is the only one that is not a count: it is what the four counts were for.

One unit throughout. Every number is a fire count for 2026, and no line mixes it
with the 168 hours of the grid, which is a different thing drawn for a different
reason.

## On screen

```text
eyebrow     CRON
headline    Five stars run / 525,600 times a year.
slots       *  *  *  *  *     the five fields, largest type after the headline
labels      MINUTE HOUR DAY MONTH WEEKDAY
grid        a week, 24 hours across by 7 days down, all 168 cells drawn
marker      an hour line sweeping the week, striking every live cell it crosses
count       525,600 -> 8,760 -> 365 -> 52, TIMES A YEAR
list        each step kept, with what its number is a year of
provenance  every minute of 2026, counted twice · cron-parser agrees
```

The slots carry the lesson and so they carry the type. Pairing them with their
names is the whole decoding key: after fourteen seconds a viewer knows which
position is which, which is what chmod does for permissions and why chmod is the
best performing cut on this page.

The grid is a week rather than a year because a year has 525,600 minutes and no
grid can draw them. The week shows the shape that repeats and the counter holds
the year. Each cell is one hour and how much of it is filled is how many of its
sixty minutes fire, which is what lets `* * * * *` and `0 * * * *` look
different when both light all 168 hours.

Density shows as size, not brightness. Driving both off density left an hour
that fires once at a tenth the opacity of one that fires sixty times, which read
as "almost off" rather than "once".

The empty cells are drawn. Without a skeleton the grid only existed where it
fired, and the late states read as a few dots floating in the dark rather than
as one hour out of a hundred and sixty-eight.

## Sound

A clock under everything, and an accent every time the marker crosses an hour
that fires. The density of the track is the density of the schedule, so the
collapse is something a listener hears before they have read a number: at
`* * * * *` almost every tick carries an accent, and by `0 9 * * 1` one in
twenty-four does.

The clock is what makes that possible. Accents alone left a 2.8 second hole once
the schedule had thinned to a single cell. Time passes whether anything is
scheduled or not, so the marker ticks whether anything fires or not.

Peak -4.9 dBFS. No silence gaps. No frozen holds anywhere in the cut, which the
marker is also responsible for.

## Copy

In `publishing.md`, with the runtime, the cover and the crops, so everything the
upload form asks for is in one place.
