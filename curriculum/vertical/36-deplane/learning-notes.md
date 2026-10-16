# Learning notes

## Why standing helps

Getting off is a chain: a row can only leave once the aisle beside it is
clear, and it needs time to stand, step out and get its bags down. If a
row only starts all that once the row in front has gone, every row adds its
own start-up time to everyone behind it. Standing early does the start-up
in advance, so rows follow each other with no gap.

## The cost

The people standing early spend almost the whole wait on their feet, bent
under the bins, for a gain of under a minute on average.

## Busy waiting

A program that needs something not yet ready can loop, checking again and
again, or ask to be put to sleep and woken when it is ready. Looping reacts
a little faster and wastes the processor for the whole wait. Operating
systems prefer sleeping for long waits and spinning only for very short
ones.
