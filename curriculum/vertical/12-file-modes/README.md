# Vertical 12: chmod is nine switches

Status: published

Built and rendered. The creator understanding check is still open.

## What it claims

A chmod number is not a code to memorise. It is three digits, one for you, one
for your group and one for everyone else, and each digit is three switches worth
4, 2 and 1. The digit is the sum of the ones that are on.

That is 8 x 8 x 8 = 512 possible modes. On a real disk, four of them cover 99.7
per cent of files.

## Why this topic

Every developer has typed `755`. Almost none of them have been shown that the 7
is 4 plus 2 plus 1. That gap between something used constantly and never
explained is the whole opportunity.

It is also the first cut in this format to use the shape behind the channel's
two biggest videos: a reference somebody wants to keep. VR09 through VR11 were
all a search space collapsing, drawn as a six panel grid, and the returns fell
each time. 512 down to four is both shapes at once.

## Why a lock

Every chmod explainer ever made draws a table: rows of rwx, a column of octal. A
table is a readout, and section 4 of the playbook is explicit that a readout
gives nobody a reason to stop scrolling.

A mode is three digits dialled onto a file and each digit is three tumblers, so
the honest object is a combination lock. It is not a metaphor being stretched;
it is what the thing is. And a lock is understood before a word of it is
explained.

## Scope

It teaches what the three digits are and what the bits in them are worth.

It does not cover the fourth digit, so setuid, setgid and the sticky bit are out
of scope and the scan masks them off. It does not cover ACLs, umask, or what
happens when you are root, and it does not claim the distribution it measures is
true of any disk but the one it ran on.

## Compositions

```text
VR12-File-Modes   1080x1920, 420 frames, 30 fps, 14 seconds
VR12-Cover        1080x1920
```
