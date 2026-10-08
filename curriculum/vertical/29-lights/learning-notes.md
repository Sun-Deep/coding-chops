# Learning notes

## Why it halves

Power flows along a series string until it reaches the bad bulb. Hold a
voltage tester just past bulb k: if it senses power, the bad bulb is beyond
k; if not, it is k or before. Test the middle of what is left and either
answer rules out half. 100, 50, 25, 13, 7, 4, 2, 1: seven checks.

## Why one by one is slow

Each check only rules out one bulb. On average the bad one is halfway, so
about 50 checks; at worst 99.

## When one by one wins

When the bad bulb is close to the plug. Each split costs more hand travel,
so splitting is slower for the first 9 positions. Over all positions it is
faster in 91 of 100.

## Where computers use it

Looking up a word in a sorted list, finding a value in a database index,
and git bisect, which splits a project's history in half to find the commit
that broke it. It needs the list in order, or a test that says "before or
after", which is what the tester gives here.

## What the model leaves out

Strings wired as two or more separate circuits, bulbs with shunts that keep
the rest lit, and more than one bad bulb.
