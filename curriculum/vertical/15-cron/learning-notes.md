# Learning notes

What had to be understood before anything was drawn.

## Cron ORs two of its fields, and the matcher had to be told

POSIX cron ORs day-of-month and day-of-week when both are restricted. `0 9 5 * 1`
is nine o'clock on the fifth _and_ nine o'clock every Monday, not "the fifth if
it is a Monday".

The matcher written for the measurement ANDs its five fields, which is correct
whenever one of those two is `*` and wrong otherwise. Checked against
`cron-parser` on `0 9 5 * 1` in January 2026 the two differ by a factor of four:
one fire against four.

Every expression in this cut leaves day-of-month as `*`, so every published
figure is right. That was luck rather than design until the guard was added.
Both implementations now refuse an expression that restricts both fields rather
than quietly producing a wrong number.

Worth carrying: a second implementation catches disagreements, but only on the
inputs you actually run. The inputs you do not run are where the wrong answer
waits, so guard the case rather than trusting the fixture to keep avoiding it.

## The numbers picked the script, not the other way round

The build-up was going to be `*/15 9-17 * * 1-5`, which is a realistic line and
lands on 9,396. Running the counts first showed something better: pinning the
fields in order gives 525,600, 8,760, 365 and 52, which are the minutes, hours,
days and weeks in a year.

Nothing was arranged to make that happen. It falls out of cron's fields being
units of time, which is exactly what the cut is trying to say, and four numbers
the audience already knows do the saying.

Measure before choosing the shots, not after. The playbook has this as an order
of operations and this is the first time it visibly changed the script.

## A schedule is not a picture

Four state changes across fourteen seconds left about eighty frames of nothing
between each, which read as a stall on the frozen-frame check and left a 2.8
second silence once the schedule had thinned out.

The fix was not decoration. Cron is a thing that happens as time passes, so time
passes on screen: an hour marker sweeps the week and strikes every live cell it
crosses. The cut now has no frozen holds anywhere, which has not happened before
in this format, and the track thins as the schedule thins so the collapse is
audible with your eyes shut.

The same idea gave the audio its bed. A clock ticks whether anything is
scheduled or not, which is both true and what stops the quiet end being silent.

## Two drawing mistakes worth naming

Density as brightness. An hour that fires once and an hour that fires sixty
times are both live, and driving opacity off density drew the first at a tenth
of the second, which read as "almost off". Size carries density now; brightness
only says whether the cell is live.

And the empty week has to be drawn. Without a skeleton the grid only existed
where it fired, so the late states looked like a few dots in the dark rather
than one hour out of a hundred and sixty-eight. The empty cells are what make
the collapse mean anything.

## The case name collision, twice

`cron.ts` beside `Cron.tsx` fails on a case-insensitive filesystem, which is
exactly what `qr.ts` beside `Qr.tsx` did on VR14 the day before. Renamed to
`fields.ts`.

Two cuts running. The rule is that the port module never takes the episode's own
name, because the scene component already has it.

## Half a decoding key is not a decoding key

Asked whether this was as clearly explained as chmod, the honest answer was no,
and the gap measured rather than being a matter of taste.

At feed size, where a 1080 frame is about 380 points: chmod's switches are 19.7
points and its `4 + 2 + 1 = 4` is 11.6, and it asks the viewer to track about
fifteen things. Cron's field values were 21.1, which is fine, and the names
under them were 6.7, which is the size chmod uses for furniture. The lesson is
the pairing of position with name, so exactly half of it was unreadable on a
phone.

The second half of the answer was that there was nothing to verify. chmod lets
the viewer check `4 + 2 + 1 = 4` in the frame. Cron gives numbers that are
recognisable rather than checkable, and worse, the unit was only spelled out in
a small list at the end, so at the moment 8,760 landed nothing on screen said
hours.

Both fixes were cheap. Names to 9.2 points, and the unit named live under each
count. Worth carrying as the question to ask of any cut: not "is the mechanism
right", which the measurement script answers, but "is every part of the thing
the viewer is supposed to leave with actually legible, and is there a moment
they can check". On this one the answer was no twice and both were one-line
changes.
