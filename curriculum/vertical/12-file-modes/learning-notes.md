# Learning notes

## The number is the switches

This is the cut. Each digit is three bits worth 4, 2 and 1, and the digit is
their sum: 7 is 4 plus 2 plus 1, 5 is 4 plus 1, 6 is 4 plus 2, 4 is 4 on its
own.

Nobody who types `755` is confused by it. They have simply never been shown it,
because every explanation is a table of rwx against octal, and a table asks you
to look things up rather than to understand them.

## Why a lock is the right object and a table is not

Section 4 of the playbook: build objects, not readouts. A fill bar and a
labelled rectangle can carry the same information as a physical thing and give
nobody a reason to stop scrolling.

A mode is three digits dialled onto a file and each digit is three tumblers.
That is a combination lock, exactly, with no stretching. It comes with motion
built in, a viewer knows how one works before anything is explained, and the
thing a lock does is the thing chmod does.

## The arithmetic has to survive being doubted

An early cut dimmed the switched-off values and left `4 + 2 + 1 = 5` on screen.
That reads as arithmetic that does not work, and a viewer who pauses on it
learns the opposite of the lesson. The off values are struck through now, which
is unmistakable, and they keep their number so the frame still says what that
switch would have been worth.

## A diagram is quieter than a field

The three cuts before this one drew hundreds or thousands of cells changing
every frame. This draws three drums and nine switches, and the frozen-frame
check said so immediately: the stretch where nine 33 pixel values faded in came
in under the threshold for a second and seven tenths.

Two things fixed it. The drums spin a full revolution rather than stepping,
which is both more motion and more true to a lock. And every value arriving
flares the switch it belongs to, which puts a 56 pixel block behind a 33 pixel
digit and says the pairing at the same time.

The general lesson: on a cut with few moving parts, an event has to be given
size, because the number of pixels it changes is the number of people who see
it happen.

## What was deliberately left out

The fourth digit. Setuid, setgid and the sticky bit are real and they are a
second idea, and a fourteen second cut has one. The scan masks them off rather
than silently merging them, which would have folded `4755` into `755` and
overstated how common plain `755` is.
