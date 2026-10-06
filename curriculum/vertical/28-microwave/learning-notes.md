# Learning notes

## Why short first lowers the average

Everyone in line waits for every job ahead of them. A job's time is added to
the wait of everyone behind it, so a long job at the front is counted seven
times and a long job at the back is counted none. Putting short jobs first
makes the big numbers count the fewest times. The total work does not change,
so the last person is done at the same second either way; only who waits for
whom changes.

## Why the longest job pays for it

It waits for everyone. In the shown line it goes from 0:00 to 10:35. With
people still arriving, a long job can be pushed back again and again: that is
starvation. Real schedulers fix it with ageing (the longer you wait, the
higher you rank) or by mixing in round robin.

## Where computers use it

Operating systems approximate it when they schedule processes, usually by
guessing a job's next burst from its last ones, because nobody announces
their heating time. Print queues and batch systems use it when job sizes are
known. Shortest remaining time first is the version that can interrupt.

## What the model leaves out

People lying about their time, someone stepping away, two microwaves, and
the argument at the counter.
