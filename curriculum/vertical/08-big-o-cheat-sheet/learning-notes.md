# Learning notes

## The fixture

The measurement runs the loop shapes at every integer input from 1 through 1,024. The displayed count always comes from that measured range. Each mini chart normalizes its work axis to its own final value, so the viewer can read the shape. Card heights cannot be compared as operation counts.

## The five shapes

Direct array access performs one operation regardless of input size. The logarithmic loop halves its remaining span until it reaches zero. The linear loop visits every item. The linearithmic fixture runs that halving loop once per item. The quadratic fixture visits every ordered pair of items.

At 1,024 items, the measured counts are 1, 11, 1,024, 11,264, and 1,048,576. The smooth curves show the Big O growth shapes. The orange numbers show the exact loop counts. They are not timing claims or complete implementations of search, sort, or pairwise algorithms.

## The catch

Big O drops constants and lower-order terms. The chart makes a small fixed fixture legible. It does not say that a quadratic routine always loses at small input sizes, or that an `O(1)` operation has the same real cost as every other operation.
