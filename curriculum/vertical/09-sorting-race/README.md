# Vertical 09: six sorts on one clock

Status: published

Built, rendered and past the creator understanding check.

## What it claims

Six sorting algorithms run on the same 48 element permutation. Given the same
number of operations per frame, quicksort finishes in 387 operations and bubble
sort takes 2,417, which is 6.2 times the work for the same answer.

An operation is a comparison between two element values or a write into an
array. Merge sort's auxiliary buffer counts.

## Why this topic

Every sorting visualiser on the internet runs one algorithm at a time, which
means the comparison a viewer actually wants is a thing they have to remember
across two videos. Six panels on one clock puts it in a single frame, and the
finishing order is then a measurement rather than an edit.

It also reuses the grid the time complexity cut established, so the two read as
a pair: that one draws the curves, this one runs the code the curves describe.

## Scope

It teaches how much work six sorts do on one random array of 48 elements.

It does not claim wall-clock speed, does not model cache behaviour or memory
traffic, does not cover the adaptive and hybrid sorts a standard library
actually ships, and says nothing about behaviour on sorted, reversed or
duplicate-heavy input, where several of these six change character completely.

One array is one sample. The gap between the quadratic three and the other
three is a property of the algorithms; the exact figures are a property of this
permutation.

## Compositions

```text
VR09-Sorting-Race   1080x1920, 420 frames, 30 fps, 14 seconds
VR09-Cover          1080x1920
```
