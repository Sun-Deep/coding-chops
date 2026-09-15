# Vertical 08: time complexity race

Status: approved

The production test is built and rendered. The creator understanding check is still open.

## What it claims

The same input size drives five measured loop shapes: constant, logarithmic, linear, linearithmic, and quadratic. At `n = 1,024`, the nested loop runs 1,048,576 steps. The logarithmic loop runs 11.

The cut compares operation counts, not elapsed time and not the speed of a particular algorithm.

## Why this topic

The previous search test made the viewer wait for a single result. This cut starts with five empty charts and their matching code. Every x-axis and line grows from the same clock. The clock accelerates as `n` approaches 1,024, and every line reaches its endpoint on frame 419.

## Scope

It teaches how loop shape changes work as input grows. It does not say one algorithm is always better, model cache effects, or measure wall-clock speed.

## Compositions

```text
VR08-Big-O-Cheat-Sheet   1080x1920, 420 frames, 30 fps, 14 seconds
VR08-Cover               1080x1920
```
