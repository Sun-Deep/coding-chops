# Vertical 29: one bad bulb, how do you find it

Status: built, not posted

## What it claims

A string of 100 lights goes dark because one bulb is bad. With a voltage
tester, checking bulb by bulb from the plug finds bulb 70 in 70 checks and
the string is lit at 1:53. Testing the middle of whatever is still in doubt
rules out half the string each time and finds it in 7 checks, lit at 0:19.
Over every possible position, splitting takes 6.7 checks on average and
never more than 7, against 50.5 one by one.

That is binary search. Programmers use it to find the change that broke a
program (git bisect) and computers use it to find a name in a sorted list.

## Why this topic

The microwave reel showed that naming the coding idea at the end costs no
reach when the rest of the formula holds. This keeps the formula: an
everyday fight with a tangle of lights, a race from the first frame (two
check counters), the methods said in the first five seconds, a real room,
the name on the picture at the payoff.

## Scope

One bad bulb in a series string and a tester that can be held anywhere
along the wire. Near the plug, one by one is quicker: splitting wins for 91
of the 100 positions, and the first 9 go to one by one. Two bad bulbs make
splitting find the first one, then start again.
