# Vertical 11: Ctrl+F, six ways

Status: blocked

Built and rendered. The creator understanding check is still open.

## What it claims

Six ways to find a phrase in a page of text, on the same 2,400 character page,
looking for the same phrase, all three occurrences.

A straight scan looks at 2,390 of those characters. Boyer-Moore finds the same
three matches having looked at 371. It skips over stretches it never reads,
because on a mismatch it can prove the phrase cannot begin in the next several
positions.

## Why this topic

Ctrl+F is the most used algorithm most people will ever touch, and almost
nobody has seen what it does. That makes it household in a way sorting is for
programmers and pathfinding is for anybody with a route app, which is the test
the last two cuts passed.

It also has the shape this page rewards: a search space collapsing. And the
claim is one number on one axis, which VR10's was not.

## Scope

It teaches that a text matcher can rule out ground without reading it, and what
that is worth on ordinary prose.

It does not claim wall-clock speed, does not cover the SIMD and vectorised
matchers a real `grep` reaches for, and says nothing about regular expressions,
which is a different problem and VR07's.

One page is one sample. The direction is not: across 100 pages Boyer-Moore read
between 14.7 and 17.5 per cent of the text, and this page is 15.5 against a
median of 15.9.

## Compositions

```text
VR11-Text-Search   1080x1920, 420 frames, 30 fps, 14 seconds
VR11-Cover         1080x1920
```
