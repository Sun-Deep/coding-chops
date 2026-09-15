# Storyboard

One shot, not three. The material is a race, and cutting a race into scenes is
how you lose the only thing that makes it a race.

## The shot map

```text
0-113     six panels, all running, headline and rule already in frame
114       quicksort finishes
178-189   merge sort, then heap sort
232-248   selection sort, then insertion sort
320       bubble sort, last
328-402   the verdict: four panels down, the other two run again
402-419   hold
```

## Why one shot

The format's default shape is slow mechanism, fast mechanism, verdict. That
exists so a viewer can see two things they cannot see at once. Here they can see
all six at once, which is the whole idea, and a cut away from the grid would
throw away the comparison to show a part of it.

The three-shot rhythm survives anyway. The first four seconds are six panels of
noise, the middle six are the field emptying one panel at a time, and the last
three are the verdict. It is paced like three shots without cutting.

## Frame zero

Headline and mechanism together, as section 10 of the standard requires. The
grid is already running: the clock starts twenty frames behind the frame, so the
first frame a viewer sees has 43 operations already spent on every panel and six
fields already moving.

## The hero per panel

Six bar fields would read as one picture six times over if nothing but the
heights differed. The active range is what separates them, and each one is a
different shape of work:

```text
bubble      a window shrinking by one a pass, swaps churning inside it
selection   a suffix that barely changes while it is scanned end to end
insertion   a sorted prefix growing, values shifting right to open a slot
merge       blocks jumping around the array, doubling in width
heap        a region draining from the right as the top is lifted off
quick       a range that halves, then halves again
```

## The clock

Mostly cubic with a linear floor. A linear clock finishes quicksort a third of
the way in and holds five panels still for eight seconds. Pure acceleration puts
the first second under one operation a frame, which reads as a still frame. The
mix opens at about two operations a frame and ends near seventeen, so the cut
starts legible one comparison at a time and finishes as a blur.

## The verdict

Four panels dim to a quarter. Bubble sort and quicksort keep their brightness,
take an accent border, and their cost bars thicken. Then both run again from
zero on a faster linear clock, so quicksort resorts itself in a quarter of a
second while bubble sort is still going two seconds later.

The two totals move up into the line under the headline and stay fixed there
while the replay runs, so nothing on screen reads as a measured figure going
backwards.

An earlier version froze the grid and moved only the cost bars. That held the
last two seconds of the frame under six hundredths of a per cent of pixel
change, which is a video a viewer reads as stalled.

## Cue map

Two layers, which is a departure from the format's default density and is
recorded here rather than assumed.

Underneath, gunfire. Every panel fires a `swap` as bars land in their slots,
once every tenth write, pitched by the value that landed. Section 11 of the
standard puts the working density at about one cue every second and a half and
says nothing plays because a property moved. A bar arriving in a slot is not a
property moving, it is an object being placed, and a sorting visualiser that
does three thousand of those in silence is missing the thing people come to
these for. So the rule that survives is the one that matters: the cue marks an
event, and it marks nothing else.

Comparisons are silent. That is what keeps the track carrying information
rather than volume. Selection sort does 1,128 comparisons and 92 writes, so it
clicks nine times in seven and a half seconds while bubble sort hammers, and
which algorithm is moving things about is audible before either number has been
read. The firing thins as panels finish, 41 cues a second at five seconds down
to 13 at ten, so the field emptying is something you hear as well as see.

The stride is a constant rather than a rate, so the firing accelerates exactly
as the shared clock does.

Over the top, the events that are about something other than a bar moving:

```text
114   settle   quicksort finishes
178   settle   merge sort
189   settle   heap sort
232   settle   selection sort
248   settle   insertion sort
320   settle   bubble sort, last, loudest
328   appear   the verdict picks two
402   land     bubble sort's replay reaches the end of its bar
```

Read out of the traces rather than typed in, so a retime cannot leave the sound
behind the picture. Gains rise through the cascade as the field empties.

There was a meter cue on the shared clock, two ticks in the opening seconds
where nothing had finished yet. The gunfire made it redundant: the firing rate
is the clock, and it is tied to the picture in a way a tick on a round number
never was.

Levels: a single click peaks about -19 dBFS, the `settle` cues run six decibels
above it, and the track peaks at -5.4 on the `land`. The first pass ran the
clicks at -24 and adding them moved the whole track's mean by three tenths of a
decibel, which is a texture nobody hears on a phone.

`swap` did not exist before this cut and was generated into
`scripts/build-sfx.sh` rather than borrowed from `tick`, which is a longer sound
with a tail and turns into a drone at thirty a second.

## Colour

Six lanes is past the four the standard allows to carry their own hue, so this
is a one-accent cut and the accent means what it means everywhere else in the
format: where the work is. Bars are neutral, the lighter neutral marks a slot
already holding its final value, and the orange is a slot touched in the last
few frames.

The cost bar along the bottom of every card is drawn against bubble sort's
total on all six, which is what makes it one chart rather than six progress
bars.
