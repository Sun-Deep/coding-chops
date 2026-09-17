# Storyboard

One object for the whole cut: a combination lock.

## The shot map

```text
-8 to 12   the drums spin into 755, so frame zero is already moving
16-60      nine switches arrive, one at a time
64-108     what each one is worth, arriving under it
112-124    the three sums
132        777, everything open
168        700, everything shut but you
204-332    the four modes a real disk carries, each landing in the list
344-374    the list read back, one row at a time
378-419    the count, and hold
```

## Why a lock

Every chmod explainer draws a table. A table is a readout and section 4 of the
playbook is explicit about what those are worth in a feed.

A mode is three digits dialled onto a file and each digit is three tumblers. The
lock is not a metaphor, it is what the thing is, and a viewer understands one
before a word of it is explained.

## Frame zero

`chmod 755` in the largest type in the frame, over drums that are still coming
to rest. The command is live and follows the lock rather than captioning it.

The opening dial sits at frame -8 deliberately. A lock already settled on the
first frame is a still image at the exact moment a scroll is decided.

## 777 and 700 are not in the top four, and are in the cut

They are the two ends of the thing: everything open, then everything shut but
you. The mechanism claim is that the number follows the switches, and that
cannot be made by stepping between four modes that all look similar. Watching
every switch light and then go dark is the proof.

## Making a diagram move

A picture of three drums and nine switches changes far fewer pixels than a field
of two thousand cells, and the frozen-frame check caught it at once: the first
version held two and a fifth seconds at a time under the threshold, twice.

Three changes fixed it.

The drums spin a full revolution to their new digit rather than stepping to it,
so a change from 5 to 5 still turns. That is what a combination lock does and it
is most of the motion in the cut.

Every value arriving flares the switch it belongs to. Nine 33 pixel digits
fading in is not a picture changing; nine 56 pixel blocks flaring is, and it
also says the pairing the frame is there to teach.

And the events were spaced so nothing holds. The longest still stretch is now
0.53 seconds against 1.70.

## The arithmetic has to survive being doubted

The switched-off values are struck through, not merely dimmed. Dimming left
`4 + 2 + 1 = 5` on screen, which reads as arithmetic that does not work, and a
viewer who pauses on that learns the opposite of the lesson. They keep their
number so the frame still says what the switch would have been worth.

The rule is drawn in the neutral grey, not the theme red. Section 6 keeps colour
for things that mean something and this cut has one accent.

## Cue map

A lock is the one object where the sound needs no inventing. Every cue is a
mechanical event on it:

```text
-8 to 12   a click per digit going past, on all three drums
16-60      a click per switch arriving, rising across the three groups
64-108     a click per value arriving, the same run a tone higher
112-124    the three sums landing
each turn  a click per digit going past, quiet, then the drum coming to rest,
           then every switch the new combination threw, then the row landing
344-374    the list read back
378        the count
```

The spin clicks matter more than they look. Without them the lock is silent for
a second between turns, which left ten silence gaps in the first cut, and they
are also the sound anybody who has opened a padlock is expecting. The frames are
computed from the same easing the drums use, so a retime moves both.

Levels: the track peaks at -6.1 dBFS, and the only silence over a third of a
second is the half second of hold at the end.

## Colour

One accent. The switches that are on wear it, the digits they add up to wear it,
and the modes as they land wear it. Everything off is neutral, including the
rule through a switched-off value.
